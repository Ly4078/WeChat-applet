Page({
  data: {
    // showSkeleton: true
  },
  onLoad: function (options) {
    
  },

  // 左下角返回首页
  returnHomeArrive: function () {
    wx.switchTab({
      url: '../../../index/index',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  onShow: function () {
    
  },
})