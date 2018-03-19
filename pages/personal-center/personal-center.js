import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    iconUrl: app.globalData.userInfo.iconUrl,
    userName: app.globalData.userInfo.userName,
    userId: app.globalData.userInfo.userId,
    qrCode: ''
  },
  onLoad: function (options) {
    this.setData({
      userName: app.globalData.userInfo.userName
    })
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
  launchAppError: function(e) {
    console.log(e.detail.errMsg)
  },
  scanAqrCode:function(e){
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: "qrCode",
      success: (res) => {
        console.log(res)
        let qrCodeArr = res.result.split('/');
        let qrCode = qrCodeArr[qrCodeArr.length - 1];
        that.setData({
          qrCode: qrCode
        });
        that.getCodeState();
      },
      fail: (res) => {
        
      }
    });
  },
  //判断二维码是否可以跳转
  getCodeState: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + '/cp/getByCode/' + that.data.qrCode,
      success: function(res) {
        var data = res.data;
        let current = res.currentTime;
        if(data.code == 0) {
          let isDue = that.isDueFunc(current, data.expiryDate);
          if (data.data.isUsed == 1) {
            wx.showToast({
              title: '您的票券已被使用',
              icon: 'none'
            })
            return false;
          } else if (isDue == 1) {
            wx.showToast({
              title: '您的票券已过期',
              icon: 'none'
            })
            return false;
          } else {
            wx.navigateTo({
              url: 'cancel-after-verification/cancel-after-verification?qrCode=' + that.data.qrCode + '&userId=' + that.data.userId,
            })
          }
        } else {
          wx.showToast({
            title: '请扫描有效票券',
            icon: 'none'
          })
        }
      }
    })
  },
  isDueFunc: function (current, expiryDate) {     //对比时间是否过期
    let isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < current) {
      isDue = 1;
    }
    return isDue;
  }
})