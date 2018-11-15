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
    _codees: '', //提货码
    isent: false,
    istihua: false,
    result: '',
    isshopuser: false, //是否是商家核销员
    iszys: false, //是否是自营核销员
    isconfirm: true,
    _salepointId: [],
    hxaleId:'',
    messaged:'',
    frequency:0,
    iszhiying: false
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
        code: options.code
      })
    }
  },
  onShow: function() {
    if (app.globalData.userInfo.shopId && app.globalData.userInfo.userType == 2) {
      this.setData({
        isshop: true,
        isshopuser: true
      })
    }
    this.setData({
      frequency:0
    })
    this.getsalepointId();
  },
  getsalepointId:function(){
    let that = this, _parms = {}, _salepointId=[];
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
          if (that.data.result){
            that.gettickets()
          }
        }else{
          if (that.data.result) {
            that.gettickets()
          }
        }
      }
    })
  },
  //实时获取输入的券码--券码
  bindinputent: function(e) {
    let actual = e.detail.value,
      ms = 0,
      _timer = null,
      _this = this;
    clearInterval(this.data.timer);;
    _timer = setInterval(function() {
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
  bindfocus: function() {
    this.setData({
      _codees: '',
      frequency: 0,
      hxData: {},
      istihua: false
    })
  },
  //实时获取输入的券码--提货码
  bindinputentes: function(e) {
    let actual = e.detail.value,
      ms = 0,
      _timer = null,
      _this = this;
    clearInterval(this.data.timer);;
    _timer = setInterval(function() {
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
  bindfocuses: function() {
    this.setData({
      _code: '',
      frequency:0,
      hxData: {},
      istihua: true
    })
  },
  //获取票券信息
  gettickets: function(val) {
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
      success: function(res) {
        console.log('fff:', res)
        if (res.data.code == 0) {
          if (res.data.data) {
            // =============================
            let _soData = res.data.data;
            let current = res.data.currentTime,
              isDue = that.isDueFunc(current, _soData.expiryDate),
              _rele = "",
              mssage = "",
              isHx = false,
              _iszhiying = false,
              lists = [];
            _iszhiying = that.data.iszhiying;
            if (_soData.isUsed == 1) {
              isHx = false;
              mssage = "该票券已被使用";
            } else if (isDue == 1) {
              isHx = false;
              mssage = "该票券已过期";
            } else {
              const _sale = that.data.salepointId;
              if (app.globalData.userInfo.shopId) {
                
                if (_soData.shopId) {
                  if (_soData.salePointOuts && _soData.salePointOuts.length > 0) {
                    if (app.globalData.userInfo.shopId == _soData.shopId) {
                      if (_sale && _sale.length > 0) {
                        for (let i in _soData.salePointOuts) {
                          for (let j in _sale) {
                            if (_soData.salePointOuts[i].id == _sale[j]) {
                              that.setData({
                                hxaleId: _soData.salePointOuts[i].id
                              })
                              isHx = true;
                              break;
                            } else {
                              mssage = "你不是该核销点人员，无权核销此券";
                              isHx = false;
                            }
                          }
                          if (isHx) {
                            break;
                          }
                        }
                      } else {
                        mssage = "你不是该核销点人员，无权核销此券";
                        isHx = false;
                      }
                    } else {
                      if (_iszhiying) {
                        isHx = true;
                      } else {
                        isHx = false;
                        mssage = "你不是该核销点人员，无权核销此券";
                      }
                    }
                  } else {
                    if (app.globalData.userInfo.shopId == _soData.shopId) {
                      if(_sale && _sale.length>0){
                        that.setData({
                          hxaleId: _sale[0]
                        })
                      }
                      isHx = true;
                    } else {
                      isHx = false;
                      mssage = "此张券并不是在该商家购买，无法在此核销";
                    }
                  }
                } else if (!_soData.shopId) {
                  // isHx = true;
                  if (_soData.salePointOuts && _soData.salePointOuts.length > 0) {
                    if (_sale && _sale.length > 0) {
                      for (let i in _soData.salePointOuts) {
                        for (let j in _sale) {
                          if (_soData.salePointOuts[i].id == _sale[j]) {
                            that.setData({
                              hxaleId: _soData.salePointOuts[i].id
                            })
                            isHx = true;
                            break;
                          } else {
                            mssage = "你不是该核销点人员，无权核销此券";
                            isHx = false;
                          }
                        }
                        if (isHx) {
                          break;
                        }
                      }
                    } else {
                      isHx = false;
                      mssage = "你不是该核销点人员，无权核销此券";
                    }
                  } else {
                    isHx = true;
                  }
                }
              } else if (!app.globalData.userInfo.shopId) {
                if (_soData.shopId || _soData.shopId == 0) {
                  if (_soData.salePointOuts && _soData.salePointOuts.length > 0) {
                    if (_sale && _sale.length > 0) {
                      for (let i in _soData.salePointOuts) {
                        for (let j in _sale) {
                          if (_soData.salePointOuts[i].id == _sale[j]) {
                            that.setData({
                              hxaleId: _soData.salePointOuts[i].id
                            })
                            isHx = true;
                            break;
                          } else {
                            mssage = "你不是该核销点人员，无权核销此券";
                            isHx = false;
                          }
                        }
                        if (isHx) {
                          break;
                        }
                      }
                    } else {
                      mssage = "你不是该核销点人员，无权核销此券";
                      isHx = false;
                    }
                  } else {
                    isHx = false;
                    mssage = "此券没有设置核销点";
                  }
                } else {
                  isHx = false;
                  mssage = "自营店核销员无权核销平台券";
                }
              }
            }
            if (_soData.userName) {
              _soData.userName1 = _soData.userName;
              _soData.userName = _soData.userName.substr(0, 3) + "****" + _soData.userName.substr(7);
            } else {}
            if (_soData.promotionRules && _soData.promotionRules.length > 0) {
              if (_soData.promotionRules[0].ruleDesc) {
                _rele = _soData.promotionRules[0].ruleDesc;
              }
            }
            if (_soData.orderItemOuts && _soData.orderItemOuts.length > 0) {
              lists = _soData.orderItemOuts;
            }

            that.setData({
              hxData: _soData,
              okhx: isHx,
              messaged: mssage,
              newamount: _soData.couponAmount ? _soData.couponAmount : 0,
              dishlist: lists
            })
            if (isHx) {
              if (_soData.skuName) {
                let Cts = "现金",
                  Dis = '折扣';
                if (_soData.skuName.indexOf(Cts) > 0) {
                  _soData.discount = false
                }
                if (_soData.skuName.indexOf(Dis) > 0) {
                  _soData.discount = true
                }
              }
              if (_soData.discount) {
                let _parms = {
                  shopId: app.globalData.userInfo.shopId,
                  skuId: _soData.skuId,
                  token: app.globalData.token
                }
                Api.searchForShopIdNew(_parms).then((res) => {
                  if (res.data.code == -1) {
                    isHx = false;
                    wx.showToast({
                      title: res.data.message + ',不能核销此活动券',
                      mask: 'true',
                      icon: 'none',
                      duration: 3000
                    })
                  }
                })
              }
              that.setData({
                okhx: isHx
              })
            } else {
              wx.showToast({
                title: mssage,
                icon: 'none',
                duration: 4000
              })
            }
          } else {
            that.setData({
              frequency: that.data.frequency+1,
              istihua: !that.data.istihua
            })
            if (that.data.frequency==1){
              that.gettickets(val);
            } else if (that.data.frequency == 2){
              wx.showToast({
                title: '券码错误，请重新输入！',
                mask: 'true',
                icon: 'none',
                duration: 3000
              })
            }
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
  isDueFunc: function(current, expiryDate) { //对比时间是否过期
    let isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < current) {
      isDue = 1;
    }
    return isDue;
  },

  confirm: function() { //确认核销
    let that = this,
      _msg ='不符合核销条件，请重新输入',
      _hxData = this.data.hxData;
    if (!this.data.isconfirm) {
      return false
    }
    if (!this.data.okhx) {
      wx.showToast({
        title: this.data.messaged ? this.data.messaged : _msg,
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
      let _value = that.data._codees ? that.data._codees : that.data.code,
        url = "",
        _Url = "";
      if (_hxData.type == 1) {
        url = that.data._build_url + 'orderInfo/useOrderInfo?orderCode=' + _value;
      } else if (_hxData.type == 2) {
        url = that.data._build_url + 'orderCoupon/hxCoupon?shopId=0&shopName=享七自营&salepointId=' + that.data.hxaleId + '&id=' + _hxData.id;
      }

      _Url = encodeURI(url);
      wx.request({
        url: _Url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
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
        }
      })
    } else {
      _hxData.shopAmount = that.data.amount ? that.data.amount : 0;
      let _values = "",
        _parms = {},
        url = "",
        _Url = "";

      console.log('_hxData:', _hxData)
      if (_hxData.type == 2 || !_hxData.type) {
        _parms={
          shopId:0 ,
          shopName:'享七自营',
          id: _hxData.id
        }
        if (that.data.hxaleId){
          _parms.salepointId = that.data.hxaleId
        }
        for (let key in _parms) {
          _values += key + "=" + _parms[key] + "&";
        }

        _values = _values.substring(0, _values.length - 1);
        url = that.data._build_url + 'orderCoupon/hxCoupon?' + _values;
      } else {
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
        for (let key in _parms) {
          _values += key + "=" + _parms[key] + "&";
        }
        _values = _values.substring(0, _values.length - 1);
        url = that.data._build_url + 'hx/add?' + _values;
      }
      _Url = encodeURI(url);
      wx.request({
        url: _Url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
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
        }
      })
    }
  }
})