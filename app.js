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
              this.globalData.openId = res.data.data.openId,
                this.globalData.sessionKey = res.data.data.sessionKey
            }
          })
        }
      }
    })
  },
  
  globalData: {  //全局变量
    userInfo: {
      openId: '',
      password: '',
      userType:'',
      userId: '1',  
      userName: '',
      nikcName: '',
      phone:'',
      iconUrl: 'https://xq-1256079679.file.myqcloud.com/test_wxf91e2a026658e78e.o6zAJs-7D9920jC4XTKdzt72lobs.1hRpd2kGdEiOa3b258766fa20678a0bf8984308a16f9_0.3.jpg',
      sourceType: '1',
      city: '',
      loginTimes:'',
      sex: '', //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
      lat: '',
      lng: ''
    },
    article: []
  }
})