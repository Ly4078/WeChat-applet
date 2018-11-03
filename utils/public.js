var config = require('./config/config.js');
import Api from './config/api.js';
var app = getApp();

let addFormIdCache = function (formId) {  //上传fromId
  let url = config.GLOBAL_API_DOMAIN + 'msg/addFormIdCache?formId=' + formId,
    _token = wx.getStorageSync('token') || '';;
  wx.request({
    url: url,
    header: {
      "Authorization": _token
    },
    success: (res) => {
      console.log('FormIdres:', res)
    }
  })
}

let authlogin = function (userName) { //获取token
  wx.request({
    url: config.GLOBAL_API_DOMAIN + 'auth/login?userName=' + userName,
    method: "POST",
    data: {},
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      if (res.data.code == 0) {
        let _token = 'Bearer ' + res.data.data;
        wx.setStorageSync('token', _token);
        console.log("token:", _token)
        return _token;;
      }
    }
  })
}

module.exports={
  addFormIdCache: addFormIdCache,
  authlogin: authlogin
}