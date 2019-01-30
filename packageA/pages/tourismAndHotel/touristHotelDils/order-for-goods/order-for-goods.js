import Api from '../../../../../utils/config/api.js';

import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var utils = require('../../../../../utils/util.js');
import Public from '../../../../../utils/public.js';
var app = getApp();
let minusStatus = '';
var payrequest = true;
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
    paytype: '1', //支付方式， 1微信支付  2余额支付
    balance: 0, //余额
    skuName: "",
    items: [{
      name: '微信支付',
      id: '1',
      disabled: false,
      img: '/images/icon/weixinzhifu.png',
      checked: true
    },
    {
      name: '余额支付',
      id: '2',
      disabled: false,
      img: '/images/icon/yuezhifu.png',
      checked: false
    }
    ]
  },
  onLoad: function (options) {
    let that = this;
    if (!app.globalData.singleData) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }, 2000)
      return
    }

    let singleData = app.globalData.singleData
    that.setData({
      singleData: singleData,
      paymentAmount: (options.number ? (singleData.sellPrice * 1) * options.number : singleData.sellPrice).toFixed(2)
    })
    if (options.number) {
      that.setData({ number: options.number })
    }
    try {
      that.setData({
        actId: options.actId ? options.actId:'',
        notadd: options.notadd ? options.notadd:false,
        flagType: options.flagType ? options.flagType:''
      })

    } catch (err) {

    }

  },
  onShow: function () {
    this.walletDetail();
  },
  sponsorVgts: function () {//点击付款按钮
    let that = this, _parms = {};
    _parms = {
      shopId: that.data.singleData.shopId,
      payType: 2,
      flagType: 7,
      singleType: that.data.singleData.singleType,
      orderItemList: [{
        goodsSkuId: that.data.singleData.id,
        goodsSpuId: that.data.singleData.spuId,
        goodsNum: that.data.number ? that.data.number : '1',
        shopId: that.data.singleData.shopId,
        orderItemShopId: '0'
      }]
    };
    if (that.data.paytype == '2') {//选择余额支付
      if ((that.data.userAmount - 0) >= (that.data.paymentAmount - 0)) {
        _parms.useAccount = '1';
      } else {
        wx.showToast({
          title: '余额不足',
          icon: 'none'
        })
        return false
      }
    }
    payrequest = false
    _parms.flagType = 1;
    if (that.data.notadd) {
      _parms.flagType = that.data.flagType;
      _parms.actId = that.data.actId;
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      // url: that.data._build_url + 'orderInfo/createNew',
      url: that.data._build_url + 'orderInfo/createv1',
      data: JSON.stringify(_parms),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0' && res.data.data) {
          if (res.data.data.status == '3') {
            payrequest = true;
            let id = res.data.data.id;
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '支付成功',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/personal-center/personnel-order/logisticsDetails/logisticsDetails?soId='+id,
                  })
                }
              }
            })
          } else {
            that.setData({
              orderId: res.data.data.id
            }, () => {
              that.wxpayment();
            })
          }

        } else {
          payrequest = true
          wx.hideLoading();
          wx.showToast({
            title: '请稍后再试',
            icon: 'none'
          })
        }

      }, fail() {
        wx.hideLoading();
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        })
      }
    })
  },
  //调起微信支付
  wxpayment: function () {
    let _parms = {},
      that = this,
      url = "",
      _Url = "",
      _value = "";
    _parms = {
      orderId: that.data.orderId,
      openId: app.globalData.userInfo.openId,
    };
    if (that.data.notadd) {
      _parms.actId = that.data.actId;
      _parms.type = 7
    } else {
      _parms.type = 1
    }

    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    url = that.data._build_url + 'wxpay/shoppingMallForCouponNew?' + _value
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == '0' && res.data.data) {
          that.pay(res.data.data)
        } else {
          payrequest = true
          wx.hideLoading();
          wx.showToast({
            title: res.data.message || '支付失败',
            icon: 'none'
          })
        }
      }, fail() {
        wx.hideLoading();
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        })
      }
    })
  },
  pay: function (_data) {
    let that = this;
    wx.hideLoading();
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function (res) {
        payrequest = true
        wx.showLoading({
          title: '订单确认中...',
        })
        setTimeout(() => {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + that.data.orderId,
          })
        },2500)

      }, fail: function (res) {
        payrequest = true
        wx.showToast({
          title: '支付取消',
          icon: "none",
          duration: 1500
        })
      }, complete: function (res) {

      }
    })
  },
  walletDetail() {
    let _this = this;
    wx.request({
      url: this.data._build_url + 'account/getUserAccount',
      method: 'POST',
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let data = res.data.data;
          _this.setData({
            userAmount: data.userAmount ? data.userAmount.toFixed(2) : '0.00',
          });
        }

      },
      fail() {
        wx.stopPullDownRefresh();
      }
    });
  },
  radioChange: function (e) { //选框
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
  bindMinus: function () { //点击减号
    if (this.data.notadd) {
      return false
    }
    let number = this.data.number;
    if (number > 1) {
      --number;
    }
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
    let _paymentAmount = this.data.number * this.data.singleData.sellPrice * 1;
    _paymentAmount = _paymentAmount.toFixed(2)
    this.setData({
      paymentAmount: _paymentAmount
    });
  },

  bindPlus: function () { //点击加号
    if (this.data.notadd) {
      return false
    }
    let number = this.data.number;
    ++number;
    this.setData({
      number: number
    })
    let _paymentAmount = this.data.number * this.data.singleData.sellPrice * 1;
    _paymentAmount = _paymentAmount.toFixed(2)
    this.setData({
      paymentAmount: _paymentAmount
    });
  },
  bindManual: function (e) {  //输入的数值
    var number = e.detail.value;
    this.setData({
      number: number
    });
  },
  formSubmit: function (e) {  //获取fromId
    let _formId = e.detail.formId;
    Public.addFormIdCache(_formId);
    if (!payrequest) {
      return false
    }
    this.sponsorVgts();

  },
  closetel: function (e) {  //新用户去注册
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/init/init?isback=1'
      })
    }
  }
})