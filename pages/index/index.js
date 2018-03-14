//index.js 
import Api from '/../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var postsData = require('/../../data/posts-data.js')
let app = getApp()

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    city: "",
    openId:'',
    sessionKey:'',
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
    wx.login({
      success: res => {
        let _code = res.code;
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {  //获取openID sessionKey
            if (res.data.code == 0) {
              that.setData({
                openId: res.data.data.openId,
                sessionKey: res.data.data.sessionKey
              })
            }
          })
        }
      }
    })

    wx.getSetting({
        success(res) {
            if(!res.authSetting['scope.userLocation']) {
                wx.openSetting({
                    success: (res) => {
                        console.log(res)
                        if(!res.authSetting['scope.userLocation']) {
                            wx.showModal({
                                title: '温馨提醒',
                                content: '需要获取您的地理位置才能使用小程序',
                                cancelText: '不使用',
                                confirmText: '获取位置',
                                success: function(res) {
                                    if(res.confirm) {
                                        getAuthor();
                                    } else if(res.cancel) {
                                        wx.showToast({
                                            title: '您可点击左下角 定位按钮 重新获取位置',
                                            icon: 'success',
                                            duration: 3000
                                        })
                                    }
                                }
                            })
                        }                    
                    }
                })
            }
        }
    })

    this.getuserInfo();
    this.getlocation();
    // wx.openSetting({
    //   success: (res) => {
 
    //     if (res.authSetting['scope.userInfo'] || res.authSetting['scope.userLocation']) {  //暂时关闭检验用户授权权限 ，如没有授权则要求用户授权
          
    //     }
    //   }
    // })



    this.getcarousel();
    this.getdata();
    this.getactlist();
    this.gethotlive();
    this.gettopic();

  },
  getlocation: function () {  //获取用户位置
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude
        let longitude = res.longitude
        let speed = res.speed
        let accuracy = res.accuracy
        that.setData({
          lat:latitude,
          lng:longitude
        })
        that.requestCityName(latitude, longitude);
      }
    })
  },
  getuserInfo: function () {  //获取用户信息
    let that = this;
    wx.getUserInfo({
      success: res => {
        if (res.userInfo) {
          this.data.Info = res.userInfo
          this.setblouserInfo()
        }
      }
    })
  },
  setblouserInfo: function () {  //将获取到的用户信息赋值给全局变量
    let _parms = {
      openId: this.data.openId,
      // userId: this.data.openId,  //暂时注释 待后台有user表后放开开注释
      userName: this.data.Info.nickName,
      nikcName: this.data.Info.nickName,
      avatarUrl: this.data.Info.avatarUrl,
      sourceType: '1',
      iconUrl: this.data.Info.avatarUrl,
      city: this.data.Info.city,
      sex: this.data.Info.gender, //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
      lat: this.data.lat,
      lng: this.data.lng
    }
    app.globalData.userInfo = _parms  //更新全局变量默认值
  },
  requestCityName(lat, lng) {//获取当前城市
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log("res:", res)
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
