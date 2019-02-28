import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var BC = require("../../../../utils/bankCardAttribution.js");
var app = getApp();
var timer = null, codeTimer = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    formList: [{
        name: '卡号',
        type: 'number',
        placeholder: '请输入银行卡号',
        maxlength: 19,
        value: ''
      },
      {
        name: '银行名称',
        type: 'text',
        placeholder: '请输入银行名称',
        maxlength: 14,
        value: ''
      },
      {
        name: '持卡人',
        type: 'text',
        placeholder: '请输入持卡人姓名',
        maxlength: 8,
        value: ''
      },
      {
        name: '身份证',
        type: 'text',
        placeholder: '请输入身份证号码',
        maxlength: 20,
        value: ''
      },
      {
        name: '手机号',
        type: 'number',
        placeholder: '银行预留手机号',
        maxlength: 11,
        value: ''
      },
      {
        name: '验证码',
        type: 'number',
        placeholder: '输入验证码',
        maxlength: 6,
        value: ''
      }
    ],
    id: '',
    accountType: 3,
    isSubmit: false,
    codeTxt: '获取验证码',
    verifyId: '',
    codeFlag: true,
    countdown: 60,
    isSave: false
  },
  onLoad: function(options) {
    let that = this;
    this.setData({
      id: options.id
    });
    if (options.accountBankCard) {
      wx.getStorage({
        key: 'countdown',
        success(res) {
          if (res.data && new Date().getTime() < res.data) {
            let countdown = Math.ceil((res.data - new Date().getTime()) / 1000);
            that.setData({
              codeTxt: '倒计时' + countdown + '秒',
              countdown: countdown,
              codeFlag: false
            });
            that.codeCountdown(countdown);
          }
        }
      })
      if (!options.bankCardName) {
        let bankCard = BC.default.bankCardAttribution(options.accountBankCard);
        if (bankCard != 'error') {
          options.bankCardName = bankCard.bankName;
        }
      }
      let formList = this.data.formList;
      formList[0].value = options.accountBankCard;
      formList[1].value = options.bankCardName;
      formList[2].value = options.accountCardholderName;
      formList[3].value = options.accountIdentityCard;
      formList[4].value = options.bankCardPhone;
      this.setData({
        formList: formList
      });
    }
  },
  onUnload: function() {
    if (this.data.countdown < 60 && !this.data.isSave) {
      this.saveCountdown();
    } else {
      wx.setStorageSync('countdown', 0);
    }
    clearInterval(timer);
    clearInterval(codeTimer);
  },
  inpCard(e) {
    clearInterval(timer);
    let id, value, that, formList, inpNum = 0;
    id = e.target.id;
    value = e.detail.value;
    that = this;
    formList = this.data.formList;
    if (id == 0 && value.length > 4) {
      let num = 1;
      timer = setInterval(() => {
        if (num * 500 >= 2000) {
          let bankCard = BC.default.bankCardAttribution(value);
          if (bankCard != 'error') {
            formList[1].value = bankCard.bankName;
          }
          clearInterval(timer);
        }
        num++;
      }, 500);
    }
    formList[id].value = value;
    this.setData({
      formList: formList
    });
    for (let i = 0; i < formList.length; i++) {
      if(formList[i].value) {
        inpNum++;
      }
    }
    if (inpNum >= 6) {
      this.setData({
        isSubmit: true
      });
    } else {
      this.setData({
        isSubmit: false
      });
    }
  },
  getCode() { //获取验证码
    let that = this, shopMobile = this.data.formList[4].value, _url = '';
    let vaild_rule = /^[1][3456789][0-9]{9}$/;
    if (!vaild_rule.test(shopMobile)) {
      this.toast('请填写正确的手机号');
      return;
    }
    if (!this.data.codeFlag) {
      return;
    }
    this.setData({
      codeFlag: false
    });
    let countdown = that.data.countdown;
    this.codeCountdown(countdown);
    _url = encodeURI(that.data._build_url + 'sms/sendForPayBinding?shopMobile=' + shopMobile);
    wx.request({
      url: _url,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        that.setData({
          verifyId: res.data.data.verifyId   //验证码
        });
      },
      fail: function (res) {}
    });
  },
  submit() {
    let formList = this.data.formList;
    for (let i = 0; i < formList.length; i++) {
      if (!formList[i].value) {
        this.toast('请完善银行卡信息');
        return;
      }
      if (formList[3].value.length < 15) {
        this.toast('请输入正确身份证');
        return;
      }
    }
    if (this.data.verifyId && this.data.verifyId != this.data.formList[5].value) {
      this.toast('验证码错误');
      return;
    }
    if (!this.data.isSubmit) {
      return;
    }
    this.setData({
      isSubmit: false
    });
    let that = this,
      _param = {},
      str = '',
      _url = '';
    let bankCardName = formList[1].value.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5]/g, '');
    let accountCardholderName = formList[2].value.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5]/g, '');
    let accountIdentityCard = formList[3].value.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5]/g, '');
    _param = {
      id: this.data.id,   //账户id
      accountType: this.data.accountType,
      accountBankCard: formList[0].value,   //银行卡号
      bankCardName: bankCardName,  //银行名称
      accountCardholderName: accountCardholderName,  //持卡人姓名
      accountIdentityCard: accountIdentityCard,  //身份证号
      bankCardPhone: formList[4].value,    //手机号
      msg: formList[5].value    //验证码
    }
    for (let key in _param) {
      str += key + '=' + _param[key] + '&';
    }
    str = str.substring(0, str.length - 1);
    _url = encodeURI(that.data._build_url + 'account/updatePayBinding?' + str);
    wx.request({
      url: _url,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            isSave: true
          });
          if (res.data.data > 0) {
            wx.navigateBack({
              delta: 1
            })
          }
        } else {
          let formList = that.data.formList;
          formList[5].value = '';
          that.setData({
            formList: formList
          });
          that.toast(res.data.message);
        }
      },
      fail() {}
    });
  },
  codeCountdown(countdown) {   //倒计时回调
    let that = this;
    codeTimer = setInterval(function () {
      let txt = '';
      if (countdown > 1) {
        countdown--;
        txt = '倒计时' + countdown + '秒';
      } else {
        txt = '重新获取验证码';
        countdown = 60;
        that.setData({
          codeFlag: true
        });
        clearInterval(codeTimer);
      }
      that.setData({
        codeTxt: txt,
        countdown: countdown
      });
    }, 1000);
  },
  saveCountdown() {   //保存倒计时
    let countdown = new Date().getTime() + this.data.countdown * 1000;
    wx.setStorageSync('countdown', countdown);
  },
  toast(txt) {
    wx.showToast({
      title: txt,
      icon: 'none'
    })
  }
})