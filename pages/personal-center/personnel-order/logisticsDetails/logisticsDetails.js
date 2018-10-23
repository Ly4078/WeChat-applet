import Api from '../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    soId: '',
    id:'',
    Countdown: '',
    soDetail: {},
    payObj:{}
  },
  onLoad: function(options) {
    this.setData({
      soId: options.soId
    })
  },
  onShow: function() {
    this.getorderInfoDetail();
  },
  onPullDownRefresh:function(){
    this.getorderInfoDetail();
  },
  //查询单个订单详情
  getorderInfoDetail: function() {
    let that = this, _dictCounty="";
    Api.orderInfoDetail({
      id: this.data.soId
    }).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        wx.stopPullDownRefresh();
        // 1待付款  2待收货  3已完成 10取消，
        if (_data.status == 1) {
          _data.status2 = '待付款';
          _data.Countdown = that.reciprocal(_data.createTime);
        } else if (_data.status == 2) {
          _data.status2 = '待收货';
        } else if (_data.status == 3) {
          _data.status2 = '已完成';
        } else if (_data.status == 10) {
          _data.status2 = '已取消';
        }
        if (_data.orderAddressOut){
          if (_data.orderAddressOut.dictCounty &&_data.orderAddressOut.dictCounty != null){
            _dictCounty = _data.orderAddressOut.dictCounty
          }
          _data.address = _data.orderAddressOut.dictProvince + _data.orderAddressOut.dictCity + _dictCounty + _data.orderAddressOut.detailAddress;
        }
        
        _data.comTotal = _data.orderItemOuts[0].goodsPrice * _data.orderItemOuts[0].goodsNum;
        _data.comTotal = _data.comTotal.toFixed(2);
        if (_data.orderItemOuts[0].packingPrice){
          _data.orderItemOuts[0].packingPrice = _data.orderItemOuts[0].packingPrice.toFixed(2);
        }
        if (_data.sendAmount && _data.sendAmount != null){
          _data.sendAmount = _data.sendAmount.toFixed(2);
        }
        if (_data.orderItemOuts[0].unit == '盒'){
          _data.units='礼盒装';
        } else if (_data.orderItemOuts[0].unit == '斤'){
          _data.units = '散装';
        } else if (_data.orderItemOuts[0].unit == '张'){
          if(_data.status == 2 || _data.status == 3){
            _data.ust= true;
          }
        }
        _data.realAmount = _data.realAmount.toFixed(2);
        _data.orderItemOuts[0].goodsPrice = _data.orderItemOuts[0].goodsPrice.toFixed(2);
        if (_data.expressCode && _data.expressCode.length*1>10){
          console.log('111')
          _data.expressCode2 = _data.expressCode.substring(0,10);
        }
        console.log('_data:', _data)
        that.setData({
          soDetail: _data
        })
      }
    })
  },
  //换算截至时间
  reciprocal: function(createTime) {
    let _createTime = '',
      oneDay = 60 * 60 * 1000 * 24,
      _endTime = '',
      now = '',
      diff = '',
      h = '',
      m = '';
    createTime = createTime.replace(/-/g, "/");//兼容IOS   IOS下不支持时间有(-)须替换
    _createTime = (new Date(createTime)).getTime(); //结束时间
    _endTime = _createTime + oneDay;
    now = new Date().getTime();
    diff = _endTime - now;
    h = Math.floor(diff / 1000 / 60 / 60 % 24); //时
    m = Math.floor(diff / 1000 / 60 % 60); //分
    return h + '小时' + m + '分';
  },
  //点击再次购买按钮
  buyagain:function(){
    let id = this.data.soDetail.orderItemOuts[0].goodsSkuSpecValues[0].id;
    wx.navigateTo({
      url: '../../../../pages/index/crabShopping/crabDetails/crabDetails?id=' + id
    })
  },
  //点击立即使用--进入提蟹券详情页面
  nowuse:function(){
    wx.navigateTo({
      url: "/pages/personal-center/voucher/voucher"
    })
  },
  //点击继续支付  -- 先更新openid
  carryPay:function(){
    let that = this, _Url = "", url = "", urll="",_Urll="";
    wx.login({
      success: res => {
        if (res.code) {
          url = that.data._build_url+'auth/getOpenId?code='+res.code;
          _Url=encodeURI(url);
          wx.request({
            url: _Url,
            header: {
              "Authorization": app.globalData.token
            },
            method: 'POST',
            success: function (res) {
              if (res.data.code == 0) {
                app.globalData.userInfo.openId = res.data.data.openId;
                app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
                urll = that.data._build_url + 'user/update?id=' + app.globalData.userInfo.userId + '&openId=' + app.globalData.userInfo.openId;
                _Urll = encodeURI(urll);
                wx.request({
                  url: _Urll,
                  header: {
                    "Authorization": app.globalData.token
                  },
                  method: 'POST',
                  success: function (res) {
                    if (res.data.code == 0) {
                      that.wxpayment()
                    }
                  }
                })
                return
                Api.updateuser(_obj).then((res) => {
                  if (res.data.code == 0) {
                    that.wxpayment()
                  }
                })
              }
            }
          })
        }
      }
    })
  },  
  //调起微信支付
  wxpayment: function () {
    let _parms = {}, that = this, _value="",url="",_Url="";
    _parms = {
      orderId: this.data.soId,
      openId: app.globalData.userInfo.openId
    };
    
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);

    if (this.data.soDetail.orderItemOuts[0].goodsSpuId == 3){
      url = this.data._build_url + 'wxpay/shoppingMallForCoupon?' + _value;
      _Url = encodeURI(url);
      wx.request({
        url: _Url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({
              payObj: res.data.data
            })
            that.pay();
          }
        }
      })

    }else{
      url = this.data._build_url + 'wxpay/doUnifiedOrderForShoppingMall?' + _value;
      _Url = encodeURI(url);
      wx.request({
        url: _Url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({
              payObj: res.data.data
            })
            that.pay();
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }
      })
    }
  },
  pay:function(){
    let _data = this.data.payObj,
      that = this;
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function (res) {
        that.getorderInfoDetail();
      },
      fail: function (res) {
        wx.showToast({
          icon: 'none',
          title: '支付取消',
          duration: 1200
        })
      }
    })
  },
  //复制订单编号
  copyCode: function() {
    wx.setClipboardData({
      data: this.data.soDetail.orderCode,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '复制成功！',
              icon: 'none'
            })
          }
        })
      }
    })
  },
  //复制快递单号
  copykdCode:function(){
    wx.setClipboardData({
      data: this.data.soDetail.expressCode,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功！',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  examineLogistics: function() { //实时物流入口--
    wx.navigateTo({
      url: 'toTheLogistics/toTheLogistics',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //确认收货
  receipt:function(){
    let that = this, url="",_Url="";
    url = this.data._build_url + 'orderInfo/confirmCeceipt?id=' + this.data.soId;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          that.getorderInfoDetail();
        }
      }
    })
  }
})