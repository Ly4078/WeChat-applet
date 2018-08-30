Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['附件美食', '我的秒杀'],
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
  } 
})