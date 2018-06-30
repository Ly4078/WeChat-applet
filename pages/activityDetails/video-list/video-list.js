import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
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
    this.videoInfo();
    this.videoData();
    this.videoList();
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
      console.log(res);
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
    wx.navigateTo({
      url: '../../discover-plate/dynamic-state/dynamic-state?actId=' + this.data.actId + '&id=2'
    })
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
    wx.navigateTo({
      url: '../video-details/video-details?actId=' + this.data.actId + '&id=' + e.currentTarget.id
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
  }
})