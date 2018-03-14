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
    let that = this
    wx.login({
      success: res => {
        let _code = res.code;
        console.log("code:",_code)
        if(res.code){
          let _parms = {
            code:res.code
          }
          Api.getOpenId(_parms).then((res) => {  //获取openID sessionKey
            if(res.data.code == 0){
              this.data.openId= res.data.data.openId,
              this.data.sessionKey= res.data.data.sessionKey

              wx.getSetting({  // 获取用户已授权权限
                success: res => {
                  // if (res.authSetting['scope.userInfo']) {  //暂时关闭检验用户授权权限 ，如没有授权则要求用户授权
                    this.getuserInfo();
                  // }
                }
              })

            }
          })
        }
      }
    })
  },
  getuserInfo:function(){  //获取用户信息
    let that = this;
    wx.getUserInfo({
      success: res => {
          if(res.userInfo){
            this.data.Info = res.userInfo
            this.setblouserInfo()
          }
      }
    })
  },
  setblouserInfo:function(){  //将获取到的用户信息赋值给全局变量
    let _parms = {
      openId: this.data.openId,
      // userId: this.data.openId,  //暂时注释 待后台有user表后放开开注释
      userName: this.data.Info.nickName,
      nikcName: this.data.Info.nickName,
      sourceType: '1',
      iconUrl: this.data.Info.avatarUrl,
      city: this.data.Info.city,
      sex: this.data.Info.gender //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
    }
    this.globalData.userInfo = _parms  //更新全局变量默认值
  },
  globalData: {  //全局变量
    userInfo: {
      openId: '',
      // userId: '',  //暂时注释 待后台有user表后放开开注释
      userName: '',
      nikcName: '',
      sourceType: '1',
      iconUrl: '',
      city: '',
      sex: '' //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
    },
    article:[]
  }
})