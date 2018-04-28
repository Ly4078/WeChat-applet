import Api from '../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    
  },
  formSubmit: function(e) {    //form表单提交
    console.log(e);
  },
  chooseImg: function() {     //上传图片
  let _this = this;
    wx.chooseImage({
      count: 6,
      success: function(res) {
        console.log(res.tempFilePaths);
        wx.uploadFile({
          url: _this.data._build_url + 'img/upload',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            // 'userName': app.globalData.userInfo.userName
            'userName': '15072329516'
          },
          success: function (res) {
            wx.showToast({
              title: '上传中..',
              icon: 'loading',
              duration: 2000
            })
            let data = JSON.parse(res.data);
            console.log(data);
            if(data.code == 0) {
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              })
            } else {
              wx.showToast({
                title: '网络慢稍后再试',
                icon: 'none'
              })
            }
          }
        })
      },
      fail: function(res) {
        console.log(res)
      }
    });
  }
})