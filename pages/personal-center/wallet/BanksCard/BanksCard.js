import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    cardBankname: '',
    accountName: '',
    accountCardholder: '',
    Encryption: ''
  },
  onLoad: function (options) {

  },
  onShow: function () {
    this.walletDetail();
  },
  onUnload: function () {
    
  },
  walletDetail() {
    let _this = this;
    wx.request({
      url: this.data._build_url + 'account/getUserAccount',
      method: 'POST',
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let data = res.data.data;
          _this.setData({
            accountType: data.accountType,
            cardBankname: data.cardBankname ? data.cardBankname : '',
            accountName: data.accountName ? data.accountName : '',
            accountCardholder: data.accountCardholder ? data.accountCardholder : '',
            Encryption: '**** **** **** ' + data.accountName.substr(-4)
          });
        }
      },
      fail() { }
    });
  },
  modifyCard() {
    wx.navigateTo({
      url: '../addBanksCard/addBanksCard?accountType=' + this.data.accountType + '&cardBankname=' + this.data.cardBankname + '&accountName=' + this.data.accountName +'&accountCardholder=' + this.data.accountCardholder
    })
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    
  },
  onShareAppMessage: function () {
    
  }
})