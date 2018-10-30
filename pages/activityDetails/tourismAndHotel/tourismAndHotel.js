Page({
  data: {
    selected: true,
    selected1: false,
    flag:true //活动详情
  },
  selected: function(e) {
    this.setData({
      selected1: false,
      selected: true
    })
  },
  selected1: function(e) {
    this.setData({
      selected: false,
      selected1: true
    })
  },

  // 遮罩层显示
  showShade: function () {
    this.setData({ flag: false })
  },
  // 遮罩层隐藏
  conceal: function () {
    this.setData({ flag: true })
  },

  //进入详情
  hoteDils:function(){
    wx.navigateTo({
      url: 'touristHotelDils/touristHotelDils',
    })
  }

})