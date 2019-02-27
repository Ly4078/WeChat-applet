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
    // getToken(that, 'notTologin').then((res) => {
    //   that.getconfig();
    // })
     try {
      //版本更新
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        // console.log(res.hasUpdate)
      });
      updateManager.onUpdateReady(function() {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      });
      updateManager.onUpdateFailed(function() {
        // 新的版本下载失败
      });
    } catch (err) {
      console.log(err)
    }
    let token = wx.getStorageSync("token") || '';
    let tokenTime = wx.getStorageSync("tokenTime");
    // let userInfo = wx.getStorageSync('userInfo');
    var nowTime = Date.parse(new Date());
    if (token && tokenTime && userInfo) {
      if (nowTime > tokenTime) {
        getToken(that, 'notTologin').then((res) => {
          that.getconfig();
        })
      } else {
        that.globalData.token = token;
        that.globalData.userInfo = userInfo;
        that.globalData.userInfo.userId = userInfo.id;
        that.getconfig();
      }
    } else {
      getToken(that, 'notTologin').then((res) => {
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
      url: this.data._build_url + 'globalConfig/list?type=1',
      header: {
        "Authorization": that.globalData.token
      },
      success: function (res) {
          if(res.data.code=='0') {
            let data = res.data.data;
            let txtObj = data;
            for(var k in data){
              txtObj[k] = JSON.parse(data[k].configValue)
            }
            wx.setStorageSync("txtObj", txtObj);
          }
      }
    })
  }
})