var postsData = require('/../../../data/my-order.js')
Page({

  data: {

  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
  },
  lowerLevel:function(event){
    wx.navigateTo({
      url: '../lelectronic-coupons/lectronic-coupons',
    })
  }
})