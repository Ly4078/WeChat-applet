Page({

  data: {
    
  },

  onLoad: function (options) {
    
  },
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: '02787175526', //此号码并非真实电话号码，仅用于测试  
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  myTickets:function(event){
    wx.navigateTo({
      url: 'my-discount/my-discount',
    })
  },
  carefulness:function(event){
    wx.navigateTo({
      url: 'personnel-order/personnel-order',
    })
  },
  enshrineClick:function(event){
    wx.navigateTo({
      url: 'enshrine/enshrine',
    })
  },
  scanAqrCode:function(e){
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res)
      }
    })
  }

})