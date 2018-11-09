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
      this.gettickets()
    }
  },
  onShow: function() {
    let that = this,
      _parms = {},
      _salepointId = [];
    if (app.globalData.userInfo.shopId && app.globalData.userInfo.userType == 2) {
      this.setData({
        isshop: true,
        isshopuser: true
      })
    }
    _parms = {
      token: app.globalData.token
    }
    Api.getSalePointUserByUserId(_parms).then((res) => {
      if (res.data.code == 0) {
        console.log("resres:", res)
        if (res.data.data && res.data.data.length > 0) {
          for (let i in res.data.data) {
            _salepointId.push(res.data.data[i].salepointId)
          }
          that.setData({
            iszhiying: true,
            salepointId: _salepointId
          })
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
    if (actual.length == 0) {
      this.setData({
        okhx: false
      })
    }
    clearInterval(this.data.timer);;
    _timer = setInterval(function() {
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
      hxData: []
    });
  },
  //聚焦--券码
  bindfocus: function() {
    this.setData({
      _codees: '',
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
        _this.gettickets(actual);
      }
    }, 1500)
    _this.setData({
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
            console.log('_soData:', _soData)
            let current = res.data.currentTime,
              isDue = that.isDueFunc(current, _soData.expiryDate),
              _rele = "",
              mssage = "",
              isHx = false,
              _iszhiying = false,
              lists = [];
            _iszhiying = that.data.iszhiying;
            console.log('_iszhiyinsssg:', _iszhiying)
            if (_soData.isUsed == 1) {
              isHx = false;
              mssage = "call-1111该票券已被使用";
            } else if (isDue == 1) {
              isHx = false;
              mssage = "call-2222该票券已过期";
            } else {
              console.log('shopId:', app.globalData.userInfo.shopId)
              console.log("_soData.shopId:", _soData.shopId)
              if (app.globalData.userInfo.shopId) {
                if (_soData.shopId) {
                  if (_soData.salePointOuts && _soData.salePointOuts.length > 0) {
                    if (app.globalData.userInfo.shopId == _soData.shopId) {
                      if (_sale && _sale.length > 0) {
                        for (let i in _soData.salePointOuts) {
                          for (let j in _sale) {
                            if (_soData.salePointOuts[i].salepointId == _sale[j]) {
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
                        mssage = "444你不是该核销点人员，无权核销此券";
                      }
                    }
                  } else {
                    if (app.globalData.userInfo.shopId == _soData.shopId) {
                      isHx = true;
                    } else {
                      isHx = false;
                      mssage = "5555此张券并不是在该商家购买，无法在此核销";
                    }
                  }
                } else if (!_soData.shopId) {
                  isHx = true;
                }
              } else if (!app.globalData.userInfo.shopId) {
                if (_soData.shopId) {
                  if (_soData.salePointOuts && _soData.salePointOuts.length > 0) {
                    if (_sale && _sale.length > 0) {
                      for (let i in _soData.salePointOuts) {
                        for (let j in _sale) {
                          if (_soData.salePointOuts[i].salepointId == _sale[j]) {
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
                    mssage = "call-777此券没有设置核销点";
                  }
                } else {
                  isHx = false;
                  mssage = "call-777自营店核销员无权核销平台券";
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
              newamount: _soData.couponAmount ? _soData.couponAmount : 0,
              dishlist: lists
            })
            if (isHx) {
              console.log('aaaa')
              if (_soData.skuName) {
                console.log('bbbbbb')
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
                console.log('cccccc')
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
              console.log('_soData:', _soData)
              that.setData({
                okhx: isHx
              })
            } else {
              console.log('mssage:', mssage);
              wx.showToast({
                title: mssage,
                icon: 'none',
                duration: 4000
              })
            }






            // ===============================
            return
            if (res.data.data) {
              let _data = res.data.data,
                _rele = "",
                lists = [];
              if (_data.orderCode) {

                let current = res.data.currentTime,
                  isDue = that.isDueFunc(current, _data.expiryDate);
                if (isDue == 1) {
                  wx.showToast({
                    title: '该票券已过期',
                    icon: 'none',
                    mmask: 'true',
                    duration: 2000,
                  })
                  that.setData({
                    okhx: false,
                    _codees: ''
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
                    okhx: false
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
                  if (that.data.isent) {
                    that.setData({
                      _codees: ''
                    })
                  } else {
                    setTimeout(() => {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 4000)
                  }
                  return;
                }
              } else {
                if (_data.salePoint) { //自营店
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
                } else { //商家
                  if (_data.type == 5) {
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
              if ((_data.type == 4 || _data.type == 5 || _data.type == 3) && _data.shopId != app.globalData.userInfo.shopId) {
                wx.showToast({
                  title: '你不是该商家销员，无法核销此券',
                  icon: 'none'
                })
                return false;
              }
              if (_data.isUsed == 1) {
                wx.showToast({
                  title: '该票券已被使用',
                  icon: 'none',
                  mask: 'true',
                  duration: 2000,
                })
                return
              }
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
              if (_data.userName) {
                _data.userName1 = _data.userName;
                _data.userName = _data.userName.substr(0, 3) + "****" + _data.userName.substr(7);
              } else {}
              if (_data.promotionRules && _data.promotionRules.length > 0) {
                if (_data.promotionRules[0].ruleDesc) {
                  _rele = _data.promotionRules[0].ruleDesc;
                }
              }
              if (_data.orderItemOuts && _data.orderItemOuts.length > 0) {
                lists = _data.orderItemOuts;
              }
              that.setData({
                hxData: _data,
                okhx: true,
                newamount: _data.couponAmount ? _data.couponAmount : '0',
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
            that.setData({
              _codees:''
            })
          }
        } else {
          wx.showToast({
            title: '券码错误，请重新输入！',
            mask: 'true',
            icon: 'none',
            duration: 3000
          })
          that.setData({
            _codees: ''
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
      let _value = that.data._codees ? that.data._codees : that.data.code,
        url = "",
        _Url = "";
      if (_hxData.type == 1) {
        url = that.data._build_url + 'orderInfo/useOrderInfo?orderCode=' + _value;
      } else if (_hxData.type == 2) {
        url = that.data._build_url + 'orderCoupon/hxCoupon?shopId=0&shopName=享七自营&salepointId=' + _hxData.salePoint.id + '&id=' + _hxData.id;
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
        if (_hxData.salePoint && _hxData.salePoint.id) {
          _salepointId = _hxData.salePoint.id
        } else if (_hxData.salepointId) {
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