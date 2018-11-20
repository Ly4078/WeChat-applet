// pages/index/web-view/index.js
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
    console.log(options)
    if (!options.src){
      wx.showToast({
        title: '页面参数错误',
        icon:"none"
      })
      setTimeout( ()=>{
        wx.navigateBack({
          delta:1
        })
      },1500)
      return
    }
    this.setData({
      src: options.src,
      shareImg: options.img
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      path: 'pages/index/web-view/index?src=' + this.data.src + '&img=' + this.data.shareImg,
      imageUrl:this.data.shareImg,
      success: function (res) {
        
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
