//index.js 
import Api from '/../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var postsData = require('/../../data/posts-data.js')
const app = getApp()

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    city: "",
    carousel: [],  //轮播图
    business: [], //商家列表，推荐餐厅
    actlist: [],  //热门活动
    hotlive: [],  //热门直播
    food: [],   //美食墙
    logs: []
  },
  onLoad: function (options) {
    let lat = '', lng = '';  //lat纬度   lng经度
    wx.getLocation({  //获取当前的地理位置
      type: 'wgs84',
      success: (res) => {
        var lat = res.latitude
        var lng = res.longitude
        this.requestCityName(lat, lng);
      }
    })
    this.getcarousel();
    this.getdata();
    this.getactlist();
    this.gethotlive();
    this.gettopic();

  },
  onShow() {
    let lat = '', lng = '';  //lat纬度   lng经度
    wx.getStorage({
      key: 'lat',
      success: function (res) {
        lat = res.data;
      }
    })
    wx.getStorage({
      key: 'lng',
      success: function (res) {
        lng = res.data;
      }
    })
    let that = this;
    setTimeout(function () {
      if (lat && lng) {
        that.requestCityName(lat, lng)
      }
    }, 500)
  },
  requestCityName(lat, lng) {//获取当前城市
    wx.request({
      url: 'http://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        this.setData({
          city: res.data.result.address_component.city
        })
      }
    })
  },
  getcarousel: function () {  //轮播图
    let that = this;
    Api.hcllist().then((res) => {
      // console.log("carousel:",res.data.data)
      this.setData({
        carousel: res.data.data
      })
    })
  },
  getdata: function () { // 获取推荐餐厅数据
    Api.shoptop().then((res) => {
      // console.log("businss:",res.data.data)
      this.setData({
        business: res.data.data
      })
    })
  },
  gettopic: function () {  // 美食墙
    Api.topictop().then((res) => {
      // console.log("food:", res.data.data)
      this.setData({
        food: res.data.data
      })
    })
  },
  getactlist() {  //获取热门活动数据
    Api.actlist().then((res) => {
      // console.log("actlist:",res.data.data.list)
      this.setData({
        actlist: res.data.data.list
      })
    })
  },
  gethotlive() {  //获取热门直播数据 
    let that = this;
    wx.request({
      url: that.data._build_url + 'zb/top/',
      success: function (res) {
        // console.log("hotlive:",res.data.data)
        that.setData({
          hotlive: res.data.data
        })
      }
    })
  },
  // 用户定位
  userLocation: function () {
    wx.navigateTo({
      url: 'user-location/user-location',
    })
  },

  //用户搜索
  seekTap: function () {
    wx.navigateTo({
      url: 'user-seek/user-seek',
    })
  },
  //用户优惠券
  discountCoupon: function () {
    wx.navigateTo({
      url: '../personal-center/my-discount/my-discount',
    })
  },
  shopping: function () {
    wx.navigateTo({
      url: 'consume-qibashare/consume-qibashare',
    })
  },
  // 餐厅
  diningRoom: function () {
    wx.navigateTo({
      url: 'dining-room/dining-room',
    })
  },

  //未开放 酒店 景点 休闲娱乐
  hotelUnopen: function () {
    wx.showToast({
      title: '该功能更新中...',
    })
  },

  scenicSpot: function () {
    wx.showToast({
      title: '该功能更新中...',
    })
  },
  entertainment: function () {
    wx.navigateTo({
      url: 'webview/webview',
    })
  },
  recommendCt: function (event) {
    wx.navigateTo({
      url: 'dining-room/dining-room',
    })
  },

  cateWall: function (event) {  //美食墙 查看更多
    wx.switchTab({
      url: '../discover-plate/discover-plate',
    })
  },
  preferential: function (event) {
    wx.switchTab({
      url: '../activityDetails/activity-details',
    })
  },
  diningHhall: function (event) {  //跳转到商家（餐厅）内页
    const shopid = event.currentTarget.id
    console.log("diningHhall:", shopid)
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },
  fooddetails: function (e) {  //跳转美食墙内页
    const id = e.currentTarget.id
    let _data = this.data.food
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan
      }
    }
    wx.navigateTo({
      url: '../discover-plate/dynamic-state/article_details/article_details?id=' + id+'&zan='+zan,
    })
  },
  detailOfTheActivity: function (event) { //跳转到活动内页
    const actid = event.currentTarget.id
    // console.log("actid:",actid)
    wx.navigateTo({
      url: '../activityDetails/details-like/details-like?actid=' + actid,
    })
  },
  tolive: function (ev) { //跳转到直播内页
    const liveid = ev.currentTarget.id
    // console.log("liveid:",liveid)
    // wx.navigateTo({
    //   url: 'test?liveid=' + liveid,
    // })
  }

})
