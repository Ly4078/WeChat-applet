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
    id:'',
    current:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.id
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
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  //查询券详情
  getorderCoupon: function () {
    let that = this;
    wx.request({
      url: this.data._build_url + 'orderCoupon/get/' + this.data.id,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _data = res.data.data;
          _data.goodsSku.sellPrice = _data.goodsSku.sellPrice.toFixed(2);
          if (_data.expressCode && _data.expressCode.length > 14){
            _data.expressCode2 = _data.expressCode.slice(0, 14);
            _data.expressCode2+='...';
          }else{
            _data.expressCode2 = _data.expressCode;
          }
          if (_data.goodsSku.spuId == 3){
            if (_data.changerId == app.globalData.userInfo.userId){
              _data.sendAmount = 30;
              _data.sendAmount = _data.sendAmount.toFixed(2);
            }
          }
          if (!_data.orderAddressOut.dictCounty || _data.orderAddressOut.dictCounty == 'null') {
            _data.orderAddressOut.dictCounty = '';
          }
          console.log('_data:', _data)
          that.setData({
            current: _data
          })
        }
      }
    })
  },
  //点击复制
  copyCode:function(e){
    let id = e.currentTarget.id,_title="";
    if(id == 1){
      _title = this.data.current.goodsSku.skuCode;
    }else if(id == 2){
      _title = this.data.current.expressCode;
    }
    wx.setClipboardData({
      data: _title,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功！',
              icon: 'none'
            })
          }
        })
      }
    })
  }
})