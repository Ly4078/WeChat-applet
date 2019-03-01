import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var app = getApp();
let parse = null, flag = true;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    bankCardName: '',
    accountBankCard: '',
    lastAccount: '',
    inpMoney: '',
    userAmount: '',
    isUsed: false,
    isWithDraw: true,
    inputchange: false,
    serviceAmount: 0,
    serviceRatio: ''
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
          if (data.bankCardName) {
            let accountBankCard = '',
              lastAccount = '';
            accountBankCard = data.accountBankCard;
            lastAccount = accountBankCard.substring(accountBankCard.length - 4, accountBankCard.length);
            _this.setData({
              bankCardName: data.bankCardName ? data.bankCardName : '',
              accountBankCard: accountBankCard ? accountBankCard : '',
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
    let that = this;
    if (parse) {
      clearTimeout(parse);
    }
    let re = /^\d+(?=\.{0,1}\d+$|$)|^\d+(?=\.{0,1}$)/, val = e.detail.value;
    if (re.test(val)) {
      this.setData({
        inpMoney: val
      });
      if (this.data.inpMoney >= 10) {
        parse = setTimeout(() => {
          that.serviceCharge();
        }, 500);
      }
    } else {
      this.setData({
        inpMoney: ''
      });
    }
    console.log(+this.data.userAmount >= +this.data.inpMoney)
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
  serviceCharge(types) {  //获取服务费
    let that = this;
    wx.request({
      url: this.data._build_url + 'tx/getServiceAmount?cashAmount=' + this.data.inpMoney,
      method: 'GET',
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let data = res.data.data;
          if(types == 'all') {
            that.setData({
              inpMoney:data.cashAmount
            })
          }
          that.setData({
            inputchange: types == 'all' ? true : false,               
            cashAmount: data.cashAmount,
            serviceAmount: data.serviceAmount,
            serviceRatio: data.serviceRatio * 100 + '%'
          });
        }
      },
      fail() { }
    });
  },
  allAccount() { //全部提现
    this.setData({
      inpMoney: this.data.userAmount
    });
    if (this.data.inpMoney >= 10) {
      this.serviceCharge('all');
    }
  },
  submit() { //提现
    if (!flag) {
      return false;
    }
    let title = '';
    if (+this.data.userAmount == 0) {
      title = '无可提现余额';
    } else if (!this.data.bankCardName) {
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
    flag = false;
    let _this = this;
    wx.request({
      url: this.data._build_url + 'tx/userApply?cashAmount=' + this.data.cashAmount + '&serviceAmount=' + this.data.serviceAmount,
      method: 'POST',
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        //返回为大于0的数字则申请成功
        if (res.data.code == 0) {
          let data = res.data.data;
          if (data > 0) {
            wx.showToast({
              title: '提现成功',
              icon: 'none'
            })
            _this.setData({
              inpMoney: ''
            });
            _this.walletDetail();
          } else {
            wx.showToast({
              title: '提现失败',
              icon: 'none'
            })
          }
        }
        setTimeout(() => {
          flag = true;
        }, 1000);
      },
      fail() {
        setTimeout(() => {
          flag = true;
        }, 1000);
      }
    });
  }
})