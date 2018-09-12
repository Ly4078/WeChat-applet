
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    address:[]
  },
  onLoad:function(){
    
  },
  onShow:function(){
    this.getAddressList();
  },
  //查询已有收货地址
  getAddressList:function(){
    let that = this;
    let _parms={
      userId: app.globalData.userInfo.userId
    }
    Api.AddressList(_parms).then((res) => {
      if(res.data.code == 0){
        let _list=res.data.data.list;
        for(let i=0;i<_list.length;i++){
          _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].dictCounty + _list[i].detailAddress;
        }
        that.setData({
          address: _list
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
    let _id = e.currentTarget.id, _chatName = '', _area = '', _mobile='',addressId='';
    for (let i = 0;i< this.data.address.length;i++){
      if (_id * 1 == this.data.address[i].id*1){
        _chatName = this.data.address[i].chatName;
        _area = this.data.address[i].address;
        _mobile = this.data.address[i].mobile;
        addressId = this.data.address[i].id;
      }
    }
 

    wx.redirectTo({
      url: '../../index/crabShopping/crabDetails/submitOrder/submitOrder?username=' + _chatName + '&address=' + _area + '&phone=' + _mobile + '&addressId=' + addressId,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})