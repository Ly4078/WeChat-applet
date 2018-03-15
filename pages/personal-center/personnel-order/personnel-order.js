import Api from '../../../utils/config/api.js';
var app = getApp();
Page({
  data: {
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 15,
    order_list: [],
    page: 1,
    reFresh: true
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
      reFresh: true
    })
  },
  getOrderList: function () {       //获取订单列表
    let that = this;
    let _parms = {
      userId: this.data.userId,
      page: this.data.page,
      rows: 8
    };
    Api.somyorder(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data != null && data.data != "" && data.data != []) {
        let order_list = that.data.order_list;
        for (let i = 0; i < data.data.length; i++) {
          order_list.push(data.data[i]);
        }
        console.log(order_list)
        that.setData({
          order_list: order_list,
          reFresh: true
        });
      } else {
        that.setData({
          reFresh: false
        });
      }
    })
  },
  lowerLevel: function (ev) {
    let id = ev.currentTarget.id
    wx.navigateTo({
      url: '../lelectronic-coupons/lectronic-coupons?id=' + id + '&isPay=0'
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (this.data.reFresh) {
      this.setData({
        page: this.data.page + 1
      });
      this.getOrderList();
    }
  }
})