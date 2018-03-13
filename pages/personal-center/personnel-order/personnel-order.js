var postsData = require('/../../../data/my-order.js')
import Api from '../../../utils/config/api.js';
var app = getApp();
Page({

  data: {
    datas:[]
  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList
    });
    let _parms = {
      userId: app.globalData.userInfo.userId
    }
    Api.somyorder(_parms).then((res) => {
      // console.log("datas:",res.data.data)
      if(res.data == '0'){
        this.setData({
          datas: res.data.data
      })
      }
    })
  },
  lowerLevel:function(ev){
    let id = ev.currentTarget.id
    // console.log("id:",id)
    wx.navigateTo({
      url: '../lelectronic-coupons/lectronic-coupons?id='+id,
    })
  }
})