Page({

  /**
   * 页面的初始数据
   */
  data: {
    deimg: "https://xq-1256079679.file.myqcloud.com/test_363956872334670392_0.8.jpg",
    deimgid1:'https://xqmp4-1256079679.file.myqcloud.com/13297932982_xqrz0190123094732.jpg',
    isdown: false,
    erimg:'',
    _value:'http://a.app.qq.com/o/simple.jsp?pkgname=io.dcloud.H53DA2BA2'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var scene_img = 'https://xq-1256079679.file.myqcloud.com/test_796192610565959937_0.8.jpg'
    that.setData({
      scene: scene_img
    })
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
  previewImg: function (e) {
    wx.previewImage({
      urls: this.data.scene.split(',')
    })
  },
  //点击下载按钮
  handxz: function () {
    this.setData({
      isdown: false
    })
  },
  //复制链接
  copy: function () {
    wx.setClipboardData({
      data: this.data._value,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
            wx.showToast({
              title: '复制成功！',
              icon:'none'
            })
          }
        })
      }
    })
  },
})