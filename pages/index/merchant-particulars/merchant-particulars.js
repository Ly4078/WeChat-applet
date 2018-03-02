var postsData = require('/../../../data/store-particulars.js')
var app = getApp()
Page({
  data: {
    navbar: ['主页', '动态'],
    currentTab: 0
  },
  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
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
  // tab栏
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  
}) 