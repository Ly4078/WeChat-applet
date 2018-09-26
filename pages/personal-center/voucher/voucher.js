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
    tabs:["提蟹券","赠送记录","领取记录"],
    ind: 0,  //tab下标
    page: 1, //  券页
    sendpage: 1,//赠送页
    recpage: 1,//收取页
    sendData: [],//赠送数据
    recData: []//收取数据
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
    if (this.data.ind == 0) {
      this.setData({
        page:  1,
        listData: []
      });
      this.getorderCoupon();
    } else if (this.data.ind == 1) {
      this.setData({
        sendpage:  1,
        sendData: []
      });
      this.getlistCoupon();
    } else if (this.data.ind == 2) {
      this.setData({
        recpage: 1,
        recData: []
      });
      this.getlistCoupon();
    } 
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.ind == 0){
      this.setData({
        page: this.data.page + 1
      });
      this.getorderCoupon();
    } else if (this.data.ind == 1) {
      this.setData({
        sendpage: this.data.sendpage + 1
      });
      this.getlistCoupon();
    } else if (this.data.ind == 2) {
      this.setData({
        recpage: this.data.recpage + 1
      });
      this.getlistCoupon();
    } 
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

  //点击ab
  handtab:function(e){
    let _ind = e.currentTarget.id;
    this.setData({
      ind:_ind
    });
    if(_ind == 0){
      this.getorderCoupon();
    }else if(_ind == 1){

      if (this.data.sendData.length>0){
      }else{
        this.getlistCoupon();
      }
    }else if(_ind == 2){
      if (this.data.recData.length > 0) {
      } else {
        this.getlistCoupon();
      }
    }
  },
  //查询我的礼品券列表数据 
  getorderCoupon: function () {
    wx.showLoading({
      title: '数据加载中...',
    });
    let _parms = {
      userId: app.globalData.userInfo.userId,
      page: this.data.page,
      // isUsed:0,
      rows: 10
    };
    if (this.data.page == 1) {
      this.setData({
        listData: []
      })
    }
    Api.orderCoupon(_parms).then((res) => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      if (res.data.code == 0) {
        let _data = this.data.listData, _list = res.data.data.list;
        if (_list && _list.length > 0) {
          for (let i = 0; i < _list.length; i++) {
            _list[i].sku = "公" + _list[i].maleWeight + " 母" + _list[i].femaleWeight + " 4对 " + _list[i].styleName + " | " + _list[i].otherMarkerPrice + "型";
            if (_list[i].ownId){
              if (_list[i].ownId != app.globalData.userInfo.userId){
                _list[i].isUsed = 1;
              }
            }
            _data.push(_list[i]);
          }
          this.setData({
            listData: _data
          })
        }
      }
    })
  },
  // 查询提蟹券赠送记录
  getlistCoupon:function(){
    let _parms ={},that = this;
    wx.showLoading({
      title: '数据加载中...',
    });
    _parms = {
      row:10
    },that = this;
    if (this.data.ind == 1) {//.赠送列表:sendUserId,page,rows
      _parms.page = this.data.sendpage;
      _parms.sendUserId = app.globalData.userInfo.userId;
    } else if (this.data.ind == 2) {//收取列表:receiveUserId,page,rows
      _parms.page = this.data.recpage;
      _parms.receiveUserId = app.globalData.userInfo.userId;
    }
    Api.listCoupon(_parms).then((res)=>{
      wx.hideLoading();
      wx.stopPullDownRefresh();
      if(res.data.code == 0){
        let _lists = res.data.data.list;
        if(_lists && _lists.length>0){
          if (this.data.ind == 1) {//.赠送列表
            // sendData: [],//赠送数据
            let _sendData = this.data.sendData;
            for(let i=0;i<_lists.length;i++){
               _lists[i].receiveUserName =  _lists[i].receiveUserName.substr(0, 3) + "****" +  _lists[i].receiveUserName.substr(7);
              _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
              _sendData.push(_lists[i]);
              that.setData({
                sendData: _sendData
              })
            }
          } else if (this.data.ind == 2) {//收取列表
            // recData: []//收取数据
            let _recData = this.data.recData;
            for (let i = 0; i < _lists.length; i++) {
              _lists[i].receiveUserName = _lists[i].receiveUserName.substr(0, 3) + "****" + _lists[i].receiveUserName.substr(7);
              _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
              _recData.push(_lists[i]);
              that.setData({
                recData: _recData
              })
            }
          }
        }
      }
    })
  },
  //立即兑换
  redeemNow: function (e) {
    let id = e.currentTarget.id, _skuName = e.currentTarget.dataset.index, _isUsed = e.currentTarget.dataset.used, _orderId = e.target.dataset.order;
    // if (_isUsed == 0){
      wx.navigateTo({
        url: '../../index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&skuname=' + _skuName
      })
    // }
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