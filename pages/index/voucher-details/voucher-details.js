Page({

  data: {
    obj:{},
    orig:''
  },
  onLoad: function (options) {
    options.inp = Number(options.inp)
    let _inp = options.inp .toFixed(2)
    this.setData({
      obj: options,
      sell: options.sell,
      orig:_inp
    })
    if (options.num && options.num != 'undefined' && options.num != '') {
      this.setData({
        sell: (options.sell * options.num).toFixed(2)
      })
    }
    if (options.sostatus && options.sostatus != 'undefined' && options.sostatus != '') {
      this.setData({
        sostatus: 1
      });
    }
  },
  immediatelyBuy:function(){
    let data = this.data.obj, parameter = '';
    parameter = '?id=' + data.id + "&sell=" + data.sell + "&inp=" + data.inp + "&rule=" + data.rule + '&num=' + data.num + '&soid=' + data.soid;
    if (this.data.sostatus == 1) {
      parameter += '&sostatus=1'
    }
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods' + parameter
    })
  },
})