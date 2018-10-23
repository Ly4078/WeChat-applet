import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isgetnumber: true,
    sessionkey: '',
    phone: '',
    Verify: '',
    verifitime: '',
    clock: ''
  },
  onLoad: function(options) {
    this.findByCode()
  },
  findByCode: function () { //通过code查询用户信息
    wx.login({
      success: res => {
        let _code = res.code,that = this;
        // console.log("code:", _code)
        // return false  //此处返回，获取的code是没有用过的，用于测试
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.findByCode(_parms).then((res) => {
            if (res.data.code == 0) {
              let _data = res.data.data;
              if (_data.id && _data != null) {
                for (let key in _data) {
                  for (let ind in app.globalData.userInfo) {
                    if (key == ind) {
                      app.globalData.userInfo[ind] = _data[key]
                    }
                  }
                };
                app.globalData.userInfo.userId = _data.id;
                that.authlogin();
                
                // this.getuser()
              }
            }
          })
        }
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          if (app.globalData.userInfo.mobile) {
            wx.switchTab({
              url: '../../index/index',
            })
          }
          // that.getuserIdLater2();
          // that.getdatamore();
        }
        console.log(app.globalData)
      }
    })
  },
  getuser: function() { //从自己的服务器获取用户信息
    let that = this
    wx.request({
      url: this.data._build_url + 'user/get/' + app.globalData.userInfo.userId,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.code == 0) {
          let data = res.data.data;
          for (let key in data) {
            for (let ind in app.globalData.userInfo) {
              if (key == ind) {
                app.globalData.userInfo[ind] = data[key]
              }
            }
          };
          if (data.mobile == '' || data.mobile == null) {} else {
            wx.switchTab({
              url: '../../index/index',
            })
            return false
          }
        }
      }
    })
  },
  getPhoneNumber: function(e) { //获取用户授权的电话号码
    let _detail = e.detail
    let that = this
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            if (res.data.code == 0) {
              let _sessionKey = app.globalData.userInfo.sessionKey,
                _ivData = res.iv, _encrypData = res.encryptedData;
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
                    let _data = JSON.parse(resv.data.data)
                    that.setData({
                      phone: _data.phoneNumber
                    })
                  }
                }
              })
            }
          })
        }
      }
    })


    this.getphone(_detail)
  },
  getphone: function(msg) { //获取用户电话号码
    this.setData({
      isgetnumber: false
    })
    let that = this
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code,
            token: app.globalData.token
          }
          Api.getOpenId(_parms).then((res) => {
            if (res.data.code == 0) {
              let _sessionKey = app.globalData.userInfo.sessionKey,
                _ivData = res.iv, _encrypData = res.encryptedData;
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
                    let _data = JSON.parse(resv.data.data)
                    that.setData({
                      phone: _data.phoneNumber
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  bindblur: function(e) { //输入框失去焦点  获取输入框内容
    let _phone = e.detail.value
    if (/^1[1234567890]\d{9}$/.test(_phone)) {
      this.setData({
        phone: _phone
      })
    } else {
      wx.showToast({
        title: '电话号码有误，请重新输入',
        icon: 'none',
        mask: true,
        duration: 1500
      })
    }
  },
  getverification: function() { //获取验证码
    // return false   //暂时不用手机短信验证，
    let that = this
    if (this.data.phone) {
      let _parms = {
        shopMobile: this.data.phone,
        // userId: app.globalData.userInfo.userId,
        // userName: app.globalData.userInfo.userName,
        token: app.globalData.token
      }
      Api.sendForRegister(_parms).then((res) => {
        if (res.data.code == 0) {
          let _time = res.data.data.veridyTime
          let time = new Date(_time.replace("-", "/"));
          time.setMinutes(time.getMinutes() + 10, time.getSeconds(), 0);
          that.setData({
            verifitime: time
          })
          let nowtime = new Date();
          let setIn = setInterval(function() {
            var leftTime = (new Date(that.data.verifitime) - new Date()); //计算剩余的毫秒数
            var minutes = parseInt(leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟 
            var seconds = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数 
            that.setData({
              clock: minutes + "分" + seconds + "秒"
            })
            if (minutes == '00' && seconds == '00') {
              clearInterval(setIn);
            }
          }, 1000)
        }
      })
    }
  },
  smsbindblur: function(e) { //获取验证码框内容
    this.setData({
      Verify: e.detail.value
    })
  },
  login: function() { //点击立即注册
    let that = this
    if (this.data.phone == '') {
      wx.showToast({
        title: '请输入电话号码',
        mask: true,
        icon: 'none',
        duration: 1500
      })
      return false
    }
    if (this.data.Verify) {
      let _parms = {
        shopMobile: this.data.phone,
        // userId: app.globalData.userInfo.userId,
        // userName: app.globalData.userInfo.userName,
        smsContent: this.data.Verify,
        token: app.globalData.token
      },that = this;
      Api.isVerify(_parms).then((res) => {
        if (res.data.code == 0) {
          app.globalData.userInfo.mobile = that.data.phone;
          wx.showToast({
            title: '注册成功!',
            icon: 'none',
            mask: true,
            duration: 2000
          })
          that.setData({
            clock: ''
          })
          that.authlogin();//重新去获取token
          // wx.switchTab({
          //   url: '../../index/index',
          // })
        } else {
          wx.showToast({
            title: '验证码错误，请重新输入!',
            icon: 'none',
            mask: true,
            duration: 2000
          })
          that.setData({
            clock: '',
            Verify: ''
          })
        }
      })
    } else {
      wx.showToast({
        title: '请输入验证码',
        mask: true,
        icon: 'none',
        duration: 1500
      })
    }
  }
})