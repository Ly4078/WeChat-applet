import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var app = getApp();


Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    realWeight: 0,
    address: {}, //地址
    dateObj:{},
    date: '', //默认日期
    threeLater: '', //三天后
    tenLater: '', //十天后
    remarks: '', //备注内容
    freight: 0, //运费
    notsent:false,
    createId:'',
    soData:{}
  },
  onLoad: function(options) {
    this.setData({
      soData:options,
      weight: options.weight,
      tempateId: options.tempateId,
      id: options.id,
      bluk: options.bluk,
      formulaMode: options.formulaMode,
      piece: options.piece,
      locationX: options.locationX,
      locationY: options.locationY
    });
  },
 
  onShow: function() {
    // 计算送达时间
    
    let today = new Date().getTime(), threeLater = 0, tenLater = 0;
    threeLater = new Date(today + 86400000);
    tenLater = new Date(today + 864000000*9);
    threeLater = utils.dateConv(threeLater, '-');
    tenLater = utils.dateConv(tenLater, '-');
    this.setData({
      threeLater: threeLater, //三天后
      tenLater: tenLater, //十天后
    });

    if (app.globalData.Express.id) {
      this.setData({
        address: app.globalData.Express
      });
      //查运费
      this.getcalculateCost();
    } else {
      this.setData({
        address: ''
      });
      this.getAddressList();
    }
  },
  inpTxt(e) { //输入框事件
    this.setData({
      remarks: e.detail.value
    });
  },
  //查询已有收货地址
  getAddressList: function(val) {
    let _this = this,
      address = {};
    let _parms = {
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
        _this.setData({
          address: _list[0]
        })
        app.globalData.Express = address;
        //查运费
        _this.getcalculateCost();
      } else {
        app.globalData.Express = {};
      }
    })
  },
  //查询运费
  getcalculateCost: function() {
    let _weight = this.data.realWeight;
    let _obj = {},
      _parms = {},
      _this = this,
      _val = '';
    var formulaMode = '';
    if (this.data.formulaMode =='2'){
      formulaMode = '0'
    } else if (this.data.formulaMode == '3'){
      formulaMode = '2'
    } else if (this.data.formulaMode == '1') {
      formulaMode = '1'
    }
    _parms = {
      dictProvinceId: this.data.address.dictProvinceId,
      dictCityId: this.data.address.dictCityId,
      weight: this.data.weight,
      tempateId: this.data.tempateId,
      formulaMode: formulaMode,//计费方式
      piece: this.data.piece,//件数
      bulk: this.data.bluk,//体积

    };
    for (var key in _parms) {
      _val += key + '=' + _parms[key] + '&';
    }
    _val = _val.substring(0, _val.length - 1);
    wx.request({
      url: _this.data._build_url + 'deliveryCost/calculateCost?' + _val,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          let freight = res.data.data ? res.data.data : 0;
          _this.setData({
            freight: freight.toFixed(2),
            notsent: false
          });
        } else {
          _this.setData({
            notsent:true
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
  //提交兑换
  submit() {
    let _this = this;
    if (this.data.notsent){
      wx.showToast({
        title: '不支持配送',
        icon:'none',
        duration:1800
      })
      return false
    }
    if (!this.data.address.id) {
      wx.showModal({
        title: '提示',
        content: '请选择或添加一个收货地址',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../../personal-center/shipping/shipping',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return false;
    }
    if (!this.data.date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return false;
    }
    //查询详情是否被领取或被使用

    this.couponPostage();
  },
  //创建运费订单
  couponPostage(){
    let _parms = {}, that = this, _value="";
    _parms={
      orderCouponId: this.data.soData.id,
      orderCouponCode: this.data.soData.couponCode,
      shopId: this.data.soData.shopId,
      couponAddressId: app.globalData.Express.id ? app.globalData.Express.id : this.data.address.id,
      sendTime: this.data.date+" 00:00:00", 
      realWeight: this.data.weight,
      templateId: this.data.tempateId,
      formulaMode: this.data.formulaMode,//计费方式
      piece: this.data.piece,//件数
      bulk: this.data.bluk//体积
    };
    if (this.data.remarks){
      _parms.remark = this.data.remarks
    }
    console.log('_parms:', _parms);

    wx.request({
      url: that.data._build_url + 'couponPostage/create',
      data: JSON.stringify(_parms),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log("fdsafas_res:", res, res.data.code, res.data.data.postFree)
        if(res.data.code == 0){
          // postFree是否包邮 0 否  1 是
          if (res.data.data.postFree == 0){
            that.setData({
              createId:res.data.data.id
            })
            that.wxpayment();
          } else if (res.data.data.postFree == 1){
            wx.showToast({
              title: '兑换成功',
              icon: 'none',
              duration: 3000
            })
            setTimeout(() => {
              wx.redirectTo({
                url: '../../../../pages/personal-center/voucher/exchangeDetails/exchangeDetails?id=' + that.data.id
              })
            }, 1500)
          }
        }
      },fail() {
        wx.hideLoading()
      },
      complete: function () {
        // wx.hideLoading();
      }
    })
  },
  //调起微信支付
  wxpayment: function () {
    let _parms = {}, _this = this, _value = "", url = "", _Url = "";
    // _parms = {
    //   orderCouponId: this.data.id,
    //   orderAddressId: this.data.address.id,
    //   realWeight: this.data.weight,
    //   templateId: this.data.tempateId,
    //   openId: app.globalData.userInfo.openId
    // };
    _parms = {
      id: this.data.createId,
      openId: app.globalData.userInfo.openId
    };
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    
    _value = _value.substring(0, _value.length - 1);
    // url = _this.data._build_url + 'wxpay/orderCouponForSendAmountNew?' + _value;
    url = _this.data._build_url + 'wxpay/orderCouponForSendAmountV1?' + _value;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.code == 0) {
          _this.setData({
            payObj: res.data.data
          })
          _this.pay();
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      },fail(){
        wx.hideLoading()
      }
    })
  },
  //支付
  pay: function () {
    let _data = this.data.payObj,
      _this = this;
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function (res) {
        wx.showToast({
          title: '兑换成功',
          icon: 'none',
          duration: 3000
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '../../../../pages/personal-center/voucher/exchangeDetails/exchangeDetails?id=' + _this.data.id
          })
        }, 1500)
      },
      fail: function (res) {
        wx.showToast({
          icon: 'none',
          title: '支付取消',
          duration: 3000
        })
      },
      complete: function (res) {
        // console.log(res);
      }
    })
  },
  addAddress() {
    wx.navigateTo({
      url: '../../../personal-center/shipping/shipping'
    })
  }
})