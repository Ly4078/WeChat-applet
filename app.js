//app.js
var http = require('utils/util.js')
import Api from 'utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/utils/config/config.js';

App({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    openId: '',
    Info: {},
    lat: '',
    lng: '',
    sessionKey: ''
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  onLaunch: function () {
    let that = this

    wx.login({
      success: res => {
        let _code = res.code;
        // console.log("code:", _code)
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {  //获取openID sessionKey
            if (res.data.code == 0) {
              this.data.openId = res.data.data.openId,
              this.data.sessionKey = res.data.data.sessionKey
            }
          })
        }
      }
    })
  },
  
  globalData: {  //全局变量
    userInfo: {
      openId: '',
      // userId: '',  //暂时注释 待后台有user表后放开开注释
      userName: '',
      nikcName: '',
      avatarUrl:'',
      sourceType: '1',
      iconUrl: '',
      city: '',
      sex: '', //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
      lat: '',
      lng: ''
    },
    article: []
  }
})