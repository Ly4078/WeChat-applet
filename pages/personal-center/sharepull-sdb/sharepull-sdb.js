var IMG_URL = 'https://xqmp4-1256079679.file.myqcloud.com/text_467423542831026840.png'//图片链接 https开头
Page({
  data: {
    img_url: IMG_URL
  },
  saveImgToPhotosAlbumTap: function () {
    wx.downloadFile({
      url: IMG_URL,
      success: function (res) {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500
            })
          },
          fail: function (res) {
            console.log(res)
            console.log('fail')
          }
        })
      },
      fail: function () {
        console.log('fail')
      }
    })

  },
  onShareAppMessage: function () {
    return {
      title: '就差你了,一起来注册领享7劵吧',
      desc: '就差你了,一起来注册领享7劵吧',
      path: 'pages/personal-center/securities-sdb/securities-sdb',
      imageUrl: 'https://xq-1256079679.file.myqcloud.com/test_242386103115353639_0.8.jpg',
    }
  }
})
