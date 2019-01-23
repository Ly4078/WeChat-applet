
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
let app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isNew: 0,
    isClick:true
  },
  onShow: function () {
    this.isNewUser();
  },
  isNewUser: function () {   //判断是否新用户
    let that = this;
    wx.request({
      url: that.data._build_url + 'orderInfo/isNewUser?userId=' + app.globalData.userInfo.userId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            isNew: 0
          });
        } else {
          that.setData({
            isNew: 1
          });
        }
      }
    })
  },
  toReceive: function() {  //点击领取新人专享
    let that = this, _parms = {};
    if (this.data.isClick){
      this.setData({
        isClick:false
      });
      if (app.globalData.userInfo.mobile) {
        if (this.data.isNew == 0) {
          _parms = {
            payType: 0,
            shopId: 0,
            singleType: 1,
            flagType: 1
          };
          wx.request({
            url: that.data._build_url + 'orderInfo/createNewForFree',
            data: JSON.stringify(_parms),
            header: {
              "Authorization": app.globalData.token
            },
            method: 'POST',
            success: function (res) {
              if (res.data.code == 0) {
                wx.switchTab({
                  url: '/pages/personal-center/my-discount/my-discount',
                  success: function () { },
                  fail: function () {
                    wx.navigateTo({
                      url: "/pages/personal-center/my-discount/my-discount",
                    })
                  }
                })
              } else {
                wx.showToast({
                  title: '您已不是新用户!',
                  icon: 'none'
                })
              }
            }
          })
        } else if (this.data.isNew == 1) {
          wx.showToast({
            title: '您已不是新用户！',
            icon: 'none'
          })
        }
      } else {
        wx.navigateTo({
          url: '/pages/init/init?isback=1'
        })
      }
    }else{
      wx.showToast({
        title: '您已不是新用户！',
        icon: 'none'
      })
    }
  }
})