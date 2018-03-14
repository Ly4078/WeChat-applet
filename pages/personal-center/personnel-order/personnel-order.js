import Api from '../../../utils/config/api.js';
var app = getApp();
Page({

  data: {
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 15,
    page: 1
  },
  onLoad: function (options) {
    this.getOrderList();
  },
  getOrderList: function() {       //获取订单列表
    let that = this;
    let _parms = { 
      userId: this.data.userId,
      page: this.data.page,
      rows: 8
    };
    Api.somyorder(_parms).then((res) => {
      var data = res.data;
      if (data.code == 0) {
        that.setData({
          order_list: data.data
        });
        console.log(data.data);
      }
    })
  },
  lowerLevel:function(ev){
    let id = ev.currentTarget.id
    wx.navigateTo({
      url: '../lelectronic-coupons/lectronic-coupons?id=' + id + '&isPay=0'
    })
  }
})