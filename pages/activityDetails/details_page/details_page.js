import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require("../../../utils/util.js")
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cmtdata:[],
    userid:'',
    information:{},
    imgs:[],
    video:{},
    commentVal:'',
    isComment: false,
    imges:[],
    issnap: false,
    user:{
      match:'麻辣小龙虾'
    },
    poll:'投票',
    isvote:false
  },

  onLoad: function (options) { //享7劵
    let _activity = options.actId;
    this.setData({
      userid:options.id
    })
    this.getcmtlist();
    let that = this;
    let _parms = {
      userId: this.data.userid,
      voteUserId: app.globalData.userInfo.userId,
      actId: _activity,
      beginTime: "2018/5/1",
      endTime: "2018/5/31"
    }
    Api.playerDetails(_parms).then((res) => {
      let _data = res.data.data;
      let _dataSe = res.data.data.picUrls;
      console.log("_data:",_data)
      console.log("_dataSe:", _dataSe)
      if (_dataSe){
        let _imgs = _dataSe.slice(0, _dataSe.length - 1);
        let _vides = _dataSe.slice(_dataSe.length - 1, _dataSe.length);
        console.log('_imgs:', _imgs)
        console.log('_vides:', _vides)
        this.setData({
          imgs: _imgs,
          video: _vides
        })
      }
     
      if (_data.isVote == 0){
        this.setData({
          poll:'投票'
        })
      }else{
        this.setData({
          poll: '已投票'
        })
      }
        this.setData({
          information: _data,
          imges: _dataSe
        })
    })
  },
  showAreatext: function () {  //显示发表输入框
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    this.setData({
      isComment: true
    })
  },
  showAreatext: function () {  //显示发表输入框
    this.setData({
      isComment: true
    })
  },
  getCommentVal: function (e) { //获取评论输入框
    console.log("内容:", e.detail.value)
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function () {  //新增评论
    if (!this.data.commentVal) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        isComment: false
      })
      // return false;
    } else {
      let _value = utils.utf16toEntities(this.data.commentVal)
      this.setData({
        commentVal: _value,
        isComment: false
      })
    }
    // return false
    let _parms = {
      // refId: this.data._id,
      refId:'35',
      cmtType: '2',
      content: this.data.commentVal,
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      nickName: app.globalData.userInfo.nickName,
    }
    console.log("Parms:",_parms)
    Api.cmtadd(_parms).then((res) => {
      this.setData({
        isComment: false
      })
      this.getcmtlist();
    })
  },
  getcmtlist: function () {  //获取评论数据
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      cmtType: '2',
      // refId: this.data._id
      refId:"35",
    }
    Api.cmtlist(_parms).then((res) => {
      console.log("res:",res)
      let _data = res.data.data;
      console.log("返回值:", _data)
      _data.total = utils.million(_data.total)
      if (_data.list) {
        let reg = /^1[34578][0-9]{9}$/;
        for (let i = 0; i < _data.list.length; i++) {
          _data.list[i].content = utils.uncodeUtf16(_data.list[i].content)
          _data.list[i].zan = utils.million(_data.list[i].zan)
          if (reg.test(_data.list[i].nickName)) {
            _data.list[i].nickName = _data.list[i].nickName.substr(0, 3) + "****" + _data.list[i].nickName.substr(7)
          }
        }
        this.setData({
          cmtdata: _data
        })
      }
    })
  },
  toLike: function (event) {//评论点赞
    let that = this
    let id = event.currentTarget.id
    let ind = ''
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    for (let i = 0; i < this.data.cmtdata.list.length; i++) {
      if (this.data.cmtdata.list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: '4',
      userId: app.globalData.userInfo.userId,
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功'
        }, 1500)
        var _cmtdata = that.data.cmtdata
        _cmtdata.list[ind].isZan = 1;
        _cmtdata.list[ind].zan++;
        that.setData({
          cmtdata: _cmtdata
        });
      }
    })
  },
  castvote: function (e) {  //投票
    let that = this
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    console.log("information:", this.data.information)
    if (this.data.information.isVote == 1){
      wx.showToast({
        mask: true,
        icon: 'none',
        title: '已经投过票,不能重复投票!'
      }, 1500)
      return false;
    }
    let stopid = e.currentTarget.id;
    let vote = this.data.actdetail
    let _parms = {
      // actId: this.data.actid,
      actId:"35",
      // shopId: stopid,
      voteUserId: "27",
      userId: app.globalData.userInfo.userId,
      voteUserId: app.globalData.userInfo.userId
    }
    Api.voteadd(_parms).then((res) => {
      console.log('res:',res)
      if (res.data.code == 0) {
        let _information = this.data.information;
        _information.isVote = 1
        that.setData({
          information: _information,
          poll: '已投票'
        })
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '投票成功'
        }, 1500)
      }
    })
  },
  closetel: function () {
    this.setData({
      issnap: false
    })
  }
})