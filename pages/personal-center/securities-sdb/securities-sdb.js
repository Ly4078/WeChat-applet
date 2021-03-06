var interval = null //倒计时函数


import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
import Public from '../../../utils/public.js';
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    actId:'',
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
    isscan: false,
    referrer: '',
    inviter: "" //推荐人ID
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('sdb_options:', options)
    if (options.back == 1) {
      this.setData({
        isBack: true
      })
    }
    if (options.actId){
      this.setData({
        actId: options.actId
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
        inviter: options.inviter,
        currentType: options.currentType
      });
    }
    let q = decodeURIComponent(options.q);
    if (q) {
      if (utils.getQueryString(q, 'flag') == 6) {
        let _ref = utils.getQueryString(q, 'userId');
        this.setData({
          referrer: _ref,
          isscan: true
        })
      }
    }
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.findByCode();
  },

  findByCode: function(val) { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          Api.findByCode({
            code: res.code
          }).then((res) => {
            if (res.data.code == 0) {
              let _data = res.data.data;
              app.globalData.userInfo.userId = _data.id ? _data.id : '';
              for (let key in _data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = _data[key]
                  }
                }
              };
              if (!_data.sessionKey){
                that.getOpendId();
              }
              let userInfo = app.globalData.userInfo;
              wx.setStorageSync('userInfo', userInfo);
              if (app.globalData.userInfo.userName){
                that.authlogin(val);
              }
            }
          })
        }
      }
    })
  },

  authlogin: function(val) { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          wx.setStorageSync('token', _token)
          if (val == 2) {
            that.getVerificationCode();
          } else {
            if (app.globalData.userInfo.mobile) {
              if (that.data.referrer) { //推荐人
                if (that.data.isscan) {
                  wx.switchTab({
                    url: '../../index/index'
                  })
                } else {
                  that.setpullUser();
                }
              } else if (that.data.parentId) {
                that.inviteNewUser();
              } else if (that.data.inviter) {
                that.inviteCrab();
              } else if (val) {
                that.freeOrder(); //获取免费票券
              } else {
                that.getuserInfo();
              }
            }
          }
        }
      }
    })
  },
  getOpendId: function () {
    let that = this;
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
                  that.createNewUser();
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
  },
  freeOrder: function () {//获取免费票券
    let _parms = {},
      _value = "",
      that = this;
    _parms = {
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      payType: 2,
      skuId: 8,
      skuNum: 1
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
      success: function(res) {
        if (res.data.code == 0) {
          console.log("领取成功")
          that.getuserInfo();
        }
      }
    })
  },
  createNewUser: function () {  //创建用户
    let that = this;
    wx.request({
      url: that.data._build_url + 'auth/addUserUnionId?openId=' + app.globalData.userInfo.openId + '&unionId=' + app.globalData.userInfo.unionId,
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          let data = res.data.data;
          for (let key in data) {
            for (let ind in app.globalData.userInfo) {
              if (key == ind) {
                app.globalData.userInfo[ind] = data[key]
              }
            }
          };
          app.globalData.userInfo.userId = res.data.data.id;
          that.authlogin();
        }
      }
    })
  },
  againgetinfo: function() { //请求用户授权获取获取用户unionId
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        console.log('agg:',res)

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
          success: function(resv) {
            if (resv.data.code == 0) {
              that.setData({
                istouqu: false
              })
              let _data = JSON.parse(resv.data.data);
              app.globalData.userInfo.unionId = _data.unionId;
              app.globalData.userInfo.openId = _data.openId;
              let userInfo = app.globalData.userInfo;
              wx.setStorageSync('userInfo', userInfo);
              that.createNewUser();
              // that.findByCode();
              // that.getmyuserinfo();
            }
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
                    delta: 1
                  })
                } else {
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
        isClick: true,
        isabss: false
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
    if (app.globalData.token.length < 5) {
      // that.findByCode("2");
      that.findByCode();
      return
    }
    if (this.data.isabss) {
      return
    }
    this.setData({
      isabss: true
    })
    if (this.data.phoneNum) {
      wx.request({
        url: that.data._build_url + 'sms/sendForRegister?shopMobile=' + that.data.phoneNum,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
          if (res.data.code == 0) {
            that.setData({
              verifyId: res.data.data.verifyId,
              veridyTime: res.data.data.veridyTime
            })
            that.Countdown();
            that.setData({
              isclick: false,
              isabss: false
            })
          } else {
            // that.findByCode("2");
            that.findByCode();
          }
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

  formSubmit: function(e) { //点击注册（领红包）按钮  ,核验验证码
    let that = this, _formId = e.detail.formId;
    if (this.data.phoneNum) {
      if (this.data.codeNum) {
        if (this.data.codeNum == this.data.verifyId) {
          let _parms = {
            shopMobile: this.data.phoneNum,
            SmsContent: this.data.verifyId,
            token: app.globalData.token
          }
          Api.isVerify(_parms).then((res) => {
            if (res.data.code == 0) {
              let data = res.data.data;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              };
              app.globalData.userInfo.userId = res.data.data.id;
              let userInfo = app.globalData.userInfo;
              wx.setStorageSync('userInfo', userInfo);
              that.setData({
                isscan:   false
              });
              that.authlogin();
              // that.findByCode("1");
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
    Public.addFormIdCache(_formId); 
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
          for (let key in data) {
            for (let ind in app.globalData.userInfo) {
              if (key == ind) {
                app.globalData.userInfo[ind] = data[key]
              }
            }
          };
          if (that.data.isBack) {
            wx.navigateBack({
              delta: 1
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
    let that = this;
    wx.request({
      url: that.data._build_url + 'pullUser/update?userId=' + that.data.referrer,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        // if (res.data.code == 0) {
          that.getuserInfo();
        // }
      }
    })
  },
  inviteNewUser() { //邀请新用户参与秒杀
    let _parms = {},
      that = this,
      url = "",
      _Url = "",
      _value = "";
    _parms = {
      parentId: that.data.parentId,
      skuId: that.data.skuId,
      shopId: that.data.shopId,
      actId:that.data.actId,
      newUser: app.globalData.userInfo.userId
    };
    for (let key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    // url = that.data._build_url + 'user/upPeopleNum?' + _value;
    url = that.data._build_url + 'user/updatePeopleNumNew?' + _value;
    _Url = encodeURI(url);
    console.log('url:', url)
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        console.log("login_res:",res)
        // if (res.data.code == 0) {
          that.getuserInfo();
        // }
      }
    })
  },
  inviteCrab() { //邀请新用户兑换螃蟹 type =1
    let that = this;
  let url = ''
    if (this.data.currentType){
      url = that.data._build_url + 'pullUser/updateNumsUp?userId=' + that.data.inviter + '&type=' + this.data.currentType
    }else{
      url = that.data._build_url + 'pullUser/upNumsUp?userId=' + that.data.inviter
    }
    wx.request({
      url: url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        if (res.data.code == 0) {
          that.getuserInfo();
        }else{
          that.getuserInfo();
        }
      }
    })
  }
})