Page({

  data: {
    obj:{},
  },
  onLoad: function (options) {
    this.setData({
      obj:options
    })
    console.log(options)
  },
  immediatelyBuy:function(){
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods',
    })
  },
})