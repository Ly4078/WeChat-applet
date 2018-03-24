import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
import Api from '../../utils/config/api.js'
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    nickName: '',
    iconUrl: app.globalData.userInfo.iconUrl,
    isname: false,
    newname: '',
    qrCode: ''
  },
  onLoad:function(){
    this.setData({
      nickName:app.globalData.userInfo.nickName
    })
    this.getuserInfo()
  },
  onShow: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'topic/myList',
      method: 'GET',
      data: {
        userId: app.globalData.userInfo.userId,
        page: '1',
        rows: 1,
      },
      success: function (res) {
        var data = res.data;
        that.setData({
          sumTotal: res.data.data.total
        })
      }
    })
    wx.request({
      url: that.data._build_url + 'fvs/list?userId=' + app.globalData.userInfo.userId + '&page=' + that.data.page + '&rows=10',
      method: 'GET',
      data: {
        userId: app.globalData.userInfo.userId,
        page: '1',
        rows: 1,
      },
      success: function (res) {
        var data = res.data;
        var aaa = res.data.data.total
        that.setData({
          collectTotal: res.data.data.total
        })
      }
    })
  },
  getuserInfo: function () {  //从微信服务器获取用户信息
    let that = this;
    wx.getUserInfo({
      success: res => {
        if (res.userInfo) {
          that.setData({
            iconUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName
          })
          that.updatauser(res.userInfo)
        }
      }
    })
  },
  wxgetsetting: function () {  //若用户之前没用授权其用户信息，则调整此函数请求用户授权
    let that = this
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo']) {// 用户未授受获取其用户信息
          wx.showModal({
            title: '提示',
            content: '享7要你的用户信息，快去授权！',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({  //打开授权设置界面
                  success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                      wx.getUserInfo({
                        success: res => {
                          if (res.userInfo) {
                            that.setData({
                              iconUrl: res.userInfo.avatarUrl,
                              nickName: res.userInfo.nickName,
                            })
                            that.updatauser(res.userInfo)
                          }
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  updatauser: function (data) { //更新用户信息
    let that = this
    let _parms = {
      userId: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId,
    }
    if (data.avatarUrl) {
      _parms.iconUrl = data.avatarUrl
    }
    if (data.nickName) {
      _parms.nickName = data.nickName
    }
    if (data.gender) {
      _parms.sex = data.gender
    }
    Api.updateuser(_parms).then((res) => {
      if (res.data.code == 0) {
          // console.log("用户信息更换成功")
      }
    })
  },
  calling: function () { //享7客户电话
    wx.makePhoneCall({
      phoneNumber: '02759728176',
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  enterEntrance: function (event) {
    wx.navigateTo({
      url: 'free-of-charge/free-of-charge',
    })
  },
  DynamicState: function (e) {
    wx.navigateTo({
      url: 'allDynamicState/allDynamicState',
    })
  },
  myTickets: function (event) {
    wx.navigateTo({
      url: 'my-discount/my-discount',
    })
  },
  carefulness: function (event) {
    wx.navigateTo({
      url: 'personnel-order/personnel-order',
    })
  },
  enshrineClick: function (event) {
    wx.navigateTo({
      url: 'enshrine/enshrine',
    })
  },
  scanAqrCode: function (e) {
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: "qrCode",
      success: (res) => {
        console.log("res:",res)
        let qrCodeArr = res.result.split('/');
        let code = qrCodeArr[qrCodeArr.length - 1];
        wx.navigateTo({
          url: '../personal-center/call-back/call-back?code='+code
        })
        // that.setData({
        //   qrCode: qrCode
        // });
        // that.getCodeState();
      },
      fail: (res) => {
          console.log("扫码失败")
      } 
    });
  },
  //判断二维码是否可以跳转
  getCodeState: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + '/cp/getByCode/' + that.data.qrCode,
      success: function (res) {
        var data = res.data;
        let current = res.currentTime;
        if (data.code == 0) {
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
              url: 'cancel-after-verification/cancel-after-verification?qrCode=' + that.data.qrCode + '&userId=' + app.globalData.userInfo.userId,
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