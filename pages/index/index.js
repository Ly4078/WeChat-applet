//index.js 
import Api from '/../../utils/config/api.js';  //每个有请求的JS文件都要写这个，注意路径
var postsData = require('/../../data/posts-data.js')
const app = getApp()

Page({
  data: {
    city: "武汉市",
    business:[], //商家列表，推荐餐厅
    // object: '',
    logs: []
  },
  onLoad: function (options) {
    wx.getLocation({  //获取当前的地理位置
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        this.requestCityName(latitude, longitude);
      }
    })
    this.getdata()
  },
  onShow() {
    wx.getStorage({
      key: "address",
      success: (res) => {
        this.setData({
          // city: res.data
        })
      }
    })
  },
  requestCityName(latitude, longitude) {//获取当前城市
    wx.request({
      url: 'http://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + "," + longitude + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
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
  getdata: function () { //new  新的请求方式
    let that = this;
    let _parms = {  //  _parms为要传回到后台的参数，使用key：value传值
    //   status: this.data.activeIndex
    }
    // if (true) {  // 不同状态下选择传回不同的参数
    //   _parms.sortby = 'release_time desc'
    // } else {
    //   _parms.sortby = 'create_time asc'
    // }
    Api.shoptop().then((res) => {  //固定格式  shoptop在utils/config/api.js中配置

    this.setData({
      business: res.data.data
    })
    // console.log("business:",that.data.business)

      // if (res.data.code == 0 && res.data.data != null) { //如果返回数据正常（data.code = 0 且 data.data不为空）
      //   console.log(res)
      // }else {  //弹窗报告错误信息
      //   res.data && res.data.msg && utils.toast("error", res.data.msg);
      // }
    })
  },
  // getdata: function () {//定义函数名称
  //   var that = this;   // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
  //   wx.request({
  //     url: 'http://www.hbxq001.cn/user/list',//请求地址
  //     data: {//发送给后台的数据
  //       "code": 0,
  //       "message": "success",
  //     },
  //     header: {//请求头
  //       "Content-Type": "applciation/json"
  //     },
  //     method: "GET",//get为默认方法/POST
  //     success: function (res) {
  //       console.log(res.data);//res.data相当于ajax里面的data,为后台返回的数据
  //       that.setData({//如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
  //       logs: res.data.result
  //       })
  //     },
  //     fail: function (err) { },//请求失败
  //     complete: function () { }//请求完成后执行的函数
  //   })
  // },
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
    wx.showToast({
      title: '该功能更新中...',
    })
  },
  recommendCt: function (event) {
    wx.navigateTo({
      url: 'dining-room/dining-room',
    })
  },
  diningHhall: function (event) {
    const stopid = event.currentTarget.id
    wx.navigateTo({  // 页面传参
      url: 'merchant-particulars/merchant-particulars?stopid=' + stopid
    })
  },
  cateWall: function (event) {
    wx.switchTab({
      url: '../discover-plate/discover-plate',
    })
  },
  preferential: function (event) {
    wx.switchTab({
      url: '../activityDetails/activity-details',
    })
  },
  detailOfTheActivity: function (event) {
    wx.navigateTo({
      url: '../activityDetails/details-like/details-like',
    })
  }

})
