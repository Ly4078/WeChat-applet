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
    verify: '', //输入的验证码
    verifyId: '',//后台返回的短信验证码
    veridyTime: '',//短信发送时间
  },
  srbindblur: function (e) { //输入电话框失焦时获取输入的电话号码 
    let _value = e.detail.value
    console.log("value:", _value)
    let RegExp = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (RegExp.test(_value)) {
      this.setData({
        phone: _value
      })
    } else {
      wx.showToast({
        title: '电话号码输入有误，请重新输入',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      this.setData({
        phone: ''
      })
      return false
    }
  },
  submitphone: function () {  //提交手机号码
    let that = this
    if (!this.data.phone) {
      wx.showToast({
        title: '请先输入或授权手机号',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    }
    let _parms = {
      shopMobile: this.data.phone,
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName
    }
    Api.sendForRegister(_parms).then((res) => {
      if (res.data.code == 0) {
        console.log("sendForRegister:", res)
        that.setData({
          verifyId: res.data.data.verifyId,
          veridyTime: res.data.data.veridyTime
        })
      }
    })
  },
  yzmbindblur: function (e) {  //输入验证码框失焦时获取输入的验证码
    let _value = e.detail.value
    console.log("yzm:", _value)
    this.setData({
      verify: _value
    })
  },
  submitverify: function () {  //提交验证码
    let that = this
    let _time = utils.reciprocal(this.data.veridyTime)
    console.log("_time:", _time)
    if (_time == 'no') {
      wx.showToast({
        title: '请先提交电话号码，获取验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    } else {
      if (this.data.verify == this.data.verifyId) {
        let _parms = {
          shopMobile: this.data.phone,
          SmsContent: this.data.verify,
          userId: app.globalData.userInfo.userId,
          userName: app.globalData.userInfo.userName
        }
        Api.isVerify(_parms).then((res) => {
          console.log("isVerify:", res)
          if (res.data.code == 0) {
            app.globalData.userInfo.userId = res.data.data,
            app.globalData.userInfo.mobile = this.data.phone,
              wx.switchTab({
                url: '../personal-center'
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})