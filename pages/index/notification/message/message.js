// pages/index/notification/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xtdata:[
      {
        id:'a1',
        title:"付款成功",
        isread: false,
        date:'2018-08-08 12:22:23',
        content:'3.0两公 大闸蟹 提货券 使用成功。'
      },
      {
        id:'a2',
        title: "金币奖励",
        isread: true,
        date: '2018-10-15 13:32:43',
        content: '恭喜你，成功帮助好友砍价，获得10个金币。'
      }
    ],
    hddata:[
      {
        id:'b1',
        title: "活动通知",
        isread:true,
        date: '2018-10-11 16:22:23',
        content: '【魅力十堰，热门景点门票、酒店1折购买】限量抢购，这个假期钜惠回馈，火热进行中'
      },
      {
        id:'b2',
        title: "活动通知",
        isread: false,
        date: '2018-10-08 9:42:23',
        content: '魅力十堰，热门景点门票、酒店1折购买;限量抢购，这个假期钜惠回馈，火热进行中'
      },
    ],
    data:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.sort == 0){
      wx.setNavigationBarTitle({
        title: '系统通知',
      })
      this.setData({
        data: this.data.xtdata
      })
    }else if(options.sort == 1){
      wx.setNavigationBarTitle({
        title: '活动通知',
      })
      this.setData({
        data: this.data.hddata
      })
    }
    console.log('data:',this.data.data)
  },

  handItem: function (e) {
    console.log(e.currentTarget.id)
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