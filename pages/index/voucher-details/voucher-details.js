Page({

  data: {
    obj:{},
  },
  onLoad: function (options) {
    this.setData({
      obj:options
    })
  },
  immediatelyBuy:function(){
    let data = this.data.obj
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods?id=' + data.id + "&sell=" + data.sell + "&inp=" + data.inp + "&rule=" + data.rule + '&num=' + data.num+'&soid='+data.soid
    })
  },
})