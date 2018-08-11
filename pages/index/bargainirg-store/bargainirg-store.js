var app = getApp()
var that = null;
Page({
  data: {
    navbar: ['附近', '销量', '价格'],
    currentTab: 0,
    showModal: true,
    cuisineArray: [{
      images: 'http://a3.att.hudong.com/52/30/28300542748198146650303532276_950.jpg',
      name: '湘菜系列阿里飞机',
      yishou: '234',
      shangName: '靓靓蒸虾',
      distance: '342',
      price: '324.2',
      original: '203.3'
    }, {
      images: 'http://a3.att.hudong.com/52/30/28300542748198146650303532276_950.jpg',
      name: '湘菜系列阿里飞机',
      yishou: '234',
      shangName: '靓靓蒸虾',
      distance: '342',
      price: '324.2',
      original: '203.3'
      }, {
        images: 'http://a3.att.hudong.com/52/30/28300542748198146650303532276_950.jpg',
        name: '湘菜系列阿里飞机',
        yishou: '234',
        shangName: '靓靓蒸虾',
        distance: '342',
        price: '324.2',
        original: '203.3'
      }, {
        images: 'http://a3.att.hudong.com/52/30/28300542748198146650303532276_950.jpg',
        name: '湘菜系列阿里飞机',
        yishou: '234',
        shangName: '靓靓蒸虾',
        distance: '342',
        price: '324.2',
        original: '203.3'
      }, {
        images: 'http://a3.att.hudong.com/52/30/28300542748198146650303532276_950.jpg',
        name: '湘菜系列阿里飞机',
        yishou: '234',
        shangName: '靓靓蒸虾',
        distance: '342',
        price: '324.2',
        original: '203.3'
      }, {
        images: 'http://a3.att.hudong.com/52/30/28300542748198146650303532276_950.jpg',
        name: '湘菜系列阿里飞机',
        yishou: '234',
        shangName: '靓靓蒸虾',
        distance: '342',
        price: '324.2',
        original: '203.3'
      }],
    scrollLeft: 0,
    choose_modal: "",
  },
  onLoad: function(options) {
    
  },
  
  occludeAds: function() {
    this.setData({
      showModal: false
    })
  },

  //菜品砍价详情
  candyDetails:function(){
    wx.navigateTo({
      url: 'CandyDishDetails/CandyDishDetails',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  

})