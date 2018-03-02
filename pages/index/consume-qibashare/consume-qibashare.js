// pages/index/consume-qibashare/consume-qibashare.js
var postsData = require('/../../../data/merchant-data.js')
Page({
  data: {
  
  },
  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
  },
  particulars:function(){
    wx.navigateTo({
      url: '../voucher-details/voucher-details',
    })
  },
  directPurchase:function(){
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods',
    })
  },

})