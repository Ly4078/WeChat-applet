// pages/index/notification/notification.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:[
      {
        id:1,
        imgUrl:'/images/icon/xitong.png',
        news:15,
        name:'系统通知',
        date:'昨天12:34',
        content:'魅力十堰，热门景点门景点门票、酒店1门景点门票、酒店1门票、酒店1折购买、限量抢购...'
      },
      {
        id: 2,
        imgUrl: '/images/icon/huodong.png',
        news: 43,
        name: '活动通知',
        date: '今天12:34',
        content: '魅力十堰，热门景点门景点门票、酒店1门景点门票、酒店1门票、酒店1折购买、限量抢购...'
      }
    ]
  },

  handItem:function(e){
    wx.navigateTo({
      url: '/pages/index/notification/message/message?sort=' + e.currentTarget.id,
    })
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