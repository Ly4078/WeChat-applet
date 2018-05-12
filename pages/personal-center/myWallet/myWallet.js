import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js')
var app = getApp();
Page({
  data: {
    balance: '',
  },
  onLoad: function (options) {
    let _sumTotal = options.sumTotal
    this.setData({
      balance: _sumTotal
    })
  },
  detailParticulars: function () { //钱包明细
    wx.navigateTo({
      url: 'moneyDetail/moneyDetail',
    })
  },
  detailLoanBond: function () { //我的劵票
    wx.navigateTo({
      url: '../my-discount/my-discount',
    })
  },
  memberIngenious: function () { //会员积分
    wx.showToast({
      title: '待更新...',
      icon: 'none',
      duration: 2000
    })
  },
})