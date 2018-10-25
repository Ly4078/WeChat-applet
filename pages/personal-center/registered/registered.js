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
    settime: null,
    rematime: '获取验证码',
    isclick: true,
    goto: false,
    isyaz:false,
    fist:1
  },
  onShow:function(){
    if (!app.globalData.userInfo.userId) {
      wx.switchTab({
        url: '../../index/index'
      })
    }else{
      this.findByCode();
    }
  },
  findByCode: function (val) { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
          if (res.data.code == 0) {
            if (res.data.data.unionId) {
              let data = res.data.data;
              app.globalData.userInfo.unionId = data.unionId;
              app.globalData.userInfo.userId = data.id;
              app.globalData.userInfo.lat = data.locationX;
              app.globalData.userInfo.lng = data.locationY;
              app.globalData.userInfo.userId = _data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              that.authlogin(val);
              wx.hideLoading();
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function (val) { //获取token
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
          if (app.globalData.userInfo.mobile){
            if(val){
              that.newUserToGet();
            }else{
              wx.navigateBack({
                data: 1
              })
            }
          }
        }
      }
    })
  },
  numbindinput: function (e) {  //监听手机号输入框
    let _value = e.detail.value, that = this, RegExp = /^[1][3456789][0-9]{9}$/;
    if(!_value){
      this.closephone();
    }
    if (RegExp.test(_value)) {
      this.setData({
        isclose: true,
        isyaz: false,
        phone: _value
      })
    }else{
      clearInterval(this.data.settime)
      this.setData({
        isclose: false,
        rematime: '获取验证码',
        isclick: true,
        goto: false,
        settime: null,
        isyaz: false
      })
    }
  },
  closephone: function () {  //手机号置空
    clearInterval(this.data.settime)
    this.setData({
      phone: '',
      rematime: '获取验证码',
      isclick: true,
      goto: false,
      settime:null,
      isclose: false,
      isyaz: false
    })
  },
  submitphone: function () {  //获取验证码
    let that = this, sett = null, RegExp = /^[1][3456789][0-9]{9}$/;;
    if (!this.data.phone) {
      that.closephone();
      wx.showToast({
        title: '请正确输入手机号',
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
    
    if (RegExp.test(this.data.phone)) {
      that.setData({
        goto: true
      })
      if (this.data.settime) {
        clearInterval(that.data.settime)
      }
      wx.request({
        url: that.data._build_url + 'sms/sendForRegister?shopMobile=' + that.data.phone,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({
              verifyId: res.data.data.verifyId,
              veridyTime: res.data.data.veridyTime
            })
            sett = setInterval(function () {
              that.remaining();
            }, 1000)
            that.setData({
              settime: sett,
              isclick: false
            })
          }
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
      verify: _value,
      isyaz:false
    })
  },
  remaining: function () {  //倒计时
    let _vertime = this.data.veridyTime.replace(/\-/ig, "\/"), rema=60;
    rema = utils.reciprocal(_vertime);
    if (rema == 'no' || rema == 'yes') {
      clearInterval(this.data.settime)
      this.setData({
        rematime: '获取验证码',
        isclick: true,
        goto: false
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
    let that = this;
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
          mask: 'true',
          duration: 2000
        })
        console.log("app.globalData.userInfo:", app.globalData.userInfo)
        let _parms = {
          shopMobile: this.data.phone,
          SmsContent: this.data.verify,
          token: app.globalData.token
          // userId: app.globalData.userInfo.userId,
          // userName: app.globalData.userInfo.userName
        }
        console.log("_parms:", _parms)
        Api.isVerify(_parms).then((res) => {
          if (res.data.code == 0) {
            app.globalData.userInfo.userId = res.data.data;
            that.findByCode('1');
          }
        })
      } else {
        that.setData({
          verify:''
        });
        wx.showToast({
          title: '验证码输入有误，请重新输入',
          icon: 'none',
          mask: 'true',
          duration: 2000
        })
      }
    }
  },
  newUserToGet: function () {    //新用户跳转票券
    let _parms={},_value="",that=this;
    _parms = {
      // userId: app.globalData.userInfo.userId,
      // userName: app.globalData.userInfo.userName,
      payType: '2',
      skuId: '8',
      skuNum: '1'
    }

    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    wx.request({
      url: that.data._build_url + 'so/freeOrder?' + _value,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        wx.navigateBack({
          data: 1
        })
      }
    })
  },
  getPhoneNumber: function (e) { //获取用户授权的电话号码
    let that = this,msg = e.detail;
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
                    this.setData({
                      phone: _data.phoneNumber
                    })
                    // this.submitphone();
                  }
                }
              })
            }
          })
        }
      }
    })
  }
})