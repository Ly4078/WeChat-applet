// pages/index/search/search.js
import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp();
var requestTask = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    code: '',
    newamount: '',
    pay: '',
    dishlist: [],
    hxData: {},
    _soData: {},
    okhx: true,
    _type: false,
    _code: '', //输入的券码
    _codees: '', //提货码
    soDataId:'',
    isent: false,
    istihua: false,
    result: '',
    isshopuser: false, //是否是商家核销员
    iszys: false, //是否是自营核销员
    isconfirm: true,
    _salepointId: [],
    hxaleId: '',
    messaged: '',
    frequency: 0,
    iszhiying: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("options:", options)

    if (options.ent) {
      this.setData({
        isent: true,
        okhx: false
      })
    }


    if (options.iszy == 'true') {
      this.setData({
        iszys: true
      })
    } else {
      this.setData({
        iszys: false
      })
    }
    if (options.code) {
      this.setData({
        result: options.ByCode,
        code: options.code,
        soDataId:options.id
      })
    }
  },
  onShow: function () {
    if (app.globalData.userInfo.shopId && app.globalData.userInfo.userType == 2) {
      this.setData({
        isshop: true,
        isshopuser: true
      })
    }
    this.setData({
      frequency: 0
    })
    this.getsalepointId();
  },
  getsalepointId: function () {
    let that = this, _parms = {}, _salepointId = [];
    _parms = {
      token: app.globalData.token
    }
    Api.getSalePointUserByUserId(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data && res.data.data.length > 0) {
          for (let i in res.data.data) {
            _salepointId.push(res.data.data[i].salepointId)
          }
          that.setData({
            iszhiying: true,
            salepointId: _salepointId
          })
          console.log('salepointId:', that.data.salepointId)
          if (that.data.result) {
            that.gettickets()
          }
        } else {
          if (that.data.result) {
            that.gettickets()
          }
        }
      }
    })
  },
  //实时获取输入的券码--券码
  bindinputent: function (e) {
    let actual = e.detail.value,
      ms = 0,
      _timer = null,
      _this = this;
    clearInterval(this.data.timer);;
    _timer = setInterval(function () {
      ms += 50;
      if (ms == 100) {
        _this.gettickets(e.detail.value);
      }
    }, 1000)
    _this.setData({
      timer: _timer,
      _code: actual,
      istihua: false,
      frequency: 0,
      okhx: false,
      isconfirm: true,
      hxData: []
    });
  },
  //聚焦--券码
  bindfocus: function () {
    this.setData({
      _codees: '',
      frequency: 0,
      hxData: {},
      istihua: false
    })
  },
  //实时获取输入的券码--提货码
  bindinputentes: function (e) {
    let actual = e.detail.value,
      ms = 0,
      _timer = null,
      _this = this;
    clearInterval(this.data.timer);;
    _timer = setInterval(function () {
      ms += 50;
      if (ms == 100) {
        _this.gettickets(e.detail.value);
      }
    }, 1500)
    _this.setData({
      frequency: 0,
      timer: _timer,
      _codees: actual,
      istihua: true,
      okhx: false,
      isconfirm: true,
      hxData: []
    });
  },
  //聚焦--提货码
  bindfocuses: function () {
    this.setData({
      _code: '',
      frequency: 0,
      hxData: {},
      istihua: true
    })
  },
  //获取票券信息
  gettickets: function (val) {
    let that = this,
      _Url = "";
    if (val) {
      if (this.data.istihua) {
        _Url = "https://www.xiang7.net/orderCoupon/getByCode/" + val;
      } else {
        _Url = "https://www.hbxq001.cn/cp/getByCode/" + val;
      }
    } else if (this.data.result) {
      _Url = this.data.result;
    }
    console.log("_Url:", _Url)
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _soData = res.data.data;
          that.setData({
            soDataId: _soData.id,
            hxData: _soData,
          });
          that.hxJurisdiction(_soData.id);
        } else {
          that.setData({
            frequency: that.data.frequency + 1,
            istihua: !that.data.istihua
          })
          if (that.data.frequency == 1) {
            that.gettickets(val);
          } else if (that.data.frequency == 2) {
            wx.showToast({
              title: '券码错误，请重新输入！',
              mask: 'true',
              icon: 'none',
              duration: 3000
            })
          }
        }
      }
    })
  },
  confirm: function () { //确认核销
    let that = this,
      _msg = '不符合核销条件，请重新输入',
      _hxData = this.data._soData;
    if (!this.data.isconfirm) {
    }else if (!this.data.okhx) {
      wx.showToast({
        title: this.data.messaged ? this.data.messaged : _msg,
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
    }else{
      if (!requestTask){
        return false;
      }
      this.hxCouponV1();
    }
    this.setData({
      isconfirm: false
    })
  },
  //查询当前用户是否有权限核销此券
  hxJurisdiction(val) {
    const that = this;
    wx.request({
      url: this.data._build_url + 'orderCoupon/hxJurisdiction?id=' + val,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'GET',
      success: function (res) {
        console.log('res:', res)
        if (res.data.code == 0) {
          // that.hxCouponV1();
        } else {
          wx.showToast({
            title: res.data.data.errorMessage,
            icon: 'none'
          })
        }
      }
    })
  },
  //核销此券
  hxCouponV1() {
    requestTask = false;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: this.data._build_url + 'orderCoupon/hxCouponV1?id=' + this.data.soDataId,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        console.log('res:', res)
        if (res.data.code == 0) {
          wx.showToast({
            title: '核销成功',
          })
          setTimeout( ()=>{
            wx.switchTab({
              url: '../personal-center'
            })
          },2000)
        } else {
          wx.showToast({
            title: '核销失败',
            icon: 'none'
          })
        }
      },fail:function(){},
      complete:function(){
        wx.hideLoading();
        setTimeout( ()=>{
          requestTask = true;
        },300)
      }
    })
  }
})