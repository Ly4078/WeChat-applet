import Api from '/../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp();
let minusStatus = '';
Page({
  data: {
    // input默认是1  
    _build_url: GLOBAL_API_DOMAIN,
    number: 1,
    minusStatus: 'disabled',
    paymentAmount: '',
    obj: [],
    sostatus: 0,
    issnap: false,
    issecond: false,
    paytype: '', //支付方式， 1微信支付  2余额支付
    balance: 0, //余额
    skuName: "",
    items: [{
        name: '微信支付',
        id: '1',
        disabled: false,
        img: '/images/icon/weixinzhifu.png',
        checked: true
      }
      // { name: '余额支付', id: '2', disabled: false, img: '/images/icon/yuezhifu.png', checked: true },
    ]
  },
  onLoad: function(options) {
    console.log(options)
    if (options.skuName) {
      this.setData({
        skuName: options.skuName
      })
      // let arr = this.data.items
      // arr[0].checked = true;
      // arr[1].checked = false;
      // arr[1].disabled = true;
      // this.setData({
      //   paytype: 1,
      //   items: arr
      // })
    }
    if (options.skutype == 3) {
      this.setData({
        actId: 37,
        shopId: options.shopId,
        skuId: options.skuId
      });
    }
    if (options.skutype == 4 || options.skutype == 8 || options.skutype == 10) {
      this.setData({
        shopId: options.shopId,
        skuName: options.skuName,
        skutype: options.skutype,
        dishSkuId: options.dishSkuId,
        dishSkuName: options.dishSkuName,
      });

    }
    if (options.skutype == 4 || options.skutype == 10) { //是否消息穿透type==1,grounpid不穿
      this.setData({
        groupId: options.groupId ? options.groupId : '',
        bargainType: options.bargainType
      });
    }
    if (options.actId) {
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
    // this.getbalance();
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

  getbalance: function() { //查询余额
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
  radioChange: function(e) { //选框
    let num = e.detail.value;
    this.setData({
      issecond: false
    })
    if (num == 1) { //1微信支付
      this.setData({
        paytype: 1
      })
    } else if (num == 2) { //2余额支付
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
  hidtel: function($phone) {
    $IsWhat = preg_match('/(0[0-9]{2,3}[\-]?[2-9][0-9]{6,7}[\-]?[0-9]?)/i', $phone);
    if ($IsWhat == 1) {
      return preg_replace('/(0[0-9]{2,3}[\-]?[2-9])[0-9]{3,4}([0-9]{3}[\-]?[0-9]?)/i', '$1****$2', $phone);
    } else {
      return preg_replace('/(1[358]{1}[0-9])[0-9]{4}([0-9]{4})/i', '$1****$2', $phone);
    }
  },

  bindMinus: function() { //点击减号
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

  bindPlus: function() { //点击加号
    if (!this.data.actId && this.data.skutype != 4 && this.data.skutype != 8 && this.data.skutype != 10) {
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
  calculate: function(val) { //判断支付方式
    if (this.data.actId || this.data.obj.skutype == 3) {
      this.setData({
        balance: 0
      });
    }
    let arr = this.data.items;
    let diff = (this.data.balance * 1) - (val * 1);
    if (diff < 0) {
      arr[0].checked = true;
      // arr[1].checked = false;
      // arr[1].disabled = true;
      this.setData({
        paytype: 1,
        items: arr
      })
    } else {
      arr[0].checked = false;
      // arr[1].checked = true;
      // arr[1].disabled = false;
      this.setData({
        paytype: 2,
        items: arr
      })
    }
  },

  bindManual: function(e) {
    var number = e.detail.value;
    this.setData({
      number: number
    });
  },

  determine: function(e) { //点击确认支付按钮
    let that = this
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      this.confirmPayment();
    }
  },

  confirmPayment: function(e) { //生成订单号
    let that = this,
      _value = "";
    console.log('confirmPayment')
    if (that.data.issecond) {
      return false
    }
    that.setData({
      issecond: true
    })
    setTimeout(function() {
      that.setData({
        issecond: false
      })
    }, 3000)
    if (this.data.skutype == 4) {
      console.log('44444');
      let _parmsss = {},
        _this = this;
      _parmsss = {
        skuName: this.data.skuName,
        skuType: 4,
        stockNum: 999,
        opreatorId: app.globalData.userInfo.userId,
        opreatorName: app.globalData.userInfo.userName,
        sellPrice: this.data.paymentAmount,
        inPrice: 20,
        agioPrice: this.data.paymentAmount
      };
      for (var key in _parmsss) {
        _value += key + "=" + _parmsss[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      wx.request({
        url: that.data._build_url + 'sku/addSkuForKj?' + _value,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            _this.setData({
              skuId: res.data.data //生成这一张券的id
            });
            let _parms = {},
              _values = "";
            _parms = {
              // userId: app.globalData.userInfo.userId,
              // userName: app.globalData.userInfo.userName,
              skuId: _this.data.skuId,
              skuNum: _this.data.number,
              shopId: _this.data.shopId,
              payType: 2,
              dishSkuId: _this.data.dishSkuId,
              dishSkuName: _this.data.dishSkuName,
              token: app.globalData.token
            };
            for (var key in _parms) {
              _values += key + "=" + _parms[key] + "&";
            }
            _values = _values.substring(0, _values.length - 1);
            wx.request({
              url: that.data._build_url + 'so/create?' + _values,
              header: {
                "Authorization": app.globalData.token
              },
              method: 'POST',
              success: function(res) {
                if (res.data.code == 0) {
                  _this.updateuser(res.data.data);
                } else {
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                  })
                }
              }
            })
          } else {
            wx.showToast({
              title: '系统繁忙',
              icon: 'none'
            })
          }
        }
      })
    } else if (this.data.skutype == 8) {
      console.log('888888')
      let _parms = {},
        _this = this;
      _parms = {
        skuName: this.data.skuName,
        skuType: 8,
        stockNum: 999,
        opreatorId: app.globalData.userInfo.userId,
        opreatorName: app.globalData.userInfo.userName,
        sellPrice: this.data.paymentAmount,
        inPrice: 20,
        agioPrice: this.data.paymentAmount
      };
      Api.addSecKill(_parms).then((res) => {
        if (res.data.code == 0) {
          _this.setData({
            skuId: res.data.data //生成这一张券的id
          });
          let _parms = {},
            _values = "";
          _parms = {
            // userId: app.globalData.userInfo.userId,
            // userName: app.globalData.userInfo.userName,
            skuId: _this.data.skuId,
            skuNum: _this.data.number,
            shopId: _this.data.shopId,
            payType: 2, //微信支付
            dishSkuId: _this.data.dishSkuId,
            dishSkuName: _this.data.dishSkuName,
            token: app.globalData.token
          };


          for (var key in _parms) {
            _values += key + "=" + _parms[key] + "&";
          }
          _values = _values.substring(0, _values.length - 1);
          wx.request({
            url: that.data._build_url + 'so/create?' + _values,
            header: {
              "Authorization": app.globalData.token
            },
            method: 'POST',
            success: function(res) {
              if (res.data.code == 0) {
                _this.updateuser(res.data.data);
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '系统繁忙',
            icon: 'none'
          })
        }
      })
    } else if (this.data.skutype == 10) {
      console.log('101010')
      let _parms = {},
        _this = this,
        _value = "";
      _parms = {
        skuName: this.data.skuName,
        skuType: 10,
        stockNum: 999,
        opreatorId: app.globalData.userInfo.userId,
        opreatorName: app.globalData.userInfo.userName,
        sellPrice: this.data.paymentAmount,
        inPrice: 20,
        agioPrice: this.data.paymentAmount
      };
      for (var key in _parms) {
        _value += key + "=" + _parms[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      wx.request({
        url: that.data._build_url + 'sku/addSkuForDh?' + _value,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            _this.setData({
              skuId: res.data.data //生成这一张券的id
            });
            let _parmss = {},
              _values = "";
            _parmss = {
              // userId: app.globalData.userInfo.userId,
              // userName: app.globalData.userInfo.userName,
              skuId: _this.data.skuId,
              skuNum: _this.data.number,
              shopId: _this.data.shopId,
              payType: 2, //微信支付
              dishSkuId: _this.data.dishSkuId,
              dishSkuName: _this.data.dishSkuName,
              token: app.globalData.token
            };
            for (var key in _parmss) {
              _values += key + "=" + _parmss[key] + "&";
            }
            _values = _values.substring(0, _values.length - 1);
            wx.request({
              url: that.data._build_url + 'so/create?' + _values,
              header: {
                "Authorization": app.globalData.token
              },
              method: 'POST',
              success: function(res) {
                if (res.data.code == 0) {
                  _this.updateuser(res.data.data);
                } else {
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                  })
                }
              }
            })
          } else {
            wx.showToast({
              title: '系统繁忙',
              icon: 'none'
            })
          }
        }
      })
    } else {
      console.log("132131")
      if (this.data.obj.soid && this.data.obj.soid != 'undefined' && this.data.obj.soid != '') {
        that.payment(this.data.obj.soid);
        that.updateuser();
      } else {
        console.log("else")
        let _value = "",
          _parms = {};
        _parms = {
          // userId: app.globalData.userInfo.userId,
          // userName: app.globalData.userInfo.userName,
          skuId: this.data.obj.id,
          skuNum: this.data.number,
          payType: 2
        }
        if (this.data.shopId) {
          _parms.shopId = this.data.shopId;
        }
        for (var key in _parms) {
          _value += key + "=" + _parms[key] + "&";
        }
        _value = _value.substring(0, _value.length - 1);
        wx.request({
          url: that.data._build_url + 'so/create?' + _value,
          header: {
            "Authorization": app.globalData.token
          },
          method: 'POST',
          success: function(res) {
            if (res.data.code == 0) {
              that.updateuser(res.data.data);
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              })
            }
          }
        })
      }
    }
  },
  updateuser: function(val) { //更新用户信息
    let that = this,
      _value = "",
      _parms = {};
    _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
    }
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    wx.request({
      url: that.data._build_url + 'user/update?' + _value,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        if (res.data.code == 0) {
          that.payment(val);
        }
      }
    })
  },
  payment: function(soid) { //调起微信支付
    console.log('payment')
    let _pars = {},
      that = this,
      _value = "";
    _pars = {
      soId: soid,
      openId: app.globalData.userInfo.openId
    };
    if (this.data.actId) {
      console.log("actId")
      _pars['actId'] = this.data.actId;
      _pars['skuId'] = this.data.skuId;
      _pars['shopId'] = this.data.obj.shopId;
      console.log('_pars:', _pars)
      for (var key in _pars) {
        _value += key + "=" + _pars[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      wx.request({
        url: that.data._build_url + 'wxpay/doUnifiedOrderForAct?' + _value,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': 'MD5',
              'paySign': res.data.data.paySign,
              success: function(res) {
                that.messagepush();
                wx.redirectTo({
                  url: '../../personal-center/my-discount/my-discount'
                })
              },
              fail: function(res) {
                wx.showToast({
                  icon: 'none',
                  title: '支付取消',
                  duration: 1200
                })
              }
            })
          }
        }
      })
    } else if (this.data.skutype == 4) {
      console.log("noactid")
      let _parms = {},
        _value = "";
      _parms = {
        soId: soid,
        openId: app.globalData.userInfo.openId,
        skuId: this.data.dishSkuId,
        shopId: this.data.shopId,
        type: 1
      };
      //type=1原价购买，grounpId不传
      if (this.data.bargainType == 1) {
        _parms.type = 1;
      } else if (this.data.bargainType == 2) {
        _parms.type = 2;
        _parms.groupId = this.data.groupId;
      }

      for (var key in _parms) {
        _value += key + "=" + _parms[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      wx.request({
        url: that.data._build_url + 'wxpay/doUnifiedOrderForKj?' + _value,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': 'MD5',
              'paySign': res.data.data.paySign,
              success: function(res) {
                wx.redirectTo({
                  url: '../../personal-center/my-discount/my-discount'
                })
              },
              fail: function(res) {
                wx.showToast({
                  icon: 'none',
                  title: '支付取消',
                  duration: 1200
                })
              }
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }
      })
    } else if (this.data.skutype == 8) {
      let _parms = {},
        _value = "";
      _parms = {
        soId: soid,
        openId: app.globalData.userInfo.openId,
        skuId: this.data.dishSkuId,
        shopId: this.data.shopId
      };
      for (var key in _parms) {
        _value += key + "=" + _parms[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      wx.request({
        url: that.data._build_url + 'wxpay/doUnifiedOrderForQg?' + _value,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': 'MD5',
              'paySign': res.data.data.paySign,
              success: function(res) {
                wx.redirectTo({
                  url: '../../personal-center/my-discount/my-discount'
                })
              },
              fail: function(res) {
                wx.showToast({
                  icon: 'none',
                  title: '支付取消',
                  duration: 1200
                })
              }
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }
      })
    } else if (this.data.skutype == 10) {
      let _parms = {},
        _value = "";
      _parms = {
        soId: soid,
        openId: app.globalData.userInfo.openId,
        skuId: this.data.dishSkuId,
        shopId: this.data.shopId
      }
      //type=1原价购买，grounpId不传
      if (this.data.bargainType == 1) {
        _parms.type = 1;
      } else if (this.data.bargainType == 2) {
        _parms.type = 2;
        _parms.groupId = this.data.groupId;
      }
      for (var key in _parms) {
        _value += key + "=" + _parms[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      wx.request({
        url: that.data._build_url + 'wxpay/doUnifiedOrderForDh?' + _value,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': 'MD5',
              'paySign': res.data.data.paySign,
              success: function(res) {
                wx.redirectTo({
                  url: '../../personal-center/my-discount/my-discount'
                })
              },
              fail: function(res) {
                wx.showToast({
                  icon: 'none',
                  title: '支付取消',
                  duration: 1200
                })
              }
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }
      })
    } else {
      for (var key in _pars) {
        _value += key + "=" + _pars[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      wx.request({
        url: that.data._build_url + 'wxpay/doUnifiedOrder?' + _value,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': 'MD5',
              'paySign': res.data.data.paySign,
              success: function(res) {
                wx.redirectTo({
                  url: '../../personal-center/my-discount/my-discount'
                })
              },
              fail: function(res) {
                wx.showToast({
                  icon: 'none',
                  title: '支付取消',
                  duration: 1200
                })
              }
            })
          }
        }
      })
    }
  },
  messagepush: function() { //消息推送
    let that = this,
      pannum = this.data.paymentAmount ? this.data.paymentAmount : 0;
    let _parms = {
      type: 'android',
      title: '收款通知',
      messageInfo: '享七收款' + pannum + '元',
      badge: 1,
      ios: '享七收款' + pannum + '元',
      shopId: that.data.shopId
    }
    Api.pushSoByShop(_parms).then((res) => {
      if (res.data.code == 0) {
        console.log('推送成功')
      }
    })
  },
  closetel: function(e) {
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