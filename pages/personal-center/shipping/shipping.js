Page({
  data: {
    customerInfo: {
      address: [{
        addressId: 1,
        address: '湖北省武汉市硚口区人名西路302号明日财富大厦20层，迪吧拉亚公司研发部',
        consignee: '轩少',
        phone: 13985858585
      }, {
        addressId: 2,
        address: '湖北省武汉市硚口区人名西路302号明日财富大厦20层，迪吧拉亚公司研发部',
        consignee: '袁小娇',
        phone: 13985858585
      }
      ]
    }
  },
  onReady: function () {
    // this.setData({
    //   customerInfo: customerInfo
    // })
  },
  // 新增收货人地址
  download: function () {
    wx.navigateTo({
      url: 'add-shipping/add-shipping',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  // 已有地址后编辑
  copyreader:function(){
    wx.navigateTo({
      url: 'add-shipping/add-shipping',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  // 返回提交订单页面
  backtrackwback:function(){
    let username = this.data.customerInfo.address[0].consignee;
    let address = this.data.customerInfo.address[0].address;
    let phone = this.data.customerInfo.address[0].phone;
    wx.navigateTo({
      url: '../../index/crabShopping/crabDetails/submitOrder/submitOrder?username=' + username + '&address=' + address + '&phone=' + phone,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})