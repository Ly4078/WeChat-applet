import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import getToken from '../../../utils/getToken.js';
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
    shareId: 0,
    showSkeleton: true,
    isshowlocation: false,
    list: []
  },
  onLoad: function(options) {
    if (options.shareId) {
      this.setData({
        shareId: options.shareId
      })
    }
    setTimeout(() => {
      this.setData({
        showSkeleton: false
      })
    }, 3000)
  },
  onShow: function() {
    this.setData({
      isshowlocation: false
    });
    if (!app.globalData.token) { //没有token 获取token
      let that = this;
      getToken(app).then(() => {
        that.getData();
      })
    } else {
      this.getData();
    }
  },
  getData() { //获取数据
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      if (this.data.list.length <= 0) {
        this.wandaList();
      }
    } else {
      this.getlocation();
    }
  },
  wandaList() {
    wx.showLoading({
      title: '加载中...'
    })
    let _param = {}, str = "", that = this;
    _param = {
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      regionName: "万达"
    }
    for(let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    let _url = this.data._build_url + 'shopZone/listItem';
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      data: JSON.stringify(_param),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let list = res.data.data.list;
          for (let i = 0; i < list.length; i++) {
            list[i].distance = utils.transformLength(list[i].distance);
          }
          that.setData({
            list: list
          });
        }
        wx.hideLoading();
      },
      fail() {
        wx.hideLoading();
      }
    })
  },
  toBranch(e) { //跳转至万达各店
    let id = e.currentTarget.id, list = this.data.list, picUrl = '', name = '', address = '', distance = '', locationX = '', locationY = '';
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        picUrl = list[i].picUrl;
        name = list[i].name;
        address = list[i].address;
        distance = list[i].distance;
        locationX = list[i].locationX;
        locationY = list[i].locationY;
      }
    }
    wx.navigateTo({
      url: 'wandaBranch/wandaBranch?id=' + id + '&picUrl=' + picUrl + '&name=' + name + '&address=' + address + '&distance=' + distance + '&city=' + app.globalData.userInfo.city + '&locationX=' + locationX + '&locationY=' + locationY
    })
  },
  onShareAppMessage: function() {
    return {
      title: '万达专区活动',
      imageUrl:'https://xqmp4-1256079679.file.myqcloud.com/15927505686_wandazhuanqu.jpg',
      path: '/packageB/pages/wanda/wanda?shareId=1',
      success: function (res) { },
      fail: function (res) { }
    }
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
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
            } else {
              village_LBS(that);
            }
          }
        })
      }
    })
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    app.globalData.userInfo.lat = lat;
    app.globalData.userInfo.lng = lng;
    if (app.globalData.userInfo.city || this.data._city) {
      this.wandaList();
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
})