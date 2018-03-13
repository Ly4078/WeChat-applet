var app = getApp();
Page({
  data: {
    userId: app.globalData.userInfo.userId   //登陆人id
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
  enterEntrance:function(event){
    wx.navigateTo({
      url: 'free-of-charge/free-of-charge',
    })
  },
  DynamicState:function(e){
    wx.navigateTo({
      url: 'allDynamicState/allDynamicState',
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
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: "qrCode",
      success: (res) => {
        let qrCodeArr = res.result.split('/');
        let qrCode = qrCodeArr[qrCodeArr.length - 1];
        wx.navigateTo({
          url: 'cancel-after-verification/cancel-after-verification?qrCode=' + qrCode + '&userId=' + that.data.userId,
        })
        console.log(qrCode)
        console.log(that.data.userId)
      },
      fail: (res) => {
        
      }
    });
  }
})