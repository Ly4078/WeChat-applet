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
    wx.showLoading({
      title: '加载中...'
    })
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
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.hideLoading();
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
    let id = e.target.id, _skuName = e.target.dataset.sku;
    return {
      title: _skuName,
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_ajdlfadjfal.png',
      path: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + id,
      success: function (res) { }
    }
  },
  //查询我的礼品券列表数据 
  getorderCoupon:function(){
    let _parms = {
      userId: app.globalData.userInfo.userId,
      page:this.data.page,
      // isUsed:0,
      rows:10
    };
    if(this.data.page ==1){
      this.setData({
        listData:[]
      })
    }
    Api.orderCoupon(_parms).then((res)=>{
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if(res.data.code == 0 ){
        let _data = this.data.listData, _list = res.data.data.list;
        if (_list && _list.length>0){
          for (let i = 0; i < _list.length; i++) {
            _list[i].sku = "公" + _list[i].maleWeight + " 母" + _list[i].femaleWeight + " 4对 " + _list[i].styleName + " | " + _list[i].otherMarkerPrice+"型";
            _data.push(_list[i]);
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
    console.log(e)
    let id = e.currentTarget.id, _skuName = e.currentTarget.dataset.index, _isUsed = e.currentTarget.dataset.used, _orderId = e.target.dataset.order;
    if (_isUsed == 0){
      wx.navigateTo({
        url: '../../index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&skuname=' + _skuName
      })
    }
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