import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    _build_url: GLOBAL_API_DOMAIN,
    verify: '', //输入的验证码
    verifyId: '',//后台返回的短信验证码
    veridyTime: '',//短信发送时间
    settime: '',
    rematime: '获取验证码',
    isclick: true,
    goto: false,
    isyaz:false,
    fist:1
  },
  onShow:function(){
    // console.log(app.globalData.userInfo)
  },
  numbindinput: function (e) {  //监听号码输入框
    let _value = e.detail.value
    if (_value) {
      this.setData({
        isclose: true,
        phone: _value
      })
    } else {
      this.setData({
        isclose: false,
        phone: _value
      })
    }
  },
  closephone: function () {  //手机号置空
    clearTimeout(this.data.settime)
    this.setData({
      phone: '',
      rematime: '获取验证码',
      isclick: true
    })
  },
  submitphone: function () {  //获取验证码
    let that = this
    if (!this.data.phone) {
      wx.showToast({
        title: '请先输入手机号',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    }
    if (!this.data.isclick) {
      return false
    }
    if(this.data.goto){
      return false
    }
    that.setData({
      goto:true
    })
    let RegExp = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (RegExp.test(this.data.phone)) {
      if (this.data.settime) {
        clearTimeout(that.data.settime)
      }
      let _parms = {
        shopMobile: that.data.phone,
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName
      }
      Api.sendForRegister(_parms).then((res) => {
        if (res.data.code == 0) {
          that.setData({
            verifyId: res.data.data.verifyId,
            veridyTime: res.data.data.veridyTime
          })
          let sett = setInterval(function () {
            that.remaining();
          }, 1000)
          that.setData({
            settime: sett,
            isclick: false
          })
        }
      })
    } else {
      wx.showToast({
        title: '电话号码输入有误，请重新输入',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      this.setData({
        isclose: false,
        phone: ''
      })
    }
  },

  yzmbindblur: function (e) {  //实时监听获取输入的验证码
    let _value = e.detail.value
    this.setData({
      verify: _value
    })
  },
  remaining: function () {  //倒计时
    let rema = utils.reciprocal(this.data.veridyTime)
    if (rema == 'no' || rema == 'yes') {
      clearTimeout(this.data.settime)
      this.setData({
        rematime: '获取验证码',
        isclick: true
      })
      wx.removeStorage({
        key: 'phone',
        success: function (res) {
          // console.log(res.data)
        }
      })
      wx.removeStorage({
        key: 'veridyTime',
        success: function (res) {
          // console.log(res.data)
        }
      })
    } else {
      this.setData({
        rematime: rema
      })
    }
  },
  closebut: function () {  //取消
    wx.switchTab({
      url: '../personal-center'
    })
  },
  submitverify: function () {  //确定
  
    let that = this
    if (this.data.isyaz){
      return false
    }
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入电话号码，获取验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
    } else if (!this.data.verify) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
    } else {
      if (!this.data.isyaz) {
        that.setData({
          isyaz:true
        })
      }
      if (this.data.verify == this.data.verifyId) {
        wx.showToast({
          title: '验证中',
          icon: 'loading',
          duration: 2000
        })
        let _parms = {
          shopMobile: this.data.phone,
          SmsContent: this.data.verify,
          userId: app.globalData.userInfo.userId,
          userName: app.globalData.userInfo.userName
        }
        Api.isVerify(_parms).then((res) => {
          if (res.data.code == 0) {
            app.globalData.userInfo.userId = res.data.data;
            
            wx.request({  //从自己的服务器获取用户信息
              url: this.data._build_url + 'user/get/' + res.data.data,
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                if (res.data.code == 0) {
                  let data = res.data.data;
                  let users = app.globalData.userInfo
                  for (let key in data) {
                    for (let ind in users) {
                      if (key == ind) {
                        users[ind] = data[key]
                      }
                    }
                  }
                  app.globalData.userInfo = users;
                  wx.switchTab({
                    url: '../personal-center'
                  })
                }
              }
            })
          }
        })
      } else {
        wx.showToast({
          title: '验证码输入有误，请重新输入',
          icon: 'none',
          mask: 'true',
          duration: 2000
        })
      }
    }
  },
  getPhoneNumber: function (e) { //获取用户授权的电话号码
    let that = this
    let msg = e.detail
    if (!e.detail.iv) { //拒绝授权
      return false
    }
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            app.globalData.userInfo.openId = res.data.data.openId
            app.globalData.userInfo.sessionKey = res.data.data.sessionKey
            if (res.data.code == 0) {
              let _pars = {
                sessionKey: res.data.data.sessionKey,
                ivData: msg.iv,
                encrypData: msg.encryptedData
              }
              Api.phoneAES(_pars).then((res) => {
                if (res.data.code == 0) {
                  let _data = JSON.parse(res.data.data)
                  this.setData({
                    phone: _data.phoneNumber
                  })
                  // this.submitphone();
                }
              })
            }
          })
        }
      }
    })
  }
})