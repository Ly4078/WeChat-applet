import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require("../../../utils/util.js")
var app = getApp();
Page({
  data: {
    cmtdata: [],
    userid: '',
    information: {},
    imgs: [],
    video: {},
    commentVal: '',
    isComment: false,
    imges: [],
    _refId:'',
    issnap: false,
    clickvideo:false,
    user: {
      match: '麻辣小龙虾'
    },
    poll: '投票',
    isVote: 0,
    shopName: '',
    groupCode: '',
    activity: '',
    _voteUserIdSuc: '',
    shopId: '',
    shareFlag: false
  },

  onLoad: function (options) {
    let that = this;
    let _activity = options.actId;
    let _voteUserId = app.globalData.userInfo.userId;
    this.setData({
      userid: options.id,
      shopId: options.shopid ? options.shopid : '',
      shopName: options._shopName ? options._shopName : '',
      groupCode: options.groupCode ? options.groupCode : '',
      activity: options.actId,
      _voteUserIdSuc: _voteUserId
    })
    
   
    let _parms = {
      userId: this.data.userid,
      actId: _activity,
      beginTime: "2018-5-1",
      endTime: "2018-6-30",
      token: app.globalData.token
    }
    if (app.globalData.userInfo.userId){
      _parms.voteUserId=app.globalData.userInfo.userId
    }
    Api.playerDetails(_parms).then((res) => { //数据请求
      let _data = res.data.data;
      let _dataSe = res.data.data.picUrls;
      let refId = res.data.data.id;
      this.setData({
        _refId:refId
      })
      this.getcmtlist();
      if (_dataSe) {
        let _imgs = _dataSe.slice(0, _dataSe.length - 1);
        let _vides = _dataSe.slice(_dataSe.length - 1, _dataSe.length);
        this.setData({
          imgs: _imgs,
          video: _vides
        })
      }
      if (_data.isVote == 0) {
        this.setData({
          poll: '投票',
          isVote: 0
        })
      } else {
        this.setData({
          poll: '已投票',
          isVote: 1
        })
      }
      this.setData({
        information: _data,
        imges: _dataSe
      })
    })
  },
  onShow() {
    this.setData({
      shareFlag: false
    });
  },
  palyvideo:function(){
    this.setData({
      clickvideo:true
    })
  },
  castvote: function () {  //選手投票
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let that = that;
    let _playUserId = this.data.information.userId;
    let date = new Date;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let today = date.getDate();
    let day = today * 1 + 1;
    let _parms = {
      actId: this.data.activity,
      beginTime: year + '-' + month + '-' + today,
      endTime: year + '-' + month + '-' + day,
      // userId: app.globalData.userInfo.userId,
      playerUserId: _playUserId,
      token: app.globalData.token
    }
    if (this.data.groupCode) {
      _parms.shopId = this.data.shopId
    }
    Api.judgment(_parms).then((res) => {
      if (res.data.code == 0) {
        Api.voteAdd(_parms).then((res) => {
          if (res.data.code == 0) {
            wx.showToast({
              title: '投票成功',
              mask: 'true',
              icon: 'none',
              duration: 2000
            })
          }
        })
      } else {
        wx.showToast({
          title: res.data.message,
          mask: 'true',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  showAreatext: function () {  //显示发表输入框
    if (app.globalData.userInfo.mobile == 'undefined' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
    }else{
      this.setData({
        isComment: true
      })
    }
    
  },

  getCommentVal: function (e) { //获取评论输入框
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
    } else {
      let _value = utils.utf16toEntities(this.data.commentVal)
      this.setData({
        commentVal: _value,
        isComment: false
      })
    }
    let _parms = {
      refId: this.data._refId,
      cmtType: '7',
      content: this.data.commentVal,
      // userId: app.globalData.userInfo.userId,
      // userName: app.globalData.userInfo.userName,
      // nickName: app.globalData.userInfo.nickName,
      token: app.globalData.token
    }
    Api.cmtadd(_parms).then((res) => {
      this.setData({
        isComment: false
      })
      this.getcmtlist();
    })
  },
  getcmtlist: function () {  //获取评论数据
    let _parms = {
      // zanUserId: app.globalData.userInfo.userId,
      cmtType: '7',
      refId: this.data._refId,   //选手ID
      token: app.globalData.token
    }
    Api.cmtlist(_parms).then((res) => {
      let _data = res.data.data;
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

  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        // url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
        url: '/pages/init/init?isback=1'
      })
    }
  },
  onPageScroll:function(){  //监听页面滑动
    this.setData({
      isComment:false
    })
  },
  toActHref() {
    wx.switchTab({
      url: '/pages/activityDetails/activity-details'
    })
    console.log(123)
  },
  shareIsShow() {
    this.setData({
      shareFlag: false
    });
  },
  sharePlayer() {    //点击打开分享弹窗
    this.setData({
      shareFlag: true
    });
  }
})
