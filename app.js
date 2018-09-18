//app.js
var utils = require('utils/util.js')
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
  onLaunch: function (options) {
    let q = decodeURIComponent(options.query.q)
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  globalData: {  //全局变量
    picker:{},
    isflag:true,
    oldcity:'',
    OrderObj:{},
    txtObj:{},
    userInfo: {
      id:'',
      openId: '',
      unionId:'',
      sessionKey:'',
      password: '',
      userType:'',
      userId: '',  
      shopId: '',
      userName: '',
      nickName: '',
      phone:'',
      mobile:'',
      iconUrl: '',
      sourceType: '',
      city: '',
      loginTimes:'',
      sex: '', //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
      lat: '',
      lng: '',
      actInfoImg: ''  //活动详情图片
    },
    article: [],
    Express: {    //收货人信息
      username: '',
      address: '',
      phone: '',
      addressId: ''
    }
  }
})


