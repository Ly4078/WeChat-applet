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
    settime: '',
    rematime: '获取验证码',
    isclick:true
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
  submitphone: function () {  
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
    if (!this.data.isclick){
      return false
    }
    let RegExp = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (RegExp.test(this.data.phone)) {
      if (this.data.settime){
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
          wx.getStorage({
            key: 'phone',
            complete: function (res) {
              if (RegExp.test(res.data)) {
                if (res.data == that.data.phone) {
                  let sett = setInterval(function () {
                    that.remaining();
                  }, 1000)
                  that.setData({
                    settime: sett,
                    isclick:false
                  })
                } else {
                  wx.setStorage({
                    key: "phone",
                    data: that.data.phone
                  })
                }
              } else {
                wx.setStorage({
                  key: "phone",
                  data: that.data.phone
                })
              }
            }
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

  yzmbindblur: function (e) {  //输入验证码框失焦时获取输入的验证码
    let _value = e.detail.value
    this.setData({
      verify: _value
    })
  },
  remaining: function () {  //倒计时
    let rema = utils.reciprocal(this.data.veridyTime)
    if (rema == 'no' || rema == 'yes') {
      clearTimeout(this.data.settime)
      wx.removeStorage({
        key: 'phone',
        complete: function (res) {
          console.log(res)
        }
      })
      this.setData({
        rematime: '获取验证码',
        isclick:true
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
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入电话号码，获取验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    } else if (!this.data.verify){
      wx.showToast({
        title: '请输入验证码',
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