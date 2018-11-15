Page({
  data: {
    selected: true,
    shadowFlag: true, //活动详情
    // showSkeleton:true
  },
  selected: function(e) {
    this.setData({
      selected: e.target.id == 1 ? true : false
    })
  },
  // 遮罩层显示
  showShade: function () {
    this.setData({ shadowFlag: false })
  },
  // 遮罩层隐藏
  conceal: function () {
    this.setData({ shadowFlag: true })
  },
  //进入详情
  hoteDils:function(){
    wx.navigateTo({
      url: 'touristHotelDils/touristHotelDils',
    })
  }
})