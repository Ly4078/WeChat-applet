import Api from '../../../../utils/config/api.js';
var app = getApp();
Page({
  data: {
    soId: '',
    id:'',
    Countdown: '',
    soDetail: {}
  },
  onLoad: function(options) {
    console.log('options:', options)
    this.setData({
      soId: options.soId
    })
  },
  onShow: function() {
    this.getorderInfoDetail();
  },
  //查询单个订单详情
  getorderInfoDetail: function() {
    let that = this;
    Api.orderInfoDetail({
      id: this.data.soId
    }).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        console.log('_data:', _data)
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
        _data.address = _data.orderAddressOut.dictProvince + _data.orderAddressOut.dictCity + _data.orderAddressOut.dictCounty + _data.orderAddressOut.detailAddress;
        that.setData({
          soDetail: _data
        })
        console.log('soDetail:', this.data.soDetail)
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
    _createTime = new Date(createTime);
    _createTime = _createTime.getTime();
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
      // url: '../../../index/crabShopping/crabDetails/crabDetails',
      url: '../../../../pages/index/crabShopping/crabDetails/crabDetails?id=' + id
    })
  },
  //点击继续支付  -- 先更新openid
  carryPay:function(){
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
  wxpayment: function () {
    let _parms = {
      orderId: this.data.soId,
      openId: app.globalData.userInfo.openId
    }, that = this;
    Api.shoppingMall(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
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
            console.log(res.data) // data
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
  }
})