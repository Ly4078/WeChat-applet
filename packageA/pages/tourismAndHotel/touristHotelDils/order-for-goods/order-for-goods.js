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
    ]
  },
  onLoad: function(options) {
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
      paymentAmount: singleData.sellPrice
    })

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
        goodsNum: that.data.number ? that.data.number:'1',
        shopId: that.data.singleData.shopId,
        orderItemShopId: '0',
      }]
    };
    payrequest = false
    _parms.flagType = 1
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: that.data._build_url + 'orderInfo/createNew',
      data: JSON.stringify(_parms),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0' && res.data.data) {
          that.setData({
            orderId: res.data.data
          }, () => {
            that.wxpayment();
          })

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
      _parms.type = 1
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
        setTimeout( ()=>{
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + that.data.orderId,
          })
        },3000)
        
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
  bindMinus: function() { //点击减号
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

  bindPlus: function() { //点击加号
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
  bindManual: function(e) {  //输入的数值
    var number = e.detail.value;
    this.setData({
      number: number
    });
  },
  formSubmit:function(e){  //获取fromId
    let _formId = e.detail.formId;
    Public.addFormIdCache(_formId);
    if (!payrequest){
      return false
    }
    this.sponsorVgts();
    
  },
  closetel: function(e) {  //新用户去注册
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