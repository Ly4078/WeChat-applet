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
    let q = decodeURIComponent(options.query.q);
    this.globalData.currentScene.path = options.path;
    this.globalData.currentScene.query = options.query
    const userInfo = wx.getStorageSync("userInfo");
    var mobile = String(userInfo.mobile);
      if ( mobile.length < 11){
      if (options.path == 'pages/personal-center/securities-sdb/securities-sdb' || options.path=='pages/init/init'){
        return
      }
      wx.reLaunch({
        url: '/pages/init/init',
      })
    }
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  globalData: {  //全局变量
    changeCity:false,
    picker:{},
    token:"",
    isflag:true,
    oldcity:'',
    OrderObj:{},
    txtObj:{},
    currentScene:{},
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
    Express: {}    //收货人信息
  }
})


