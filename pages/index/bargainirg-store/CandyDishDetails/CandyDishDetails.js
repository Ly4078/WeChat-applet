Page({
  data: {
    
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
// 发起砍价
  sponsorVgts:function(){
    wx.navigateTo({
      url: '../AprogressBar/AprogressBar',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 左上角返回首页
  returnHomeArrive: function () {
    wx.switchTab({
      url: '../../index',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
})