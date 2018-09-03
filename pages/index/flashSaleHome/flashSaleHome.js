Page({
  data: {
    navbar: ['附近美食', '我的秒杀'],
    currentTab: 0,
    showModal: true,
  },

  onLoad: function (options) {
    
  },
  occludeAds: function () {
    this.setData({
      showModal: false
    })
  },
  //响应点击导航栏
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  toSecKillDetail() {   //跳转至菜品详情
    wx.navigateTo({
      url: 'secKillDetail/secKillDetail'
    })
  }
})