Page({
  data: {
    iconUrl: '',
    shopName: '襄阳市-城市代理',
    nickName: '花花',
    shopNum: '345',
    today: '2018年11月11日',
    dailyList: [
      {
        name: '成交额(元)',
        today: '2455.34',
        yesterday: '2455.34'
      },
      {
        name: '成交额(元)',
        today: '2455.34',
        yesterday: '2455.34'
      },
      {
        name: '成交额(元)',
        today: '2455.34',
        yesterday: '2455.34'
      },
      {
        name: '成交额(元)',
        today: '2455.34',
        yesterday: '2455.34'
      },
      {
        name: '成交额(元)',
        today: '2455.34',
        yesterday: '2455.34'
      },
      {
        name: '成交额(元)',
        today: '2455.34',
        yesterday: '2455.34'
      }
    ]
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    
  },
  onUnload: function () {
    
  },
  toSigned() {
    wx.navigateTo({
      url: 'signedAgent/signedAgent',
    })
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    
  },
  onShareAppMessage: function () {
    
  }
})