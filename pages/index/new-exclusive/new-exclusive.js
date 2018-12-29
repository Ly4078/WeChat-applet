
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
let app = getApp()
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isNew: 0  //0新用户  其他老用户
  },
  onShow:function(){
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
        console.log('res:',res)
        if (res.data.code == 0) {
          that.setData({
            isNew: 0
          });
        }else{
          that.setData({
            isNew: 1
          });
        }
      }
    })
  },
  toReceive: function() {  //点击领取新人专享
    if (app.globalData.userInfo.mobile){
      if (this.data.isNew == 0) {
        let that = this, _parms = {};
        wx.request({
          url: that.data._build_url + 'orderInfo/createNewForFreer?payType=0&shopId=0&singleType=1&flagType=1',
          header: {
            "Authorization": app.globalData.token
          },
          method: 'POST',
          success: function (res) {
            if (res.data.code == 0) {
              wx.navigateTo({
                url: "/pages/personal-center/my-discount/my-discount?let=let"
              })
            } else {
              wx.showToast({
                title: '您已不是新用户！',
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
    }else{
      wx.navigateTo({
        url: '/pages/init/init?isback=1'
      })
    }
  }
})