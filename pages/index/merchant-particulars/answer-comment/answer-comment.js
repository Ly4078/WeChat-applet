import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    value: ''
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
      let content = utils.utf16toEntities(this.data.value);
      let _parms = {
        refId: this.data.shopid,
        cmtType: '5',
        content: content,
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        nickName: app.globalData.userInfo.nickName
      }
      Api.cmtadd(_parms).then((res) => {
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
          this.setData({
            value: ''
          });
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