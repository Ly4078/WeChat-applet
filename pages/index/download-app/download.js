Page({

  /**
   * 页面的初始数据
   */
  data: {
    deimg: "https://xq-1256079679.file.myqcloud.com/test_363956872334670392_0.8.jpg",
    deimgid1:'https://xq-1256079679.file.myqcloud.com/test_325919865351719177_0.3.jpg',
    // deimgid1:'/images/icon/img123.png',
    isdown: false,
    erimg:'https://xq-1256079679.file.myqcloud.com/test_796192610565959937_0.8.jpg',
    _value:'https://xqmp4-1256079679.file.myqcloud.com/test_H567B9652_0709203519.apk'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.isshop == 'yes') {
      this.setData({
        isdown: true
      })
    } else if (options.isshop == 'ind'){
      this.setData({
        isdown: false
      })
    }else{
      this.setData({
        isdown: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  previewImg: function (e) {
    let that = this,arr=[];
    arr.push(this.data.erimg);
    wx.previewImage({
      current: that.data.erimg,     //当前图片地址
      urls: arr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //点击下载按钮
  handxz: function () {
    this.setData({
      isdown: false
    })
  },
  copy: function () {
    wx.setClipboardData({
      data: this.data._value,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
            wx.showToast({
              title: '复制成功！',
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})