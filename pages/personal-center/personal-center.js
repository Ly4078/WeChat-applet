import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
import Api from '../../utils/config/api.js';
var utils = require('../../utils/util.js');
import Public from '../../utils/public.js';
import getToken from '../../utils/getToken.js';
var app = getApp();
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    _build_url: GLOBAL_API_DOMAIN,
    nickName: '',
    iconUrl: '',
    hxaleId: '',
    isname: false,
    newname: '',
    qrCode: '',
    sumTotal: 0,
    collectTotal: 0,
    ismobile: true,
    istouqu: false,
    isshop: false,
    isshopuser: false, //是否是商家核销员
    iszhiying: false, //是否自营店核销员
    qrdata: {},
    issnap: false,
    userType: '',
    accountBalance: '',
    userId: '',
    picUrl: '',
    salepointId: [],
    soData:{},
    isShow: false //是否联系客服
  },
  onLoad: function () {

    let that = this;
    this.setData({
      userType: app.globalData.userInfo.userType
    })
    if (app.globalData.userInfo.mobile) {
      this.setData({
        ismobile: false
      })
    };


    // this.getuserInfo();
  },
  onShow: function () {
    let that = this, _salepointId = [], _parms = {};
    getToken(app).then(() => {
      if (app.globalData.userInfo.shopId && app.globalData.userInfo.userType == 2) {
        that.setData({
          isshop: true,
          isshopuser: true
        })
      } else {
        that.setData({
          isshop: false,
          isshopuser: false
        })
      }
    })

    _parms = {
      token: app.globalData.token
    };
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
        }
      }
    })

    if (!app.globalData.userInfo.unionId) {
      wx.login({
        success: res => {
          if (res.code) {
            wx.request({
              url: that.data._build_url + 'auth/getOpenId?code=' + res.code,
              method: 'POST',
              success: function (res) {
                if (res.data.code == 0) {
                  app.globalData.userInfo.openId = res.data.data.openId;
                  app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
                  if (res.data.data.unionId) {
                    app.globalData.userInfo.unionId = res.data.data.unionId;
                    that.setData({
                      istouqu: false
                    })
                  } else {
                    that.setData({
                      istouqu: true
                    })
                  }
                }
              }
            })
          }
        }
      })
    } else {
      that.setData({
        istouqu: false
      })
    }

    if (app.globalData.userInfo.mobile) {
      // this.getbalance();
      this.setData({
        ismobile: false,
        istouqu: false
      })
    }

    let _nickName = '',
      reg = /^1[34578][0-9]{9}$/;
    _nickName = app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : app.globalData.userInfo.userName;
    if (reg.test(_nickName)) {
      _nickName = _nickName.substr(0, 3) + "****" + _nickName.substr(7);
    }

    this.setData({
      iconUrl: app.globalData.userInfo.iconUrl,
      nickName: _nickName
    })
    wx.request({
      url: that.data._build_url + 'topic/myList',
      header: {
        "Authorization": app.globalData.token
      },
      data: {
        userId: app.globalData.userInfo.userId,
        page: 1,
        rows: 1,
      },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.data.total) {
            let _total = res.data.data.total;
            _total = utils.million(_total);
            if (app.globalData.isflag) {
              that.setData({
                sumTotal: _total
              })
            }
          }
        }
      }
    })

    wx.request({
      url: that.data._build_url + 'fvs/list?page=' + that.data.page + '&rows=10',
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      data: {
        userId: app.globalData.userInfo.userId,
        page: '1',
        rows: 1,
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _total = res.data.data.total
          _total = utils.million(_total)
          that.setData({
            collectTotal: _total
          })
        }
      }
    })
    // 查询是否配置
    that.getPullUser();
    that.walletDetail()
  },
  walletDetail() {
    let _this = this;
    wx.request({
      url: this.data._build_url + 'account/getUserAccount',
      method: 'POST',
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let data = res.data.data;
          _this.setData({
            userAmount: data.userAmount ? data.userAmount.toFixed(2) : '0.00',
          });
        }

      },
      fail() {
        wx.stopPullDownRefresh();
      }
    });
  },
  getPullUser: function () {
    let that = this;
    wx.request({
      url: this.data._build_url + 'pullUser/get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.data) {
            let _userId = res.data.data.userId;
            let _picUrl = res.data.data.picUrl;
            that.setData({
              userId: _userId,
              picUrl: _picUrl
            })
          }
        }
      }
    })
  },
  againgetinfo: function () { //解密加密信息
    let that = this,
      _values = "",
      _parms = {};
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        that.updatauser(res.userInfo);

        let _sessionKey = app.globalData.userInfo.sessionKey,
          _ivData = res.iv,
          _encrypData = res.encryptedData;

        _sessionKey = _sessionKey.replace(/\=/g, "%3d");
        _ivData = _ivData.replace(/\=/g, "%3d");
        _ivData = _ivData.replace(/\+/g, "%2b");
        _encrypData = _encrypData.replace(/\=/g, "%3d");
        _encrypData = _encrypData.replace(/\+/g, "%2b");
        _encrypData = _encrypData.replace(/\//g, "%2f");

        wx.request({
          url: that.data._build_url + 'auth/phoneAES?sessionKey=' + _sessionKey + '&ivData=' + _ivData + '&encrypData=' + _encrypData,
          header: {
            'content-type': 'application/json' // 默认值
          },
          method: 'POST',
          success: function (resv) {
            if (resv.data.code == 0) {
              that.setData({
                istouqu: false
              })
              let _data = JSON.parse(resv.data.data);
              app.globalData.userInfo.unionId = _data.unionId;
            }
          }
        })
      }
    })
  },
  getbalance: function () { //查询余额
    let _userId = app.globalData.userInfo.userId;
    let _account = {
      userId: _userId
    }
    Api.accountBalance(_account).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data == null ? '0' : res.data.data;
        this.setData({
          accountBalance: _data
        })
      }
    })
  },
  bindGetUserInfo: function (e) {
    this.updatauser(e.detail.userInfo)
  },
  updatauser: function (data) { //更新用户信息
    let that = this,
      _values = "",
      _parms = {},
      url = "",
      _Url = "";
    _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
    };
    if (data.avatarUrl) {
      _parms.iconUrl = data.avatarUrl
    }
    if (data.nickName) {
      // _parms.nickName = data.nickName;
      _parms.nickName = utils.utf16toEntities(data.nickName);
    }
    if (data.gender) {
      _parms.sex = data.gender
    }
    for (var key in _parms) {
      _values += key + "=" + _parms[key] + "&";
    }
    _values = _values.substring(0, _values.length - 1);
    url = that.data._build_url + 'user/update?' + _values;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          app.globalData.userInfo.nickName = data.nickName;
          app.globalData.userInfo.iconUrl = data.avatarUrl;
          that.getuserInfo();
        }
      }
    })
  },
  getuserInfo: function () { //从微信服务器获取用户信息
    let that = this;
    wx.getUserInfo({
      success: res => {
        if (res.userInfo) {
          that.setData({
            iconUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName
          })
          let data = res.userInfo;
          delete data.city;
          for (let key in data) {
            for (let ind in app.globalData.userInfo) {
              if (key == ind) {
                app.globalData.userInfo[ind] = data[key]
              }
            }
          };
          // that.updatauser(res.userInfo)
        }
      },
      complete: res => {
        // this.wxgetsetting()
      }
    })
  },
  wxgetsetting: function () { //若用户之前没用授权其用户信息，则调整此函数请求用户授权
    let that = this
    if (app.globalData.userInfo.mobile) {
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户位置信息
            wx.showModal({
              title: '提示',
              content: '授权获得更多功能和体验',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.openSetting({ //打开授权设置界面
                    success: (res) => {
                      if (res.authSetting['scope.userLocation']) {
                        wx.getLocation({
                          type: 'wgs84',
                          success: function (res) {
                            let latitude = res.latitude,
                              longitude = res.longitude;
                            that.requestCityName(latitude, longitude);
                          }
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
    }
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    if (!lat && !lng) {
      this.wxgetsetting();
    } else {
      app.globalData.userInfo.lat = lat;
      app.globalData.userInfo.lng = lng;
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          if (res.data.status == 0) {
            let _city = res.data.result.address_component.city;
            if (_city.indexOf('十堰') != -1 || _city.indexOf('武汉') != -1 || _city.indexOf('黄冈') != -1 || _city.indexOf('襄阳') != -1) {
              app.globalData.userInfo.city = _city;
            } else {
              app.globalData.userInfo.city = '十堰市';
            }
            app.globalData.picker = res.data.result.address_component;
            let userInfo = app.globalData.userInfo;
            wx.setStorageSync('userInfo', userInfo);
            this.setData({
              city: _city,
              alltopics: [],
              restaurant: [],
              service: []
            })
          }
        }
      })
    }
  },
  calling: function () { //享7客户电话
    wx.makePhoneCall({
      phoneNumber: '02759728176',
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  enterEntrance: function (event) { //点击免费入驻
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      wx.navigateTo({
        url: '../../pages/index/download-app/download?isshop=ind',
      })
    }
  },

  DynamicState: function (e) {
    wx.navigateTo({
      url: 'allDynamicState/allDynamicState',
    })
  },
  submit: function (e) {
    let _formId = e.detail.formId;
    this.todiscount();
    Public.addFormIdCache(_formId);
  },
  todiscount: function () {
    wx.switchTab({
      url: '/pages/personal-center/my-discount/my-discount',
      success: function () { },
      fail: function () {
        wx.navigateTo({
          url: '/pages/personal-center/my-discount/my-discount'
        })
      }
    })
  },
  carefulness: function (e) { //订单
    let id = e.currentTarget.id;
    if (id == 10) {
      wx.navigateTo({
        url: 'personnel-order/personnel-order?toview=tuikuan&elephant=' + 4
      })
    } else {
      wx.navigateTo({
        url: 'personnel-order/personnel-order?elephant=' + id
      })
    }
  },
  infromation: function (event) { //收货地址
    wx.navigateTo({
      url: '../personal-center/shipping/shipping',
    })
  },

  remittance: function (event) { //兑换记录
    wx.navigateTo({
      url: '../personal-center/conversionHsy/conversionHsy',
    })
  },

  enshrineClick: function (event) { //收藏
    wx.navigateTo({
      url: 'enshrine/enshrine',
    })
  },
  personalCenter: function (event) { //关注
    wx.navigateTo({
      url: '../personal-center/livepage/livepage?likeType=1&userId=' + app.globalData.userInfo.userId
    })
  },
  personal: function (event) { //个人主页
    wx.navigateTo({
      url: '../activityDetails/homePage/homePage?iconUrl=' + this.data.iconUrl + '&userId=' + app.globalData.userInfo.userId,
    })
  },

  toWallet: function () {
    wx.navigateTo({
      url: 'wallet/wallet'
    })
  },

  // 我的砍价
  continuousAs: function () {
    wx.navigateTo({
      url: '../index/bargainirg-store/pastTense/pastTense',
    })
  },
  //礼品券
  handVoucher: function () {
    wx.navigateTo({
      url: '../personal-center/voucher/voucher',
    })
  },
  hiddenCall() { //隐藏电话弹窗
    this.setData({
      isShow: false
    });
  },
  contact() { //联系客服
    this.setData({
      isShow: !this.data.isShow
    });
  },
  VoucherCode: function () { //输入券码核销
    wx.navigateTo({
      url: '../personal-center/call-back/call-back?ent=ent&isshopuser=' + this.data.isshopuser + '&iszy=' + this.data.iszhiying
    })
  },
  scanAqrCode: function (e) { //扫一扫核销
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: "qrCode",
      success: (res) => {
        let qrCodeArr = res.result.split('/'),
          qrCode = qrCodeArr[qrCodeArr.length - 1];
        that.setData({
          qrdata: res,
          qrCode: qrCode
        })
        that.getCodeState();
      },
      fail: (res) => {
        wx.showToast({
          title: '扫码失败',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
      }
    });
  },
  //判断二维码是否可以跳转
  getCodeState: function () {
    let that = this, isHx = false, _sale = this.data.salepointId, mssage = "";
    wx.request({
      url: that.data.qrdata.result,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            soData: res.data.data
          })
          that.hxJurisdiction(res.data.data.id);
        } else {
          wx.showToast({
            title: res.data.message,
            mask: 'true',
            icon: 'none',
            duration: 3000
          })
        }
      }
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
          wx.navigateTo({
            url: '../personal-center/call-back/call-back?code=' + that.data.qrCode + '&discount=' + that.data.soData.discount + '&ByCode=' + that.data.qrdata.result + '&iszy=' + that.data.iszhiying + '&isshopuser=' + that.data.isshopuser + '&id=' + that.data.soData.id
          })
          // that.hxCouponV1(val);
        } else {
          wx.showToast({
            title: res.data.data.errorMessage,
            icon: 'none'
          })
        }
      }
    })
  },
  feedback: function (e) { //意见反馈
    wx.navigateTo({
      url: 'feedback/feedback'
    })
  },
  aboutMe: function (e) { //关于我们
    wx.navigateTo({
      url: 'aboutMe/aboutMe',
    })
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.redirectTo({
        url: '/pages/init/init?isback=1'
      })
    }
  },
  // 分享注册
  dividualLogin: function () {
    wx.navigateTo({
      url: '/pages/personal-center/sharepull-sdb/sharepull-sdb?picUrl=' + this.data.picUrl
    })
  },
  onPullDownRefresh:function(){
    this.onShow();
    setTimeout( ()=>{
      wx.stopPullDownRefresh();
    },1500)
  }
  // toAgent() {   //跳转至代理商
  //   wx.navigateTo({
  //     url: 'agent/agent'
  //   })
  // }
})