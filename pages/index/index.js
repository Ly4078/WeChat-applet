//index.js 
import Api from '/../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
let app = getApp()

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    city: "",
    openId: '',
    sessionKey: '',
    carousel: [],  //轮播图
    business: [], //商家列表，推荐餐厅
    actlist: [],  //热门活动
    hotlive: [],  //热门直播
    food: [],   //美食墙
    logs: [],
    lat: '',
    lng: ''
  },
  onLoad: function (options) {
    let that = this
    this.getopenid();
    this.getcarousel();
    this.getdata();
    this.getactlist();
    this.gethotlive();
    this.gettopic();
  },
  onShow: function () {
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

  getopenid: function () {  //获取openID sessionKey
    let that = this
    let lat = '', lng = ''
    wx.login({
      success: res => {
        let _code = res.code;
        console.log("code:",_code)
        // return false  //此处返回，则获取的code是没有用过的，用于测试
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            console.log("res:", res)
            if (res.data.code == 0) {
              that.setData({
                openId: res.data.data.openId,
                sessionKey: res.data.data.sessionKey
              })
              app.globalData.userInfo.openId = res.data.data.openId,
              app.globalData.userInfo.sessionKey = res.data.data.sessionKey
              // this.getuserInfo()
              this.getlocation()
            }
          })
        }
      }
    })
  },
  getuserInfo: function () {  //获取用户信息
    let that = this;
    wx.getUserInfo({
      success: res => {
        if (res.userInfo) {
          this.data.Info = res.userInfo
          this.setblouserInfo(res.userInfo)
        }
      },
      complete: res => {
        this.getlocation();
      }
    })
  },
  getlocation: function () {  //获取用户位置
    let that = this
    let lat = '', lng = ''
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude
        let longitude = res.longitude
        let speed = res.speed
        let accuracy = res.accuracy
        that.setData({
          lat: latitude,
          lng: longitude
        })
        that.requestCityName(latitude, longitude);
      },
      complete: function (res) {
        that.wxgetsetting();
      }
    })
  },
  wxgetsetting: function () {  //若用户之前没用授权其用户信息和位置信息，则调整此函数请求用户授权
    let that = this
    wx.getSetting({
      success: (res) => {
        // if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
        if (res.authSetting['scope.userLocation']) {
          // console.log("用户已授受获取其用户信息和位置信息")
        } else {
          // console.log("用户未授受获取其用户信息或位置信息")
          wx.showModal({
            title: '提示',
            content: '享7要你的用户信息和位置信息，快去授权！',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({  //打开授权设置界面
                  success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                      wx.getUserInfo({
                        success: res => {
                          if (res.userInfo) {
                            // this.data.Info = res.userInfo
                            that.setblouserInfo(res.userInfo)
                          }
                        }
                      })
                    }
                    if (res.authSetting['scope.userLocation']) {
                      wx.getLocation({
                        type: 'wgs84',
                        success: function (res) {
                          let latitude = res.latitude
                          let longitude = res.longitude
                          let speed = res.speed
                          let accuracy = res.accuracy
                          that.setData({
                            lat: latitude,
                            lng: longitude
                          })
                          that.requestCityName(latitude, longitude);
                        }
                      })
                    }
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    })
  },
  requestCityName(lat, lng) {//获取当前城市
    app.globalData.userInfo.lat = lat
    app.globalData.userInfo.lng = lng
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0) {
          this.setData({
            city: res.data.result.address_component.city
          })
          app.globalData.userInfo.city = res.data.result.address_component.city
        }
      }
    })
  },
  setblouserInfo: function (data) {  //将获取到的用户信息赋值给全局变量
    app.globalData.userInfo.userName = data.nickName,
      app.globalData.userInfo.nikcName = data.nickName,
      app.globalData.userInfo.avatarUrl = data.avatarUrl,
      app.globalData.userInfo.city = data.city,
      app.globalData.userInfo.sex = data.gender //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
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
      // console.log("actlist:",res)
      this.setData({
        actlist: res.data.data.list.slice(0,10)
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
  userLocation: function () {   // 用户定位
    wx.navigateTo({
      url: 'user-location/user-location',
    })
  },
  seekTap: function () {   //用户搜索
    wx.navigateTo({
      url: 'user-seek/user-seek',
    })
  },
  discountCoupon: function () {  //用户优惠券
    wx.navigateTo({
      url: '../personal-center/my-discount/my-discount',
    })
  },
  shopping: function () {
    wx.navigateTo({
      url: 'consume-qibashare/consume-qibashare',
    })
  },
  diningRoom: function () {  // 餐厅
    wx.navigateTo({
      url: 'dining-room/dining-room',
    })
  },
  hotelUnopen: function () {  //未开放 酒店 景点 休闲娱乐
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
    wx.showToast({
      title: '该功能更新中...',
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
      url: '../discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan,
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
