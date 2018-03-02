// var postsData = require('/../../../data/posts-data.js')

Page({
  data: {
    currentSite: "",
    positionArr: []
  },
  onLoad() {
    this.getLoaction();
  },
  anewPosition() {
    this.setData({
      currentSite: ""
    })
    this.getLoaction();
  },
  getLoaction() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        this.requestCityName(latitude, longitude);
      }
    })
  },
  requestCityName(latitude, longitude) {//获取当前位置
    wx.request({
      url: 'http://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + "," + longitude + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        this.setData({
          currentSite: res.data.result.address
        })
      }
    })
  },
  searchAddress(e) {
    let value = e.detail.value;
    wx.request({
      url: 'http://apis.map.qq.com/ws/place/v1/suggestion?keyword=' + value + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log(res.data.data)
        this.setData({
          resultPosition: res.data.data
        })
        console.log(this.resultPosition)
      }
    })
  },
  selectAddress(e) {//选择地点
    wx.setStorage({
      key: "address",
      data: e.currentTarget.dataset['title']
    })
    wx.switchTab({
      url: '../../index/index'
    })
  }
})
