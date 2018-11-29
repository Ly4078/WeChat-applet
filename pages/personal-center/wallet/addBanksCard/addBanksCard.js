import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var BC = require("../../../../utils/bankCardAttribution.js");
var app = getApp();
var timer = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    accountType: '',
    cardBankname: '',
    accountName: '',
    accountCardholder: '',
    isSubmit: false
  },
  onLoad: function(options) {
    this.setData({
      accountType: options.accountType
    });
    if (this.data.accountType == 3) {
      this.setData({
        isSubmit: true,
        cardBankname: options.cardBankname,
        accountName: options.accountName,
        accountCardholder: options.accountCardholder
      });
      if (!options.cardBankname) {
        let bankCard = BC.default.bankCardAttribution(options.accountName);
        if (bankCard != 'error') {
          this.setData({
            cardBankname: bankCard.bankName
          });
        }
      }
    }
  },
  onShow: function() {
    
  },
  onUnload: function () {
    clearInterval(timer);
  },
  inpCard(e) {
    clearInterval(timer);
    let id, value, _this;
    id = e.target.id;
    value = e.detail.value;
    _this = this;
    if (id == 1) {
      this.setData({
        accountCardholder: value
      });
    } else if (id == 2) {
      let num = 1;
      timer = setInterval(() => {
        console.log(123);
        if (num * 500 >= 2000) {
          _this.setData({
            accountName: value
          });
          if (value.length > 4) {
            let bankCard = BC.default.bankCardAttribution(value);
            if (bankCard != 'error') {
              _this.setData({
                cardBankname: bankCard.bankName,
                isSubmit: true
              });
            } else {
              _this.setData({
                cardBankname: ''
              });
            }
          } else {
            _this.setData({
              cardBankname: ''
            });
          }
          clearInterval(timer);
        }
        num++;
      }, 500);
    } else if (id == 3) {
      this.setData({
        cardBankname: value
      });
    }
    if (this.data.accountCardholder && this.data.accountName && this.data.cardBankname) {
      this.setData({
        isSubmit: true
      });
    } else {
      this.setData({
        isSubmit: false
      });
    }
  },
  submit() {
    if (!this.data.cardBankname || !this.data.accountName || !this.data.accountCardholder) {
      wx.showToast({
        title: '请完善银行信息',
        icon: 'none'
      })
      return;
    }
    let _this = this,
      str = '',
      _url = '';
    let _param = {
      cardBankname: this.data.cardBankname, //银行
      accountName: this.data.accountName, //银行卡号
      accountCardholder: this.data.accountCardholder, //持卡人姓名
      accountType: 3
    }
    for (let key in _param) {
      str += key + '=' + _param[key] + '&';
    }
    str = str.substring(0, str.length - 1);
    _url = encodeURI(_this.data._build_url + 'account/updateBank?' + str);
    wx.request({
      url: _url,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          if (res.data.data > 0) {
            wx.navigateBack({
              delta: 1
            })
          }
          11111
        }
      },
      fail() {}
    });
  },
  onPullDownRefresh: function() {

  },
  onReachBottom: function() {

  },
  onShareAppMessage: function() {

  }
})