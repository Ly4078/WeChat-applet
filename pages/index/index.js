//index.js
var postsData = require('/../../data/posts-data.js')
const app = getApp()

Page({
  data: {
    city: "武汉市",
    // object: '',
    logs: []
  },
  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
    // this.getdata();
    app.func.req('/user/list', {}, function (res) {
      console.log(res)
    }); 
  },
  onShow() {
    wx.getStorage({
      key: "address",
      success: (res) => {
        this.setData({
          city: res.data
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

  //         logs: res.data.result

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
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars',
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
