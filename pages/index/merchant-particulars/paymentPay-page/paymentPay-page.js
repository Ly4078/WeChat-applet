Page({
  data: {
    isChecked: false,
  },
  onLoad: function (options) {
    
  },
  changeSwitch1() {
    this.setData({
      isChecked: !this.data.isChecked
    });
  },
  toTickets() {
    wx.navigateTo({
      url: '../ticket-list/ticket-list'
    })
  }
})