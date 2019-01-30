import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import Public from '../../../utils/public.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    showSkeleton: true,
    walletList: [   //钱包列表
      {
        id: 1,
        name: '我的金币',
        iconUrl: '/images/icon/gold.png',
        linkUrl:'/pages/personal-center/integratorMs/integratorMs'
      },
      {
        id: 2,
        name: '钱包明细',
        iconUrl: '/images/icon/bag.png',
        linkUrl: '/pages/personal-center/wallet/walletDetail/walletDetail'
      },
      {
        id: 3,
        name: '银行卡',
        iconUrl: '/images/icon/box.png',
        linkUrl: '/pages/personal-center/wallet/BanksCard/BanksCard'
      },
      {
        id: 4,
        name: '开票记录',
        iconUrl: '/images/icon/invoice.png',
        linkUrl: '/pages/personal-center/wallet/BillingRecord/BillingRecord'
      }
    ],
    userAmount: '0.00',
    accountStatus: '',
    cardBankname: '',
    accountName: '',
    passedAmount: '',  //已获得
    reviewAmount: '',  //审核中
    failAmount: ''     //已失效
  },
  onLoad: function (options) {
    let _this = this;
    setTimeout(() => {
      _this.setData({
        showSkeleton: false
      });
    }, 5000);
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
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let data = res.data.data;
          _this.setData({
            userAmount: data.userAmount ? data.userAmount.toFixed(2) : '0.00',
            accountStatus: data.accountStatus,
            cardBankname: data.cardBankname ? data.cardBankname: '',
            accountName: data.accountName ? data.accountName : '',
            accountCardholder: data.accountCardholder ? data.accountCardholder : '',
            passedAmount: data.passedAmount ? data.passedAmount : 0,
            reviewAmount: data.reviewAmount ? data.reviewAmount : 0,
            failAmount: data.failAmount ? data.failAmount : 0
          });
        }
        setTimeout(() => {
          _this.setData({
            showSkeleton: false
          });
        }, 500);
      },
      fail() {
        wx.stopPullDownRefresh();
      }
    });
  },
  toWithdraw() {  //跳转至提现
    wx.showModal({
      title: '提示',
      showCancel:false,
      content: '尊敬的用户：由于系统升级中，提现功能于2019年3月1日正式开发，开放后方可自由提现，如您有任何问题，请于2019年2月12日后拨打客服电话027-59728176进行咨询。如给您带来不便，敬请谅解。感谢您对享7购的支持！',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return false
    wx.navigateTo({
      url: 'withdraw/withdraw'
    })
  },
  toAward() {   //跳转至奖励进度
    wx.navigateTo({
      url: 'award/award?passedAmount=' + this.data.passedAmount + '&reviewAmount=' + this.data.reviewAmount + '&failAmount=' + this.data.failAmount
    })
  },
  toHref(e) {   //跳转
    let id = e.target.id;
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url,
      success:function(){},
      fail:function(){
        wx.switchTab({
          url: url,
        })
      }
    })
    // return
    // if (id == 1) {
    //   wx.navigateTo({
    //     url: '../integratorMs/integratorMs'
    //   })
    // } else if (id == 2) {
    //   wx.navigateTo({
    //     url: 'walletDetail/walletDetail'
    //   })
    // } else if (id == 3) {
    //   wx.navigateTo({
    //     url: 'BanksCard/BanksCard'
    //   })
    // }
  },
  onPullDownRefresh() {
    this.walletDetail();
  }
})