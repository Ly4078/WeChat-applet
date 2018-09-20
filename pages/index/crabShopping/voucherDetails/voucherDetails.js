import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actaddress: {}, //当前选中收货地址信息
    current: {}, //券详情
    payObj: {},
    isconvert: true,
    vouId: '', //券ID
    kaishi:'',
    errmsg:'',
    postage:0,
    remarks: '', //备注内容
    date: '', //默认日期
    threeLater: '', //三天后
    tenLater: '' //十天后
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      vouId: options.id
    })
    this.getorderCoupon();
  },
  //查询券详情
  getorderCoupon: function() {
    let that = this;
    wx.request({
      url: this.data._build_url + 'orderCoupon/get/' + this.data.vouId,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log('res:', res)
        let _data = res.data.data;
        let _arr = _data.goodsSkuName.split(" ");
        console.log('_arr:', _arr)
        _arr[0] = "礼品券 | " + _arr[0];
        if (res.data.code == 0) {
          that.setData({
            current: _data,
            kaishi: _arr[0]
          })
          that.getcalculateCost();
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let id = this.data.vouId,
      _skuName = this.data.current.goodsSkuName;
    console.log('id:', id, '_skuName:', _skuName)
    return {
      title: _skuName,
      path: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + id,
      success: function(res) {}
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
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
      this.getcalculateCost();
    } else {
      if (app.globalData.userInfo.userId){
        if (app.globalData.userInfo.mobile) { //是新用户，去注册页面
          this.getAddressList();
        }else{
          wx.navigateTo({
            url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
          })
        }
        
      } else {
        this.findByCode(); 
      }
      
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    app.globalData.Express = {};
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  findByCode: function () { //通过code查询进入的用户信息，判断是否是新用户
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            app.globalData.userInfo.userId = data.id;
            app.globalData.userInfo.lat = data.locationX;
            app.globalData.userInfo.lng = data.locationY;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }
            if (!data.mobile) { //是新用户，去注册页面
              wx.navigateTo({
                url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
              })
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },

  //查询已有收货地址
  getAddressList: function(val) {
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
          actaddress: _list[0]
        })
        app.globalData.Express = this.data.actaddress;
        if (val) {
          this.getcalculateCost();
        }
      } else {
        app.globalData.Express = {};
      }
    })
  },
  // 选择收货地址
  additionSite: function() {
    wx.navigateTo({
      url: '../../../personal-center/shipping/shipping',
    })
  },
  //选择送达时间
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  //查询最费
  getcalculateCost: function() {
    if (!this.data.current) {
      this.getDetailBySkuId('val');
      return;
    }
    if (!this.data.actaddress.id) {
      this.getAddressList('val');
      return;
    }
    let _weight = this.data.current.goodsSku.realWeight * 1,
      _obj = {};
    let _parms = {
      dictProvinceId: this.data.actaddress.dictProvinceId,
      dictCityId: this.data.actaddress.dictCityId,
      weight: _weight,
      tempateId: this.data.current.goodsSku.deliveryTemplateId
    }
    Api.calculateCost(_parms).then((res) => {
      if (res.data.code == 0) {
        _obj = this.data.current;
        if (_obj.goodsSku.realWeight== 0){

        }else {
          if(res.data.data){
            _obj.total = _obj.total * 1 + res.data.data;
            _obj.total = _obj.total.toFixed(2);
            this.setData({
              postage: res.data.data.toFixed(2)
            })
            this.setData({
              current: _obj
            })
            console.log('current11:', this.data.current)
          }else{
            this.setData({
              errmsg:res.data.message
            })
            wx.showToast({
              title: res.data.message,
              icon:'none'
            })
          }
        }
        
        
      }
    })
  },
  //赠送好友
  giveFriend: function() {
    console.log('giveFriend')
  },
  //点击立即兑换
  redeemNow: function() {
    if (this.data.errmsg){
      wx.showToast({
        title: this.data.errmsg,
        icon:'none'
      })
    }else{
      if (this.data.isconvert) {
        if (this.data.postage) {
          this.updataUser();
        } else {
          this.seduseCoupon();
        }
        this.setData({
          isconvert: false
        })
      }
    }
    
  },

  //执行立即兑换
  seduseCoupon: function() {
    let _parms = {
      shopId: 0,
      shopName: '享7自营',
      sendTime: this.data.date,
      remark: this.data.remarks,
      id: this.data.current.id,
      couponAddressId: this.data.actaddress.id,
      changerId: app.globalData.userInfo.userId,
      changerName: app.globalData.userInfo.userName,
      sendAmount: this.data.postage
    },that = this;
    Api.useCoupon(_parms).then((res) => {
      if (res.data.code == 0) {
        console.log('res:', res)
        wx.showToast({
          title: '兑换成功',
          icon: 'none'
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '../../../../pages/personal-center/voucher/exchangeDetails/exchangeDetails?id=' + that.data.current.id,
          })
          this.setData({
            isconvert: true
          })
        }, 1500)
      }else{
        this.setData({
          isconvert: true
        })
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
      }
    })
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
    console.log("current:", this.data.current.id);
    console.log("actaddress:", this.data.actaddress.id)
    let _parms = {
      orderCouponId: this.data.current.id,
      orderAddressId: this.data.actaddress.id,
      realWeight: this.data.current.goodsSku.realWeight,
      templateId: this.data.current.goodsSku.deliveryTemplateId,
      userId: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
    },that = this;
    console.log('_parms:', _parms)
    Api.orderCouponForSendAmount(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          payObj: res.data.data
        })
        that.pay();
      } else {
        that.setData({
          isconvert: true
        })
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //支付
  pay: function() {
    let _data = this.data.payObj,
      that = this;
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function(res) {
        that.seduseCoupon();
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