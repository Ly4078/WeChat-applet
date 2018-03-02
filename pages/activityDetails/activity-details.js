var postsData = require('/../../data/merchant-data.js')
Page({

  data: {
    
  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
  },
  clickVote:function(event){
    wx.navigateTo({
      url: 'details-like/details-like',
    })
  }
})