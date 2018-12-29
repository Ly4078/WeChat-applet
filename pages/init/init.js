// pages/init/init.js
import Api from '/../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
var utils = require('../../utils/util.js')
let app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    getPhone: false,
    isgetCode: false,
    isBack: false,
    timer: null
  },
  onLoad: function(options) {
    let that = this;
    if (options.isback ) {
      console.log('options.isback', options)
      this.setData({
        isBack: true
      })
    }
    var _parms = app.globalData.currentScene.query,
      _values = '',
      valus = '';
    for (var key in _parms) {
      _values += key + "=" + _parms[key] + "&";
    }
    valus = _values.substring(0, _values.length - 1);
    var path = '/' + app.globalData.currentScene.path + (valus ? '?' : '') + valus
    if (app.globalData.currentScene.path == 'pages/init/init') {
      path = '';
    }
    // if (app.globalData.currentScene.query == '') {
    //   path = '';
    // }
    console.log('path',path)
    that.setData({
      navigetToUrl: path
    })
    console.log('url')
    console.log(path)
    console.log('url')
    that.findByCode();
    // that.checksession();
    that.timer = setInterval(function() { //sessionkey五分钟失效,再次获取
      that.wxLogin();
    }, 290000)
    setTimeout(function(){
      if (!that.data.isgetCode){
        wx.showToast({
          title: '网络连接失败，请重新进入',
          icon:'none',
          duration:5000
        })
      }
    },3000)
  },
  findByCode: function() {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            wx.setStorageSync('userInfo', res.data.data)
            app.globalData.userInfo = res.data.data;
            app.globalData.userInfo.userId = res.data.data.id;
            var mobile = String(res.data.data.mobile);
            if (mobile.length >= 11 && res.data.data.unionId && res.data.data.id && res.data.data.userName) {
              var wechatUserInfo = {};
              wechatUserInfo.userInfo = {};
              wechatUserInfo.userInfo.nickName = res.data.data.nickName;
              wechatUserInfo.userInfo.avatarUrl = res.data.data.iconUrl;
              wechatUserInfo.userInfo.gender = res.data.data.sex;
              that.setData({
                wechatUserInfo: wechatUserInfo,
                isgetCode:true
              }, () => {
                wx.showLoading({
                  title: '自动登录中...',
                  mask:true
                })
                that.authlogin(res.data.data.userName)
              })

            } else {
              that.wxLogin();
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  checksession: function() {
    let that = this;
    wx.checkSession({
      success: res => {
        const userinfo = wx.getStorageSync('userInfo');
        var mobile = String(userinfo.mobile);
        if (mobile.length >= 11) {
          app.globalData.currentScene.query == ''
          
          wx.reLaunch({ //以拥有手机号码直接跳转
            url: that.data.navigetToUrl ? that.data.navigetToUrl : '/pages/index/index',
            success:function(){

            },fail:function(){
              wx.navigateTo({
                url: that.data.navigetToUrl ? that.data.navigetToUrl : '/pages/index/index',
                success:function(){

                },fail:function(){
                  wx.switchTab({
                    url: that.data.navigetToUrl ? that.data.navigetToUrl : '/pages/index/index',
                  })
                }
              })
            }

          })
        } else {
          this.wxLogin()
        }
      },
      fail: res => {
        this.wxLogin()
      }
    })
  },
  wxLogin: function() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.login({
      success: res => {
        if (res.code) {
          wx.request({
            url: that.data._build_url + 'auth/getOpenId?code=' + res.code,
            method: 'POST',
            success: function(res) {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.setData({
                  isgetCode: true,
                  loginData: res.data.data
                })
                app.globalData.sessionKey = res.data.data.sessionKey
              } else {
                that.wxLogin();
              }
            },
            fail: function() {
              that.wxLogin();
            }
          })
        }
      }
    })
  },
  bindgetuserinfo: function(e) {
    let isPhoneLogin = e.currentTarget.dataset.types ? true : false
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        let sessionKey = that.data.loginData.sessionKey;
        app.globalData.sessionKey = sessionKey;
        app.globalData.loginData = res;
        if (isPhoneLogin) {
          var isisBack = that.data.isBack ? '1' : '0'
          wx.navigateTo({
            url: 'phone/phone?isback=' + isisBack,
          })
          // wx.navigateTo({
          //   url: 'phone/phone?isback=' + that.data.isBack?'1':'0',
          // })
          return
        }
        wx.showLoading({
          title: '加载中...',
        })
        that.createNewUser(sessionKey, res.iv, res.encryptedData);
        that.setData({
          wechatUserInfo: res
        })
      }
    })
  },
  createNewUser: function(sessionKey, ivData, encrypData) {
    let that = this;
    wx.request({
      url: that.data._build_url + 'auth/addUserUnionIdAndPhoneAES?sessionKey=' + sessionKey.replace(/\+/g, "%2b").replace(/\=/g, "%3d") + '&encrypData=' + encrypData.replace(/\+/g, "%2b").replace(/\=/g, "%3d") + '&ivData=' + ivData.replace(/\+/g, "%2b").replace(/\=/g, "%3d"),
      method: 'POST',
      success: function(res) {
        if (res.data.data != null) {
          if (res.data.data.userName) {
            wx.setStorageSync('userInfo', res.data.data)
            app.globalData.userInfo = res.data.data;
            app.globalData.userInfo.userId = res.data.data.id;
            that.authlogin(res.data.data.userName)
          }
        }else{
          wx.hideLoading();
          wx.showToast({
            title: '系统异常，请重新登录',
            icon:'none'
          });
          that.wxLogin();
        }
      }
    })
  },
  authlogin: function(userName) { //获取token
    let that = this;
    wx.request({
      url: that.data._build_url + 'auth/login?userName=' + userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' //默认值
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          let userInfo = wx.getStorageSync("userInfo")
          userInfo.token = _token;
          wx.setStorageSync('token', _token)
          wx.setStorageSync('userInfo', userInfo);
          var mobile = String(userInfo.mobile);
          if (mobile.length >= 11) {
            that.updatauser(that.data.wechatUserInfo);
          } else {
            that.setData({
              getPhone: true
            })
            wx.hideLoading()
            return;
          }
        }
      }
    })
  },
  updatauser: function(data) { //更新用户信息
    let that = this,
      _values = "",
      _parms = {},
      url = "",
      _Url = "";
    _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
    };
    if (data.userInfo.avatarUrl) {
      _parms.iconUrl = data.userInfo.avatarUrl
    }
    if (data.userInfo.nickName) {
      _parms.nickName = utils.utf16toEntities(data.userInfo.nickName);
    }
    if (data.userInfo.gender) {
      _parms.sex = data.userInfo.gender
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
      success: function(res) {
        if (res.data.code == 0) {
          wx.hideLoading()
          let userInfo = wx.getStorageSync("userInfo")
          userInfo.nickName = data.userInfo.nickName;
          userInfo.iconUrl = data.userInfo.avatarUrl
          wx.setStorageSync("userInfo", userInfo)
          app.globalData.userInfo.nickName = data.userInfo.nickName;
          app.globalData.userInfo.iconUrl = data.userInfo.avatarUrl;
          app.globalData.currentScene.query == '';
          app.globalData.newcomer = 1;
          if (that.data.isBack) {
            wx.navigateBack({
              delta: 1
            })
          } else {
            // console.log("navigetToUrl:", that.datat.navigetToUrl)
            wx.reLaunch({ //以拥有手机号码直接跳转
              url: that.data.navigetToUrl? that.data.navigetToUrl: '/pages/index/index',
            })
          }
        }
      }
    })
  },
  bindgetphonenumber: function(e) { //拉取微信手机号码
    let that = this;
    this.setData({
      getPhone: false
    });
    let sessionKey = this.data.loginData.sessionKey;
    wx.showLoading({
      title: '加载中...',
    })
    if (!e.detail.encryptedData || !e.detail.iv) {
      wx.hideLoading();
    } else {
      that.AES(e.detail.encryptedData, e.detail.iv) //解析加密信息
    }

  },
  AES: function(encryptedData, iv) {
    let that = this;
    let sessionKey = that.data.loginData.sessionKey
    wx.request({
      url: that.data._build_url + 'auth/phoneAES?sessionKey=' + sessionKey.replace(/\+/g, "%2b").replace(/\=/g, "%3d") + '&encrypData=' + encryptedData.replace(/\+/g, "%2b").replace(/\=/g, "%3d") + '&ivData=' + iv.replace(/\+/g, "%2b").replace(/\=/g, "%3d"),
      method: 'POST',
      success: function(res) {
        var data = JSON.parse(res.data.data);
        if (data.purePhoneNumber && data.purePhoneNumber.length >= 11) {
          that.BindwechatPhone(data.purePhoneNumber)
        } else {
          wx.hideLoading()
          var isisBack = that.data.isBack ? '1' : '0'
          wx.navigateTo({
            url: 'phone/phone?types=2&isback=' + isisBack,
          })
        }
      }
    })
  },
  BindwechatPhone: function(phone) {
    let that = this;
    wx.request({
      url: that.data._build_url + 'sms/isVerifyForUpdateUser?shopMobile=' + phone,
      method: "GET",
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.data) {
          if (res.data.data.userName) {
            wx.setStorageSync('userInfo', res.data.data)
            app.globalData.userInfo = res.data.data;
            app.globalData.userInfo.userId = res.data.data.id;
            that.authlogin(res.data.data.userName)
          }
        }
      }
    })
  },
  onUnload: function() {
    let that = this;
    clearInterval(that.timer)
  },
  showProtocol: function() {
    wx.navigateTo({
      url: 'Agreement/Agreement',
    })
  },
  hideThis: function() {
    this.setData({
      getPhone: false
    })
  }
})