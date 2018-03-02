var postsData = require('/../../../data/activity-data.js')
Page({
  data: {
    
  },

  onLoad: function (options) {
    // var postId = options.id;
    // var postData = postsData.postList[postId];
    this.setData({
      posts_key: postsData.postList
    });
    // var postsCollected = wx.getStorageSync(postsCollected)
  },

})