var postsData = require('/../../../data/activity-data.js')
Page({
  data: {
    actid:''  //活动ID
  },

  onLoad: function (options) {
    // var postId = options.id;
    // var postData = postsData.postList[postId];
    this.setData({
      posts_key: postsData.postList,
      actid:options.actid
    });
    console.log(this.data.actid)
    // var postsCollected = wx.getStorageSync(postsCollected)
  },

})