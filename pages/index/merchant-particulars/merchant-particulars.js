var postsData = require('/../../../data/store-particulars.js')
import Api from '/../../../utils/config/api.js';  //每个有请求的JS文件都要写这个，注意路径
var app = getApp()
Page({
  data: {
    navbar: ['主页', '动态'],
    stopid:'',  //商家ID
    store_details:[],  //店铺详情
    currentTab: 0
  },
  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList,
      stopid: options.stopid  
    });
    this.getstoredata();
    console.log("stopid:",this.data.stopid)
    // 分享功能
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) {
        // 分享成功
        console.log('shareMenu share success')
        console.log(res)
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    });
  },
  getstoredata(){  //获取店铺详情数据
    console.log("id:",this.data.stopid)
    let _parms = {
      id: this.data.stopid
    }
    console.log(_parms)
    Api.shopget(_parms).then((res) => { 
      console.log("shopget res:",res)
      this.setData({
        // store_details: res.data.data.list
      })
    })
  },
  liuynChange: function (e) {
    var that = this;
    console.log(e.currentTarget.dataset.id)
    that.setData({
      llbView: true,
      pid: e.currentTarget.dataset.id,
      to_user_id: e.currentTarget.dataset.user
    })
  },  
  onShareAppMessage: function () {
    return {
      title: '哇,看着流口水',
      path: '/pages/activityDetails/merchant-particulars/merchant-particulars',
      success: function (res) {
        console.log(res.shareTickets[0])
        // console.log
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function (res) { console.log(res) },
          fail: function (res) { console.log(res) },
          complete: function (res) { console.log(res) }
        })
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    }
  },
  // 电话号码功能
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: '15827245422', //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  moreImages:function(event){
    wx.navigateTo({
      url: 'preview-picture/preview-picture',
    })
  },
  TencentMap:function(event){
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度  
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({
          latitude: 23.362490,
          longitude: 116.715790,
          scale: 18,
          name: '华乾大厦',
          address: '金平区长平路93号'  
        })
      }
    })  
  },
  // tab栏
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  
}) 