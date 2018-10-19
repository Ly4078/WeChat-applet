import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
var swichrequestflag = false;
Page({
  data: {
    navbar: ['附近美食', '我的秒杀'],
    currentTab: 0,
    showModal: true,
    aNearbyShop: [],
    page: 1,
    listPages: 1,
    timer: null,
    timeArr: [], //倒计时集合
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0
  },
  onShow: function(options) {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null,
      page: 1,
      aNearbyShop: []
    })
    if (this.data.currentTab == 0) {
      this.secKillList();
    } else if (this.data.currentTab == 1) {
      this.mySecKill();
    }
  },
  onHide() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
    wx.hideLoading();
  },
  onUnload() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
    wx.hideLoading();
  },
  secKillList() { //附近美食
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 0,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      page: this.data.page,
      rows: 8,
      token: app.globalData.token
    };
    swichrequestflag = true;
    Api.secKillList(_parms).then((res) => {
      if(this.data.page == 1) {
        this.setData({
          aNearbyShop: []
        });
      }
      let data = res.data;
      if (data.code == 0 && data.data.list) {
        let list = data.data.list,
          listPages = Math.ceil(data.data.total / 8),
          aNearbyShop = this.data.aNearbyShop;
        for (let i = 0; i < list.length; i++) {
          list[i].distance = utils.transformLength(list[i].distance);
          list[i].widthRate = list[i].stockNum / 15 * 186;
          aNearbyShop.push(list[i]);
        }
        this.setData({
          aNearbyShop: aNearbyShop,
          listPages: listPages,
          loading: false
        }, () => {
          wx.hideLoading();
          });
        swichrequestflag = false;
      } else {
        this.setData({ loading: false})
        wx.hideLoading();
      }
    }, () => {
      wx.hideLoading();
      this.setData({ loading: false })
      swichrequestflag = false;
    });
  },
  mySecKill() { //我的秒杀列表
    wx.showLoading({
      title: '加载中...'
    })
    let _parms = {
      parentId: app.globalData.userInfo.userId
    };
    swichrequestflag = true;
    Api.mySecKill(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data) {
        this.setData({
          aNearbyShop: []
        });
        let list = data.data,
          aNearbyShop = this.data.aNearbyShop;
        for (let i = 0; i < list.length; i++) {
          aNearbyShop.push(list[i]);
        }
        this.setData({
          aNearbyShop: aNearbyShop
        }, () => {
          wx.hideLoading();
        });
        let arr = [];
        for (let i = 0; i < this.data.aNearbyShop.length; i++) {
          arr.push({
            endTime: this.data.aNearbyShop[i].endTime.replace(/\-/g, "/"),
            countDown: ''
          });
        }
        this.updateTime(arr);
        swichrequestflag = false;
      } else {
        wx.hideLoading();
      }
    }, () => {
      wx.hideLoading();
      swichrequestflag = false;
    });
  },
  updateTime(arr) { //倒时计
    let minutes = '',
      seconds = '',
      timeArr = arr,
      countDown = '',
      miliEndTime = '',
      miliNow = '',
      timer = null,
      minus = '', //时间差(秒)
      that = this;
    timer = setInterval(function() {
      console.log('倒计时')
      that.setData({
        timer: timer
      });
      let isEnd = 0;
      for (let i = 0; i < arr.length; i++) {
        miliNow = new Date().getTime(); //现在时间
        miliEndTime = (new Date(timeArr[i].endTime)).getTime(); //结束时间
        minus = Math.floor((miliEndTime - miliNow) / 1000); //时间差(秒)
        if (minus <= 0) {
          isEnd++;
          timeArr[i].countDown = '';
        } else {
          isEnd--;
          // hours = Math.floor(minus / 3600); //时
          minutes = Math.floor(minus / 60); //分
          seconds = minus % 60; //秒
          // hours = hours < 10 ? '0' + hours : hours;
          minutes = minutes < 10 ? '0' + minutes : minutes;
          seconds = seconds < 10 ? '0' + seconds : seconds;
          timeArr[i].countDown = minutes + ':' + seconds;
        }
        that.setData({
          timeArr: timeArr
        });
        timeArr = that.data.timeArr;
      }
      that.setData({
        timeArr: timeArr
      });
      if (isEnd == timeArr.length) {
        clearInterval(that.data.timer);
        return false;
      }
      minus--;
    }, 1000)
  },
  occludeAds: function() { //是否关闭banner图
    this.setData({
      showModal: false
    })
  },
  //响应点击导航栏
  navbarTap: function (e) {
    if (swichrequestflag) {
      return;
    }
    let oldIdx = this.data.currentTab, idx = e.currentTarget.dataset.idx;
    if (oldIdx == idx) {
      return;
    }
    this.setData({
      currentTab: idx,
      page: 1,
      aNearbyShop: []
    }, () => {
      if (idx == 0) {
        this.secKillList();
        let _this = this;
        clearInterval(_this.data.timer);
        this.setData({
          timer: null,
          timeArr: [], //倒计时集合
          countDownHour: 0,
          countDownMinute: 0,
          countDownSecond: 0
        });
      } else if (idx == 1) {
        this.mySecKill();
      }
    })
  },
  toSecKillDetail(e) { //跳转至菜品详情
    let curr = e.currentTarget;
    wx.navigateTo({
      url: 'secKillDetail/secKillDetail?id=' + curr.id + '&shopId=' + curr.dataset.shopid
    })
  },
  onPullDownRefresh: function () { //下拉刷新
    if (swichrequestflag) {
      return;
    }
    if (this.data.currentTab == 0) {
      this.setData({
        page: 1
      });
      this.secKillList();
    } else if (this.data.currentTab == 1) {
      let _this = this;
      clearInterval(_this.data.timer);
      this.setData({
        timer: null
      });
      this.mySecKill();
    }
  },
  onReachBottom: function() { //上拉加载
    if (this.data.listPages <= this.data.page){
      return
    }
    if (this.data.currentTab == 0) {
      this.setData({
        page: this.data.page + 1,
        loading: true
      }, () => {
        this.secKillList();
      });
      
    }
    
    
    
   
  }
})