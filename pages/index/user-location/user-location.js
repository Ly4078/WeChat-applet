var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    txtObj:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let txtObj = wx.getStorageSync("txtObj");
    that.setData({
      txtObj: txtObj.citylist
    })
  },
  selectCity:function(e){
    let that = this;
    let city = e.currentTarget.dataset.city;
    let isopen = e.currentTarget.dataset.isopen;
    console.log(city)
    console.log(isopen)
    if (isopen == '1') {
      let userInfo = wx.getStorageSync('userInfo')
      userInfo.city = city
      wx.setStorageSync("userInfo", userInfo)
      app.globalData.userInfo.city = city;
      app.globalData.changeCity = true;
      wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
        url: '../../index/index'
      })
    }else{
      wx.showToast({
        title: '暂未开放',
        icon:'none'
      })
    }

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
    
  }
})