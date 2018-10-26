import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: '',
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
    switchFlag: true,
    vitotal:0,
    actdata:{}
  },
  onLoad: function (options) {
    console.log("options:",options)
    if(options.id){
      this.setData({
        actId: options.id,
      })
    }
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });
    //在此函数中获取扫描普通链接二维码参数
    let q = decodeURIComponent(options.q);
    if (q) {
      if (utils.getQueryString(q, 'flag') == 5) {
        console.log(utils.getQueryString(q, 'actId'));
        this.setData({
          actId: utils.getQueryString(q, 'actId')
        });
      }
    } else {
      this.setData({
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.mobile,
      });
    }
    
    this.videlistInit();
  },
  onShow:function(){},
  videlistInit: function () {
    wx.showLoading({
      title: '数据加载中...',
    });
    if (!app.globalData.userInfo.mobile) {
      this.getuserinfo();
    }else{
      this.videoInfo();
      this.videoData();
      this.videoList();
    }
    this.setData({
      page: 1,
      videoList: [],
      flag: true
    });
    
  },
  toactlist() {
    wx.switchTab({
      url: '../../index/index',
    })
  },
  videoInfo() {     //视频详情
    let _parms = {
      id: this.data.actId,
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      sourceType: '1',
      token: app.globalData.token
    },that = this;
    Api.actdetail(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        let startTime = data.data.startTime,
          endTime = data.data.endTime;
        startTime = startTime.substring(0, startTime.indexOf(" "));
        endTime = endTime.substring(0, endTime.indexOf(" "));
        wx.hideLoading();
        this.setData({
          actdata:data.data,
          mainPic: data.data.mainPic,
          infoPic: data.data.actUrl,
          actName: data.data.actName,
          actDesc: data.data.actDesc,
          startTime: startTime,
          endTime: endTime
        });
      }else{
        // that.videoInfo();
      }
    });
  },
  //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    this.setData({
      _page: 1
    })
  },
  videoData() {
    let _parms = {
      actId: this.data.actId,
      token: app.globalData.token
    },that = this;
    Api.videoData(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        if(data.data){
          this.setData({
            zanTotal: data.data.zanTotal,
            actHitNum: data.data.actHitNum
          });
        }
      }else{
        // that.videoData();
      }
    });
  },
  addVideo() {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      let _actdata = this.data.actdata;
      if (_actdata.actStatus ==0){
        wx.showToast({
          title: '活动还未开始',
          icon: 'none',
          mask:'true'
        })
      } else if (_actdata.actStatus == 1){
        if (app.globalData.isflag) {
          wx.navigateTo({
            url: '../../discover-plate/dynamic-state/dynamic-state?acfrom=1&actId=' + this.data.actId + '&id=2'
          })
        } else {
          wx.showToast({
            title: '本期活动已结束',
            icon: 'none'
          })
        }
      } else if (_actdata.actStatus == 2){
        wx.showToast({
          title: '活动已结束',
          icon: 'none',
          mask: 'true'
        })
      }
    }
  },
  videoList() {
    if (app.globalData.isflag) {
      let _parms = {
        actId: this.data.actId,
        // zanUserId: app.globalData.userInfo.userId,
        page: this.data.page,
        rows: 6,
        token: app.globalData.token
      }, that = this;
      if (!this.data.switchFlag) {
        _parms['sortType'] = 1;
      }
      Api.videoList(_parms).then((res) => {
        let data = res.data;
        if (data.code == 0) {
          wx.hideLoading();
          let videoList = this.data.videoList, listData = data.data.list;

          this.setData({
            vitotal: data.data.total
          })
          if (listData && listData.length) {
            let reg = /^1[34578][0-9]{9}$/;
            for (let i = 0; i < listData.length; i++) {
              videoList.push(listData[i]);

              if (reg.test(videoList[i].nickName)) {
                videoList[i].nickName = videoList[i].nickName.substr(0, 3) + "****" + videoList[i].nickName.substr(7)
              }
              if (reg.test(videoList[i].userName)) {
                videoList[i].userName = videoList[i].userName.substr(0, 3) + "****" + videoList[i].userName.substr(7)
              }
              // if (videoList[i].nickName == 'null' || !videoList[i].nickName){
              //   videoList[i].nickName = videoList.userName[i];
              // }
              if (videoList[i].nickName && videoList[i].nickName.length > 11) {
                videoList[i].nickName = videoList[i].nickName.slice(0, 11);
              }
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
        } else {
          // that.videoList();
        }
      });
    } else{
      wx.hideLoading();
    }
    
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
      wx.navigateTo({
        url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
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
              if(data){
                for (let key in data) {
                  for (let ind in app.globalData.userInfo) {
                    if (key == ind) {
                      app.globalData.userInfo[ind] = data[key]
                    }
                  }
                };
                that.setData({
                  userId: app.globalData.userInfo.userId,
                  userName: app.globalData.userInfo.mobile,
                });
                that.videoInfo();
                that.videoData();
                that.videoList();
                if (!data.mobile) {
                  that.setData({
                    isnew: true
                  })
                }
              }else{
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
          wx.hideLoading();
          if (res.data.code == 0) {
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo();
            } 
          } 
        })
      }
    })
  }
})