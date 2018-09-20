Page({
  data: {
    
  },
  onLoad: function (options) {
    let supermarket = [
      {
        name:'中商超市',
        place:'(汉口店)',
        images:'https://xqmp4-1256079679.file.myqcloud.com/Colin_fafadfasdafs.jpg'
      },
      {
        name: '中商超市',
        place: '(武汉店)',
        images: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_fafadfasdafs.jpg'
      },
      {
        name: '中商超市',
        place: '(汉阳店)',
        images: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_fafadfasdafs.jpg'
      },
      {
        name: '中商超市',
        place: '(大洋店)',
        images: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_fafadfasdafs.jpg'
      },
      {
        name: '中商超市',
        place: '(恩施店)',
        images: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_fafadfasdafs.jpg'
      }
    ]

    this.setData({
      postList: supermarket
    })
  },
  onShow: function () {
    
  },
})