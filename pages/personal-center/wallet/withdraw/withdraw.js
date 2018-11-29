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
    lastAccount: '',
    inpMoney: '',
    userAmount: '',
    isUsed: false,
    isWithDraw: true
  },
  onLoad: function(options) {

  },
  onShow: function() {
    this.walletDetail();
  },
  onUnload: function() {

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
      success: function(res) {
        if (res.data.code == 0) {
          let data = res.data.data;
          _this.setData({
            accountType: data.accountType,
            userAmount: data.userAmount ? data.userAmount.toFixed(2) : 0
          });
          if (_this.data.userAmount > 0) {
            _this.setData({
              isUsed: true
            });
          } else {
            _this.setData({
              isUsed: false
            });
          }
          if (data.accountType == 3) {
            let accountName = '',
              lastAccount = '';
            accountName = data.accountName;
            lastAccount = accountName.substring(accountName.length - 4, accountName.length);
            _this.setData({
              cardBankname: data.cardBankname ? data.cardBankname : '',
              accountName: accountName ? accountName : '',
              lastAccount: lastAccount
            });
          }
        }
      },
      fail() {}
    });
  },
  toAddCard() { //跳转至编辑银行卡
    wx.navigateTo({
      url: '../BanksCard/BanksCard'
    })
  },
  inpFunc(e) { //输入金额
    let re = /^\d+(?=\.{0,1}\d+$|$)|^\d+(?=\.{0,1}$)/, val = e.detail.value;
    if (re.test(val)) {
      this.setData({
        inpMoney: val
      });
    } else {
      this.setData({
        inpMoney: ''
      });
    }
    if (+this.data.userAmount < +this.data.inpMoney) {
      this.setData({
        isWithDraw: false
      });
    } else {
      this.setData({
        isWithDraw: true
      });
    }
  },
  allAccount() { //全部提现
    this.setData({
      inpMoney: this.data.userAmount
    });
  },
  submit() { //提现
    let title = '';
    if (+this.data.userAmount == 0) {
      title = '无可提现余额';
    } else if (+this.data.accountType != 3) {
      title = '请添加银行卡号';
    } else if (+this.data.inpMoney > +this.data.userAmount) {
      title = '输入金额超过钱包余额';
    } else if (+this.data.inpMoney < 10) {
      title = '提现金额不小于10元';
    }
    if (title) {
      wx.showToast({
        title: title,
        icon: 'none'
      })
      return;
    }
    let _this = this;
    wx.request({
      url: this.data._build_url + 'tx/userApply?cashAmount=' + this.data.inpMoney,
      method: 'POST',
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        //返回为大于0的数字则申请成功
        if (res.data.code == 0) {
          let data = res.data.data;
          console.log(data);
          if (data > 0) {
            wx.showToast({
              title: '提现成功',
              icon: 'none'
            })
            _this.walletDetail();
          } else {
            wx.showToast({
              title: '提现失败',
              icon: 'none'
            })
          }
        }
      },
      fail() {}
    });
  }
})