import Api from '../../../utils/config/api.js';  //每个有请求的JS文件都要写这个，注意路径
var postsData = require('/../../../data/activity-data.js')
Page({
  data: {
    actid:'',  //活动ID
    actdetail:[]
  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList,
      actid:options.actid
    });
    this.getactdetails()
    console.log(this.data.actid)
    // var postsCollected = wx.getStorageSync(postsCollected)
  },
  getactdetails(){  //获取单个活动详情
    let id = this.data.actid;
    wx.request({
      url: _build_url + 'shop/top/' + id,
      success: function (res) {
        this.setData({
          store_details: res.data.data.list
        })
      }
    })
  }
})