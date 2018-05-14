import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js')
var app = getApp();
Page({
  data: {
    balance: '',
  },
  onLoad: function () { 
    let _account = {//查询余额
      userId: app.globalData.userInfo.userId
    }
    Api.accountBalance(_account).then((res) => { 
      if (res.data.code == 0) {
        let _data = res.data;
        if (_data.data == 0){
          this.setData({
            balance:0
          })
        }else{
          this.setData({
            balance: _data.data
          })
        }
      }
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
  }
})