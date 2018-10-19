import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    value: '',
    _build_url: GLOBAL_API_DOMAIN,
  },
  onLoad: function (options) {
    this.setData({
      shopid: options.shopid
    });
  },
  getvalue(e) {
    this.setData({
      value: e.detail.value
    });
  },
  //发表评论
  send: function (e) {
    if (this.data.value == "" || this.data.value == 'undefined' || this.data.value == 'null') {
      wx.showToast({
        mask: true,
        title: '请先输入评论',
        icon: 'none'
      }, 1500)
    } else {
      let content = utils.utf16toEntities(this.data.value), that = this, _parms = {}, _values="";
      _parms = {
        refId: this.data.shopid,
        cmtType: '5',
        content: content,
        // token: app.globalData.token,
        // userId: app.globalData.userInfo.userId,
        // userName: app.globalData.userInfo.userName,
        // nickName: app.globalData.userInfo.nickName
      }

      for (var key in _parms) {
        _values += key + "=" + _parms[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      wx.request({
        url: that.data._build_url + 'cmt/add?' + _values,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            wx.navigateBack({
              delta: 1
            })
          } else {
            wx.showToast({
              mask: true,
              title: '系统繁忙,请稍后再输',
              icon: 'none'
            }, 1500);
            that.setData({
              value: ''
            });
          }
        }
      })
    }
  },
  cancel() {
    wx.navigateBack({
      delta: 1
    })
  }
})