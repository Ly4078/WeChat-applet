// pages/init/phone/phone.js
import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
import Public from '../../../utils/public.js';
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    second: 60,
    isBack: false,
    text: '获取验证码'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _parms = app.globalData.currentScene.query,
      _values = '',
      valus = '',
      that = this;
    for (var key in _parms) {
      _values += key + "=" + _parms[key] + "&";
    }
    valus = _values.substring(0, _values.length - 1);
    var path = '/' + app.globalData.currentScene.path + (valus ? '?' : '') + valus
    if (app.globalData.currentScene.path == 'pages/init/init') {
      path = '';
    }
    if (app.globalData.currentScene.query == '') {
      path = '';
    }
    this.setData({
      navigetToUrl: path,
      isBack: options.isback == '1' ? true : false
    })
    let loginData = app.globalData.loginData;
    let sessionKey = app.globalData.sessionKey;
    if (options.types == 2) { //用户点击微信一键登录，但是没有获取到微信手机号码
      return
    } else {
      that.createNewUser(sessionKey, loginData.iv, loginData.encryptedData, 1)
    }

  },
  createNewUser: function(sessionKey, ivData, encrypData, types) {
    let that = this;
    wx.request({
      url: that.data._build_url + 'auth/addUserUnionIdAndPhoneAES?sessionKey=' + sessionKey.replace(/\+/g, "%2b").replace(/\=/g, "%3d") + '&encrypData=' + encrypData.replace(/\+/g, "%2b").replace(/\=/g, "%3d") + '&ivData=' + ivData.replace(/\+/g, "%2b").replace(/\=/g, "%3d"),
      method: 'POST',
      success: function(res) {
        if (res.data.data) {
          if (res.data.data.userName) {
            wx.setStorageSync('userInfo', res.data.data)
            app.globalData.userInfo = res.data.data;
            app.globalData.userInfo.userId = res.data.data.id;
            that.authlogin(res.data.data.userName, types)
          }

        }
      }
    })
  },
  authlogin: function(userName, types) { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + userName,
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
          if (mobile.length >= 11 && types == '1') {
            wx.showModal({
              title: '提示',
              content: '您已经绑定过手机号码!',
              showCancel: false,
              success: function(res) {
                if (res.confirm) {
                  that.updatauser(app.globalData.loginData.userInfo)
                } else if (res.cancel) {

                }

              }

            })
          }
          if (types == 2) {
            that.updatauser(app.globalData.loginData.userInfo)
          }
          // if (types == 3) {
          //   that.isVerity();
          // }
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
    if (data.avatarUrl) {
      _parms.iconUrl = data.avatarUrl
    }
    if (data.nickName) {
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
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let userInfo = wx.getStorageSync("userInfo")
          userInfo.nickName = data.nickName;
          userInfo.iconUrl = data.avatarUrl
          wx.setStorageSync("userInfo", userInfo)
          app.globalData.userInfo.nickName = data.nickName;
          app.globalData.userInfo.iconUrl = data.avatarUrl;
          app.globalData.currentScene.query == ''
          app.globalData.newcomer = 1
          if (that.data.isBack) {
            wx.navigateBack({
              delta: 2
            })
          } else {
            
            wx.reLaunch({ //以拥有手机号码直接跳转
              url: that.data.navigetToUrl ? that.data.navigetToUrl : '/pages/index/index',
              success: function () {

              }, fail: function () {
                wx.navigateTo({
                  url: that.data.navigetToUrl ? that.data.navigetToUrl : '/pages/index/index',
                  success: function () {

                  }, fail: function () {
                    wx.switchTab({
                      url: that.data.navigetToUrl ? that.data.navigetToUrl : '/pages/index/index',
                    })
                  }
                })
              }

            })
          }
        }
      }
    })
  },

  sendCode: function() {
    let that = this;
    let phone = this.data.phoneNumber;
    let second = that.data.second;
    let vaild_rule  = /^[1][3456789][0-9]{9}$/;;
    if (!vaild_rule.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: "none"
      })
      return false;
    }
    if (second == 60) {
      wx.showLoading({
        title: '发送短信中...',
      })
      that.sendSMS();
    }
  },
  sendSMS: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'sms/sendForRegister?shopMobile=' + that.data.phoneNumber,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        if (res.data.code == 0) {
          that.timeRuning();
          wx.hideLoading();
          wx.showToast({
            title: '发送成功',
            icon: "none"
          })
          that.setData({
            verifyId: res.data.data.verifyId,
            veridyTime: res.data.data.veridyTime
          })

        }
      },
      fail: function() {
        wx.hideLoading();
        that.timeRuning();
        wx.showToast({
          title: '发送失败，请稍后重新发送',
        })
      }
    })
  },
  isVerity: function(e) {
    let that = this,
      _formId = e.detail.formId,
      phone = this.data.phoneNumber,
      _parms = {};
    let vaild_rule = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/;
    if (!vaild_rule.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: "none"
      })
      return false;
    }
    if (that.data.code.length < 4) {
      wx.showToast({
        title: '请输入验证码',
        icon: "none"
      })
      return false;
    }
    _parms = {
      shopMobile: phone,
      SmsContent: that.data.code,
      // userId: app.globalData.userInfo.userId,
      token: app.globalData.token
    }
    wx.showLoading({
      title: '登录中...',
    })
    Api.isVerify(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.setStorageSync('userInfo', res.data.data)
        app.globalData.userInfo = res.data.data;
        app.globalData.userInfo.userId = res.data.data.id;
        that.authlogin(res.data.data.userName, 2)
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '验证码错误',
          icon: 'none'
        })
        let loginData = app.globalData.loginData;
        let sessionKey = app.globalData.sessionKey;
        that.createNewUser(sessionKey, loginData.iv, loginData.encryptedData, 3)
      }
    })
    Public.addFormIdCache(_formId);
  },
  timeRuning: function() {
    let that = this;
    var timer = setInterval(function() {
      var second = that.data.second;
      if (second == 1) {

        that.setData({
          text: '获取验证码',
          second: 60,
          phoneLength: true
        })
        clearInterval(timer)
        return
      }
      second--
      that.setData({
        text: second + '秒后重新发送',
        phoneLength: false,
        second: second
      })
    }, 1000)
  },
  getPhone: function(e) {
    let phone = e.detail.value;
    this.setData({
      phoneNumber: phone,
      phoneLength: phone.length == 11 ? true : false
    })
  },
  getCode: function(e) {
    let code = e.detail.value;
    this.setData({
      code: code,
    })
  },
  sendMessage: function() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})