//index.js 
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
let app = getApp()
Page({
  data: {
    isNew: 0
  },
  onLoad: function (options) {
   
  },
  onReady: function () {
    
  },
  onShow: function () {
    this.isNewUser();
  },
  onHide: function () {
    
  },
  isNewUser: function () {   //判断是否新用户
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId
    };
    Api.isNewUser(_parms).then((res) => {
      console.log(res.data.code)
      if (res.data.code == 0) {
        that.setData({
          isNew: 1
        });
      }
    })
  },
  toReceive: function() {  //点击领取新人专享
    if(this.data.isNew == 1) {
      let that = this
      let _parms = {
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        payType: '2',
        skuId: '8',
        skuNum: '1'
      }
      Api.getFreeTicket(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.navigateTo({
            url: '../../personal-center/lelectronic-coupons/lectronic-coupons?id=' + res.data.data + '&isPay=1'
          })
        }else{
          wx.showToast({
            title: '您已不是新用户！',
            icon: 'none'
          })
        }
      })
    } else if (this.data.isNew == 0) {
      wx.showToast({
        title: '您已不是新用户！',
        icon: 'none'
      })
    }
  }
})