import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
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

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation: false,
    page: 1,
    list: []
  },
  onLoad: function(options) {
    let _token = wx.getStorageSync('token') || "";
    let userInfo = wx.getStorageSync('userInfo') || {};
    if (userInfo) {
      app.globalData.userId = userInfo;
    }
    if (_token.length > 5) {
      app.globalData.token = _token;
    }
  },
  onShow: function() {
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
            if (this.data._city || app.globalData.userInfo.city) {
              this.wandaList();
            } else {
              this.getUserlocation();
            }
          } else {
            this.getlocation();
          }
        } else {
          this.authlogin();
        }
      } else {
        this.authlogin();
      }
    } else {
      this.findByCode();
    }
  },
  wandaList() {
    let _param = {}, str = "", that = this;
    _param = {
      page: this.data.page,
      locationX: app.globalData.userInfo.lat,
      locationY: app.globalData.userInfo.lng,
      rows: 10,
      city: app.globalData.userInfo.city,
      regionName: "万达"
    }
    for(let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    wx.request({
      url: that.data._build_url + 'shopZone/listItem',
      data: JSON.stringify(_param),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        console.log(res);
        if (res.data.code == 0) {
          let list = res.data.data.list;
          for (let i = 0; i < list.length; i++) {
            list[i].distance = utils.transformLength(list[i].distance);
          }
          that.setData({
            list: list
          });
        }
      },
      fail() {
        // wx.stopPullDownRefresh()
        // wx.hideLoading()
      }
    })
  },
  toBranch(e) { //跳转至万达各店
    console.log(e);
    let id = e.currentTarget.id, list = this.data.list, picUrl = '', name = '', address = '',distance = '';
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        picUrl = list[i].picUrl;
        name = list[i].name;
        address = list[i].address;
        distance = list[i].distance;
      }
    }
    wx.navigateTo({
      url: 'wandaBranch/wandaBranch?id=' + id + '&picUrl=' + picUrl + '&name=' + name + '&address=' + address + '&distance=' + distance
    })
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
              that.wandaList();
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
        that.wandaList();
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
              that.wandaList();
            }
          }
        })
      }
    }
  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function() {
    
  },
  onShareAppMessage: function() {

  }
})