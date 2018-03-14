import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 1     //登录用户的id
  },
  onLoad: function (options) {
    this.setData({
      ticketId: options.id,
      isPay: options.isPay
    });
    this.getTicketInfo();
    this.getTel();
  },
  //获取票券详情
  getTicketInfo: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'cp/get/' + that.data.ticketId,
      success: function(res) {
        let data = res.data;
        if(data.code == 0) {
          console.log(data.data)
          that.setData({
            ticketInfo: data.data,
            soId: data.data.soId
          });
          that.getOrderInfo();
        }
      }
    });
  },
  //获取订单信息
  getOrderInfo: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'so/get/' + that.data.soId, 
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          console.log(data.data)
          that.setData({
            orderInfo: data.data
          });
        }
      }
    })
  },
  //获取手机号
  getTel: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'user/get/' + that.data.userId,
      success: function(res) {
        if(res.data.data) {
          that.setData({
            mobile: res.data.data.mobile
          });
        }
      }
    })
  },
  sublevelSum:function(event){
    let that = this;
    wx.navigateTo({
      url: '../../index/voucher-details/voucher-details?id=' + that.data.ticketId + '&sell=' + that.data.orderInfo.soAmount + '&inp=' + that.data.ticketInfo.couponAmount + '&rule=' + that.data.ticketInfo.promotionRules[0].ruleDesc
    })
  }
})