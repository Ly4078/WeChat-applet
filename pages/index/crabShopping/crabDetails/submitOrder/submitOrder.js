var app = getApp();
import Api from '../../../../../utils/config/api.js';
import utils from '../../../../../utils/util.js';
import {GLOBAL_API_DOMAIN} from '../../../../../utils/config/config.js';
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
    isagree: false,
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
    remarks:'',//备注内容
    date: '',  //默认日期
    threeLater:'', //三天后
    tenLater:''  //十天后
  },
  onLoad: function(options) {
    if (options.username) {
      this.setData({
        chatName: options.username,
        area: options.address,
        mobile: options.phone,
        addressId: options.addressId ? options.addressId : '',
      })
    }
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
    let _day = 60*60*24*1000;
    let _today = new Date();
    let _threeday = _today.getTime()+_day*3;
    let _tenday = _today.getTime() + _day * 10;
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
    let pages = getCurrentPages();
    // console.log('pages:=================' + JSON.stringify(pages[2]));
    let options = pages[2].data;
    if (options.username && options.address && options.phone) {
      this.setData({
        chatName: options.username,
        area: options.address,
        mobile: options.phone,
        addressId: options.addressId ? options.addressId : ''
      });
    }
    if (!this.data.chatName) {
      this.getAddressList();
    }
    this.getDetailBySkuId();
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
          _total = 0;
        if (_obj.unit) {
          rules = _obj.goodsPromotionRules;
          rules.sort(that.compareUp("ruleType"));
          for (let i = 0; i < rules.length; i++) {
            if (rules[i].ruleType == 2) {
              if (this.data.num > rules[i].manNum * 1 - 0.5) {
                man = Math.floor(this.data.num / rules[i].manNum);
              }
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
          current: _obj
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
      if (res.data.code == 0) {
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
  //选择送货时间
  bindDateChange:function(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
    console.log('data:',this.data.date)
  },
  //监听备注输入
  bindremarks:function(e){
    let _value = e.detail.value;
    this.setData({
      remarks:_value
    })
    console.log('remarks:', this.data.remarks)
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
      console.log('addressId:', this.data.addressId)
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
          success: function (res) {
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
      }else{
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
            console.log('openres:', res)
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
          }
        })
      }
    })
  }
})

let data = {
  "__wxWebviewId__": 196,
  "__route__": "pages/index/crabShopping/crabDetails/submitOrder/submitOrder",
  "data": {
    "_build_url": "https://www.hbxq001.cn/",
    "current": {
      "id": 11,
      "skuCode": "10000011",
      "skuName": "3.0两(公)阳澄湖大闸蟹/斤",
      "skuPic": "https://xqmp4-1256079679.file.myqcloud.com/text_页面图散装.png",
      "costPrice": 20,
      "marketPrice": 89.8,
      "sellPrice": 39.8,
      "stockNum": 10126,
      "waringStock": 50,
      "spuId": 1,
      "isDeleted": 0,
      "status": 1,
      "shopId": 0,
      "sellNum": 599,
      "unit": "斤",
      "miniNum": 1,
      "createTime": "2018-09-17 08:35:00",
      "updateTime": "2018-09-17 12:01:58",
      "spuName": null,
      "spuCode": null,
      "spuType": null,
      "categoryId": null,
      "brandId": null,
      "categoryName": null,
      "brandName": null,
      "goodsSkuSpecValues": [{
        "id": 11,
        "skuId": 11,
        "specValueId": 1,
        "createTime": null,
        "updateTime": null,
        "goodsSpecValue": {
          "id": 1,
          "specId": 1,
          "specValue": "一斤",
          "name": "重量",
          "createTime": null,
          "updateTime": null
        }
      }],
      "goodsPromotionRules": [{
        "id": 16,
        "goodsSkuId": null,
        "goodsSkuCode": null,
        "goodsSkuName": null,
        "ruleType": 3,
        "ruleDesc": "每8斤收15元包装费,不满8斤按8斤算",
        "endTime": 1536652949000,
        "shopId": null,
        "createTime": null,
        "updateTime": null,
        "manNum": 8,
        "giftNum": 15
      }],
      "bzf": 15,
      "total": "54.80"
    },
    "username": "焦焦",
    "phone": "13297932982",
    "address": "云南省红河哈尼族彝族自治州个旧市个旧考虑考虑",
    "issku": "2",
    "num": "1",
    "sellPrice": "",
    "skuName": "",
    "spuName": "",
    "skuPic": "",
    "total": 0,
    "isagree": false,
    "bzf": 0,
    "chatName": "涂茜",
    "addressId": 32,
    "area": "广东省深圳市宝安区西丽",
    "mobile": "15808566665",
    "isbox": 0,
    "id": "11",
    "shopId": "0",
    "spuId": "1",
    "orderId": "",
    "__webviewId__": 196
  },
  "route": "pages/index/crabShopping/crabDetails/submitOrder/submitOrder",
  "options": {
    "spuId": "1",
    "id": "11",
    "num": "1",
    "issku": "2",
    "shopId": "0"
  }
}