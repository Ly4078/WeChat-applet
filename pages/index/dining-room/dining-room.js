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
    this.setData({
      posts_key: postsData.postList
    });
  },
  diningRoomList:function(event){
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars',
    })
  }
})