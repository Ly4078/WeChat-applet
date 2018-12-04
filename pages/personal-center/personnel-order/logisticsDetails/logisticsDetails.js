import Api from '../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
import Countdown from '../../../../utils/Countdown.js';
import canvasShareImg from '../../../../utils/canvasShareImg.js';
import Public from '../../../../utils/public.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    soId: '',
    id: '',
    timer:null,
    shadowFlag:true,
    showSkeleton:true,
    Countdown: '',
    soDetail: {},
    payObj: {},
    ispay: true,
    isGroup:false
  },
  onLoad: function (options) {
   
    this.setData({
      soId: options.soId || ''
    })
  },
  onShow: function () {
    this.findByCode()
  },
  onPullDownRefresh: function () {
    this.findByCode()
  },
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              that.authlogin(); //获取token
            } else {
              if (!data.mobile) { //是新用户，去注册页面
                wx.reLaunch({
                  url: '/pages/init/init'
                })
              } else {
                that.authlogin();
              }
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          let userInfo = wx.getStorageSync('userInfo')
          userInfo.token = _token
          wx.setStorageSync("token", _token)
          wx.setStorageSync("userInfo", userInfo)
          if (app.globalData.userInfo.mobile) {
            that.getorderInfoDetail();
            that.getgroupOrderDetail();
          } else {
            wx.reLaunch({
              url: '/pages/init/init',
            })
          }
        }
      }
    })
  },
  getgroupOrderDetail:function(){
    let that = this;
    wx.request({
      url: that.data._build_url + 'actGoodsSku/getActSkuListAndOrder?id=' + that.data.soId,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'get',
      success: function (res) {
          if(res.data.code=='0' && res.data.data){
            if (res.data.data.dueTime){
              that.endTimerun(res.data.data.dueTime)
            }
            if (res.data.data.users){
              for (let i = 0; i < res.data.data.users.length;i++){
                if (res.data.data.users[i] != null && res.data.data.users[i].iconUrl){
                  res.data.data.users[0] = res.data.data.users[i]
                  break;
                }
              }
            }
              that.setData({
                groupOrderDetail:res.data.data,
                isGroup: res.data.data.actOrder?true:false,
                progress: parseInt((res.data.data.currentNum/res.data.data.peopleNum *10000)/100)
              })
          }

      },fail:function(){
        
      }
      })
  },
  endTimerun: function (endTime) {
    let that = this;
    that.countdownStart(endTime);
    if(that.data.timer == null){
      that.data.timer = setInterval(() => {
        if (that.data.Countdowns.isEnd) {
          that.getgroupOrderDetail();
          clearInterval(that.data.timer)
        }
        that.countdownStart(endTime);
      }, 1000)
    }
  },
  onHide: function () {
    try {
      clearInterval(that.data.timer);
      that.setData({
        timer: null
      })
    } catch (err) { }
  },
  onUnload: function () {
    try {
      clearInterval(that.data.timer);
      that.setData({
        timer: null
      })
    } catch (err) { }
  },
  countdownStart: function (endTime) {
    let that = this;
    let times = Countdown(endTime)
    that.setData({
      Countdowns: times
    })
  },
  //查询单个订单详情
  getorderInfoDetail: function () {
    let that = this, _dictCounty = "";
    Api.orderInfoDetail({
      id: that.data.soId || '157',
      token:app.globalData.token
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
        } else if (_data.status == 4) {
          _data.status2 = '退款申请中';
        } else if (_data.status == 5) {
          _data.status2 = '已退款';
        }
        if (_data.orderAddressOut) {
          if (_data.orderAddressOut.dictCounty && _data.orderAddressOut.dictCounty != null) {
            _dictCounty = _data.orderAddressOut.dictCounty
          }
          _data.address = _data.orderAddressOut.dictProvince + _data.orderAddressOut.dictCity + _dictCounty + _data.orderAddressOut.detailAddress;
        }

        _data.comTotal = _data.orderItemOuts[0].goodsPrice * _data.orderItemOuts[0].goodsNum;
        _data.comTotal = _data.comTotal.toFixed(2);
        if (_data.orderItemOuts[0].packingPrice) {
          _data.orderItemOuts[0].packingPrice = _data.orderItemOuts[0].packingPrice.toFixed(2);
        }
        if (_data.sendAmount && _data.sendAmount != null) {
          _data.sendAmount = _data.sendAmount.toFixed(2);
        }
        if (_data.orderItemOuts[0].unit == '盒') {
          _data.units = '礼盒装';
        } else if (_data.orderItemOuts[0].unit == '斤') {
          _data.units = '散装';
        } else if (_data.orderItemOuts[0].unit == '张') {
          if (_data.status == 2 || _data.status == 3) {
            _data.ust = true;
          }
        }
        _data.realAmount = _data.realAmount.toFixed(2);
        _data.orderItemOuts[0].goodsPrice = _data.orderItemOuts[0].goodsPrice.toFixed(2);
        if (_data.expressCode && _data.expressCode.length * 1 > 10) {
          _data.expressCode2 = _data.expressCode.substring(0, 10);
        }
        canvasShareImg(_data.orderItemOuts[0].goodsSkuPic, _data.realAmount, _data.comTotal).then(function (res) {
          that.setData({
            shareImg: res
          })
        })
        that.setData({
          soDetail: _data,
          showSkeleton:false,
          offerPrice: (_data.comTotal - _data.realAmount).toFixed(2)
        })
      }else{
        that.setData({
          showSkeleton: false,
        })
      }
    })
  },
  //换算截至时间
  reciprocal: function (createTime) {
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
  buyagain: function () {
    let id = this.data.soDetail.orderItemOuts[0].goodsSkuSpecValues[0].id;
    wx.navigateTo({
      url: '../../../../pages/index/crabShopping/crabDetails/crabDetails?id=' + id
    })
  },
  //点击立即使用--进入提蟹券详情页面
  nowuse: function () {
    wx.navigateTo({
      url: "/pages/personal-center/my-discount/my-discount"
    })
  },
  //点击继续支付  -- 先更新openid
  formSubmit: function (e) {
    let _formId = e.detail.formId;
    let that = this, _Url = "", url = "", urll = "", _Urll = "";
    if (this.data.ispay) {
      that.setData({
        ispay: false
      })
      setTimeout(() => {
        that.setData({
          ispay: true
        })
      }, 2000)

      wx.login({
        success: res => {
          if (res.code) {
            url = that.data._build_url + 'auth/getOpenId?code=' + res.code;
            _Url = encodeURI(url);
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
                }
              }
            })
          }
        }
      })
    }
    Public.addFormIdCache(_formId);
  },
  seeMore:function(){
      let that = this;
      wx.navigateTo({
        url:'/pages/activityDetails/activity-details',
        success:function(){},
        fail:function(){
          wx.switchTab({
            url: '/pages/activityDetails/activity-details',
          })
        }
      })
  },
  seeMygoods:function(){
    let that = this;
    wx.navigateTo({
      url: '/pages/personal-center/my-discount/my-discount',
    })
  },
  //调起微信支付
  wxpayment: function () {
    let _parms = {}, that = this, _value = "", url = "", _Url = "";;
    _parms = {
      orderId: this.data.soId,
      openId: app.globalData.userInfo.openId
    };

    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);

    if (that.data.soDetail.orderAddressOut && that.data.soDetail.orderAddressOut.id) {
      url = that.data._build_url + 'wxpay/doUnifiedOrderForShoppingMall?' + _value;
    } else {
      url = that.data._build_url + 'wxpay/shoppingMallForCoupon?' + _value;
    }
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
  },
  pay: function () {
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
        that.getgroupOrderDetail();
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
  copyCode: function () {
    wx.setClipboardData({
      data: this.data.soDetail.orderCode,
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
  //复制快递单号
  copykdCode: function () {
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

  examineLogistics: function () { //实时物流入口--
    wx.navigateTo({
      url: 'toTheLogistics/toTheLogistics',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //确认收货
  receipt: function () {
    let that = this, url = "", _Url = "";
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
  },
  formSubmits: function (e) {
    let _formId = e.detail.formId;
    this.toRefund();
    Public.addFormIdCache(_formId);
  },
  toRefund: function () {
    let that = this;
    wx.navigateTo({
      url: "/pages/personal-center/personnel-order/order-requesRefund/order-requesRefund?orderNumber=" + that.data.soDetail.orderCode,
    })
  },
  onShareAppMessage: function (e) {
    let that = this;
    let title = "急死了！我正在拼购仅需" + that.data.soDetail.realAmount + "元拿👉" + that.data.soDetail.orderItemOuts[0].goodsSkuName +"👈考验我们感情的时候到了❤❤❤";
    let url = "/packageA/pages/tourismAndHotel/touristHotelDils/touristHotelDils?types=share&parentId=" + that.data.groupOrderDetail.actOrder.userId + '&actid=' + that.data.groupOrderDetail.actId + '&id=' + that.data.groupOrderDetail.skuId + '&groupid=' + that.data.groupOrderDetail.id
    if (e.target.dataset.type=='2'){
      url = url +'&shareType=2'
    }else{
      
    }
    if (e.from == 'button'){
      return {
        title: title,
        imageUrl: that.data.shareImg,
        path: url
      }
    }
    
  },
  // 遮罩层显示
  showShade: function () {
    this.setData({
      shadowFlag: false
    })
  },
  touchmove: function () {

  },
  // 遮罩层隐藏
  conceal: function () {
    this.setData({
      shadowFlag: true
    })
  },

})