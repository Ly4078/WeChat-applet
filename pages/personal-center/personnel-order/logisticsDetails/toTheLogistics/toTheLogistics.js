// pages/userhome/address/address.js
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    // 列表数据
    list: []


  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getexpress(options.code);
    this.setData({ imgUrl: options.img})
  },
  getexpress: function (expressCode) {//huo获取物流信息
    let that = this;
    wx.request({
      url: that.data._build_url + 'orderDelivery/getExpress?expressCode=' + expressCode,
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == '0') {
          if (res.data.data[0].list.length) {
            that.setData({
              list: res.data.data[0].list,
              expTextName: res.data.data[0].expTextName,
              expressCode: res.data.data[0].expressCode
            })
          }
        }
      }, fail() {

      }
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})
