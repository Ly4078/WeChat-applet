Page({
  data: {
    qrCodeUrl: ''
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      qrCodeUrl: 'http://182.254.130.252/m/hx?qrCode=' + options.qrCode + '&userId=' + options.userId
    });
  }
})