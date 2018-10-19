import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
import Api from '../../utils/config/api.js'
var utils = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    _build_url: GLOBAL_API_DOMAIN,
    nickName: '',
    iconUrl: '',
    isname: false,
    newname: '',
    qrCode: '',
    sumTotal: 0,
    collectTotal: 0,
    ismobile: true,
    istouqu: false,
    isshop: false,
    isshopuser:false, //是否是商家核销员
    iszhiying:false,//是否自营店核销员
    qrdata:{},
    issnap: false,
    userType: '',
    accountBalance: '',
    userId: '',
    picUrl: '',
  },
  onLoad: function() {
    let that = this;
    this.setData({
      userType: app.globalData.userInfo.userType
    })
    if (app.globalData.userInfo.mobile) {
      this.setData({
        ismobile: false
      })
    };

    this.getuserInfo();
  },
  onShow: function() {
    let that = this;
    if (app.globalData.userInfo.shopId && app.globalData.userInfo.userType == 2) {
      this.setData({
        isshop: true,
        isshopuser:true
      })
    } 
    let _parms = {
      // userId: app.globalData.userInfo.userId,
      token: app.globalData.token
    }
    Api.getSalePointUserByUserId(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data && res.data.data.length>0) {
          that.setData({
            isshop: true,
            iszhiying: true
          })
        }
      }
    })
    if (!app.globalData.userInfo.unionId) {
      wx.login({
        success: res => {
          if (res.code) {
            let _parms = {
              code: res.code,
              token: app.globalData.token
            }
            Api.getOpenId(_parms).then((res) => {
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
            })
          }
        }
      })
    } else {
      that.setData({
        istouqu: false
      })
    }
    if (!app.globalData.userInfo.nickName && !app.globalData.userInfo.mobile) {
      this.setData({
        istouqu: true
      })
    }

    if (app.globalData.userInfo.mobile) {
      // this.getbalance();
      this.setData({
        ismobile: false
      })
    }
    let _nickName = ''
    _nickName = app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : app.globalData.userInfo.userName;
    let reg = /^1[34578][0-9]{9}$/;
    if (reg.test(_nickName)) {
      _nickName = _nickName.substr(0, 3) + "****" + _nickName.substr(7);
    }
    this.setData({
      iconUrl: app.globalData.userInfo.iconUrl,
      nickName: _nickName
    })

    wx.request({
      url: that.data._build_url + 'topic/myList',
      method: 'GET',
      data: {
        userId: app.globalData.userInfo.userId,
        page: '1',
        rows: 1,
      },
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let _total = res.data.data.total;
        _total = utils.million(_total);
        if (app.globalData.isflag) {
          that.setData({
            sumTotal: _total
          })
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
      success: function(res) {
        let _total = res.data.data.total
        _total = utils.million(_total)
        that.setData({
          collectTotal: _total
        })
      }
    })
    // 查询是否配置
    this.getPullUser();
  },
  getPullUser: function() {
    let that = this;
    wx.request({
      url: this.data._build_url + 'pullUser/get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
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
  againgetinfo: function() {
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        that.updatauser(res.userInfo);
        let _pars = {
          sessionKey: app.globalData.userInfo.sessionKey,
          ivData: res.iv,
          encrypData: res.encryptedData
        }
        Api.phoneAES(_pars).then((resv) => {
          if (resv.data.code == 0) {
            that.setData({
              istouqu: false
            })
            let _data = JSON.parse(resv.data.data);
            app.globalData.userInfo.unionId = _data.unionId;
          }
        })
      }
    })
  },
  getbalance: function() { //查询余额
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
  bindGetUserInfo: function(e) {
    this.updatauser(e.detail.userInfo)
  },
  updatauser: function(data) { //更新用户信息
    let that = this, _values = "", _parms={};
    _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId,
      token: app.globalData.token
    };
    if (data.avatarUrl) {
      _parms.iconUrl = data.avatarUrl
    }
    if (data.nickName) {
      _parms.nickName = data.nickName
    }
    if (data.gender) {
      _parms.sex = data.gender
    }
    for (var key in _parms) {
      _values += key + "=" + _parms[key] + "&";
    }
    _values = _values.substring(0, _values.length - 1);
    wx.request({
      url: that.data._build_url + 'user/update?' + _values,
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
    return;
    Api.updateuser(_parms).then((res) => {
      if (res.data.code == 0) {
        app.globalData.userInfo.nickName = data.nickName;
        app.globalData.userInfo.iconUrl = data.avatarUrl;
        that.getuserInfo();
      }
    })
  },
  getuserInfo: function() { //从微信服务器获取用户信息
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
        this.wxgetsetting()
      }
    })
  },
  wxgetsetting: function() { //若用户之前没用授权其用户信息，则调整此函数请求用户授权
    let that = this
    if (!app.globalData.userInfo.mobile) {
      return false
    }
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户位置信息
          wx.showModal({
            title: '提示',
            content: '授权获得更多功能和体验',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                wx.openSetting({ //打开授权设置界面
                  success: (res) => {
                    if (res.authSetting['scope.userLocation']) {
                      wx.getLocation({
                        type: 'wgs84',
                        success: function(res) {
                          let latitude = res.latitude,
                            longitude = res.longitude;
                          that.requestCityName(latitude, longitude);
                        }
                      })
                    } else {
                      let latitude = '30.51597',
                        longitude = '114.34035';
                      that.requestCityName(latitude, longitude);
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    if (!lat && !lng) {
      this.wxgetsetting();
      return;
    }
    app.globalData.userInfo.lat = lat
    app.globalData.userInfo.lng = lng
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0) {
          let _city = res.data.result.address_component.city;
          app.globalData.userInfo.city = _city;
          this.setData({
            city: _city,
            alltopics: [],
            restaurant: [],
            service: []
          })
          // app.globalData.userInfo.city = res.data.result.address_component.city
        }
      }
    })
  },
  calling: function() { //享7客户电话
    wx.makePhoneCall({
      phoneNumber: '02759728176',
      success: function() {
        console.log("拨打电话成功！")
      },
      fail: function() {
        console.log("拨打电话失败！")
      }
    })
  },
  enterEntrance: function(event) { //点击免费入驻
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    } else {
      wx.navigateTo({
        url: '../../pages/index/download-app/download?isshop=ind',
      })
    }

  },
  DynamicState: function(e) {
    wx.navigateTo({
      url: 'allDynamicState/allDynamicState',
    })
  },
  myTickets: function(event) {
    wx.navigateTo({
      url: 'my-discount/my-discount',
    })
  },
  carefulness: function(event) { //订单
    wx.navigateTo({
      url: 'personnel-order/personnel-order',
    })
  },
  infromation: function(event) { //收货地址
    wx.navigateTo({
      url: '../personal-center/shipping/shipping',
    })
  },

  remittance: function(event) { //兑换记录
    wx.navigateTo({
      url: '../personal-center/conversionHsy/conversionHsy',
    })
  },

  enshrineClick: function(event) { //收藏
    wx.navigateTo({
      url: 'enshrine/enshrine',
    })
  },
  personalCenter: function(event) { //关注
    wx.navigateTo({
      url: '../personal-center/livepage/livepage?likeType=1&userId=' + app.globalData.userInfo.userId
    })
  },
  personal: function(event) { //个人主页
    wx.navigateTo({
      url: '../activityDetails/homePage/homePage?iconUrl=' + this.data.iconUrl + '&userId=' + app.globalData.userInfo.userId,
    })
  },
  // myMineMoney: function () { //钱包明细
  //   wx.navigateTo({
  //     url: 'myWallet/myWallet?sumTotal=' + this.data.accountBalance.data
  //   })
  // },
  myMineMoney: function() {
    wx.navigateTo({
      url: 'integratorMs/integratorMs'
    })
  },
  // 我的砍价
  continuousAs: function() {
    wx.navigateTo({
      url: '../index/bargainirg-store/pastTense/pastTense',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //礼品券
  handVoucher: function() {
    wx.navigateTo({
      url: '../personal-center/voucher/voucher',
    })
  },
  VoucherCode: function() { //输入券码核销
    // isshopuser iszhiying
    wx.navigateTo({
      url: '../personal-center/call-back/call-back?ent=ent&isshopuser=' + this.data.isshopuser+'&iszy='+this.data.iszhiying
    })
  },
  scanAqrCode: function(e) { //扫一扫核销
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: "qrCode",
      success: (res) => {
        let qrCodeArr = res.result.split('/');
        let qrCode = qrCodeArr[qrCodeArr.length - 1];
        that.setData({
          qrdata:res,
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
  registered: function() { //用户注册
    wx.navigateTo({
      url: '../personal-center/registered/registered'
    })
  },
  //判断二维码是否可以跳转
  getCodeState: function() {
    let that = this;
    wx.request({
      url: that.data.qrdata.result,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          let data = res.data;
          if (data.data.orderCode) {
            if (that.data.isshopuser && !that.data.iszhiying){
              wx.showToast({
                title: '你不是自营店核销员，无法核销该订单',
                icon: 'none',
                duration: 4000
              })
              return;
            }
            if (data.data.status == 2) {
              that.setData({
                iszhiying: true
              })
            } else {
              wx.showToast({
                title: '此券已被使用，不可再使用',
                icon: 'none',
                duration: 4000
              })
              return;
            }
          }else{
            if (that.data.isshopuser && that.data.iszhiying){

            }else  if (that.data.iszhiying && !that.data.isshopuser){
              wx.showToast({
                title: '你不是该商家销员，无法核销该订单',
                icon: 'none',
                duration: 4000
              })
              return;
            }
          }
          if (data.skuName){
            let Cts = "现金",
              Dis = '折扣';
            if (data.data.skuName.indexOf(Cts) > 0) {
              data.data.discount = false
            }
            if (data.data.skuName.indexOf(Dis) > 0) {
              data.data.discount = true
            }
          }
          let current = data.currentTime, isDue = that.isDueFunc(current, data.data.expiryDate);
          if ((data.data.type == 4 || data.data.type == 5 || data.data.type == 3) && data.data.shopId != app.globalData.userInfo.shopId) {
            wx.showToast({
              title: '该菜不属于本店',
              icon: 'none'
            })
            return false;
          }
          if (data.data.isUsed == 1) {
            wx.showToast({
              title: '该票券已被使用',
              icon: 'none',
              mask: 'true',
              duration: 2000,
            })
          } else if (isDue == 1) {
            wx.showToast({
              title: '该票券已过期',
              icon: 'none',
              mmask: 'true',
              duration: 2000,
            })
          } else if (data.data.discount) {
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
              } else {
                wx.navigateTo({
                  url: '../personal-center/call-back/call-back?code=' + that.data.qrCode + '&type=' + data.data.type+ '&ByCode='+that.data.qrdata.result
                })
              }
            })
          } else {
            wx.navigateTo({
              url: '../personal-center/call-back/call-back?code=' + that.data.qrCode + '&discount=' + data.data.discount + '&ByCode=' + that.data.qrdata.result
            })
          }
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
  isDueFunc: function(current, expiryDate) { //对比时间是否过期
    let isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < current) {
      isDue = 1;
    }
    return isDue;
  },
  aboutMe: function(e) { //关于我们
    wx.navigateTo({
      url: 'aboutMe/aboutMe',
    })
  },
  closetel: function(e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.redirectTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },

  // 分享注册
  dividualLogin: function() {
    wx.navigateTo({
      url: '/pages/personal-center/sharepull-sdb/sharepull-sdb?picUrl=' + this.data.picUrl
    })
  }
})