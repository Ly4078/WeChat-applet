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
    istow:true,
    okhx: true,
    _type: false,
    _code: '', //输入的券码
    _codees:'',//提货码
    isent: false,
    istihua:false,
    result: '',
    isshopuser:false,//是否是商家核销员
    iszys: false,//是否是自营核销员
    isconfirm: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log("options:", options)
    if (options.ent) {
      this.setData({
        isent: true,
        okhx: false
      })
    }
   
    if (options.isshopuser == 'true'){
      this.setData({
        isshopuser:true
      })
    }else{
      this.setData({
        isshopuser: false
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
    if(this.data.iszys && this.data.isshopuser){
      this.setData({
        istow:false
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
    let actual = e.detail.value, ms = 0, _timer = null, _this = this;
    if (actual.length == 0) {
      this.setData({
        okhx: false
      })
    }
    clearInterval(this.data.timer);;
    _timer = setInterval(function () {
      ms += 50;
      if (ms == 100) {
        _this.gettickets(actual);
      }
    }, 1000)
    _this.setData({
      timer: _timer,
      _code: actual,
      istihua: false,
      okhx: false,
      isconfirm: true,
      hxData:[]
    });
  },
  //聚焦--券码
  bindfocus:function(){
    this.setData({
      _codees: '',
      hxData: {},
      istihua: false
    })
  },
  //实时获取输入的券码--提货码
  bindinputentes: function (e) {
    let actual = e.detail.value, ms = 0, _timer = null, _this = this;
    clearInterval(this.data.timer);;
    _timer = setInterval(function () {
      ms += 50;
      if (ms == 100) {
        _this.gettickets(actual);
      }
    }, 1500)
    _this.setData({
      timer: _timer,
      _codees: actual,
      istihua: true,
      okhx: false,
      isconfirm: true,
      hxData:[]
    });
  },
  //聚焦--提货码
  bindfocuses: function () {
    this.setData({
      _code: '',
      hxData:{},
      istihua: true
    })
  },
  //获取票券信息
  gettickets: function(val) {
    console.log("gettickets")
    let that = this,
      _Url = "";
    if (val) {
      if(this.data.istihua){
        _Url = "https://www.xiang7.net/orderCoupon/getByCode/" + val;
      }else{
        _Url = "https://www.hbxq001.cn/cp/getByCode/" + val;
      }
    } else if (this.data.result) {
      _Url = this.data.result;
    }
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        console.log("callres:",res)
        if (res.data.code == 0) {
          if (res.data.data) {
            let _data = res.data.data,
              _rele = "",
              lists = [];
            if (_data.orderCode) {

              let current = res.data.currentTime, isDue = that.isDueFunc(current, _data.expiryDate);
              if (isDue == 1) {
                wx.showToast({
                  title: '该票券已过期',
                  icon: 'none',
                  mmask: 'true',
                  duration: 2000,
                })
                that.setData({
                  okhx: false,
                  _codees:''
                })
                return
              } 
              if (that.data.isshopuser && that.data.iszys) {
                wx.showToast({
                  title: '你不是自营店核销员，无法核销该订单sss',
                  icon: 'none',
                  duration: 4000
                })
                that.setData({
                  okhx:false
                })
                return
              }
              
              if (_data.status == 2 || _data.shopId == 0) {
                that.setData({
                  iszy: true
                })
              } else {
                wx.showToast({
                  title: '此券已被使用，不可再使用',
                  icon: 'none',
                  duration: 4000
                })
                that.setData({
                  okhx: false
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
              
              // if (that.data.iszys && that.data.isshopuser){
              //   console.log('1111')
              // } else if (that.data.iszys && !that.data.isshopuser){
              //   console.log('222')
              //   that.setData({
              //     okhx: false
              //   })
              //   wx.showToast({
              //     title: '你不是该商家销员，无法核销该订单',
              //     icon: 'none',
              //     duration: 4000
              //   })
              //   return;
              // } 
              
              if (_data.salePoint) {  //自营店
                if (!that.data.iszys) {
                  that.setData({
                    okhx: false
                  })
                  wx.showToast({
                    title: '你不是自营店销员，无法核销该订单',
                    icon: 'none',
                    duration: 4000
                  })
                  return
                }
              } else {  //商家

              console.log('abcdef')
                if (_data.type == 5) {
                  console.log("5555555")
                  if (app.globalData.userInfo.shopId != _data.shopId) {
                    that.setData({
                      okhx: false
                    })
                    wx.showToast({
                      title: '你不是该商家销员，无法核销该订单',
                      icon: 'none',
                      duration: 4000
                    })
                    return
                  }
                } else if (_data.type == 1) {
                  if (that.data.iszys && !that.data.isshopuser) {
                    that.setData({
                      okhx: false
                    })
                    wx.showToast({
                      title: '你不是该商家销员，无法核销此券',
                      icon: 'none',
                      duration: 4000
                    })
                    return
                  }
                }
              }
            }
            console.log('nonono')
            if ((_data.type == 4 || _data.type == 5 || _data.type == 3) && _data.shopId != app.globalData.userInfo.shopId) {
              wx.showToast({
                title: '你不是该商家销员，无法核销此券',
                icon: 'none'
              })
              return false;
            }
            console.log('nonono')
            if (_data.isUsed == 1) {
              wx.showToast({
                title: '该票券已被使用',
                icon: 'none',
                mask: 'true',
                duration: 2000,
              })
              return
            }
            console.log('nonono')
            if (_data.discount) {
              let _parms = {
                shopId: app.globalData.userInfo.shopId,
                skuId: data.data.skuId,
                token: app.globalData.token
              }
              Api.searchForShopIdNew(_parms).then((res) => {
                if (res.data.code == -1) {
                  wx.showToast({
                    title: res.data.message + ',不能核销此活动券',
                    mask: 'true',
                    icon: 'none',
                    duration: 3000
                  })
                  return
                }
              })
            }
            console.log('nonono')
            if (_data.userName) {
              console.log("12312")
              _data.userName1 = _data.userName;
              _data.userName = _data.userName.substr(0, 3) + "****" + _data.userName.substr(7);
            }else{
              console.log("getuser")
            }
            if (_data.promotionRules && _data.promotionRules.length > 0) {
              if (_data.promotionRules[0].ruleDesc){
                _rele = _data.promotionRules[0].ruleDesc;
              }
            }
            if (_data.orderItemOuts && _data.orderItemOuts.length > 0) {
              lists = _data.orderItemOuts;
            }
            that.setData({
              hxData: _data,
              okhx: true,
              newamount: _data.couponAmount ? _data.couponAmount:'0',
              dishlist: lists
            })
          } else {
            wx.showToast({
              title: '券码错误，请重新输入！',
              mask: 'true',
              icon: 'none',
              duration: 3000
            })
          }
        } else {
          wx.showToast({
            title: '券码错误，请重新输入！',
            mask: 'true',
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },
  isDueFunc: function (current, expiryDate) { //对比时间是否过期
    let isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < current) {
      isDue = 1;
    }
    return isDue;
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
      let _value = that.data._codees ? that.data._codees : that.data.code,url="",_Url="";
      if (_hxData.type == 1){
        url = that.data._build_url + 'orderInfo/useOrderInfo?orderCode=' + _value;
      } else if (_hxData.type == 2){
        url = that.data._build_url + 'orderCoupon/hxCoupon?shopId=0&shopName=享七自营&salepointId=' + _hxData.salePoint.id+'&id='+_hxData.id;
      }
      
      _Url=encodeURI(url);
      wx.request({
        url: _Url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            wx.showModal({
              title: '',
              showCancel: false,
              content: '核销成功',
              success: function (res) {
                if (res.confirm) {
                  wx.switchTab({
                    url: '../personal-center'
                  })
                }
              }
            })
          }
        }
      })
    } else {
      _hxData.shopAmount = that.data.amount ? that.data.amount:0;
      let _values = "", _parms={},url="",_Url="";
      _parms = {
        soId: _hxData.soId, //订单id	Long
        shopId: app.globalData.userInfo.shopId ? app.globalData.userInfo.shopId : "", //商家id	Long
        shopName: app.globalData.userInfo.shopName ? app.globalData.userInfo.shopName : "", //店铺名称	Date
        shopAmount: that.data.newamount, //消费总额	BigDecimal
        couponId: _hxData.id, //电子券id	Long
        couponCode: _hxData.couponCode, //电子券code	String
        skuId: _hxData.skuId, //商品id	Long
        couponAmount: that.data.newamount, //电子券面额	BigDecimal
        userId: _hxData.userId, //消费人id	Long
        userName: _hxData.userName1, //消费人账号	String
        // cashierId: app.globalData.userInfo.userId, //收银id	Long
        // cashierName: app.globalData.userInfo.userName, //收银账号	String
      }
      for (var key in _parms) {
        _values += key + "=" + _parms[key] + "&";
      }
     
      _values = _values.substring(0, _values.length - 1);
      if (_hxData.type == 2) {
        let _salepointId = "";
        if (_hxData.salePoint && _hxData.salePoint.id){
          _salepointId = _hxData.salePoint.id
        } else if (_hxData.salepointId){
          _salepointId = _hxData.salepointId;
        }
        url = that.data._build_url + 'orderCoupon/hxCoupon?shopId=0&shopName=享七自营&salepointId=' + _salepointId + '&id=' + _hxData.id;
      } else {
        url = that.data._build_url + 'hx/add?' + _values;
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
            wx.showModal({
              title: '',
              showCancel: false,
              content: '核销成功',
              success: function (res) {
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
              success: function (res) {
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
        }
      })
      return;
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