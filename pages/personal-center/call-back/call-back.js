// pages/index/search/search.js
import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp();
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
    okhx: true,
    _type: false,
    _code: '', //输入的券码
    _codees:'',//提货码
    isent: false,
    istihua:false,
    result: '',
    iszy: false, //j是否是自营
    isshopusers:false,//是否是商家核销员
    iszys: false,//是否是自营核销员
    isconfirm: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("options:", options)
    if (options.ent) {
      this.setData({
        isent: true,
        okhx: false,
        isshopusers: options.isshopuser,
        iszys: options.iszy
      })
    }

    if (options.code) {
      this.setData({
        result: options.ByCode,
        code: options.code
      })
      this.gettickets()
    }
  },
  //实时获取输入的券码--券码
  bindinputent: function(e) {
    let actual = e.detail.value;
    if (actual.length == 10) {
      this.gettickets(actual);
    }
    this.setData({
      _code: actual,
      istihua:false
    })
  },
  //聚焦--券码
  bindfocus:function(){
    this.setData({
      _codees: '',
      istihua: false
    })
  },
  //实时获取输入的券码--提货码
  bindinputentes: function (e) {
    let actual = e.detail.value;
    console.log(actual, actual.l)
    if (actual.length == 11) {
      this.gettickets(actual);
    }
    this.setData({
      _codees: actual,
      istihua:true
    })
  },
  //聚焦--提货码
  bindfocuses: function () {
    this.setData({
      _code: '',
      istihua: true
    })
  },
  //获取票券信息
  gettickets: function(val) {
    let that = this,
      _Url = "";
    if (val) {
      if(this.data.istihua){
        _Url = "https://www.hbxq001.cn/orderInfo/getDetailByOrderCode/"+val
      }else{
        _Url = "https://www.hbxq001.cn/cp/getByCode/" + val;
      }
    } else if (this.data.result) {
      _Url = this.data.result;
    }
    console.log("_url:", _Url)
    wx.request({
      url: _Url,
      success: function(res) {
        if (res.data.code == 0) {
          if (res.data.data) {
            let _data = res.data.data,
              _rele = "",
              lists = [];
            console.log("_data_data:", _data);
            if (_data.orderCode) {
              if (that.data.isshopuser && !that.data.iszys) {
                wx.showToast({
                  title: '你不是自营核销员，无法核销该订单',
                  icon: 'none',
                  duration: 4000
                })
                return;
              }
              if (_data.status == 2) {
                that.setData({
                  iszy: true
                })
              } else {
                wx.showToast({
                  title: '此券已被使用，不可再使用',
                  icon: 'none',
                  duration: 4000
                })
                if (that.data.isent){
                  that.setData({
                    _codees:''
                  })
                }else{
                  setTimeout(() => {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 4000)
                }
                return;
              }
            }else{
              if (that.data.iszys && that.data.isshopuser){

              }else if (that.data.iszys && !that.data.isshopuser){
                wx.showToast({
                  title: '你不是该商家销员，无法核销该订单',
                  icon: 'none',
                  duration: 4000
                })
                return;
              }
            }
            if (_data.userName) {
              _data.userName = _data.userName.substr(0, 3) + "****" + _data.userName.substr(7);
            }
            if (_data.promotionRules && _data.promotionRules.length > 0) {
              _rele = _data.promotionRules[0].ruleDesc;
            }
            if (_data.orderItemOuts && _data.orderItemOuts.length > 0) {
              lists = _data.orderItemOuts;
            }
            that.setData({
              hxData: _data,
              okhx: true,
              newamount: _data.couponAmount,
              dishlist: lists
            })
          } else {
            wx.showToast({
              title: '券码错误，请重新输入！',
              mask: 'true',
              icon: 'none',
              duration: 3000
            })
            that.setData({
              _code: ''
            })
          }
        } else {
          that.setData({
            _code: ''
          })
          wx.showToast({
            title: '券码错误，请重新输入！',
            mask: 'true',
            icon: 'none',
            duration: 3000
          })
        }

        // ===============================================
      }
    })
  },


  confirm: function() { //确认核销
    let that = this,
      _hxData = this.data.hxData;
    if (!this.data.isconfirm) {
      return false
    }
    if (!this.data.okhx) {
      wx.showToast({
        title: '不符合核销条件，请重新输入',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    }
    this.setData({
      isconfirm: false
    })
    if (this.data.iszy) {
      let _parms = {
        orderCode: that.data._codees ? that.data._codees : that.data.code,
        hxUserId: app.globalData.userInfo.userId
      }
      Api.useOrderInfo(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showModal({
            title: '',
            showCancel: false,
            content: '核销成功',
            success: function(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '../personal-center'
                })
              }
            }
          })
        }
      })
    } else {
      _hxData.shopAmount = this.data.amount;
      let _parms = {
        soId: _hxData.soId, //订单id	Long
        shopId: app.globalData.userInfo.shopId ? app.globalData.userInfo.shopId : "", //商家id	Long
        shopName: app.globalData.userInfo.shopName ? app.globalData.userInfo.shopName : "", //店铺名称	Date
        shopAmount: that.data.newamount, //消费总额	BigDecimal
        couponId: _hxData.id, //电子券id	Long
        couponCode: _hxData.couponCode, //电子券code	String
        skuId: _hxData.skuId, //商品id	Long
        couponAmount: that.data.newamount, //电子券面额	BigDecimal
        userId: _hxData.userId, //消费人id	Long
        userName: _hxData.userName, //消费人账号	String
        cashierId: app.globalData.userInfo.userId, //收银id	Long
        cashierName: app.globalData.userInfo.userName //收银账号	String
      }
      // console.log("_parms:", _parms);
      Api.hxadd(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showModal({
            title: '',
            showCancel: false,
            content: '核销成功',
            success: function(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '../personal-center'
                })
              }
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            success: function(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '../personal-center'
                })
              } else if (res.cancel) {
                wx.switchTab({
                  url: '../personal-center'
                })
              }
            }
          })
        }
      })
    }

  }
})