import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 1,   //登录用户的id
    qrCodeArr: [],     //二维码数组
    qrCodeFlag: true   //二维码列表显示隐藏标识
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    });
    this.getTicketInfo();
  },
  //二维码放大
  previewImg: function (e) {
    let that = this,
      idx = e.currentTarget.dataset.index;
    wx.previewImage({
      current: that.data.qrCodeArr[idx],     //当前图片地址
      urls: that.data.qrCodeArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //获取票券详情
  getTicketInfo: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'so/getForOrder/' + that.data.id,
      success: function (res) {
        let data = res.data;
        console.log(data);
        if (data.code == 0) {
          let imgsArr = [];
          for (let i = 0; i < data.data.coupons.length; i++) {
            imgsArr.push(data.data.coupons[i].qrcodeUrl);
          }
          that.setData({
            ticketInfo: data.data,
            qrCodeArr: imgsArr
          });
        }
      }
    });
  },
  //点击更多收起按钮
  onclickMore: function () {
    this.setData({
      qrCodeFlag: !this.data.qrCodeFlag
    });
  },
  sublevelSum: function (event) {
    let that = this;
    wx.navigateTo({
      url: '../../index/voucher-details/voucher-details?id=' + that.data.id + ' &sell=' + that.data.ticketInfo.soAmount + '&inp=' + that.data.ticketInfo.coupons[0].couponAmount + '&rule=' + that.data.ticketInfo.coupons[0].promotionRules[0].ruleDesc
    })
  }
})