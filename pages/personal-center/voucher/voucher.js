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
    actaddress:{},
    page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getorderCoupon();
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
      path: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + id,
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
    };
    if(this.data.page ==1){
      this.setData({
        listData:[]
      })
    }
    Api.orderCoupon(_parms).then((res)=>{
      wx.stopPullDownRefresh();
      if(res.data.code == 0 ){
        let _data = this.data.listData, _list = res.data.data.list;
        if (_list && _list.length>0){
          for (let i = 0; i < _list.length; i++) {
            _data.push(_list[i])
          }
          this.setData({
            listData: _data
          })
        }
      }
    })
  },

  //立即兑换
  redeemNow: function (e) {
    console.log('e:', e)
    let id = e.currentTarget.id, _skuName = e.currentTarget.dataset.index;
    console.log('id:', id);
    console.log('_skuName:', _skuName);
    wx.navigateTo({
      url: '../../index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&skuname=' + _skuName
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
    wx.navigateTo({
      url: '../voucher/record/record',
    })
  }
})