import Api from '/../../../utils/config/api.js'
var app = getApp();
let minusStatus = '';
Page({
  data: {
    // input默认是1  
    number: 1,
    // 使用data数据对象设置样式名  
    minusStatus: 'disabled',
    paymentAmount: '',
    obj: []
  },
  onLoad: function (options) {
    this.setData({
      obj: options,
      paymentAmount: options.sell
    })

    var summation = this.data.obj.sell
    // var indentId = this.data.obj.id
    // this.hidtel(phone)
  },
  hidtel: function ($phone) {
    $IsWhat = preg_match('/(0[0-9]{2,3}[\-]?[2-9][0-9]{6,7}[\-]?[0-9]?)/i', $phone);
    if ($IsWhat == 1) {
      return preg_replace('/(0[0-9]{2,3}[\-]?[2-9])[0-9]{3,4}([0-9]{3}[\-]?[0-9]?)/i', '$1****$2', $phone);
    } else {
      return preg_replace('/(1[358]{1}[0-9])[0-9]{4}([0-9]{4})/i', '$1****$2', $phone);
    }
  },
  /* 点击减号 */
  bindMinus: function () {
    var number = this.data.number;
    if (number > 1) {
      --number;
    }

    // 将数值与状态写回  
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
    let _paymentAmount = this.data.number * this.data.obj.sell * 1;
    _paymentAmount = _paymentAmount.toFixed(2)
    this.setData({
      paymentAmount: _paymentAmount
    });
    minusStatus = number <= 1 ? 'disabled' : 'normal';

  },
  /* 点击加号 */
  bindPlus: function () {
    var number = this.data.number;
    ++number;
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
    let _paymentAmount = this.data.number * this.data.obj.sell * 1;
    _paymentAmount = _paymentAmount.toFixed(2)
    this.setData({
      paymentAmount: _paymentAmount
    });
    minusStatus = number < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var number = e.detail.value;
    // 将数值与状态写回  
    this.setData({
      number: number
    });
  },

  determine: function (e) {  //点击确认支付按钮
    let that = this
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
          this.confirmPayment()
        } else {
          wx.showModal({
            title: '提示',
            content: '为让享7更好为您服务，请授权以下权限给享7',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting['scope.userInfo']) { //得到用户信息授权，获取用户信息
                      wx.getUserInfo({
                        success: res => {
                          if (res.userInfo) {  //设置全局变量
                            app.globalData.userInfo.userName = res.userInfo.nickName,
                              app.globalData.userInfo.nikcName = res.userInfo.nickName,
                              app.globalData.userInfo.avatarUrl = res.userInfo.avatarUrl,
                              app.globalData.userInfo.city = res.userInfo.city,
                              app.globalData.userInfo.sex = res.userInfo.gender //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
                          }
                        }
                      })
                    }
                    if (res.authSetting['scope.userLocation']) {  //得到用户位置授权，获取用户位置
                      wx.getLocation({
                        type: 'wgs84',
                        success: function (res) {
                          let latitude = res.latitude
                          let longitude = res.longitude
                          let speed = res.speed
                          let accuracy = res.accuracy
                          app.globalData.userInfo.lat = latitude
                          app.globalData.userInfo.lng = longitude
                          if (latitude && longitude) {
                            wx.request({
                              url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + "," + longitude + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
                              header: {
                                'content-type': 'application/json' // 默认值
                              },
                              success: (res) => {
                                if (res.data.status == 0) {
                                  app.globalData.userInfo.city = res.data.result.address_component.city
                                }
                              }
                            })
                          }
                        }
                      })
                    }
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    })
  },

  confirmPayment: function (e) {  //生成订单号
    let that = this
    if (this.data.obj.soid && this.data.obj.soid != 'undefined' && this.data.obj.soid != ''){
      that.payment(this.data.obj.soid)
    }else{
      let _parms = {
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        payType: '2',
        skuId: this.data.obj.id,
        skuNum: this.data.number
      }
      Api.socreate(_parms).then((res) => {
        if (res.data.code == 0) {
          that.payment(res.data.data)
        }
      })
    }
  },
  payment: function (soid) {  //调起微信支付
    let that = this
    let _parms = {
      soId: soid,
      openId: app.globalData.userInfo.openId,
    }
    Api.doUnifiedOrder(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          success: function (res) {
            wx.redirectTo({
              url: '../../personal-center/lelectronic-coupons/lectronic-coupons?id=' + soid + '&isPay=1'
            })
          },
          fail: function (res) {
            wx.showToast({
              icon: 'loading',
              title: '支付取消',
              duration: 1200
            })
          }
        })
      }
    })
  }
})  