var postsData = require('/../../../data/my-order.js')
Page({

  data: {

  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
  },
  immediateUse: function (event) {
    wx.navigateTo({
      // url: '../../index/payment-rea-return/payment-rea-return',
      url:'../lelectronic-coupons/lectronic-coupons'
    })
  },
})