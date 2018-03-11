var postsData = require('/../../data/discover-data.js');
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
Page({

  data: {
    _build_url: GLOBAL_API_DOMAIN,
    hotlive:[]
  },
  
  onLoad: function (options) {
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
    

    wx.setStorage({
      key: 'cover',
      data: ''
    })
    wx.setStorage({
      key: 'title',
      data: '',
    })
    wx.setStorage({
      key: 'text',
      data: '',
    })
  },
  announceState:function(event){ // 跳转到编辑动态页面
    wx.redirectTo({
      url: 'dynamic-state/dynamic-state',
    })
  }
})