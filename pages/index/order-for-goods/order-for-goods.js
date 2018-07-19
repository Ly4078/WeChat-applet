import Api from '/../../../utils/config/api.js'
var app = getApp();
let minusStatus = '';
Page({
  data: {
    // input默认是1  
    number: 1,
    minusStatus: 'disabled',
    paymentAmount: '',
    obj: [],
    sostatus: 0,
    issnap: false,
    issecond: false,
    paytype: '', //支付方式， 1微信支付  2余额支付
    balance: 0,  //余额
    skuName:"",
    items: [
      { name: '微信支付', id: '1', disabled: false, img: '/images/icon/weixinzhifu.png', checked: false },
      { name: '余额支付', id: '2', disabled: false, img: '/images/icon/yuezhifu.png', checked: true },
    ]
  },
  
  onLoad: function (options) {
    if (options.skuName){
      this.setData({
        skuName: options.skuName
      })
      let arr = this.data.items
      arr[0].checked = true;
      arr[1].checked = false;
      arr[1].disabled = true;
      this.setData({
        paytype: 1,
        items: arr
      })
    }
    if (options.skutype==3){
      this.setData({
        actId: 37,
        shopId: options.shopId,
        skuId: options.skuId
      });
    }
    if(options.actId) {
      this.setData({
        actId: options.actId,
        shopId: options.shopId,
        skuId: options.skuId
      });
    }
    // this.isNewUser()
    this.setData({
      obj: options,
      paymentAmount: options.sell
    })
    this.getbalance();
    if (options.num && options.num != 'undefined' && options.num != '') {
      this.setData({
        number: options.num,
        paymentAmount: (options.sell * options.num).toFixed(2)
      });
    }
    if (options.sostatus && options.sostatus != 'undefined' && options.sostatus != '') {
      this.setData({
        sostatus: 1
      });
    }
  },

  getbalance: function () {//查询余额
    let _account = {
      userId: app.globalData.userInfo.userId
    }
    Api.accountBalance(_account).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          balance: res.data.data
        })
        this.calculate(this.data.paymentAmount)
      }
    })
  },
  radioChange: function (e) {  //选框
    let num = e.detail.value;
    this.setData({
      issecond: false
    })
    if (num == 1) { //1微信支付
      this.setData({
        paytype: 1
      })
    } else if (num == 2) {  //2余额支付
      this.setData({
        paytype: 2
      })
    }
  },
  // isNewUser: function () {   //判断是否新用户
  //   let that = this;
  //   let _parms = {
  //     userId: app.globalData.userInfo.userId
  //   };
  //   Api.isNewUser(_parms).then((res) => {
  //     if (res.data.code == 0) {
  //       that.setData({
  //         isNew: 1
  //       });
  //     }
  //   })
  // },
  hidtel: function ($phone) {
    $IsWhat = preg_match('/(0[0-9]{2,3}[\-]?[2-9][0-9]{6,7}[\-]?[0-9]?)/i', $phone);
    if ($IsWhat == 1) {
      return preg_replace('/(0[0-9]{2,3}[\-]?[2-9])[0-9]{3,4}([0-9]{3}[\-]?[0-9]?)/i', '$1****$2', $phone);
    } else {
      return preg_replace('/(1[358]{1}[0-9])[0-9]{4}([0-9]{4})/i', '$1****$2', $phone);
    }
  },

  bindMinus: function () {  //点击减号
    let number = this.data.number;
    if (number > 1) {
      --number;
    }
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
    let _paymentAmount = this.data.number * this.data.obj.sell * 1;
    _paymentAmount = _paymentAmount.toFixed(2)
    this.calculate(_paymentAmount)
    this.setData({
      paymentAmount: _paymentAmount
    });

    minusStatus = number <= 1 ? 'disabled' : 'normal';

  },

  bindPlus: function () {  //点击加号
    if(!this.data.actId) {
      let number = this.data.number;
      ++number;
      if (number > 10) {
        wx.showToast({
          title: '单次最多购买10张',
          icon: 'none',
          duration: 1500,
          mask: true
        })
        number = 10;
        this.setData({
          number: number
        })
      }
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
      this.calculate(_paymentAmount)
      this.setData({
        number: number,
        minusStatus: minusStatus
      });
    }
  },
  calculate: function (val) {  //判断支付方式
    if (this.data.actId || this.data.obj.skutype ==3) {
      this.setData({
        balance: 0
      });
    }
    let arr = this.data.items;
    let diff = (this.data.balance * 1) - (val * 1);
    if (diff < 0) {
      arr[0].checked = true;
      arr[1].checked = false;
      arr[1].disabled = true;
      this.setData({
        paytype: 1,
        items: arr
      })
    } else {
      arr[0].checked = false;
      arr[1].checked = true;
      arr[1].disabled = false;
      this.setData({
        paytype: 2,
        items: arr
      })
    }
  },

  bindManual: function (e) {
    var number = e.detail.value;
    this.setData({
      number: number
    });
  },

  determine: function (e) {  //点击确认支付按钮
    let that = this
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
          this.confirmPayment()
        } else if (!res.authSetting['scope.userInfo']) { // 用户未授受获取其用户信息或位置信息
          wx.showModal({
            title: '提示',
            content: '请先至[我的]页面点击头像授权用户信息,方可购买券票',
            success: (res) => {
              wx.switchTab({
                url: '../../personal-center/personal-center'
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '为让享7更好为您服务，请授权以下权限给享7',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
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
              }
            }
          })
        }
      }
    })
  },

  confirmPayment: function (e) {  //生成订单号
    let that = this;
    if (that.data.issecond) {
      return false
    }
    that.setData({
      issecond: true
    })
    if (this.data.obj.soid && this.data.obj.soid != 'undefined' && this.data.obj.soid != '') {
      if (that.data.paytype == 1) {
        that.payment(this.data.obj.soid);
        that.updateuser();
      } else if (that.data.paytype == 2) {
        wx.showToast({
          title: '余额支付成功',
          icon: 'none',
          mask: true
        })
        setTimeout(function () {
          wx.redirectTo({
            url: '../../personal-center/my-discount/my-discount'
          })
        }, 2000)
      }
    } else {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        skuId: this.data.obj.id,
        skuNum: this.data.number
      }
      if (this.data.shopId){
        _parms.shopId = this.data.shopId;
      }
      if (that.data.paytype == 1) {  //微信支付
        _parms.payType = '2';
      } else if (that.data.paytype == 2) {  //余额支付
        _parms.payType = '1';
      }
      Api.socreate(_parms).then((res) => {
        if (res.data.code == 0) {
          if (that.data.paytype == 1) {
            that.updateuser(res.data.data);
          } else if (that.data.paytype == 2) {
            wx.showToast({
              title: '余额支付成功',
              icon: 'none',
              mask: true
            })
            setTimeout(function () {
              wx.redirectTo({
                url: '../../personal-center/my-discount/my-discount'
              })
            }, 2000)
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }
  },
  updateuser: function (val) {  //更新用户信息
    let that = this;
    let _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
    }
    Api.updateuser(_parms).then((res) => {
      that.payment(val);
    })
  },
  payment: function (soid) {//调起微信支付
    let _pars = {
      soId: soid,
      openId: app.globalData.userInfo.openId
    },that = this;
    if(this.data.actId) {
      _pars['actId'] = this.data.actId;
      _pars['skuId'] = this.data.skuId;
      _pars['shopId'] = this.data.obj.shopId;
      Api.doUnifiedOrderAct(_pars).then((res) => {
        if (res.data.code == 0) {
          wx.requestPayment({
            'timeStamp': res.data.data.timeStamp,
            'nonceStr': res.data.data.nonceStr,
            'package': res.data.data.package,
            'signType': 'MD5',
            'paySign': res.data.data.paySign,
            success: function (res) {
              that.messagepush();
              wx.redirectTo({
                url: '../../personal-center/my-discount/my-discount'
              })
            },
            fail: function (res) {
              wx.showToast({
                icon: 'none',
                title: '支付取消',
                duration: 1200
              })
            }
          })
        }
      })
    } else {
      Api.doUnifiedOrder(_pars).then((res) => {
        if (res.data.code == 0) {
          wx.requestPayment({
            'timeStamp': res.data.data.timeStamp,
            'nonceStr': res.data.data.nonceStr,
            'package': res.data.data.package,
            'signType': 'MD5',
            'paySign': res.data.data.paySign,
            success: function (res) {
              wx.redirectTo({
                url: '../../personal-center/my-discount/my-discount'
              })
            },
            fail: function (res) {
              wx.showToast({
                icon: 'none',
                title: '支付取消',
                duration: 1200
              })
            }
          })
        }
      })
    }
  },
  messagepush: function () {//消息推送
    let that = this, pannum = this.data.paymentAmount ? this.data.paymentAmount:0;
    let _parms = {
      type: 'android',
      title: '收款通知',
      messageInfo: '享七收款' + pannum + '元',
      badge: 1,
      ios: '1',
      shopId: that.data.shopId
    }
    Api.pushSoByShop(_parms).then((res) => {
      if (res.data.code == 0) {
        console.log('推送成功')
      }
    })
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  }
})  