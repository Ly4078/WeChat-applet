import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import getToken from '../../../../utils/getToken.js';
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
    isshowlocation: false,
    loading: false,
    name: '',
    address: '',
    distance: '',
    picUrl: '',
    rows: 10,
    page: 1,
    pageTotal: 1,
    dishList: []
  },
  onLoad: function (options) {
    this.setData({
      id: options.id,
      address: options.address,
      distance: options.distance,
      name: options.name,
      picUrl: options.picUrl
    });
  },
  onShow: function () {
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
      this.setData({
        dishList: []
      });
      this.dishL();
    } else {
      this.getlocation();
    }
  },
  dishL() { //砍菜列表
    let that = this, lng = "", lat = "", _parms = {};
    lng = wx.getStorageInfoSync('userInfo').lng ? wx.getStorageInfoSync('userInfo').lng : "110.77877";
    lat = wx.getStorageInfoSync('userInfo').lat ? wx.getStorageInfoSync('userInfo').lat : "32.6226";
    _parms = {
      actId: 45,
      zanUserId: app.globalData.userInfo.userId,
      browSort: 0,    //0附近 1销量 2价格
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
      city: app.globalData.userInfo.city ? app.globalData.userInfo.city : '十堰市',
      isDeleted: 0,
      page: this.data.page,
      rows: this.data.rows,
      token: app.globalData.token,
      shopZoneItemId: that.data.id
    };
    swichrequestflag = true;
    Api.partakerList(_parms).then((res) => {
      that.setData({
        loading: false
      })
      wx.stopPullDownRefresh();
      if(res.data.code == 0) {
        if (res.data.data.list && res.data.data.list.length > 0) {
          let list = res.data.data.list, dishList = that.data.dishList;
          for (let i = 0; i < list.length; i++) {
            list[i].distance = utils.transformLength(list[i].distance);
            dishList.push(list[i]);
          }
          that.setData({
            dishList: dishList,
            pageTotal: Math.ceil(res.data.data.total / 10)
          });
        }
      }
      swichrequestflag = false;
    }, () => {
      swichrequestflag = false;
    });
  },
  toBuy(e) { //买菜
    let id = e.currentTarget.id,
      shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: '../../../../pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=45&categoryId=8'
    })
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
  onShareAppMessage: function (res) {
    console.log(res);
    return {
      title: '享7美食',
      desc: '万达专区活动',
      path: '/packageB/pages/wanda/wandaBranch/wandaBranch?id=' + this.data.id + '&picUrl=' + this.data.picUrl + '&name=' + this.data.name + '&address=' + this.data.address + '&distance=' + this.data.distance,
      success: function (res) { },
      fail: function (res) { }
    }
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
      this.dishL();
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
})