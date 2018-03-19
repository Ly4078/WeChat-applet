import Api from '../../../utils/config/api.js';
var app = getApp();
Page({
  data: {
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 1,
    order_list: [],
    page: 1,
    reFresh: true,
    completed: true,
    currentTab: ''
  },
  onLoad: function (options) {

  },
  onShow: function () {
    this.getOrderList();
  },
  onHide: function () {
    this.setData({
      order_list: [],
      page: 1,
      reFresh: true,
      completed: true,
      currentTab: ''
    })
  },
  swichNav: function (event) {
    this.setData({
      order_list: [],
      page: 1,
      reFresh: true,
      completed: true,
      currentTab: event.currentTarget.dataset.current
    })
    this.getOrderList();
  },
  getOrderList: function () {       //获取订单列表
    let that = this;
    let _parms = {
      userId: this.data.userId,
      page: this.data.page,
      rows: 4,
      soStatus: this.data.currentTab
    };
    Api.somyorder(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data != null && data.data != "" && data.data != []) {
        let order_list = that.data.order_list;
        for (let i = 0; i < data.data.length; i++) {
          order_list.push(data.data[i]);
        }
        that.setData({
          order_list: order_list,
          reFresh: true
        });
      } else {
        that.setData({
          reFresh: false
        });
      }
    });
    if (this.data.currentTab == 2) {
      let _parms = {
        userId: this.data.userId,
        page: this.data.page,
        rows: 4,
        soStatus: 3
      };
      Api.somyorder(_parms).then((res) => {
        let data = res.data;
        if (data.code == 0 && data.data != null && data.data != "" && data.data != []) {
          let order_list = that.data.order_list;
          for (let i = 0; i < data.data.length; i++) {
            order_list.push(data.data[i]);
          }
          that.setData({
            order_list: order_list,
            completed: true
          });
        } else {
          that.setData({
            completed: false
          });
        }
      });
    }
  },
  lowerLevel: function (e) {
    let id = e.currentTarget.id,
      sostatus = e.currentTarget.dataset.sostatus;
    if (sostatus == 1) {
      wx.navigateTo({
        url: '/pages/index/voucher-details/voucher-details'
      })
    } else if (sostatus == 2 || sostatus == 3) {
      wx.navigateTo({
        url: '../lelectronic-coupons/lectronic-coupons?id=' + id
      })
    }
  },
  //用户上拉触底
  onReachBottom: function () {
    if (this.data.currentTab != 2 && this.data.reFresh) {
      this.setData({
        page: this.data.page + 1
      });
      this.getOrderList();
    }
    if (this.data.currentTab == 2 && (this.data.reFresh || this.data.completed)) {
      this.setData({
        page: this.data.page + 1
      });
      this.getOrderList();
    }
  }
})