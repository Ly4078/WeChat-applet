//app.js
var utils = require('utils/util.js')
import Api from 'utils/config/api.js';
import getToken from 'utils/getToken.js'
import {
  GLOBAL_API_DOMAIN
} from '/utils/config/config.js';

App({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    openId: '',
    Info: {},
    lat: '',
    lng: '',
    sessionKey: ''
  },
  globalData: { //全局变量
    changeCity: false,
    picker: {},
    token: "",
    isflag: true,
    oldcity: '',
    OrderObj: {},
    txtObj: {},
    currentScene: {},
    userInfo: {
      id: '',
      openId: '',
      unionId: '',
      sessionKey: '',
      password: '',
      userType: '',
      userId: '',
      shopId: '',
      userName: '',
      nickName: '',
      phone: '',
      mobile: '',
      iconUrl: '',
      sourceType: '',
      city: '',
      loginTimes: '',
      sex: '', //gender	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
      lat: '',
      lng: '',
      actInfoImg: '' //活动详情图片
    },
    article: [],
    Express: {} //收货人信息
  },
  onLaunch: function(options) {
    let that = this;
    console.log("options:", options)
    let q = decodeURIComponent(options.query.q);
    this.globalData.currentScene.path = options.path;
    this.globalData.currentScene.query = options.query
    let userInfo = wx.getStorageSync("userInfo");
    var mobile = String(userInfo.mobile);
    
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.systemInfo = res
      },
    })
    let token = wx.getStorageSync("token") || '';
    let tokenTime = wx.getStorageSync("tokenTime");
    // let userInfo = wx.getStorageSync('userInfo');
    var nowTime = Date.parse(new Date());
    if (token && tokenTime && userInfo){
      if (nowTime > tokenTime) {
        getToken(that,'notTologin').then((res) => {
          that.getconfig();
        })
      } else {
        that.globalData.token = token;
        that.globalData.userInfo = userInfo;
        that.globalData.userInfo.userId = userInfo.id;
        that.getconfig();
      }
    }else{
      getToken(that,'notTologin').then((res) => {
        that.getconfig();
      })
    }
  },
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
  },
  onShow:function(){
    // this.getconfig();
  },
  getconfig: function () { //请求配置数据
    let that = this;
    wx.request({
      url: this.data._build_url + 'version.txt',
      header: {
        "Authorization": that.globalData.token
      },
      success: function (res) {
        if(res.data.hidecai){
          // wx.hideTabBar({})
        }
        console.log('res.data:', res.data)
        console.log('res.data.hidecai:',res.data.hidecai)
        console.log('apponShow')
        that.globalData.txtObj = res.data;
        wx.setStorageSync("txtObj", res.data);
      }
    })
  }
})