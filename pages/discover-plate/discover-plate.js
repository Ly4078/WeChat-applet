var postsData = require('/../../data/discover-data.js');
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
Page({

  data: {
    _build_url: GLOBAL_API_DOMAIN,
    hotlive:[]
  },
  
  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
    let that = this;
    wx.request({
      url: that.data._build_url + 'zb/list/',
      success: function (res) {
        // console.log("hotlive:",res.data.data)
        that.setData({
          hotlive: res.data.data.list
        })
      }
    })
  },
  announceState:function(event){
    wx.navigateTo({
      url: 'dynamic-state/dynamic-state',
    })
  }
})