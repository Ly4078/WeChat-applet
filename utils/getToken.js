var app = getApp();
var config = require('./config/config.js');
import Api from './config/api.js';
var getToken = function (that) {
  return new Promise( (resolve,reject)=>{
    var App = that ? that:app
      wx.login({
        success: res => {
          Api.findByCode({
            code: res.code
          }).then((res) => {
            if (res.data.code == 0) {
              let _data = res.data.data;
              if (_data && _data.id) {
                console.log('app',App.globalData)
                App.globalData.userInfo.userId = _data.id;
                for (let key in _data) {
                  for (let ind in App.globalData.userInfo) {
                    if (key == ind) {
                      App.globalData.userInfo[ind] = _data[key]
                    }
                  }
                 
                };
               
                wx.setStorageSync("userInfo", App.globalData.userInfo)
                if (_data.mobile) {
                  authlogin(resolve, App);
                } else {
                  wx.navigateTo({
                    url: '/pages/init/init'
                  })
                }
              } else {
                wx.navigateTo({
                  url: '/pages/init/init'
                })
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
        console.log('time', timestamp);
        wx.setStorageSync("tokenTime", tokenTime)
        wx.setStorageSync('token', _token);
        return resolve(_token)
      } else {
        getToken()
      }
    },
    fail() {
      getToken()
    }
  })
}
module.exports = getToken