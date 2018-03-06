var postsData = require('/../../../data/activity-data.js')
Page({
  data: {
    actid:'',  //活动ID
    actdetail:[]
  },

  onLoad: function (options) {
    // var postId = options.id;
    // var postData = postsData.postList[postId];
    this.setData({
      posts_key: postsData.postList,
      actid:options.actid
    });
    getactdetails()
    console.log(this.data.actid)
    // var postsCollected = wx.getStorageSync(postsCollected)
  },
  getactdetails(){  //获取单个活动详情
    let _parms = {
      id:this.data.actid
    }
  }
})