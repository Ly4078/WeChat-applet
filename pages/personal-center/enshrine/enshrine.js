var postsData = require('/../../../data/my-order.js')
Page({

  data: {

  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
  },
  enshrineXim:function(event){
    wx.navigateTo({
      url: '../../index/merchant-particulars/merchant-particulars',
    })
  }
})