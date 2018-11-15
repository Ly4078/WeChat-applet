
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    address:[]
  },
  onLoad() {
    wx.showLoading({
      title: '加载中...'
    })
  },
  onHide() {
    wx.hideLoading();
  },
  onUnload() {
    wx.hideLoading();
  },
  onShow:function(){
    this.getAddressList();
  },

  //查询已有收货地址
  getAddressList:function(){
    let that = this;
    let _parms={
      // userId: app.globalData.userInfo.userId,
      token: app.globalData.token
    }
    Api.AddressList(_parms).then((res) => {
      wx.hideLoading();
      if(res.data.code == 0){
        let _list=res.data.data.list;
        if (_list) {
          for (let i = 0; i < _list.length; i++) {
            if (_list[i].dictCounty && _list[i].dictCounty != 'null') {
              _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].dictCounty + _list[i].detailAddress;
            } else {
              _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].detailAddress;
            }
            if (_list[i].id == app.globalData.Express.id) {
              app.globalData.Express = _list[i]
            }
          }
          that.setData({
            address: _list
          })
        } else {
          app.globalData.Express = {};
        }
      } else {
        that.setData({
          address: []
        })
      }
    })
  },
  // 新增收货人地址
  addnewaddress: function () {
    wx.redirectTo({
      url: 'add-shipping/add-shipping?isnew=isnew',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  // 已有地址后编辑
  copyreader:function(e){
    let _id = e.currentTarget.id;
    // navigateTo
    wx.redirectTo({
      url:'add-shipping/add-shipping?id='+_id
    })
  },
  // 返回提交订单页面
  handli:function(e){
    let _id = e.currentTarget.id, _chatName = '', _area = '', _mobile = '', addressId = '', addressOjb={};
    for (let i = 0;i< this.data.address.length;i++){
      if (_id * 1 == this.data.address[i].id*1){
        _chatName = this.data.address[i].chatName;
        _area = this.data.address[i].address;
        _mobile = this.data.address[i].mobile;
        addressId = this.data.address[i].id;
        addressOjb = this.data.address[i]
      }
    }
    app.globalData.Express = addressOjb;
    console.log('-----------------------93');
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    wx.navigateBack({//返回
      delta: 1
    })
    console.log('-----------------------99');
  }
})



