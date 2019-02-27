// var app = getApp();
var config = require('./config/config.js');
var objUserInfo ={
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
    }
import Api from './config/api.js';
var getToken = function (that,isLogin) {
  return new Promise( (resolve,reject)=>{
    var App = that ? that:getApp();
      wx.login({
        success: res => {
          Api.findByCode({
            code: res.code
          }).then((res) => {
            if (res.data.code == 0) {
              let _data = res.data.data;
              if (_data && _data.id) {
                for (let key in _data) {
                  for (let ind in objUserInfo) {
                    if (key == ind) {
                      objUserInfo[ind] = _data[key]
                    }
                  }
                 
                };
                objUserInfo.userId = _data.id;
                App.globalData.userInfo = objUserInfo;
                wx.setStorageSync("userInfo", objUserInfo)
                if (_data.mobile) {
                  authlogin(resolve, App);
                } else {
                  if (isLogin != 'notTologin'){
                    wx.navigateTo({
                      url: '/pages/init/init'
                    })
                  }
                
                }
              } else {
                if (isLogin != 'notTologin'){
                  wx.navigateTo({
                    url: '/pages/init/init'
                  })
                }
              }
            }
          })
        }
      })

  })
}
let authlogin = function (resolve, App) { //获取token
  let that = this;
  wx.request({
    url: config.GLOBAL_API_DOMAIN + 'auth/login?userName=' + App.globalData.userInfo.userName,
    method: "POST",
    data: {},
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      if (res.data.code == 0) {
        let _token = 'Bearer ' + res.data.data;
        App.globalData.userInfo.token = _token;
        App.globalData.token = _token;
        let timestamp = Date.parse(new Date());
        var tokenTime = timestamp - 0 + 518400000
        wx.setStorageSync("tokenTime", tokenTime)
        wx.setStorageSync('token', _token);
        return resolve(_token)
      } else {
        // getToken()
      }
    },
    fail() {
      // getToken()
    }
  })
}
module.exports = getToken