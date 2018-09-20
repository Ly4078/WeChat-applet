var app = getApp();
import Api from '../../../../../utils/config/api.js';
import utils from '../../../../../utils/util.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
// var utils = require('../../../../../utils/util.js');
var rules = [];
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    current: {},
    payObj: {},
    username: '',
    phone: '',
    address: '',
    issku: '',
    num: '',
    sellPrice: '',
    skuName: '',
    spuName: '',
    skuPic: '',
    total: 0,
    issoid: false,
    isvoucher: false, //是否是券
    bzf: 0,
    isbox: 0,
    id: '',
    shopId: '',
    errmsg:'',
    spuId: '',
    orderId: '',
    _rules: '',
    actaddress: {},
    weight: '',
    postage: 0, //配送费
    remarks: '', //备注内容
    date: '', //默认日期
    threeLater: '', //三天后
    tenLater: '' //十天后
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...'
    })

    if (options.id) {
      app.globalData.OrderObj = options;
    } else {
      options = app.globalData.OrderObj;
    }
    this.setData({
      id: options.id,
      num: options.num,
      issku: options.issku,
      id: options.id,
      shopId: options.shopId,
      spuId: options.spuId
    })
    app.globalData.OrderObj = options;
  },
  onShow: function(res) {
    let _day = 60 * 60 * 24 * 1000,
      _today = '',
      hours = '',
      _threeday = '',
      _tenday = '';
    _today = new Date();
    hours = _today.getHours();
    if (hours >= 17) {
      _threeday = _today.getTime() + _day * 4;
      _tenday = _today.getTime() + _day * 11;
    } else {
      _threeday = _today.getTime() + _day * 3;
      _tenday = _today.getTime() + _day * 10;
    }

    _threeday = new Date(_threeday);
    _tenday = new Date(_tenday);
    _today = utils.dateConv(_today, '-');
    _threeday = utils.dateConv(_threeday, '-');
    _tenday = utils.dateConv(_tenday, '-');
    this.setData({
      threeLater: _threeday,
      tenLater: _tenday,
      date: _threeday
    })
    if (app.globalData.Express.id) {
      this.setData({
        actaddress: app.globalData.Express
      });
    } else {
      this.getAddressList();
    }
    this.getDetailBySkuId();
  },
  onHide() {
    wx.hideLoading();
    // app.globalData.Express = {};
  },
  onUnload() {
    app.globalData.Express = {};
  },
  //查询当前商品详情
  getDetailBySkuId: function(val) {
    let that = this,
      man = 0,
      _bzf = 0,
      _ceil = 0;
    Api.DetailBySkuId({
      id: this.data.id
    }).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0) {
        let _obj = res.data.data,
          _bzf = 0,
          _rules = '',
          zbzf = 0,
          _total = 0;
        if (_obj.unit == '盒') {
          this.setData({
            isunit: false
          })
        }
        if (_obj.unit) {
          rules = _obj.goodsPromotionRules;
          if (rules.length > 0) {
            rules.sort(that.compareUp("ruleType"));
            for (let i = 0; i < rules.length; i++) {
              if (rules[i].ruleType == 2) {
                if (this.data.num > rules[i].manNum * 1 - 0.5) {
                  man = Math.floor(this.data.num / rules[i].manNum);
                }
                _rules = rules[i].ruleDesc;
              }
              if (rules[i].ruleType == 3) {
                _ceil = Math.ceil(this.data.num / rules[i].manNum);
                _bzf += _ceil * rules[i].giftNum;
                _bzf += man * rules[i].giftNum;
                _obj.bzf = _bzf;
              }
            }
          } else {
            this.setData({
              isvoucher: true
            })
          }
          zbzf = _obj.bzf ? _obj.bzf : 0;
          _total = this.data.num * _obj.sellPrice + zbzf;
          _total = _total.toFixed(2);
          _obj.total = _total;
        }
        this.setData({
          current: _obj,
          _rules: _rules
        })
        if (_obj.spuId !=3){
          this.getcalculateCost();
        }
        
      }
    })
  },
  // 升序排序
  compareUp: function(propertyName) {
    if ((typeof rules[0][propertyName]) != "number") { // 属性值为非数字
      return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value1.localeCompare(value2);
      }
    } else {
      return function(object1, object2) { // 属性值为数字
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value1 - value2;
      }
    }
  },
  //查询已有收货地址
  getAddressList: function(val) {
    let that = this,
      actaddress = {};
    let _parms = {
      userId: app.globalData.userInfo.userId
    }
    Api.AddressList(_parms).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0 && res.data.data.list) {
        let _list = res.data.data.list, _dictCounty="",
          actList = {};
        for (let i = 0; i < _list.length; i++) {
          if (_list[i].dictCounty == null || !_list[i].dictCounty){}else{
            _dictCounty = _list[i].dictCounty
          }
          _list[i].address = _list[i].dictProvince + _list[i].dictCity + _dictCounty + _list[i].detailAddress;
        }
        this.setData({
          actaddress: _list[0]
        })
        app.globalData.Express = actaddress;
        if (val && this.data.current.spuId != 3) {
          this.getcalculateCost();
        }
      } else {
        app.globalData.Express = {};
      }
    })
  },
  // 选择收货地址
  additionSite: function() {
    wx.navigateTo({
      url: '../../../../personal-center/shipping/shipping',
    })
  },

  //查询最费
  getcalculateCost: function() {
    if (!this.data.current) {
      this.getDetailBySkuId('val');
      return;
    }
    if (!this.data.actaddress.id) {
      this.getAddressList('val');
      return;
    }
    let _weight = this.data.current.realWeight * this.data.num,
      _obj = {};
    let _parms = {
      dictProvinceId: this.data.actaddress.dictProvinceId,
      dictCityId: this.data.actaddress.dictCityId,
      weight: _weight,
      tempateId: this.data.current.deliveryTemplateId
    }
    Api.calculateCost(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data){
          _obj = this.data.current;
          _obj.total = _obj.total * 1 + res.data.data;
          _obj.total = _obj.total.toFixed(2);
          this.setData({
            errmsg:'',
            postage: res.data.data
          })
          this.setData({
            current: _obj
          })
        }else{
          if (this.data.current.spuId == 1){
            this.setData({
              errmsg: res.data.message
            })
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }
      }
    })
  },
  //选择送达时间
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  //监听备注输入
  bindremarks: function(e) {
    let _value = e.detail.value;
    this.setData({
      remarks: _value
    })
  },
  //点击包装费疑问
  handbzf: function() {
    let str = '';
    for (let i = 0; i < rules.length; i++) {
      str += rules[i].ruleDesc + ' ';
    }
    wx.showModal({
      title: '',
      content: str,
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //点击提交订单
  submitSoid: function() {
    let that = this;
    if (this.data.errmsg){
      wx.showToast({
        title: this.data.errmsg,
        icon:'none'
      })
    }else{
      if (this.data.issoid) {
        return
      }
      this.setData({
        issoid: true
      })
      if (this.data.actaddress.id || this.data.isvoucher || this.data.current.spuId==3) {
        let _parms = {
          userId: app.globalData.userInfo.userId,
          userName: app.globalData.userInfo.userName,
          shopId: this.data.shopId,
          payType: 2,
          orderItemList: [{
            goodsSkuId: this.data.id,
            goodsSpuId: this.data.spuId,
            goodsNum: this.data.num,
            shopId: this.data.shopId,
            orderItemShopId: '0',
            remark: this.data.remarks
          }]
        };
        if(this.data.current.spuId !=3){
          _parms.orderAddressId=this.data.actaddress.id,
          _parms.sendTime=this.data.date
        }
        wx.request({
          url: that.data._build_url + 'orderInfo/create',
          data: JSON.stringify(_parms),
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 0) {
              if (res.data.data) {
                that.setData({
                  orderId: res.data.data
                })
                that.updataUser();
              }
            }
          }
        })
      } else {
        wx.showToast({
          title: '请选择或添加收货地址',
          icon: 'none'
        })
      }
    }
    
  },
  //更新用户信息
  updataUser: function() {
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            if (res.data.code == 0) {
              app.globalData.userInfo.openId = res.data.data.openId;
              app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
              let _obj = {
                id: app.globalData.userInfo.userId,
                openId: app.globalData.userInfo.openId
              };
              Api.updateuser(_obj).then((res) => {
                if (res.data.code == 0) {
                  that.wxpayment()
                }
              })
            }
          })
        }
      }
    })
  },
  //调起微信支付
  wxpayment: function() {
    let _parms = {
        orderId: this.data.orderId,
        openId: app.globalData.userInfo.openId
      },
      that = this;
    if (that.data.current.spuId ==3) {
      Api.MallForCoupon(_parms).then((res) => {
        if (res.data.code == 0) {
          that.setData({
            payObj: res.data.data
          })
          that.pay();
        }
      })
    } else {
      Api.shoppingMall(_parms).then((res) => {
        if (res.data.code == 0) {
          that.setData({
            payObj: res.data.data
          })
          that.pay();
        }
      })
    }
  },
    //支付
  pay: function() {
    let _data = this.data.payObj,
      that = this;
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function(res) {
        if (that.data.current.spuId == 3) {
          wx.redirectTo({
            url: 
            '../../../../personal-center/voucher/voucher'
          })
        } else {
          wx.redirectTo({
            url: '../../../../personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + that.data.orderId,
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          icon: 'none',
          title: '支付取消',
          duration: 1200
        })
      },
      complete: function(res) {
        that.setData({
          issoid: false
        })
      }
    })
  }
})