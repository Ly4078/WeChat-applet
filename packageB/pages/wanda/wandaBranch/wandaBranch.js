import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var app = getApp();
let gameFlag = true; //防止重复点击
var village_LBS = function (that) {
  wx.getLocation({
    success: function (res) {
      console.log('vill_res:', res)
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}
var swichrequestflag = false;

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    branchName: '汉街店',
    address: '武汉市武昌区水果湖沙湖大道18号',
    distance: '520m',
    picUrl: '/images/icon/login/login.jpg',
    page: 1,
    pageTotal: 1,
    dishList: []
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    });
    this.dishL();
  },
  onShow: function () {
    
  },
  onUnload: function () {
    
  },
  dishL() { //砍菜列表
    let that = this, lng = "", lat = "", _parms = {};
    lng = wx.getStorageInfoSync('userInfo').lng ? wx.getStorageInfoSync('userInfo').lng : "110.77877";
    lat = wx.getStorageInfoSync('userInfo').lat ? wx.getStorageInfoSync('userInfo').lat : "32.6226";
    _parms = {
      actId: 41,
      zanUserId: app.globalData.userInfo.userId,
      browSort: 0,    //0附近 1销量 2价格
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
      city: app.globalData.userInfo.city ? app.globalData.userInfo.city : '十堰市',
      isDeleted: 0,
      page: this.data.page,
      rows: 10,
      token: app.globalData.token,
      shopZoneItemId: that.data.id
    };
    swichrequestflag = true;
    Api.partakerList(_parms).then((res) => {
      console.log(res);
      if(res.data.code == 0) {
        if (res.data.data.list && res.data.data.list.length > 0) {
          let list = res.data.data.list, dishList = that.data.dishList;
          for(let i = 0 ; i < list.length; i++) {
            dishList.push(list[i]);
          }
          that.setData({
            dishList: dishList,
            pageTotal: Math.ceil(res.data.data.total / 10)
          });
        }
        swichrequestflag = false;
      }
    }, () => {
      swichrequestflag = false;
    });
  },
  onPullDownRefresh: function () {   //刷新
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: 1,
      dishList: []
    });
    this.dishL();
  },
  onReachBottom: function () { // 翻页
    if (this.data.page > this.data.pageTotal) {
      return;
    }
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    this.dishL();
  },
  onShareAppMessage: function () {

  },
  findByCode: function () { //通过code查询进入的用户信息，判断是否是新用户
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            app.globalData.userInfo.userId = data.id;
            app.globalData.userInfo.lat = data.locationX;
            app.globalData.userInfo.lng = data.locationY;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }
            if (!data.mobile) { //是新用户，去注册页面
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            } else {
              that.authlogin();
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
            if (that.data._city || app.globalData.userInfo.city) {
              that.dishL();
            }
          } else {
            // that.getUserlocation();
            that.getlocation();
          }
        }
      }
    })
  },
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权          
          // that.getUserlocation();
          // village_LBS(that);
          wx.getLocation({
            success: function (res) {
              let latitude = res.latitude,
                longitude = res.longitude;
              that.requestCityName(latitude, longitude);
            },
          })
        } else {
          that.setData({
            isshowlocation: true
          })

        }
      }
    })
  },
  getUserlocation: function () { //获取用户位置经纬度
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude,
          longitude = res.longitude;
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其位置信息          
              that.setData({
                isshowlocation: true
              })

            } else {

            }
          }
        })
      }
    })
  },
  getlocation: function () { //获取用户位置
    let that = this,
      lat = '',
      lng = '';
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.requestCityName(latitude, longitude);
      },

      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              that.setData({
                isshowlocation: true
              })
            }
          }
        })
      }
    })
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    if (!lat && !lng) {
      // this.getlocation();
    } else {
      app.globalData.userInfo.lat = lat;
      app.globalData.userInfo.lng = lng;
      if (app.globalData.userInfo.city || this.data._city) {
        that.dishL();
      } else {
        wx.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: (res) => {
            if (res.data.status == 0) {
              let _city = res.data.result.address_component.city;
              if (_city == '十堰市') {
                app.globalData.userInfo.city = _city;
              } else {
                app.globalData.userInfo.city = '十堰市';
              }
              app.globalData.oldcity = app.globalData.userInfo.city;
              wx.setStorageSync('userInfo', app.globalData.userInfo);
              that.dishL();
            }
          }
        })
      }
    }
  }
})