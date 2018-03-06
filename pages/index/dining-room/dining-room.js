import Api from '../../../utils/config/api.js';
var postsData = require('/../../../data/merchant-data.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  getData: function () {
    let _parms = {}
    Api.shoplist(_parms).then((res) => {
      this.setData({
        posts_key: res.data.data.list
      });
    })
  },
  onTouchItem: function (event) {
    var shopid = event.currentTarget.id
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + shopid,
    })
  }
})