var utils = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    textValue:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getStorage({
      key: 'modi',
      success: function(res) {
        if(res.data){
          that.setData({
            textValue:res.data
          })
        }
      }
    })
  },

  bindFormSubmit:function(e){  //点击完成按钮
    let text = e.detail.value.textarea
    this.setData({
      textValue: text
    })
    // wx.setStorageSync('text', text)  //同步缓存数据
    wx.setStorage({
      key: "text",
      data: this.data.textValue
    })
    wx.setStorage({
      key: 'modi',
      data: '',
    })
    
    wx.redirectTo({
      url: '../dynamic-state'
    })

  }
})