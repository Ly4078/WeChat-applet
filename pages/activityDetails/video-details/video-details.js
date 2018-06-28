import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    issnap: false,
    isComment: false,
    totalComment: 0,
    commentVal: '',
    playerUserId:'',
    videoUrl:'',
    comment_list: [],
    refId: 0,
    assNum:'',
    _actId:'',
    _userId:'',
    isdtzan:false,
    videodata:[],
    voteNum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('options:',options)
    if (options.userId){
      this.setData({
        _userId: options.userId
      })
    }
    if (options.actId){
      this.setData({
        _actId: options.actId
      })
    }
    if(options.id){
      this.setData({
        refId: options.id
      });
      this.gettopiclist(options.id);
      this.getcmtlist(options.id);
    } else if (options.url){
      this.setData({
        videoUrl:options.url,
        
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  gettopiclist: function (id) {  //获取文章内容数据
    let _parms = {
      id: id,
      zanUserId: app.globalData.userInfo.userId,
      zanUserName: app.globalData.userInfo.usrName,
      zanSourceType: '1'
    },that=this;
    Api.getTopicByZan(_parms).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        _data.summary = utils.uncodeUtf16(_data.summary);
        _data.content = utils.uncodeUtf16(_data.content);
        _data.timeDiffrence = utils.timeDiffrence(res.data.currentTime, _data.updateTime, _data.createTime)
        _data.content = JSON.parse(_data.content);
        _data.hitNum = utils.million(_data.hitNum);
        _data.zan = utils.million(_data.zan);
        let _arr = _data.updateTime.split(' ');
        let arr = _arr[0].split('-');
        _data.updateTime = arr[1] + '-' + arr[2]+' '+ _arr[1];
        let reg = /^1[34578][0-9]{9}$/;
        if (reg.test(_data.userName)) {
          _data.userName = _data.userName.substr(0, 3) + "****" + _data.userName.substr(7);
        }
        if (_data.isZan==0){  //
          that.setData({
            isdtzan:true
          })
        }else{
          that.setData({
            isdtzan: false
          })
        }
        that.setData({
          videodata: _data,
          playerUserId: _data.userId,
          voteNum:_data.zan,
        })
      }
    })
  },
  toplayer:function(){  //to个人主页
    wx.redirectTo({
      url: '../../activityDetails/homePage/homePage?actId=' + this.data._actId + '&userId=' + this.data._userId,
    })
  },
  showArea() {
    this.setData({
      isComment: !this.data.isComment
    });
  },
  onPageScroll: function () {  //监听页面滑动
    this.setData({
      isComment: false
    })
  },
  toMoreComment() {
    wx.navigateTo({
      url: '../../index/merchant-particulars/total-comment/total-comment?id=' + this.data.refId + '&cmtType=2'
    })
  },
  getCommentVal(e) { //实时获取输入的评论
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function () {  //新增评论
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (!this.data.commentVal) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 2000
      })
    } else {
      let _value = utils.utf16toEntities(this.data.commentVal)
      this.setData({
        commentVal: _value,
        isComment: false
      })
    }
    let _parms = {
      refId: this.data.refId,
      cmtType: 2,
      content: this.data.commentVal,
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      nickName: app.globalData.userInfo.nickName,
    }
    Api.cmtadd(_parms).then((res) => {
      if (res.data.code == 0) {
        this.getcmtlist();
      } else {
        wx.showToast({
          title: '系统繁忙,请稍后再试',
          icon: 'none'
        })
      }
    })
  },

  getcmtlist: function (id) {  //获取评论数据
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      cmtType: '2',
      refId: this.data.refId
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
          if (reg.test(_data.list[i].userName)) {
            _data.list[i].userName = _data.list[i].userName.substr(0, 3) + "****" + _data.list[i].userName.substr(7)
          }
        }
        this.setData({
          comment_list: _data.list,
          totalComment:_data.list.length,
          assNum: _data.list.length,
        })
      }
    })
  },
  castvote: function () {  //選手投票
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _this = this;
    let _parms = {
      actId: this.data.actId,
      userId: this.data.voteUserIdcastvote,
      playerUserId: this.data.playerUserId
    }
    Api.availableVote(_parms).then((res) => {
      this.setData({
        availableNum: res.data.data.user
      });
      if (this.data.availableNum <= 0) {
        wx.showToast({
          title: '今天票数已用完,请明天再来',
          icon: 'none'
        })
        return false;
      }
      Api.voteAdd(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '投票成功',
            icon: 'none'
          })
          _this.setData({
            availableNum: _this.data.availableNum - 1,
            voteNum: _this.data.voteNum + 1
          });
        }
      });
    });
  },
  toLike: function (e) {//评论点赞
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let id = e.currentTarget.id, ind = '';
    for (let i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: 4,
      userId: app.globalData.userInfo.userId,
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功'
        }, 1500)
        var comment_list = this.data.comment_list;
        comment_list[ind].isZan = 1;
        comment_list[ind].zan++;
        this.setData({
          comment_list: comment_list
        });
      }
    })
  },
  handzan:function(){
    if (this.data.isdtzan){
      this.dianzanwz();
    }else{
      this.quxiaozanwz();
    }
  },
  dianzanwz: function () {  //文章点赞
    let that = this
    let _details = this.data.videodata;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true,
        clickvideo: false
      })
      return false
    }
    let _parms = {
      refId: this.data.refId,
      type: '2',
      userId: app.globalData.userInfo.userId
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功'
        }, 1500)
        _details.isZan = 1
        _details.zan = _details.zan + 1
        let _zan = this.data.zan
        _zan++
        that.setData({
          videodata: _details,
          isdtzan:false,
          voteNum: that.data.voteNum+1,
        })
      }
    })
  },
  quxiaozanwz: function () {  //文章取消点赞
    let that = this
    let _details = this.data.videodata;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true,
        clickvideo: false
      })
      return false
    }
    let _parms = {
      refId: _details.id,
      type: '2',
      userId: app.globalData.userInfo.userId
    }
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '取消成功',
        }, 1500)
        _details.isZan = 0
        _details.zan = _details.zan - 1
        if (_details.zan < 0) {
          _details.zan = 0
        }
        let _zan = this.data.zan
        _zan--
        this.setData({
          videodata: _details,
          isdtzan: true,
          voteNum: that.data.voteNum - 1,
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
      wx.redirectTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  }
})