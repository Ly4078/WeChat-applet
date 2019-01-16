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
    toTops: false,
    shareId: 0,
    actId: '41',
    name: '',
    address: '',
    distance: '',
    picUrl: '',
    city: '',
    rows: 10,
    page: 1,
    pageTotal: 1,
    dishList: []
  },
  onLoad: function (options) {
    let hidecai = wx.getStorageSync('txtObj') ? wx.getStorageSync('txtObj').hidecai:true
    if (options.shareId) {
      this.setData({
        shareId: options.shareId
      });
    }
    this.setData({
      id: options.id,
      hidecai,
      address: options.address,
      distance: options.distance,
      name: options.name,
      picUrl: options.picUrl,
      city: options.city,
      locationX: options.locationX,
      locationY: options.locationY
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
      if (this.data.dishList.length <= 0) {
        this.dishL();
      }
    } else {
      this.getlocation();
    }
  },
  dishL() { //砍菜列表
    wx.showLoading({
      title: '加载中...'
    })
    let that = this, lng = "", lat = "", _parms = {};
    lng = wx.getStorageInfoSync('userInfo').lng ? wx.getStorageInfoSync('userInfo').lng : "110.77877";
    lat = wx.getStorageInfoSync('userInfo').lat ? wx.getStorageInfoSync('userInfo').lat : "32.6226";
    _parms = {
      actId: this.data.actId,
      zanUserId: app.globalData.userInfo.userId,
      browSort: 0,    //0附近 1销量 2价格
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
      city: this.data.city,
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
      wx.hideLoading();
    }, () => {
      swichrequestflag = false;
    });
  },
  toBuy(e) { //买菜
    let id = e.currentTarget.id,
      actId = e.currentTarget.dataset.actid,
      shopId = e.currentTarget.dataset.shopid,
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: '../../../../pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=' + actId + '&categoryId=' + categoryId + '&city=' + this.data.city
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
      title: this.data.name + '专区菜品',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_wandazhuanqu.jpg',
      path: '/packageB/pages/wanda/wandaBranch/wandaBranch?shareId=1&id=' + this.data.id + '&picUrl=' + this.data.picUrl + '&name=' + this.data.name + '&address=' + this.data.address + '&distance=' + this.data.distance + '&city=' + this.data.city + '&locationX=' + this.data.locationX + '&locationY=' + this.data.locationY,
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
  // //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  //滚动事件
  onPageScroll: function (e) {
    if (e.scrollTop > 400) {
      this.setData({
        toTops: true
      })
    } else {
      this.setData({
        toTops: false
      })
    }
  },
  //打开地图导航，先查询是否已授权位置
  TencentMap: function (event) {
    let that = this;
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
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户位置信息
              that.setData({
                isshowlocation: true
              })
            } else {
              that.openmap();
            }
          }
        })
      }
    })
  },
  //打开地图，已授权位置
  openmap () {
    console.log(typeof this.data.locationX);
    let that = this;
    wx.openLocation({
      longitude: Number(that.data.locationX),
      latitude: Number(that.data.locationY),
      scale: 18,
      name: that.data.name,
      address: that.data.address,
      success: function (res) { },
      fail: function (res) { }
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