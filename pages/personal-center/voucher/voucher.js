import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData:[],
    page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getorderCoupon();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page:1
    });
    this.getorderCoupon();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: this.data.page+1
    });
    this.getorderCoupon();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    console.log(e)
    let id = e.target.id, _skuName = e.target.dataset.sku;
    console.log('id:', id, '_skuName:', _skuName)
    return {
      title: _skuName,
      path: '/pages/personal-center/voucher/voucherDetails/voucherDetails?id=' + id + '&skuname=' + _skuName,
      success: function (res) { }
    }
  },
  //查询我的礼品券列表数据 
  getorderCoupon:function(){
    let _parms = {
      userId: app.globalData.userInfo.userId,
      isUsed:'0',
      page:this.data.page,
      rows:10
    }
    Api.orderCoupon(_parms).then((res)=>{
      if(res.data.code == 0 ){
        console.log('res:',res)
      }
    })
  },

    //赠送好友
  giveFriend: function (e) {
    let id = e.currentTarget.id;
    console.log('id:', id)
  },
  //立即兑换
  redeemNow: function (e) {
    console.log('e:', e)
    let id = e.currentTarget.id, _skuName = e.currentTarget.dataset.index;
    console.log('id:', id);
    console.log('_skuName:', _skuName);
    wx.navigateTo({
      url: '../../index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&skuName=' + _skuName
    })
  },
  //点击购买券
  buyVoucher: function () {
    wx.navigateTo({
      url: '../../index/crabShopping/crabShopping?currentTab=0&spuval=3',
    })
  },

  //点击兑换记录
  handexchange: function () {
    console.log('handexchange')
    wx.navigateTo({
      url: '../voucher/record/record',
    })
  }
})