Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgArr: [
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1520672766&di=8c0cd8047f8bc0c504b700f59f7c2e58&imgtype=jpg&er=1&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimage%2Fc0%253Dpixel_huitu%252C0%252C0%252C294%252C40%2Fsign%3Df7df1ef248166d222c7a1dd42f5b6c9b%2F5ab5c9ea15ce36d3771d1a0931f33a87e950b1ea.jpg',
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1520672784&di=62d46383278101baba0677b400049c01&imgtype=jpg&er=1&src=http%3A%2F%2Fpic.58pic.com%2F00%2F89%2F10%2F66bOOOPICf7.jpg',
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1520672804&di=42ef3aa3fd2301c978ed30f7c03e0962&imgtype=jpg&er=1&src=http%3A%2F%2Fpic41.nipic.com%2F20140510%2F9899750_115407754000_2.jpg'
    ]
  },
  amplification: function (e) {
    console.log(e.currentTarget.dataset.index);
    var index = e.currentTarget.dataset.index;
    var imgArr = this.data.imgArr;
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})