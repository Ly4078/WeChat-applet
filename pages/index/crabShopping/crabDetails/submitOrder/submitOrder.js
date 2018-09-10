Page({
  data: {
    username:'',
    phone:'',
    address:''
  },
  onLoad: function (options) {
    // console.log("拿到数据:", options.username)
    // let username = options.username;
    // let phone = options.phone;
    // let address = options.address;
    // this.setData({
    //   username: username,
    //   phone: phone,
    //   address: address
    // })
  },
  // 选择收货地址
  additionSite:function(){
    wx.navigateTo({
      url: '../../../../personal-center/shipping/shipping',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  onReady: function () {
    
  },
})