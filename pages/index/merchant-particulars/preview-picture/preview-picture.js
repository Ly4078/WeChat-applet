import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _shopid: '',
    _build_url: GLOBAL_API_DOMAIN,
    carousel:[],
  },
  onLoad: function (options) {
    this.setData({
      _shopid: options.id
    });
    this.photographAny();
  },
  photographAny: function (event) {
    let that = this;
    let _data = {
      shopId: this.data._shopid
    }
    wx.request({
      url: that.data._build_url + 'shop/get/' + this.data._shopid,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        that.setData({
          carousel: res.data.data.shopTopPics
        })
      }
    });
  },
  previewImg: function (e) {
    var index = e.currentTarget.id;
    var carousel = this.data.carousel;
    let arr = [];
    let obj ={}
    for (let i = 0; i < carousel.length;i++){
      arr.push(carousel[i].value0)
      if(i==index){
        obj=carousel[i]
      }
    }
   
    wx.previewImage({
      current: carousel[index].value0,     //当前图片地址
      urls: arr,           //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})