import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var app = getApp();

var village_LBS = function(that) {
  wx.getLocation({
    success: function(res) {
      let latitude = res.latitude;
      let longitude = res.longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    id: '',
    sendType: '', // 0-均有/1-快递/2-门店
    isReceived: false, //是否被领取
    isExchange: false, //是否弹出兑换码
    giftTxt: '已被领取' //赠送文字
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '数据加载中...'
    })
    this.setData({
      id: options.id
    });
    if (options.shareId) {
      this.setData({
        shareId: options.shareId,
        oldVersionNo: options.versionNo
      });
    }
  },
  onUnload() {
    wx.hideLoading();
  },
  onShow: function() {
    let _token = wx.getStorageSync('token') || "";
    let userInfo = wx.getStorageSync('userInfo') || {};

    if (userInfo) {
      app.globalData.userInfo = userInfo;
    }
    if (_token.length > 5) {
      app.globalData.token = _token;
    }
    console.log('--------------------------60')
    //判断是否新用户
    if (app.globalData.userInfo.userId) {
      console.log('--------------------------63');
      if (app.globalData.userInfo.mobile) {
        console.log('--------------------------65');
        if (app.globalData.token) {
          console.log('--------------------------67');
          this.getorderCoupon();
        } else {
          console.log('--------------------------70');
          this.authlogin();
        }
      } else { //是新用户，去注册页面
        wx.navigateTo({
          url: '/pages/init/init?isback=1'
        })
      }
    } else {
      console.log('--------------------------79');
      this.findByCode();
    }
  },
  getorderCoupon: function(val) { //查询券详情
    let _this = this;
    wx.request({
      url: this.data._build_url + 'orderCoupon/getDetail?id=' + this.data.id + '&locationX=' + app.globalData.userInfo.lng + '&locationY=' + app.globalData.userInfo.lat,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          wx.hideLoading();
          let data = res.data.data,
            userId = app.globalData.userInfo.userId;
          _this.setData({
            skuName: data.goodsSku.skuName,
            skuPic: data.goodsSku.skuPic,
            qrcodeUrl: data.qrcodeUrl, //核销二维码
            couponCode: data.couponCode, //核销号码
            remark: data.goodsSku.remark,
            expiryDate: data.expiryDate,
            sendType: data.goodsSku.sendType,
            isUsed: data.isUsed, //是否使用 0否/1是
            ownId: data.ownId, //券所有人
            versionNo: data.versionNo, //版本号
            realWeight: data.goodsSku.realWeight, //实际重量
            tempateId: data.goodsSku.deliveryTemplateId //模板id
          });
          if (data.singleType == 2) {
            _this.setData({
              goodsNum: data.orderItemOuts[0].giftNum + data.orderItemOuts[0].goodsNum
            });
          }
          if (data.isUsed == 1) {
            _this.setData({
              giftTxt: '已被使用'
            });
          }
          if (_this.data.shareId) { //从分享页进来
            if (_this.data.shareId == _this.data.ownId || _this.data.ownId == null) { //未被领取
              if (userId != _this.data.shareId) { //不是(所有人&&分享人)点开
                if (_this.data.oldVersionNo == data.versionNo) {
                  _this.getsendCoupon();
                } else {
                  _this.setData({
                    isReceived: true
                  })
                }
              }
            } else { //已被领取
              if (userId != _this.data.ownId) { //被别人领取
                _this.setData({
                  isReceived: true
                });
              }
            }
          } else { //从列表进来
            if (userId == _this.data.ownId) { //未被领取

            } else { //列表进来被领取
              _this.setData({
                isReceived: true
              });
            }
          }
          if (_this.data.sendType != 1) {
            //获取门店列表数据
            _this.storeData(data);
          }
          if (val == 1) {
            let isExchange = true;
            if (_this.data.isReceived || _this.data.isUsed == 1) {
              wx.showToast({
                title: '该券已被人领取',
                icon: 'none'
              })
              isExchange = false;
            }
            _this.setData({
              isExchange: isExchange
            });
          }
          if (val == 2) {
            if (_this.data.isReceived || _this.data.isUsed == 1) {
              wx.showToast({
                title: '该券已被人领取',
                icon: 'none'
              })
              return;
            }
            wx.navigateTo({
              url: '../express/express?weight=' + _this.data.realWeight + '&tempateId=' + _this.data.tempateId + '&id=' + _this.data.id + '&locationX=' + app.globalData.userInfo.lng + '&locationY=' + app.globalData.userInfo.lat
            })
          }
        }
      },
      complete: function() {
        wx.hideLoading();
      }
    })
  },
  getsendCoupon: function() { //领取提蟹券
    let _parms = {},
      _this = this,
      _value = "",
      url = "",
      _Url = "",
      _txt = "";
    _parms = {
      orderCouponCode: this.data.couponCode,
      sendUserId: this.data.ownId,
      versionNo: this.data.versionNo,
      token: app.globalData.token
    };
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    url = _this.data._build_url + 'orderCoupon/sendVersionCoupon?' + _value;
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
            title: '提示',
            content: '领取成功',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                _this.getorderCoupon();
              } else if (res.cancel) {
                // console.log('用户点击取消')
              }
            }
          })
        } else {
          _this.setData({
            isReceived: true
          });
        }
      }
    })
  },
  onShareAppMessage: function() { //赠送好友转发
    return {
      title: this.data.skuName,
      imageUrl: this.data.skuPic,
      path: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + this.data.id + '&shareId=' + app.globalData.userInfo.userId + '&versionNo=' + this.data.versionNo,
      success: function(res) {}
    }
  },
  storeData(data) { //门店列表
    let storeList = [],
      salePointOuts = data.salePointOuts;
    if (salePointOuts.length > 0) {
      for (let i = 0; i < salePointOuts.length; i++) {
        storeList.push({
          salepointName: salePointOuts[i].salepointName,
          address: salePointOuts[i].address,
          distance: this.calculate(salePointOuts[i].distance),
          locationX: salePointOuts[i].locationX,
          locationY: salePointOuts[i].locationY,
          mobile: salePointOuts[i].mobile ? salePointOuts[i].mobile : salePointOuts[i].phone
        });
      }
    }
    if (data.shopOut.id != 0) {
      storeList.push({
        salepointName: data.shopOut.shopName,
        address: data.shopOut.address,
        distance: this.calculate(data.shopOut.distance),
        locationX: data.shopOut.locationX,
        locationY: data.shopOut.locationY,
        mobile: data.shopOut.mobile ? data.shopOut.mobile : data.shopOut.phone
      });
    }
    this.setData({
      storeList: storeList
    });
  },
  calculate(val) { //计算距离
    if (val >= 1000) {
      val = (val / 1000).toFixed(2);
      val = val + 'km'
    } else {
      val = val + 'm';
    }
    return val;
  },
  express() { //跳转至快递配送
    this.getorderCoupon(2);
  },
  storeList() { //跳转至门店列表
    let storeList = '';
    if (this.data.storeList != []) {
      storeList = JSON.stringify(this.data.storeList)
    }
    wx.navigateTo({
      url: '../storeList/storeList?storeList=' + storeList
    })
  },
  exchange() { //点击兑换按钮
    this.getorderCoupon(1);
  },
  infoDetail() {   //跳转至详细说明
    wx.navigateTo({
      url: '../getFailure/getFailure',
    })
  },
  cancelQr() { //取消兑换
    this.setData({
      isExchange: false
    });
    this.getorderCoupon();
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //通过code查询进入的用户信息，判断是否是新用户
  findByCode: function (val) {
    let _this = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              app.globalData.userInfo.lat = data.locationX ? data.locationX : '';
              app.globalData.userInfo.lng = data.locationY ? data.locationY : '';
              for (let key in data) {
                app.globalData.userInfo[key] = data[key]
              }
              if (!data.mobile) { //是新用户，去注册页面
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                  // url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
                })
              } else {
                if (app.globalData.token) {
                  _this.getorderCoupon();
                } else {
                  _this.authlogin();
                }
              }
            } else {
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
          } else {
            _this.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let _this = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          if (app.globalData.userInfo.mobile) {
            _this.getorderCoupon();
          }
        }
      }
    })
  },
  requestCityName(lat, lng) { //获取当前城市
    let _this = this;
    app.globalData.userInfo.lat = lat;
    app.globalData.userInfo.lng = lng;
    if (app.globalData.userInfo.city) {

    } else {
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          if (res.data.status == 0) {
            let _city = res.data.result.address_component.city;
            if (_city == '十堰市' || _city == '武汉市') {
              app.globalData.userInfo.city = _city;
            } else {
              app.globalData.userInfo.city = '十堰市';
            }
            app.globalData.oldcity = app.globalData.userInfo.city;
            app.globalData.picker = res.data.result.address_component;
            let userInfo = app.globalData.userInfo;
            wx.setStorageSync('userInfo', userInfo);
          }
        }
      })
    }
  }
})