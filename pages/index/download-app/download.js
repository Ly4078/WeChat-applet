Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  downloadandroid:function(e){
    wx.navigateTo({
      url: './downloadH5/downloadH5',
    })
  },
  downloadBtn: function (e) {
    wx.showToast({
      title: '抱歉!待更新后可下载',
      icon: 'none',
    })
  },
  cleardownload(){
    const downloadTask = wx.downloadFile({
      url: 'https://xq-1256079679.file.myqcloud.com/test_247008125620330980_1.0.jpg',
      success: function (res) {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: function (res) {
            var savedFilePath = res.savedFilePath;
            wx.showToast({
              title: '保存成功',
            })
            console.log('savedFilePath:', savedFilePath)
            wx.getSavedFileList({
              success: function (res) {
                console.log('getSavedFileList')
                console.log(res.fileList)
              }
            })
          }
        })
      }
    })
    downloadTask.onProgressUpdate((res) => {
      console.log('下载进度', res.progress)
      console.log('已经下载的数据长度', res.totalBytesWritten)
      console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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