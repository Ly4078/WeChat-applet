var interval = null //倒计时函数


import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTime: 61,
    _build_url: GLOBAL_API_DOMAIN,
    butTxt: '获取验证码',
    phoneNum: '', //手机号码
    codeNum: '', //输入的验证码
    verifyId: '', //后台返回的验证码
    isClick: false,
    istouqu: false,
    isBack: false,
    isabss: false,
    referrer: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('options:', options)
    this.findByCode();
    if (options.back == 1) {
      this.setData({
        isBack: true
      })
    }
    if (options.userId) {
      this.setData({
        referrer: options.userId
      })
    }
    if (options.parentId) {
      this.setData({
        parentId: options.parentId,
        skuId: options.skuId,
        shopId: options.shopId
      })
    }
    if (options.inviter) {
      this.setData({
        inviter: options.inviter
      });
    }
    let q = decodeURIComponent(options.q)
    if (q) {
      if (utils.getQueryString(q, 'flag') == 6) {
        let _ref = utils.getQueryString(q, 'userId');
        this.setData({
          referrer: _ref
        })
      }
    }
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  findByCode: function() { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.findByCode({ code: res.code }).then((res) => {
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
                if(!_data.unionId){
                  that.setData({
                    istouqu: true
                  })
                }
                that.authlogin();
              } 
            }
          })
        }
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
          if(val){
            if (that.data.referrer) { //推荐人
              that.setpullUser();
            }
            if (that.data.parentId) {
              that.inviteNewUser();
            }
            if (that.data.inviter) {
              that.inviteCrab();
            }
          }
        }
        // console.log(app.globalData)
      }
    })
  },
  againgetinfo: function() { //请求用户授权获取获取用户unionId
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
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
            app.globalData.userInfo.openId = _data.openId;
            that.getmyuserinfo();
          }
        })
      }
    })
  },

  getmyuserinfo: function() { //从自己的服务器获取用户信息
    let _parms = {
        openId: app.globalData.userInfo.openId,
        unionId: app.globalData.userInfo.unionId
      },
      that = this;
    Api.addUserUnionId(_parms).then((res) => {
      if (res.data.data) {
        app.globalData.userInfo.userId = res.data.data;
        wx.request({ //从自己的服务器获取用户信息
          url: this.data._build_url + 'user/get/' + res.data.data,
          header: {
            "Authorization": app.globalData.token
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
              if (data.mobile) {
                if (that.data.isBack) {
                  wx.navigateBack({
                    data: 1
                  })
                }else{
                  wx.switchTab({
                    url: '../../index/index'
                  })
                }
              }
            }
          }
        })
      }
    })
  },
  changePhone: function(e) { //监听手机号输入
    let _value = e.detail.value,
      RegExp = /^[1][3456789][0-9]{9}$/;
    if (!_value) {
      this.setData({
        phoneNum: ''
      })
    }
    if (RegExp.test(_value)) { //校验手机号码 
      this.setData({
        phoneNum: _value,
        isClick: true
      })
    } else {
      this.setData({
        isClick: false,
        isabss: false,
        codeNum: '',
        verifyId: '',
        butTxt: '获取验证码'
      })
      clearInterval(interval);
    }
  },

  changeCode: function(e) { //监听验证码输入
    let _value = e.detail.value;
    if (!_value) {
      this.setData({
        codeNum: ''
      })
    }
    if (_value.length == 4) {
      this.setData({
        codeNum: _value
      })
    }
  },

  getVerificationCode() { //点击获取验证码
    let that = this;
    if (this.data.isabss) {
      return
    }
    this.setData({
      isabss: true
    })
    if (this.data.phoneNum) {
      let _parms = {
        shopMobile: that.data.phoneNum,
        // userId: app.globalData.userInfo.userId,
        // userName: app.globalData.userInfo.userName,
        token: app.globalData.token
      }
      Api.sendForRegister(_parms).then((res) => {
        if (res.data.code == 0) {
          that.setData({
            verifyId: res.data.data.verifyId,
            veridyTime: res.data.data.veridyTime
          })
          that.Countdown();

          that.setData({
            isclick: false
          })
        }
      })
    } else {
      wx.showToast({
        title: '请输入电话号码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
    }

  },

  Countdown: function() { //倒计时
    let that = this,
      currentTime = that.data.currentTime;
    interval = setInterval(function() {
      currentTime--;
      that.setData({
        butTxt: currentTime + '秒'
      })
      if (currentTime <= 0) {
        that.setData({
          butTxt: '获取验证码',
          currentTime: 61,
          isabss: false,
          isClick: true
        })
        clearInterval(interval);
      }
    }, 1000)
  },

  registered: function() { //点击注册（领红包）按钮  ,核验验证码
    let that = this;
    if (this.data.phoneNum) {
      if (this.data.codeNum) {
        if (this.data.codeNum == this.data.verifyId) {
          let _parms = {
            shopMobile: this.data.phoneNum,
            SmsContent: this.data.verifyId,
            // userId: app.globalData.userInfo.userId,
            // userName: app.globalData.userInfo.userName,
            token: app.globalData.token
          }
          // return;
          Api.isVerify(_parms).then((res) => {
            if (res.data.code == 0) {
              app.globalData.userInfo.userId = res.data.data;
              app.globalData.userInfo.mobile = that.data.phoneNum;
              that.authlogin("1");
              that.getuserInfo();
              
            }
          })
        } else {
          wx.showToast({
            title: '验证码输入错误',
            icon: 'none',
            mask: 'true',
            duration: 2000
          })
          this.setData({
            codeNum: ''
          })
        }
      } else {
        wx.showToast({
          title: '请输入验证码',
          icon: 'none',
          mask: 'true',
          duration: 2000
        })
      }
    } else {
      wx.showToast({
        title: '请输入电话号码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
    }
  },

  getuserInfo: function(val) { //从自己的服务器获取用户信息
    let that = this;
    wx.request({
      url: that.data._build_url + 'user/get/' + app.globalData.userInfo.userId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          let data = res.data.data;
          // if (val == 1) {
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            };
          // }
          if (that.data.isBack) {
            wx.navigateBack({
              data: 1
            })
          } else {
            wx.switchTab({
              url: '../../index/index'
            })
          }
        }
      }
    })
  },

  setpullUser: function() { //上传推荐人userId
    let _parms = {
      userId: this.data.referrer,
      token: app.globalData.token
    };
    Api.setPullUser(_parms).then((res) => {
      if (res.data.code == 0) {
        console.log('res:', res)
      }
    })
  },
  inviteNewUser() { //邀请新用户参与秒杀
    let _parms = {
      parentId: this.data.parentId,
      skuId: this.data.skuId,
      shopId: this.data.shopId,
      newUser: app.globalData.userInfo.userId,
      token: app.globalData.token
    };
    console.log("368行：=========_parms", _parms);
    Api.inviteNewUser(_parms).then((res) => {
      consle.log('369行：=========邀请是否成功' + res.data);
      if (res.data.code == 0) {
        consle.log('邀请成功：========='+res.data);
      }
    })
  },
  inviteCrab() {   //邀请新用户兑换螃蟹
    let _parms = {
      userId: this.data.inviter,
      token: app.globalData.token
    };
    Api.addInviteCrab(_parms).then((res) => {
      if (res.data.code == 0) {
        console.log('res:', res)
      }
    })
  }
})