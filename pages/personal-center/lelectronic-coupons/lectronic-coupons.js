import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 1  ,   //登录用户的id
    posts_key:[
      {
      aa: '01',
      bb: '12345678',
      },
      {
        aa: '02',
        bb: '12345678',
      },
      {
        aa: '03',
        bb: '12345678',
      }, 
      {
        aa: '04',
        bb: '12345678',
      }
    ],
    imgArr: [
      'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=373481702,2170748029&fm=27&gp=0.jpg'
    ]
  },
  onLoad: function (options) {
    //卷码分格
    let _data = this.data.posts_key
    for (let i = 0; i < _data.length;i++){
      let ncard = ''
      for (var n = 0; n < _data[i].bb.length; n = n + 4) {
        ncard += _data[i].bb.substring(n, n + 4) + " ";
      }
      _data[i].bb = ncard.replace(/(\s*$)/g, "")
      console.log('分4位数',ncard.replace(/(\s*$)/g, ""));
    }
    this.setData({
      ticketId: options.id,
      posts_key:_data
    });
    this.getTicketInfo();
    this.getTel();
  },
  
  //二维码放大
  previewImg: function (e) {
    console.log(e.currentTarget.dataset.index);
    var index = e.currentTarget.dataset.index;
    var imgArr = this.data.imgArr;
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //获取票券详情
  getTicketInfo: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'cp/get/' + that.data.ticketId,
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
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
  getOrderInfo: function () {
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
  getTel: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'user/get/' + that.data.userId,
      success: function (res) {
        if (res.data.data) {
          that.setData({
            mobile: res.data.data.mobile
          });
        }
      }
    })
  },
  sublevelSum: function (event) {
    let that = this;
    wx.navigateTo({
      url: '../../index/voucher-details/voucher-details?id=' + that.data.ticketId + '&sell=' + that.data.orderInfo.soAmount + '&inp=' + that.data.ticketInfo.couponAmount + '&rule=' + that.data.ticketInfo.promotionRules[0].ruleDesc
    })
  }
})