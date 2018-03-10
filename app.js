//app.js
var http = require('utils/util.js')  
import Api from 'utils/config/api.js'; 
import { GLOBAL_API_DOMAIN } from '/utils/config/config.js';

App({
  data:{
    _build_url: GLOBAL_API_DOMAIN,
    openId:'',
    Info:{},
    sessionKey:''
  },

  onLaunch: function () {
    wx.login({
      success: res => {
        let _code = res.code;
        wx.request({
          url: this.data._build_url+'wxpay/getOpenId',
          method:'POST',
          data: {
            code:res.code
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if(res.data.code == 0){
              this.setData({
                openId: res.data.data.openId,
                sessionKey: res.data.data.sessionKey
              })
            }
          }
        })
      }
    })
    
    wx.getSetting({  // 获取用户信息
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                Info:res.userInfo
              }),
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if(this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    let _parms = {
      id:this.data.openId,
      userName: this.data.Info.nickName,
      nikcName: this.data.Info.nickName,
      sourceType:'1',
      iconUrl: this.data.Info.avatarUrl,
      city: this.data.Info.city,
      sex: this.data.Info.gender //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
    }
    let  _arr = []
    _arr.push(_parms)
    this.globalData.userInfo  = _arr[0];
    Api.usersignup(_parms).then((res) => {
      console.log("usersignup:",res)
    })

  },
  globalData: {
    userInfo: null,
    article:[]
  }
})