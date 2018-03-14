var postsData = require('/../../data/discover-data.js');
import Api from '../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
Page({

  data: {
    _build_url: GLOBAL_API_DOMAIN,
    food:[],
    hotlive:[]
  },
  
  onLoad: function (options) {
    let that = this;
    Api.topiclist().then((res) => {
      // console.log("food:", res.data.data.list)
      this.setData({
        food: res.data.data.list
      })
    })
    wx.request({
      url: that.data._build_url + 'zb/list/',
      success: function (res) {
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
  clickarticle:function(e){  //点击某条文章
    const id = e.currentTarget.id
    wx.navigateTo({
      url: 'dynamic-state/article_details/article_details?id='+id
    })
  },
  announceState:function(event){ // 跳转到编辑动态页面
    wx.redirectTo({
      url: 'dynamic-state/dynamic-state',
    })
  }
  
})