import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    id:'',
    rType: 1,   //券类型
    current:{},
    orderType: ['已兑换', '待发货', '已发货', '已完成'],
    orderType2: ['', '正在为您准备商品中', '您订购的商品已经发货，正在运送途中', '已确认收货'],
  },

  onLoad: function (options) {
    // console.log("options:", options)
    this.setData({
      id:options.id
    })
  },
  onShow:function(){
    this.getorderCoupon();
  },
  //查询券详情
  getorderCoupon: function () {
    let that = this;
    wx.request({
      url: this.data._build_url + 'orderCoupon/getDetail?id=' + this.data.id,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.hideLoading();
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
              if(_data.type == 1){
                _data.sendAmount = 30;
                _data.sendAmount = _data.sendAmount.toFixed(2);
              }
            }
          }
          app.globalData.orderexpressState = _data.expressState;
          app.globalData.orderexpressid = _data.id
          that.setData({
            current: _data,
            rType: _data.type
          })
          if (_data.expressCode){
            that.getexpress();
          }
        }
      },fail(){
        wx.hideLoading();
      }
    })
  },
  getexpress:function(){//huo获取物流信息
    let that = this;
    wx.request({
      url: that.data._build_url + 'orderDelivery/getExpress?expressCode=' + that.data.current.expressCode,
      method:'get',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
          console.log(res);
          if(res.data.code=='0'){
            that.setData({
              data: res.data.data,
            })
            if (res.data.data[0].list.length){
              that.setData({
              
                expressData: res.data.data[0].list
              })
            }
          }
      },fail(){

      }
    })
  },
  confirmReceipt:function(){
    let that = this;
    wx.request({
      url: that.data._build_url + 'orderCoupon/receiving?id=' + that.data.current.id,
      method: 'post',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        console.log(res)
        if(res.data.code=='0' && res.data.data != null){
          wx.showLoading({
            title: '已确认收货',
            icon:'none'
          })
          that.getorderCoupon();
        }else{
          wx.showToast({
            title: '确认收货失败',
            icon:"none"
          })
        }
      }
    })
  },
  examineLogistics:function(){
    let that   = this;
    if(!that.data.data[0].list.length){
      wx.showToast({
        title: '暂无物流信息，请稍后查询',
        icon:'none'
      })
      return false
    }
    wx.navigateTo({
      url: '/pages/personal-center/personnel-order/logisticsDetails/toTheLogistics/toTheLogistics?code=' + that.data.current.expressCode + '&img=' + that.data.current.goodsSku.skuPic,
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