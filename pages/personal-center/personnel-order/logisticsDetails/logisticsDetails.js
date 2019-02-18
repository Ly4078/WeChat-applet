import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
import Countdown from '../../../../utils/Countdown.js';
import canvasShareImg from '../../../../utils/canvasShareImg.js';
import Public from '../../../../utils/public.js';
var app = getApp();
var timer = null,
  InquireorderTimer = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    soId: '',
    id: '',
    payTypeText: ['免费赠送', '','微信支付','','余额支付'],
    timer: null,
    shadowFlag: true,
    showSkeleton: true,
    Countdown: '',
    soDetail: {},
    payObj: {},
    ispay: true,
    isGroup: false
  },
  onLoad: function(options) {
    this.setData({
      soId: options.soId || ''
    })
  },
  onShow: function() {
    let that = this;
    if (app.globalData.token) {
      that.getorderInfoDetail();
      that.getgroupOrderDetail();
    } else {
      that.findByCode()
    }
    let timerNum = 0;
    InquireorderTimer = setInterval(() => {
      if (timerNum == 10) {
        clearInterval(InquireorderTimer)
        return false
      }
      that.getorderInfoDetail();
      that.getgroupOrderDetail();
      timerNum++
    }, 2000)
  },
  onPullDownRefresh: function() {
    this.findByCode()
  },
  findByCode: function() { //通过code查询用户信息
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
  authlogin: function() { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          let userInfo = wx.getStorageSync('userInfo') || {};
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
  getgroupOrderDetail: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'actGoodsSku/getActSkuListAndOrder?id=' + that.data.soId,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'get',
      success: function(res) {
        if (res.data.code == '0' && res.data.data) {
          if (res.data.data.dueTime) {
            that.endTimerun(res.data.data.dueTime)
          }
          if (res.data.data.users !=null) {
            for (let i = 0; i < res.data.data.users.length; i++) {
              if (res.data.data.users[i] != null && res.data.data.users[i].iconUrl) {
                res.data.data.users[0] = res.data.data.users[i]
                break;
              }
            }
          }
          if(res.data.data.users != null){
            if (res.data.data.users.length < 9) {
              for (let i = 0; i < 9; i++) {
                if (res.data.data.users.length >= 9) {
                  break
                }
                res.data.data.users.push('')
              }
            }
          }
          
          that.setData({
            groupOrderDetail: res.data.data,
            // isGroup: res.data.data.actOrder.id ? true : false,
            progress: parseInt((res.data.data.currentNum / res.data.data.peopleNum * 10000) / 100)
          })
        }

      },
      fail: function() {

      }
    })
  },
  endTimerun: function(endTime) {
    let that = this;
    that.countdownStart(endTime);
    if (that.data.timer == null) {
      that.data.timer = setInterval(() => {
        if (that.data.Countdowns.isEnd) {
          that.getgroupOrderDetail();
          clearInterval(that.data.timer)
        }
        that.countdownStart(endTime);
      }, 1000)
    }
  },
  onHide: function() {
    try {
      clearInterval(InquireorderTimer);
      clearInterval(that.data.timer);
      that.setData({
        timer: null
      })
    } catch (err) {}
    clearInterval(timer);
  },
  onUnload: function() {
    try {
      clearInterval(InquireorderTimer);
      clearInterval(that.data.timer);
      that.setData({
        timer: null
      })
    } catch (err) {}
    clearInterval(timer);
  },
  countdownStart: function(endTime) {
    let that = this;
    let times = Countdown(endTime)
    that.setData({
      Countdowns: times
    })
  },
  //查询单个订单详情
  getorderInfoDetail: function() {
    let that = this,
      _dictCounty = "";
    Api.orderInfoDetail({
      id: that.data.soId || '157',
      token: app.globalData.token
    }).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        wx.stopPullDownRefresh();
        // 1待付款  2待收货  3已完成 10取消，
        if (_data.status == 1) {
          _data.status2 = '待付款';
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
        } else {
          _data.ust = true;
        }
        _data.realAmount = _data.realAmount.toFixed(2);
        _data.orderItemOuts[0].goodsPrice = _data.orderItemOuts[0].goodsPrice.toFixed(2);
        if (_data.expressCode && _data.expressCode.length * 1 > 10) {
          _data.expressCode2 = _data.expressCode.substring(0, 10);
        }
        canvasShareImg(_data.orderItemOuts[0].goodsSkuPic, _data.realAmount, _data.marketPrice ? _data.marketPrice : _data.orderItemOuts[0].goodsPrice).then(function(res) {
          that.setData({
            shareImg: res
          })
        })
        that.setData({
          soDetail: _data,
          showSkeleton: false,
          offerPrice: (_data.comTotal - _data.realAmount).toFixed(2)
        })
        if (_data.status == 1) {
          let createTime = _data.createTime;
          createTime = createTime.replace(/\-/g, '/');
          that.reciprocal(createTime);
        }
      } else {
        that.setData({
          showSkeleton: false
        })
      }
    })
  },
  //换算截至时间
  reciprocal: function(createTime) {
    let that = this,
      soDetail = this.data.soDetail,
      currentTime = 0,
      endTime = 0;
    currentTime = new Date().getTime();
    endTime = new Date(createTime).getTime() + 900000;
    if (endTime - currentTime >= 1000) {
      let subtraction = Math.floor((endTime - currentTime) / 1000),
        m = '',
        s = '',
        Countdown = '';
      timer = setInterval(function() {
        m = Math.floor(subtraction / 60); //分
        s = Math.floor(subtraction % 60); //秒
        Countdown = m > 0 ? m + '分' + s + '秒' : s + '秒';
        that.setData({
          Countdown: Countdown
        });
        subtraction--;
        if (subtraction <= 0) {
          soDetail.status2 = '已取消';
          that.setData({
            Countdown: '0秒',
            soDetail: soDetail
          });
          clearInterval(timer);
        }
      }, 1000);
    } else {
      soDetail.status2 = '已取消';
      that.setData({
        Countdown: '0秒',
        soDetail: soDetail
      });
    }
  },
  //点击再次购买按钮
  buyagain: function() {
    let id = this.data.soDetail.orderItemOuts[0].goodsSkuSpecValues[0].id;
    wx.navigateTo({
      url: '../../../../pages/index/crabShopping/crabDetails/crabDetails?id=' + id
    })
  },
  //点击立即使用--进入提蟹券详情页面
  nowuse: function() {
    wx.switchTab({
      url: '/pages/personal-center/my-discount/my-discount',
      success: function () { },
      fail: function () {
        wx.navigateTo({
          url: "/pages/personal-center/my-discount/my-discount",
        })
      }
    })
  },
  //点击继续支付  -- 先更新openid
  formSubmit: function(e) {
    let _formId = e.detail.formId;
    let that = this,
      _Url = "",
      url = "",
      urll = "",
      _Urll = "";
    if (this.data.ispay) {
      that.setData({
        ispay: false
      })
      setTimeout(() => {
        that.setData({
          ispay: true
        })
      }, 2000)
      wx.showLoading({
        title: '加载中...',
      })
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
              success: function(res) {
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
                    success: function(res) {
                      if (res.data.code == 0) {
                        that.wxpayment()
                      } else {
                        wx.hideLoading()
                      }
                    },
                    fail: function() {
                      wx.hideLoading()
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
  seeMore: function() {
    let that = this;
    wx.navigateTo({
      url: '/pages/activityDetails/activity-details',
      success: function() {},
      fail: function() {
        wx.switchTab({
          url: '/pages/activityDetails/activity-details',
        })
      }
    })
  },
  seeMygoods: function() {
    let that = this;
    wx.switchTab({
      url: '/pages/personal-center/my-discount/my-discount',
      success: function () { },
      fail: function () {
        wx.navigateTo({
          url: "/pages/personal-center/my-discount/my-discount",
        })
      }
    })
  },
  //调起微信支付
  wxpayment: function(types) {
    let _parms = {},
      that = this,
      _value = "",
      url = "",
      urls = '',
      _Url = "";;
    _parms = {
      orderId: this.data.soId,
      openId: app.globalData.userInfo.openId
    };
    if(that.data.soDetail.actId){
      _parms.actId = that.data.soDetail.actId
    }
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    url = that.data._build_url + 'wxpay/shoppingMallForCouponNew?' + _value;
    if (that.data.groupOrderDetail.actInfo) {
      let type = that.data.groupOrderDetail.actInfo.type ? that.data.groupOrderDetail.actInfo.type : '1'
      urls = url + '&type=' + type
    } else {
      urls = url + '&type=1'
    }
    _Url = encodeURI(urls);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            payObj: res.data.data
          })
          that.pay();
        } else {
          wx.hideLoading()
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  pay: function() {
    wx.hideLoading()
    let _data = this.data.payObj,
      that = this;
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function(res) {
        that.getorderInfoDetail();
        that.getgroupOrderDetail();
      },
      fail: function(res) {
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
  copykdCode: function() {
    wx.setClipboardData({
      data: this.data.soDetail.expressCode,
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

  examineLogistics: function() { //实时物流入口--
    wx.navigateTo({
      url: 'toTheLogistics/toTheLogistics',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //确认收货
  receipt: function() {
    let that = this,
      url = "",
      _Url = "";
    url = this.data._build_url + 'orderInfo/confirmCeceipt?id=' + this.data.soId;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        if (res.data.code == 0) {
          that.getorderInfoDetail();
        }
      }
    })
  },
  applybilling:function(){
    let that =  this;
    wx.navigateTo({
      url: '/pages/personal-center/personnel-order/logisticsDetails/applyBilling/applyBilling?price=' + that.data.soDetail.realAmount + '&orderNum=' + that.data.soDetail.orderCode + '&imageUrl=' + that.data.soDetail.orderItemOuts[0].goodsSkuPic,
    })
  },
  formSubmits: function(e) {
    let _formId = e.detail.formId;
    this.toRefund();
    Public.addFormIdCache(_formId);
  },
  toRefund: function() {
    let that = this;
    wx.navigateTo({
      url: "/pages/personal-center/personnel-order/order-requesRefund/order-requesRefund?orderNumber=" + that.data.soDetail.orderCode,
    })
  },
  onShareAppMessage: function(e) {
    let that = this,
      title = '享7',
      url = '';
    if (that.data.groupOrderDetail.actInfo && that.data.groupOrderDetail.actInfo.type == '7') {
      url = "/packageA/pages/tourismAndHotel/touristHotelDils/touristHotelDils?types=share&parentId=" + that.data.groupOrderDetail.actOrder.userId + '&actid=' + that.data.groupOrderDetail.actId + '&id=' + that.data.groupOrderDetail.skuId + '&groupid=' + that.data.groupOrderDetail.id + '&shareType=2';
      title = "急死了！我正在拼购仅需" + that.data.soDetail.realAmount + "元拿👉" + that.data.soDetail.orderItemOuts[0].goodsSkuName + "👈考验我们感情的时候到了❤❤❤";
    } else {
      url = "/pages/index/index";
      title = that.data.soDetail.orderItemOuts[0].goodsSkuName
    }
    // if (e.from == 'button') {
    return {
      title: title,
      imageUrl: that.data.shareImg,
      path: url
    }
    // }

  },
  seepiaoDetail: function() { //查看票券
    wx.switchTab({
      url: '/pages/personal-center/my-discount/my-discount',
      success: function () { },
      fail: function () {
        wx.navigateTo({
          url: "/pages/personal-center/my-discount/my-discount",
        })
      }
    })
  },
  // 遮罩层显示
  showShade: function() {
    this.setData({
      shadowFlag: false
    })
  },
  touchmove: function() {

  },
  // 遮罩层隐藏
  conceal: function() {
    this.setData({
      shadowFlag: true
    })
  },

})