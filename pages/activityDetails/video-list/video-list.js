import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 38,
    userId: '',
    userName: '',
    mainPic: '',
    infoPic: '',
    actName: '',
    actDesc: '',
    startTime: '',
    endTime: '',
    zanTotal: '',
    actHitNum: '',
    flag: true,
    page: 1,
    videoList: [],
    isball:true,
    issnap: false,
    isnew: false,
    switchFlag: true
  },
  onLoad: function (options) {
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.mobile,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });
  },
  onShow: function () {
    this.setData({
      page: 1,
      videoList: [],
      flag: true
    });
    if (!app.globalData.userInfo.mobile) {
      this.getuserinfo();
    }
    this.videoInfo();
    this.videoData();
    this.videoList();
  },
  toactlist() {
    wx.switchTab({
      url: '../../index/index',
    })
  },
  videoInfo() {     //视频详情
    let _parms = {
      id: this.data.actId,
      userId: this.data.userId,
      userName: this.data.userName,
      sourceType: '1'
    }
    Api.actdetail(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        let startTime = data.data.startTime,
          endTime = data.data.endTime;
        startTime = startTime.substring(0, startTime.indexOf(" "));
        endTime = endTime.substring(0, endTime.indexOf(" "));
        this.setData({
          mainPic: data.data.mainPic,
          infoPic: data.data.actUrl,
          actName: data.data.actName,
          actDesc: data.data.actDesc,
          startTime: startTime,
          endTime: endTime
        });
      }
    });
  },
  videoData() {
    let _parms = {
      actId: this.data.actId
    }
    Api.videoData(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        this.setData({
          zanTotal: data.data.zanTotal,
          actHitNum: data.data.actHitNum
        });
      }
    });
  },
  addVideo() {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      wx.redirectTo({
        url: '../../discover-plate/dynamic-state/dynamic-state?actId=' + this.data.actId + '&id=2'
      })
    }
  },
  videoList() {
    let _parms = {
      actId: this.data.actId,
      zanUserId: this.data.userId,
      page: this.data.page,
      rows: 6
    }
    if (!this.data.switchFlag) {
      _parms['sortType'] = 1;
    }
    Api.videoList(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        wx.hideLoading();
        let videoList = this.data.videoList, listData = data.data.list;
        for (let i = 0; i < listData.length; i++) {
          videoList.push(listData[i]);
        }
        this.setData({
          videoList: videoList
        });
        if (listData.length < 6) {
          this.setData({
            flag: false
          });
        }
      }
    });
  },
  videoDetail(e) {
    let id = e.currentTarget.id, _videoList = this.data.videoList,userid='';
    for (let i in _videoList){
      if (id == _videoList[i].topicId){
        userid = _videoList[i].userId
      }
    }
    wx.navigateTo({
      url: '../video-details/video-details?actId=' + this.data.actId + '&id=' + id + '&userId=' + userid
    })
  },
  switchTab(e) {
    let id = e.currentTarget.id, switchFlag = true;
    if(id == 2) {
      switchFlag = false;
    }
    this.setData({
      flag: true,
      page: 1,
      switchFlag: switchFlag,
      videoList: []
    });
    this.videoList();
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      flag: true,
      videoList: []
    });
    this.videoList();
  },
  onReachBottom: function () {
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.videoList();
    }
  },
  onShareAppMessage: function () {

  },
  dateConv: function (dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
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
  },
  getuserinfo() {
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          let that = this;
          Api.getOpenId(_parms).then((res) => {
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo();
            } else {
              that.findByCode();
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
  getmyuserinfo: function () {
    let _parms = {
      openId: app.globalData.userInfo.openId,
      unionId: app.globalData.userInfo.unionId
    }, that = this;
    Api.addUserUnionId(_parms).then((res) => {
      if (res.data.data) {
        app.globalData.userInfo.userId = res.data.data;
        wx.request({  //从自己的服务器获取用户信息
          url: this.data._build_url + 'user/get/' + res.data.data,
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 0) {
              let data = res.data.data;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              };
              if (!data.mobile) {
                that.setData({
                  isnew: true
                })
              }
            }
          }
        })
      }
    })
  },
  findByCode: function () {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
          if (res.data.code == 0) {
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo();
            } else {
              wx.hideLoading();
              that.setData({
                istouqu: true
              })
            }
          } else {
            that.findByCode();
            wx.hideLoading();
            that.setData({
              istouqu: true
            })
          }
        })
      }
    })
  }
})