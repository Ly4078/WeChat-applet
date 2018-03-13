import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN
  },
  onLoad: function (options) {
    this.setData({
      ticketId: options.id
    });
    this.getTicketInfo();
  },
  //获取票券详情
  getTicketInfo: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'cp/get/' + that.data.ticketId,
      success: function(res) {
        let data = res.data;
        if(data.code == 0) {
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
          that.setData({
            orderInfo: data.data
          });
        }
      }
    })
  },
  sublevelSum:function(event){
    wx.navigateTo({
      url: '../../index/voucher-details/voucher-details',
    })
  }
})