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
    ticklist: [],
    seleced: [],
    soid:'',
    act:0
  },
  onLoad: function (options) {
    console.log("fdasfasdsa")
    let q = decodeURIComponent(options.q);
    if (q) {
      console.log("123213213")
      console.log("q1234567:", utils.getQueryString(q, 'shopid'));
      this.setData({
        shopId: utils.getQueryString(q, 'shopid')
      })
      this.getuserInfo();
    }
    if(options.shopid){
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
    if (options.soid){
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
  getuserInfo(){//如果是扫码直接进入到这里，则查询其用户信息，若查询到的用户信息中没有电话号码，要求用户注册
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
                        issnap:true
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
      this.getvoucher(this.data.inputValue)
    }
  },
  //查看可用票券
  toTickets() {
    let _deff='';
    if (this.data.offer) {
      _deff = this.data.inputValue * 1 - this.data.offer * 1;
    } else {
      _deff = this.data.inputValue * 1;
    }
    wx.navigateTo({
      url: '../ticket-list/ticket-list?shopid=' + this.data.shopId + "&val=" + _deff + '&inputValue=' + this.data.inputValue + '&offer=' + this.data.offer + '&isChecked=' + this.data.isChecked+'&act='+this.data.act
    })
  },
  //获取输入框的消费总额
  bindKeyInput: function (e) {
    let _value = e.detail.value;
    if (_value) {
      this.setData({
        inputValue: e.detail.value,
        ispay: true
      })
      this.getvoucher(_value)
    } else {
      this.setData({
        seleced: []
      })
    }
  },
  //获取输入框的优惠金额
  preferential: function (e) {
    let _value = e.detail.value;
    if (_value) {
      let cha = _value * 1 - this.data.inputValue*1;
      if (cha>0){
        wx.showToast({
          title: '不参与优惠金额不应大于消费总额',
          icon: 'none',
          mask:'true',
          duration: 1500
        })
        this.setData({
          offer:''
        })
        return false
      }
      this.setData({
        offer: e.detail.value
      })
      this.getvoucher()
    } else {
      this.setData({
        seleced: []
      })
    }
  },
  //获取票券
  getvoucher: function () {
    let that = this, _act = this.data.act, _payment = '', _deff='';
    if (this.data.offer){
      _deff = this.data.inputValue * 1 - this.data.offer * 1;
    }else{
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
      if (res.data.code == 200045){
        _payment = this.data.inputValue * 1;
        that.setData({
          payment: _payment,
          ispay:true
        })
      }else if (res.data.code == 0) {
        if (res.data.data.list && res.data.data.list.length > 0) {
          that.setData({
            ispay: false
          })
          if (_act > -1) {
            _payment = _deff * 1 - res.data.data.list[_act].couponAmount * 1;
          }else{
            _payment = _deff * 1;
          }
          if (this.data.offer){
            _payment = _payment.toFixed(2) *1 + this.data.offer * 1;
          }else{
            _payment = _payment.toFixed(2);
          }
          if (_payment > 0) {
            that.setData({
              ispay: true
            })
          } else {
            _payment = 0;
          }
          that.setData({
            num: res.data.data.total,
            ticklist: res.data.data.list,
            payment: _payment
          })
          if (_act>-1){
            that.setData({
              seleced: res.data.data.list[_act]
            })
          }
        } else {
          that.setData({
            payment: this.data.inputValue,
            ispay: true,
            num:0,
            ticklist:[],
            seleced:[]
          })
        }
      }
    })
  },
  //确认支付
  surepay: function () {
    if (this.data.ispay){
      if (!app.globalData.userInfo.mobile) {
        this.setData({
          issnap: true
        })
      }else{
        if (this.data.soid) {
          this.payment(this.data.soid)
        } else {
          let _parms = {
            userId: app.globalData.userInfo.userId,
            userName: app.globalData.userInfo.userName,
            payType: '2',
            soAmount: this.data.payment,
            shopId: this.data.shopId
          }
          if (this.data.seleced.skuId) {
            _parms.skuId = this.data.seleced.skuId;
            _parms.skuNum = '1';
          }
          Api.createForShop(_parms).then((res) => {
            if (res.data.code == 0) {
              this.payment(res.data.data)
              this.updetauserinfo(res.data.data)
            }
          })
        }
      }
    }
  },
  updetauserinfo:function(val){  //更新用户信息
    let _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
    }
    Api.updateuser(_parms).then((res) => {
      if (res.data.code == 0) {
        this.payment(val)
      }
    })
  },
  payment: function (soid) {  //调起支付
    let that = this;
    let _parms = {
      soId: soid,
      openId: app.globalData.userInfo.openId,
      shopId: this.data.shopId
    }
    if (this.data.seleced.id){
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
              soid:''
            })
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
  }
})

