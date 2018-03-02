var postsData = require('/../../data/discover-data.js')
Page({

  data: {

  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
  },
  announceState:function(event){
    wx.navigateTo({
      url: 'dynamic-state/dynamic-state',
    })
  }
})