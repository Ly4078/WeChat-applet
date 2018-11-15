Page({
  data: {
    storeList: []
  },
  onLoad: function(options) {
    console.log(options);
    this.setData({
      storeList: JSON.parse(options.storeList)
    });
    console.log(this.data.storeList);
  },
  // 电话号码功能
  calling: function (e) {
    let idx = e.target.id, storeList = this.data.storeList;
    console.log(idx);
    let that = this;
    if (storeList[idx].mobile) {
      wx.makePhoneCall({
        phoneNumber: storeList[idx].mobile,
        success: function() {
          console.log("拨打电话成功！")
        },
        fail: function() {
          console.log("拨打电话失败！")
        }
      })
    } else {
      wx.showToast({
        title: '商家没有设置',
        icon: 'none'
      })
    }
  },
  //打开地图导航，先查询是否已授权位置
  TencentMap: function (e) {
    let idx = e.target.id, storeList = this.data.storeList;
    console.log(idx);
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        //打开地图，已授权位置
        wx.openLocation({
          longitude: storeList[idx].locationX,
          latitude: storeList[idx].locationY,
          scale: 18,
          name: storeList[idx].salepointName,
          address: storeList[idx].address,
          success: function (res) { },
          fail: function (res) { }
        })
      }
    })
  },
  onReady: function() {

  },
  onShow: function() {

  },
  onHide: function() {

  },
  onUnload: function() {

  },
  onPullDownRefresh: function() {

  },
  onReachBottom: function() {

  },
  onShareAppMessage: function() {

  }
})