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
  onUnload: function () { //生命周期函数--监听页面卸载
    
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
    
  },

  bindinput:function(){
    // console.log("11")
  },
  bindFormSubmit:function(e){  //点击完成按钮
    let text = e.detail.value.textarea
    // wx.setStorageSync('text', text)  //同步缓存数据
    wx.setStorage({
      key: "text",
      data: text
    })
    // wx.setStorageSync({
    //   key: "value",
    //   data: value
    // })
    wx.navigateTo({
      url: '../dynamic-state'
    })


    // let value = e.detail.value.textarea
    // console.log("_value:",value)
    // wx.navigateTo({
    //   url: '../dynamic-state?value='+value
    // })
  }
})