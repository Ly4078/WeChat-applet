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
    bzf: 0,
    chatName: '',
    addressId: '',
    area: '',
    mobile: '',
    isbox: 0,
    id: '',
    shopId: '',
    spuId: '',
    orderId: '',
    _rules: '',
    isagree: false,
    postage: "到付", //配送费
    remarks: '', //备注内容
    date: '', //默认日期
    threeLater: '', //三天后
    tenLater: '' //十天后
  },
  onLoad: function(options) {
    // if (options.username) {
    //   app.globalData.Express = {
    //     chatName: options.username,
    //     area: options.address,
    //     mobile: options.phone,
    //     addressId: options.addressId ? options.addressId : '',
    //   };
    // }
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
      spuId: options.spuId,
      isagree: options.isagree ? options.isagree : false
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
    // let pages = getCurrentPages();
    // let options = pages[2].data;
    this.setData({
      chatName: app.globalData.Express.username ? app.globalData.Express.username : '',
      area: app.globalData.Express.address ? app.globalData.Express.address : '',
      mobile: app.globalData.Express.phone ? app.globalData.Express.phone : '',
      addressId: app.globalData.Express.addressId ? app.globalData.Express.addressId : ''
    });
    if (!this.data.chatName) {
      this.getAddressList();
    }
    this.getDetailBySkuId();
  },
  onHide() {
    app.globalData.Express = {
      chatName: '',
      area: '',
      mobile: '',
      addressId: ''
    };
  },
  onUnload() {
    app.globalData.Express = {
      chatName: '',
      area: '',
      mobile: '',
      addressId: ''
    };
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
      if (res.data.code == 0) {
        let _obj = res.data.data,
          _bzf = 0,
          _rules = '',
          _total = 0;
        if (_obj.unit) {
          rules = _obj.goodsPromotionRules;
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
          _total = this.data.num * _obj.sellPrice + _obj.bzf;
          _total = _total.toFixed(2);
          _obj.total = _total;
        }
        this.setData({
          current: _obj,
          _rules: _rules
        })
        console.log('current:', this.data.current)
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
  getAddressList: function() {
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId
    }
    Api.AddressList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data.list) {
        let _list = res.data.data.list,
          actList = {};
        for (let i = 0; i < _list.length; i++) {
          _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].dictCounty + _list[i].detailAddress;
        }

        this.setData({
          chatName: _list[0].chatName,
          area: _list[0].address,
          mobile: _list[0].mobile,
          addressId: _list[0].id
        })
        app.globalData.Express = {
          chatName: _list[0].chatName,
          area: _list[0].address,
          mobile: _list[0].mobile,
          addressId: _list[0].id
        };
      } else {
        app.globalData.Express = {
          chatName: '',
          area: '',
          mobile: '',
          addressId: ''
        };
      }
    })
  },
  // 选择收货地址
  additionSite: function() {
    wx.navigateTo({
      url: '../../../../personal-center/shipping/shipping',
    })
  },
  //是否同意预售协议
  checkboxChange: function(e) {
    if (e.detail.value[0] == 1) {
      this.setData({
        isagree: true
      })
    } else {
      this.setData({
        isagree: false
      })
    }
  },
  //选择送达时间
  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
    console.log('data:', this.data.date)
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
    if (this.data.isagree) {
      if (this.data.issoid) {
        return
      }
      this.setData({
        issoid: true
      })
      if (this.data.addressId) {
        let _parms = {
          userId: app.globalData.userInfo.userId,
          userName: app.globalData.userInfo.userName,
          shopId: this.data.shopId,
          payType: 2,
          orderAddressId: this.data.addressId,
          sendTime: this.data.date,
          orderItemList: [{
            goodsSkuId: this.data.id,
            goodsSpuId: this.data.spuId,
            goodsNum: this.data.num,
            shopId: this.data.shopId,
            orderItemShopId: '0',
            remark: this.data.remarks
          }]
        };
        wx.request({
          url: that.data._build_url + 'orderInfo/create',
          data: JSON.stringify(_parms),
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            if (res.data.code == 0) {
              if (res.data.data) {
                that.setData({
                  orderId: res.data.data
                })
                console.log('订单生成成功，订单号；', res.data.data)
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
    } else {
      wx.showToast({
        title: '亲,请勾线顺丰到付哟!',
        icon: 'none'
      })
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
    Api.shoppingMall(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          success: function(res) {
            wx.redirectTo({
              url: '../../../../personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + that.data.orderId,
            })
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
  }
})