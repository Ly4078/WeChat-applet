Page({
  data: {
    address: [{
      address: '核销劵',
      consignee: '2018-08-04',
      phone: "+5",
    }, {
      address: '帮砍价',
      consignee: '2018-02-04',
      phone: "+6",
    }, {
      address: '核销劵',
      consignee: '2018-05-04',
      phone: "-7"
    }, {
      address: '分享获得',
      consignee: '2018-08-04',
      phone: "+20",
    },]
  },

  onReady: function () {

  },

  // 金币商城直通车
  goldPath: function () {
    wx.navigateTo({
      url: '../../golSdhopping/golSdhopping',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  onShow: function () {

  },
})