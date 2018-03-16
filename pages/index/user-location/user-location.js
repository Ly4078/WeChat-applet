Page({
  data: {
    currentSite: "",
    positionArr: []
  },
  onLoad() {
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
      }
    })
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
        let latitude = res.latitude
        let longitude = res.longitude
        this.requestCityName(latitude, longitude);
      }
    })
  },
  requestCityName(latitude, longitude) {//获取当前位置
    let that = this;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + "," + longitude + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        that.setData({
          currentSite: res.data.result.address
        })
      }
    })
  },
  searchAddress(e) {
    let value = e.detail.value;
    if(!value){
      wx.showToast({
        title: '请输入地址',
        icon:'none',
        duration: 1500
      })
      return false;
    }
    let that = this;
    wx.request({
      url: 'https://apis.map.qq.com/ws/place/v1/suggestion?keyword=' + value + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        that.setData({
          resultPosition: res.data.data
        })
      }
    })
  },
  selectAddress: function (event) { //选择地点
    const id = event.currentTarget.id;
    const _data = this.data.resultPosition;
    let lat='',lng='';
    for (let i = 0; i < _data.length;i++){
      if(id == _data[i].id){
        lat = _data[i].location.lat;
        lng = _data[i].location.lng;
      }
    }
    wx.setStorage({  //将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容
      key: "lat",
      data:lat
    })
    wx.setStorage({
        key: 'lng',
        data: lng
    })

    wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
      url: '../../index/index'
    })
  }
})
