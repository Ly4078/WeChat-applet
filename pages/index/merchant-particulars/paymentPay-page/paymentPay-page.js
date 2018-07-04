import Api from '/../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isChecked: false,
    inputValue: '',
    offer: '',
    num: 0,
    payment: 0,
    ispay: false,
    isuse: true,
    issnap: false,
    shopId: '',
    shopCode:'',
    ticklist: [],
    seleced: [],
    soid: '',
    act: 0,
    timer: null
  },
  onLoad: function (options) {
    let q = decodeURIComponent(options.q)
    if (q) {
      if (utils.getQueryString(q, 'flag') == 2) {
        this.setData({
          shopCode: utils.getQueryString(q, 'shopCode')
        })
        this.getshopInfo();
        this.getuserInfo();
      }
    }
    if (options.shopid) {
      this.setData({
        shopId: options.shopid
      })
    }
    if (options.inputValue) {
      this.setData({
        inputValue: options.inputValue,
        offer: options.offer,
        act: options.act
      })
      if (options.isChecked == 'false') {
        this.setData({
          isChecked: false
        })
      } else {
        this.setData({
          isChecked: true
        })
      }
      this.getvoucher()
    }
    if (options.soid) {
      this.setData({
        soid: options.soid
      })
    }
  },
  onUnload: function () {
    this.setData({
      soid: ''
    })
  },
  //通过shopcode查询商家信息
  getshopInfo:function(){
    let _parms = {
      code: this.data.shopCode
    }
    Api.getByCode(_parms).then((res) => {
      if(res.data.code == 0){
        this.setData({
          shopId:res.data.data.id
        })
      }
    })
  },
  getuserInfo() {//如果是扫码直接进入到这里，则查询其用户信息，若查询到的用户信息中没有电话号码，要求用户注册
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.useradd(_parms).then((res) => {
            if (res.data.data) {
              app.globalData.userInfo.userId = res.data.data;
              wx.request({  //从自己的服务器获取用户信息
                url: this.data._build_url + 'user/get/' + res.data.data,
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  if (res.data.code == 0) {
                    let data = res.data.data;
                    for (let key in data) {
                      for (let ind in app.globalData.userInfo) {
                        if (key == ind) {
                          app.globalData.userInfo[ind] = data[key]
                        }
                      }
                    }
                    if (!data.mobile) {
                      that.setData({
                        issnap: true
                      })
                    }
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },
  changeSwitch1() {
    this.setData({
      isChecked: !this.data.isChecked
    });
    if (this.data.isChecked) {
      this.setData({
        ispay: false,
        num: 0,
        seleced: [],
        payment: 0
      })
    } else {
      this.setData({
        offer: ''
      })
      this.getvoucher()
    }
  },
  //查看可用票券
  toTickets() {
    let _deff = '';
    if (this.data.offer) {
      _deff = this.data.inputValue * 1 - this.data.offer * 1;
    } else {
      _deff = this.data.inputValue * 1;
    }
    wx.redirectTo({
      url: '../ticket-list/ticket-list?shopid=' + this.data.shopId + "&val=" + _deff + '&inputValue=' + this.data.inputValue + '&offer=' + this.data.offer + '&isChecked=' + this.data.isChecked + '&act=' + this.data.act
    })
  },
  //获取输入框的消费总额
  bindinputvalue: function (e) {
    let _value = e.detail.value, _this = this, ms = 0, _timer = null;
    clearTimeout(this.data.timer);
    if (_value>0) {
      _timer = setInterval(function () {
        ms += 50;
        if (ms == 100) {
          wx.showLoading({
            title: '计算中...',
          })
          _this.setData({
            inputValue: e.detail.value,
            ispay: true
          })

          _this.getvoucher();
          clearInterval(_timer)
        }
      }, 500)
      _this.setData({
        timer: _timer
      });
    } else {
      this.setData({
        offer: '',
        isChecked: false,
        ispay: false,
        payment: 0,
        num: 0,
        seleced: []
      })
    }
  },
  //获取输入框的优惠金额
  preferential: function (e) {
    let _value = e.detail.value, _this = this, ms = 0, _timer = null;
    clearTimeout(this.data.timer);
    if (_value) {
      let cha = _value * 1 - this.data.inputValue * 1;
      if (cha > 0) {
        wx.showToast({
          title: '不参与优惠金额不应大于消费总额',
          icon: 'none',
          mask: 'true',
          duration: 3000
        })
        this.setData({
          offer: '',
          payment: 0,
          num: 0,
          seleced: []
        });
        this.getvoucher()
      } else {
        _timer = setInterval(function () {
          ms += 50;
          if (ms == 100) {
            wx.showLoading({
              title: '计算中...',
            })
            _this.setData({
              offer: e.detail.value
            })
            _this.getvoucher()
            clearInterval(_timer)
          }
        }, 500)
        _this.setData({
          timer: _timer
        });
      };
    } else {
      _timer = setInterval(function () {
        ms += 50;
        if (ms == 100) {
          wx.showLoading({
            title: '计算中...',
          })
          _this.setData({
            offer: e.detail.value,
            seleced: []
          })
          _this.getvoucher()
          clearInterval(_timer)
        }
      }, 500)
      _this.setData({
        timer: _timer
      });
    };
  
},
  //获取票券 计算金额
  getvoucher: function () {
    let that = this, _act = this.data.act, _payment = '', _deff = '';
    if (this.data.offer) {
      _deff = this.data.inputValue * 1 - this.data.offer * 1;
    } else {
      _deff = this.data.inputValue * 1;
    }
    let _parms = {
      shopId: this.data.shopId,
      userId: app.globalData.userInfo.userId,
      isUsed: '0',
      finalAmount: _deff,
      page: 1,
      rows: 100
    }
    Api.listShopUser(_parms).then((res) => {
      if (res.data.code == 200045) {
        _payment = this.data.inputValue * 1;
        _payment = _payment.toFixed(2);
        wx.hideLoading();
        that.setData({
          payment: _payment,
          ispay: true
        })
      } else if (res.data.code == 0) {
        if (res.data.data.list && res.data.data.list.length > 0) {
          that.setData({
            ispay: false
          })
          if (_act > -1) {
            _payment = this.data.inputValue * 1 - res.data.data.list[_act].couponAmount * 1;
          } else {
            _payment = this.data.inputValue * 1;
            that.setData({
              offer:'',
              isChecked:false
            })
          }
          _payment = _payment.toFixed(2);
          if (_payment > 0) {
            that.setData({
              ispay: true
            })
          } else {
            _payment = 0;
          }
          wx.hideLoading();
          that.setData({
            num: res.data.data.total,
            ticklist: res.data.data.list,
            payment: _payment
          })
          if (_act > -1) {
            that.setData({
              seleced: res.data.data.list[_act]
            })
          }
        } else {
          wx.hideLoading();
          that.setData({
            payment: this.data.inputValue,
            ispay: true,
            num: 0,
            ticklist: [],
            seleced: []
          })
        }
      }
    })
  },
  //确认支付
  surepay: function () {
    let that = this;
    if (that.data.ispay) {
      if (!app.globalData.userInfo.mobile) {
        that.setData({
          issnap: true
        })
      } else {
        if (that.data.soid) {
          that.payment(that.data.soid)
        } else {
          let _parms = {
            userId: app.globalData.userInfo.userId,
            userName: app.globalData.userInfo.userName,
            payType: '2',
            soAmount: that.data.payment,
            shopId: that.data.shopId
          }
          if (that.data.seleced.skuId) {
            _parms.skuId = that.data.seleced.skuId;
            _parms.skuNum = '1';
            let _coupon = that.data.seleced.couponAmount / 10;
            if (that.data.payment < _coupon) {
              wx.showToast({
                title: '系统错误，请联系管理员',
                icon: 'none',
                mask: 'true',
                duration: 1000
              })
              that.setData({
                ispay: false
              })
              return false
            }
          }
          Api.createForShop(_parms).then((res) => {
            if (res.data.code == 0) {
              that.updetauserinfo(res.data.data)
            }
          })
        }
      }
    }
  },
  updetauserinfo:function (val) {  //更新用户信息
    let _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
      }, that = this;
    Api.updateuser(_parms).then((res) => {
      that.payment(val)
    })
  },
  payment: function (soid) {  //调起支付
    let that = this;
    let _parms = {
      soId: soid,
      openId: app.globalData.userInfo.openId,
      shopId: this.data.shopId
    }
    if (this.data.seleced.id) {
      _parms.couponId = this.data.seleced.id
    }
    Api.doUnifiedOrderForShop(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.requestPayment({ //调起微信支付
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          success: function (res) {
            that.setData({
              soid: ''
            })
            that.messagepush();
            wx.redirectTo({
              url: '../../../personal-center/lelectronic-coupons/lectronic-coupons?pay=pay' + '&soid=' + soid
            })
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
  //消息推送
  messagepush:function(){
    let that = this, paynum = that.data.payment ? that.data.payment:0;
    let _parms = {
      // alias:app.globalData.userInfo.userId,
      type:'android',
      title:'收款通知',
      messageInfo: '享七收款' + paynum +'元',
      badge:1,
      ios:'1',
      shopId: that.data.shopId
    }
    console.log('_parms:', _parms)
    Api.pushSoByShop(_parms).then((res) => {
      if(res.data.code == 0){
        console.log('推送成功')
      }
    })
  }
})

