var postsData = require('/../../../data/my-order.js')
Page({

  data: {

  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
  },
  sublevelSum:function(event){
    wx.navigateTo({
      url: '../../index/voucher-details/voucher-details',
    })
  }
})