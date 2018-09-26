import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    listData:[],
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
      page: 0
    })
    this.getorderCoupon();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: this.data.page+1
    })
    this.getorderCoupon();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  //查询兑换记录列表
  getorderCoupon:function(){
    wx.showLoading({
      title: '加载中...'
    });
    let _parms = {
      changerId: app.globalData.userInfo.userId,
      browSort:1,
      page:this.data.page,
      rows:10
    };
    if (this.data.page == 1) {
      this.setData({
        listData: []
      })
    }
    Api.dhCoupon(_parms).then((res)=>{
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if(res.data.code == 0){
        let _data = this.data.listData,_list = res.data.data.list
        if (_list && _list.length>0){
          for (let i = 0; i < _list.length; i++) {
            let _arr = _list[i].goodsSkuName.split(" ");
            _arr[0] += " 礼品卡";
            _list[i].p1 = _arr[0];
            _list[i].p2 = _arr[1];
            _data.push(_list[i]);
          }
          this.setData({
            listData: _data
          })
        }
      }
    })
  },
  //点击某个条目
  handItem:function(e){
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../../voucher/exchangeDetails/exchangeDetails?id='+id,
    })
  }
})