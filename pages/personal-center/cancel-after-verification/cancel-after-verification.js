Page({
  data: {
    qrCodeUrl: ''
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      qrCodeUrl: 'https://www.hbxq001.cn/m/hx?qrCode=' + options.qrCode + '&userId=' + options.userId
    });
  }
})