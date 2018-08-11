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
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    this.setData({
      // 页面渲染完成
      customerInfo: customerInfo
    })
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
  // 返回商品详情
  backtrackwback:function(){
    wx.navigateTo({
      url: '../../golSdhopping/commodityDetails/commodityDetails',
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