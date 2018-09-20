
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
    chatName:'',
    mobile: '',
    area: '',
    vouId:'',
    vouSku:'',
    remarks: '', //备注内容
    date: '', //默认日期
    threeLater: '', //三天后
    tenLater: '' //十天后
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      vouId: options.id,
      vouSku: options.skuName
    })
    console.log(this.data)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    let id = this.data.id, _skuName = this.data.skuName;
    console.log('id:', id, '_skuName:', _skuName)
    return {
      title: _skuName,
      path: '/pages/personal-center/voucher/voucherDetails/voucherDetails?id=' + id + '&skuname=' + _skuName,
      success: function (res) { }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _day = 60 * 60 * 24 * 1000,
      _today = '',
      hours = '',
      _threeday = '',
      _tenday = '';
    _today = new Date();
    hours = _today.getHours();
    if (hours >= 17) {
      _threeday = _today.getTime() + _day * 4;
      _tenday = _today.getTime() + _day * 11;
    } else {
      _threeday = _today.getTime() + _day * 3;
      _tenday = _today.getTime() + _day * 10;
    }

    _threeday = new Date(_threeday);
    _tenday = new Date(_tenday);
    _today = utils.dateConv(_today, '-');
    _threeday = utils.dateConv(_threeday, '-');
    _tenday = utils.dateConv(_tenday, '-');
    this.setData({
      threeLater: _threeday,
      tenLater: _tenday,
      date: _threeday
    })
    
    if (app.globalData.Express.chatName){
      this.setData({
        chatName: app.globalData.Express.chatName,
        area: app.globalData.Express.area,
        mobile: app.globalData.Express.mobile,
        addressId: app.globalData.Express.addressId
      })
    }else{
      this.getAddressList();
    }
    console.log(app.globalData.Express)
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
    app.globalData.Express = {
      chatName: '',
      area: '',
      mobile: '',
      addressId: ''
    };
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


  //查询已有收货地址
  getAddressList: function () {
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId
    }
    Api.AddressList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data.list) {
        let _list = res.data.data.list,
          actList = {};
        for (let i = 0; i < _list.length; i++) {
          _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].dictCounty + _list[i].detailAddress;
        }

        this.setData({
          chatName: _list[0].chatName,
          area: _list[0].address,
          mobile: _list[0].mobile,
          addressId: _list[0].id
        })
        app.globalData.Express = {
          chatName: _list[0].chatName,
          area: _list[0].address,
          mobile: _list[0].mobile,
          addressId: _list[0].id
        };
      } else {
        app.globalData.Express = {
          chatName: '',
          area: '',
          mobile: '',
          addressId: ''
        };
      }
    })
  },
  // 选择收货地址
  additionSite: function () {
    wx.navigateTo({
      url: '../../../personal-center/shipping/shipping',
    })
  },
  //选择送达时间
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  //赠送好友
  giveFriend:function(){
    console.log('giveFriend')
  },
  //立即兑换
  redeemNow:function(){
    console.log('redeemNow')
  }
})