import Api from '../../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var utils = require('../../../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    skuPic: '',
    skuName: '',
    sellNum: 0,
    marketPrice: 0,
    sellPrice: 0,
    orderPrice: '',
    num: 1,
    shopId: '',
    spuId: 1,    //判断是散装还是礼盒
    salepointId: ''    //自提点id
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      id: options.id,
      salepointId: options.salepointId
    });
  },
  onShow: function () {
    this.getDetailBySkuId();
  },
  onHide: function () {
    wx.hideLoading();
  },
  //查询单个详情
  getDetailBySkuId: function (val) {
    let that = this;
    Api.DetailBySkuId({
      id: this.data.id
    }).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0) {
        let data = res.data.data;
        this.setData({
          skuName: data.skuName,
          skuPic: data.skuPic,
          sellNum: data.sellNum,
          marketPrice: data.marketPrice,
          sellPrice: data.sellPrice,
          orderPrice: (data.sellPrice * this.data.num).toFixed(2),
          spuId: data.spuId,
          shopId: data.shopId
        })
      }
    })
  },
  add() {   //点击加号
    let num = this.data.num + 1, sellPrice = this.data.sellPrice;
    this.setData({
      num: num,
      orderPrice: (sellPrice * num).toFixed(2)
    });
  },
  minus() {   //点击减号
    if (this.data.num > 0) {
      let num = this.data.num - 1, sellPrice = this.data.sellPrice;
      this.setData({
        num: num,
        orderPrice: (sellPrice * num).toFixed(2)
      });
    }
  },
  toBuy() {    //去下单
    if(this.data.num <= 0) {
      wx.showToast({
        title: '请至少选择一只',
        icon: 'none'
      })
      return false;
    }
    //issku=3为到店自提
    wx.navigateTo({
      url: '../../crabDetails/submitOrder/submitOrder?spuId=' + this.data.spuId + '&id=' + this.data.id + '&num=' + this.data.num + '&issku=3&shopId=' + this.data.shopId + '&salepointId=' + this.data.salepointId
    })
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})