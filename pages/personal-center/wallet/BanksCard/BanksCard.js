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
    id: '',
    bankCardName: '',
    accountBankCard: '',
    accountCardholderName: '',
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
            id: data.id,
            bankCardName: data.bankCardName ? data.bankCardName : '',
            accountBankCard: data.accountBankCard ? data.accountBankCard : '',
            accountCardholderName: data.accountCardholderName ? data.accountCardholderName : '',
            Encryption: data.accountBankCard ? '**** **** **** ' + data.accountBankCard.substr(-4) : '',
            accountIdentityCard: data.accountIdentityCard ? data.accountIdentityCard : '',
            bankCardPhone: data.bankCardPhone ? data.bankCardPhone : ''
          });
        }
      },
      fail() { }
    });
  },
  modifyCard() {
    wx.navigateTo({
      url: '../addBanksCard/addBanksCard?id=' + this.data.id +'&bankCardName=' + this.data.bankCardName + '&accountBankCard=' + this.data.accountBankCard + '&accountCardholderName=' + this.data.accountCardholderName + '&accountIdentityCard=' + this.data.accountIdentityCard + '&bankCardPhone=' + this.data.bankCardPhone
    })
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    
  },
  onShareAppMessage: function () {
    
  }
})