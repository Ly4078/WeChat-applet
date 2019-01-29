var app = getApp();
import Api from '../../../../../utils/config/api.js';
import utils from '../../../../../utils/util.js';
import Public from '../../../../../utils/public.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
// var utils = require('../../../../../utils/util.js');
var rules = [];
var payrequest = true;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    current: {},
    payObj: {},
    isclick:true,
    issyzf:false,
    username: '',
    phone: '',
    address: '',
    issku: '', //issku=3为到店自提 issku=2为现金券
    ssnum:1,
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
    errmsg: '',
    spuId: '',
    orderId: '',
    _rules: '',
    actaddress: {},
    stockNum:'',//库存
    weight: '',
    postage: 0, //配送费
    remarks: '', //备注内容
    date: '', //默认日期
    threeLater: '', //三天后
    tenLater: '', //十天后
    distribution: '顺丰速运', //配送方式
    storeName: '',
    address: '',
    picUrl:'',
    skuName:'',
    sellPrice:'',
    actId:'',
    flag:'',
    sendType:'',
    groupId:'',
    singleType:'',
    optionsObj:{},
    items: [{
      name: '微信支付',
      id: '1',
      disabled: false,
      img: '/images/icon/weixinzhifu.png',
      checked: true
    }],
    isuserye:false,  //是否开启余额支付
    balance:140,  //余额数值
    lessbal: 0  //减掉的价格
  },
  onLoad: function(options) {
    console.log('options:', options)
    if (options.id) {
      app.globalData.OrderObj = options;
    } else {
      options = app.globalData.OrderObj;
    }
    this.setData({
      optionsObj:options,
      id: options.id ? options.id:'',
      num: options.num ? options.num:'',
      ssnum: options.num ? options.num : '',
      actId: options.actId ? options.actId:'',
      issku: options.issku ? options.issku:'',
      shopId: options.shopId ? options.shopId:'',
      spuId: options.spuId ?options.spuId:'',
      picUrl: options.picUrl ? options.picUrl : '',
      skuName: options.skuName ? options.skuName : '',
      sellPrice: options.sellPrice ? options.sellPrice : '',
      flag: options.flag ? options.flag : '',
      stockNum: options.stockNum ? options.stockNum:'',
      remarks: options.remark ? options.remark:'',
      sendType: options.sendType ? options.sendType : '',
      groupId: options.groupId ? options.groupId : '',
      singleType: options.singleType ? options.singleType : '',
    })
    if (this.data.actId == 41 || this.data.actId == 44 || this.data.actId == 45) {
      this.setData({
        totleKey: options.totleKey ? options.totleKey:'',
        valueKey: options.valueKey ? options.valueKey:''
      });
    }
    app.globalData.OrderObj = options;
  },
  onShow: function(res) {
    if (this.data.issku == 3) {
      if(!this.data.actId){
        this.setData({
          salepointId: app.globalData.OrderObj.salepointId,
          distribution: '到店自提'
        });
        this.marketDetail();
      }
    } else if (this.data.issku == 2) {
      //现金券
      let _total = this.data.sellPrice;
      if (this.data.ssnum){
        _total = this.data.sellPrice * this.data.ssnum;
      }
      _total = _total.toFixed(2);
      this.setData({
        picUrl: '/images/icon/ticket_txt.png',
        total: _total,
        lessbal: _total
      });
      that.changmoney();
    } else{
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
        if (!this.data.actId) {
          this.getAddressList();
          this.setData({
            actaddress: ''
          });
        }
      }
    }
    if(this.data.actId){
      let _total = this.data.sellPrice * this.data.ssnum;
      _total = _total.toFixed(2);
      this.setData({
        total: _total,
        lessbal: _total
      })
      this.changmoney();
    }else{
      this.setData({ issoid: false })
      if (this.data.issku != 2) {
        wx.showLoading({
          title: '加载中...'
        })
        this.getDetailBySkuId();
      }
    }
  },
  onHide() {
    wx.hideLoading();
  },
  onUnload() {
    app.globalData.Express = {};
  },
  checkboxChange(val){
    this.setData({
      isuserye: !this.data.isuserye
    })
    this.changmoney();
    console.log("isuserye:", this.data.isuserye)
  },
  //价格发生变化 时
  changmoney(){
    let _total = this.data.total, _lessbal = this.data.lessbal;
    if (this.data.isuserye) {
      _total = _total * 1 - this.data.balance * 1;
      if(_total<0){
        _total=0;
      }
    } else {
      _total = this.data.sellPrice * this.data.ssnum;
    }
    _total = _total.toFixed(2);
    if (_total > this.data.balance){
      _lessbal=this.data.balance
    }
    this.setData({
      total: _total,
      lessbal: _lessbal
    })
  },
  //数量加一
  addnum:function(){
    let _ssnum = this.data.ssnum;
    if (this.data.stockNum) {
      if (this.data.ssnum >= this.data.stockNum){
        wx.showToast({
          title: '库存不足',
          icon:'none'
        })
        return false
      }
    }
    _ssnum++;
    this.setData({
      ssnum: _ssnum
    })
    let _total = this.data.sellPrice * this.data.ssnum;
    let _lessbal = this.data.sellPrice * this.data.ssnum;
    console.log('_totaladd:', _total)
    _total = _total.toFixed(2);
    this.setData({
      total: _total,
      lessbal: _lessbal
    })
    this.changmoney();
  },
  //数量减一
  lessnum: function () {
    let _ssnum = this.data.ssnum;
    _ssnum--;
    if (_ssnum<1){
      this.setData({
        ssnum: 1
      })
    }else{
      this.setData({
        ssnum: _ssnum
      })
    }
    let _total = this.data.sellPrice*this.data.ssnum;
    let _lessbal = this.data.sellPrice * this.data.ssnum;
    console.log('_totalless:', _total)
    _total = _total.toFixed(2);
    this.setData({
      total: _total,
      lessbal: _lessbal
    })
    this.changmoney();
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
          //到店提货不需要运费
          zbzf = this.data.issku == 3 ? 0 : zbzf;
          _total = this.data.ssnum * _obj.sellPrice + zbzf;
          _total = _total.toFixed(2);
          _obj.total = _total;
        }
        this.setData({
          current: _obj,
          _rules: _rules
        })
        if (_obj.spuId != 3 && this.data.issku != 3 && this.data.issku != 2) {
          this.getcalculateCost();
        }
      }
    })
  },
  marketDetail() { //超市详细信息
    let _parms = {
      id: this.data.salepointId,
      token: app.globalData.token
    };
    Api.superMarketDetail(_parms).then((res) => {
      if (res.data.code == 0) {
        let data = res.data.data;
        this.setData({
          storeName: data.salepointName,
          address: data.address
        });
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
      // userId: app.globalData.userInfo.userId,
      token: app.globalData.token
    }
    Api.AddressList(_parms).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0 && res.data.data.list) {
        let _list = res.data.data.list,
          _dictCounty = "",
          actList = {};
        for (let i = 0; i < _list.length; i++) {
          if (_list[i].dictCounty == null || !_list[i].dictCounty) {} else {
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
        this.setData({
          postage: 0
        })
      }
    })
  },
  // 选择收货地址
  additionSite: function() {
    wx.navigateTo({
      url: '../../../../personal-center/shipping/shipping',
    })
  },

  //查询运费
  getcalculateCost: function() {
    if (!this.data.current) {
      this.getDetailBySkuId('val');
      return;
    }
    if (!this.data.actaddress.id) {
      this.getAddressList('val');
      return;
    }
    let _weight = this.data.current.realWeight * this.data.num;
    let _obj = {}, _parms = {}, that = this, _val = '';
    _parms = {
      dictProvinceId: this.data.actaddress.dictProvinceId,
      dictCityId: this.data.actaddress.dictCityId,
      weight: _weight,
      tempateId: this.data.current.deliveryTemplateId
    };
    for (var key in _parms) {
      _val += key + '=' + _parms[key] + '&';
    }
    _val = _val.substring(0, _val.length -1);
    wx.request({
      url: that.data._build_url + 'deliveryCost/calculateCost?' + _val,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          if (res.data.data) {
            _obj = that.data.current;
            _obj.total = _obj.total * 1 + res.data.data;
            _obj.total = _obj.total.toFixed(2);
            that.setData({
              errmsg: '',
              postage: res.data.data.toFixed(2)
            })
            that.setData({
              current: _obj
            })
          } 
        } else {
          that.setData({
            errmsg: res.data.message,
            postage: ''
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
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
  formSubmit:function(e){
    let _formId = e.detail.formId;
    if(!this.data.isclick){
      return
    }
    this.setData({
      isclick:false
    })
    if (this.data.issku == 3){
      if(this.data.actId){
        this.createActOrder();
      }else{
        this.superMarketOrder();
      }
    } else if (this.data.issku == 2) {    //现金券
      let _parms = {}, that = this;
      _parms = {
        shopId: '0',
        payType: 2,
        flagType: this.data.flag,
        singleType: this.data.singleType,
        orderItemList: [{
          goodsSkuId: this.data.id,
          // goodsSpuId: this.data.spuId,
          goodsNum: this.data.ssnum,
          shopId: '0',
          orderItemShopId: '0'
        }]
      };
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
          if (res.data.code == 0 && res.data.data != null) {
            if (res.data.data) {
              that.setData({
                orderId: res.data.data
              })
              that.wxpayment();
            }
          } else {
            wx.hideLoading();
            payrequest = true;
          }
        }, fail() {
          wx.hideLoading();
          payrequest = true;
        }
      })
    } else{
      this.submitSoid();
    }
    Public.addFormIdCache(_formId); 
  },
  //创建活动订单
  createActOrder:function(){
    if (!payrequest){
      return false
    }
    if (this.data.issyzf){
      wx.showToast({
        title: '此砍价是已过期，请重新发起砍价',
        icon: 'none'
      })
      return
    }
    payrequest = false;
    let _parms={},that=this;
    _parms = {
      shopId: this.data.shopId,
      payType: 2,
      flagType: this.data.flag,
      singleType: this.data.singleType,
      orderItemList: [{
        goodsSkuId: this.data.id,
        goodsSpuId: this.data.spuId,
        goodsNum: this.data.ssnum,
        shopId: this.data.shopId,
        orderItemShopId: '0'
      }]
    };
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    if (this.data.actId == 41 || this.data.actId == 44 || this.data.actId == 45) {
      if (this.data.totleKey){
        _parms['totalKey'] = this.data.totleKey;
      }
      if (this.data.totleKey) {
        _parms['valueKey'] = this.data.valueKey;
      }
    }
    if (this.data.flag==4){
      _parms.groupId = this.data.groupId;
    }
    // if (this.data.flag != 1) {
    //   _parms.actId = this.data.actId;
    // }
    if (this.data.actId){
      _parms.actId = this.data.actId;
    }
    wx.request({
      url: that.data._build_url + 'orderInfo/createNew',
      data: JSON.stringify(_parms),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0 && res.data.data != null) {
          if (res.data.data) {
            that.setData({
              orderId: res.data.data
            })
            that.wxpayment();
          }
        }else{
          payrequest = true;
          that.setData({
            issyzf:true
          })
          wx.showToast({
            title: '此砍价是已过期，请重新发起砍价',
            icon:'none'
          })
        }
      },fail(){
        payrequest = true;
      },
      complete(){
        wx.hideLoading();
      }
    })
  },
  //到店自提
  superMarketOrder() {
    let that = this;
    if (this.data.issoid) {
      return
    }
    this.setData({
      issoid: true
    })
    let _parms = {
      // userId: app.globalData.userInfo.userId,
      // userName: app.globalData.userInfo.userName,
      shopId: this.data.shopId,
      payType: 2,
      sendType: 2, //到店自提
      salepointId: this.data.salepointId, //到店自提销售点id
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
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          if (res.data.data) {
            that.setData({
              orderId: res.data.data
            })
            that.wxpayment();
            // that.updataUser();
          }
        }
      }
    })
  },
  //点击提交订单
  submitSoid: function() {
    let that = this;
    if (this.data.errmsg) {
      wx.showToast({
        title: this.data.errmsg,
        icon: 'none'
      })
    } else {
      if (this.data.issoid) {
        return
      }
      this.setData({
        issoid: true
      })
      if (this.data.actaddress.id || this.data.isvoucher || this.data.current.spuId == 3) {
        let _parms = {
          token: app.globalData.token,
          // userId: app.globalData.userInfo.userId,
          // userName: app.globalData.userInfo.userName,
          shopId: this.data.shopId,
          payType: 2,
          sendType: 1, //非自提
          orderItemList: [{
            goodsSkuId: this.data.id,
            goodsSpuId: this.data.spuId,
            goodsNum: this.data.num,
            shopId: this.data.shopId,
            orderItemShopId: '0',
            remark: this.data.remarks
          }]
        };
        if (this.data.current.spuId != 3) {
          _parms.orderAddressId = this.data.actaddress.id,
          _parms.sendTime = this.data.date
        }
        wx.request({
          url: that.data._build_url + 'orderInfo/create',
          data: JSON.stringify(_parms),
          method: 'POST',
          header: {
            "Authorization": app.globalData.token
          },
          success: function(res) {
            if (res.data.code == 0) {
              if (res.data.data) {
                that.setData({
                  orderId: res.data.data
                })
                that.wxpayment();
                // that.updataUser();
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
    let _parms = {},
      that = this,
      url="",
      _Url="",
      _value = "";
    _parms = {
      orderId: this.data.orderId,
      openId: app.globalData.userInfo.openId
    };
    this.setData({
      isclick: true
    })
    if (this.data.actId) {
      _parms.type = this.data.flag;
      if (this.data.groupId){
        _parms.groupId = this.data.groupId
      }
    }
    if (this.data.issku == 2) {
      _parms.type = this.data.flag;
    }
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    
    _value = _value.substring(0, _value.length - 1);
    if (that.data.current.spuId != 3 && that.data.issku != 3 && that.data.issku != 2){
      url = that.data._build_url + 'wxpay/doUnifiedOrderForShoppingMall?' + _value;
    }else{
      url = that.data._build_url + 'wxpay/shoppingMallForCouponNew?' + _value;
    }
    if (this.data.actId) {
      url = that.data._build_url + 'wxpay/shoppingMallForCouponNew?' + _value + '&actId=' + this.data.actId;
    }
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({
            payObj: res.data.data
          })
          that.pay();
        }else{
          payrequest = true
        }
      },fail(){
        wx.hideLoading();
        payrequest = true
      }
    })
  },
  //支付
  pay: function() {
    payrequest = true
    let _data = this.data.payObj,
      that = this;
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function(res) {
        payrequest = true;
        wx.showLoading({
          title: '订单确认中...',
        })
        setTimeout( ()=>{
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + that.data.orderId,
          })
        },3000)
      },
      fail: function(res) {
        wx.hideLoading();
        payrequest = true
        wx.showToast({
          icon: 'none',
          title: '支付取消',
          duration: 1200
        })
      },
      complete: function(res) {
        payrequest = true
        that.setData({
          issoid: false
        })
      }
    })
  }
})