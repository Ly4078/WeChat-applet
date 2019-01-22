import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import getCurrentLocation from '../../../utils/getCurrentLocation.js';
import getToken from '../../../utils/getToken.js';
var app = getApp();
var swichrequestflag = false;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    showSkeleton: true,
    SkeletonData: ['', '', '', '', '', ''],
    navbar: ['附近美食', '我的秒杀'],
    currentTab: 0,
    showModal: true,
    aNearbyShop: [],
    page: 1,
    actId:44,
    listPages: 1,
    timer: null,
    timeArr: [], //倒计时集合
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0
  },
  onShow: function(options) {
    let _this = this;
    setTimeout(() => {
      _this.setData({
        showSkeleton: false
      })
    }, 3000)
    clearInterval(_this.data.timer);
    this.setData({
      timer: null,
      page: 1,
      aNearbyShop: []
    })
    if(!app.globalData.token){
      getToken(app).then( ()=>{
        getCurrentLocation(_this).then((res) => {
          if (_this.data.currentTab == 0) {
            _this.secKillList();
          } else if (_this.data.currentTab == 1) {
            _this.mySecKill();
          }
        })
      })
    }else{
      if (app.globalData.userInfo.city && app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
        if (_this.data.currentTab == 0) {
          _this.secKillList();
        } else if (_this.data.currentTab == 1) {
          _this.mySecKill();
        }
      } else {
        getCurrentLocation(_this).then( (res)=>{
          if (_this.data.currentTab == 0) {
            _this.secKillList();
          } else if (_this.data.currentTab == 1) {
            _this.mySecKill();
          }
        })
      }
     
    }
  },

  openSetting() {//打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权  
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
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
  onPullDownRefresh: function () { //下拉刷新
    this.setData({
      page:  1
    })
    this.secKillList();
  },
  onReachBottom:function(){
    this.setData({
      page: this.data.page+1
    })
    this.secKillList();
  },
  secKillList() { //附近美食
    let that = this,
      _parms = {};
    let lng = wx.getStorageInfoSync('userInfo').lng ? wx.getStorageInfoSync('userInfo').lng : "110.77877";
    let lat = wx.getStorageInfoSync('userInfo').lat ? wx.getStorageInfoSync('userInfo').lat : "32.6226";
    _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 0,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      page: this.data.page,
      rows: 10,
      actId: that.data.actId,
      isDeleted: 0,
      token: app.globalData.token
    };

    swichrequestflag = true;
    Api.listForActs(_parms).then((res) => {
      if (this.data.page == 1) {
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
          if (list[i].shop.shopName.length>12){
            list[i].shop.shopName = list[i].shop.shopName.substring(0, 12)+'...'
          }
          
          aNearbyShop.push(list[i]);
        }
        this.setData({
          aNearbyShop: aNearbyShop,
          listPages: listPages,
          loading: false,

        }, () => {
          setTimeout(() => {
            that.setData({
              showSkeleton: false
            })
          }, 200)
          wx.hideLoading();
        });
        swichrequestflag = false;
      } else {
        this.setData({
          loading: false,
          showSkeleton: false
        })
        wx.hideLoading();
      }
    }, () => {
      wx.hideLoading();
      this.setData({
        loading: false,
        showSkeleton: false
      })
      swichrequestflag = false;
    });
  },
  mySecKill() { //我的秒杀列表
    let that = this;
    wx.showLoading({
      title: '加载中...'
    })
    let _parms = {
      parentId: app.globalData.userInfo.userId,
      actId: that.data.actId,
      row:10,
      page:this.data.page
    };
    swichrequestflag = true;
    Api.mySecKill(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data) {
        this.setData({
          aNearbyShop: []
        });
        let list = data.data,
          aNearbyShop = that.data.aNearbyShop;
        for (let i = 0; i < list.length; i++) {
          list[i].peoPleNum = list[i].peoPleNum > 2 ? '2' : list[i].peoPleNum;
          aNearbyShop.push(list[i]);
        }
        that.setData({
          aNearbyShop: aNearbyShop
        }, () => {
          wx.hideLoading();
        });
        let arr = [];
        for (let i = 0; i < that.data.aNearbyShop.length; i++) {
          arr.push({
            endTime: that.data.aNearbyShop[i].endTime.replace(/\-/g, "/"),
            countDown: ''
          });
        }
        that.setData({
          showSkeleton: false
        })
        that.updateTime(arr);
        swichrequestflag = false;
      } else {
        wx.hideLoading();
        that.setData({
          showSkeleton: false
        })
      }
    }, () => {
      wx.hideLoading();
      that.setData({
        showSkeleton: false
      })
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
  navbarTap: function(e) {
    let _this = this;
    // if (swichrequestflag) {
    //   return;
    // }
    let oldIdx = this.data.currentTab,
      idx = e.currentTarget.dataset.idx;
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
    let curr = e.currentTarget,
      _categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: 'secKillDetail/secKillDetail?id=' + curr.id + '&shopId=' + curr.dataset.shopid + '&categoryId=' + _categoryId + '&actId=' + this.data.actId
    })
  },
  onPullDownRefresh: function() { //下拉刷新
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
    if (this.data.listPages <= this.data.page) {
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
  },
  onShareAppMessage: function (res) {
    return {
      title:'限量秒杀',   imageUrl:'https://xq-1256079679.file.myqcloud.com/15927505686_1545618005_miaosha12312321321_0.png'
    }
  }
})