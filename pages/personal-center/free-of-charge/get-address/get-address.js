
var app = getApp()

Page({
  data: {
    currentlng: '',
    currentlat:'',
    buslng: '',
    buslat: '',
    county:'',
    address:'',
    region: ['湖北省', '武汉市', '洪山区'],
    customItem: '全部',
    markers: [{
      iconPath: "/images/icon/origin.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 50,
      height: 50
    }],
    controls: [{
      id: 1,
      iconPath: "/images/icon/location1.png",
      position: {
        left:162,
        top: 265,
        width: 50,
        height: 50
      },
      clickable: true
    }]
  },
  onLoad: function (options){
    this.setData({
      address: options.deaddress
    })
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('maps')
  },
  onShow(){
    let _pic = app.globalData.picker
    let _reg = []
    _reg[0] = _pic.province
    _reg[1] = _pic.city
    _reg[2] = _pic.district
    this.setData({
      region:_reg,
      currentlng: app.globalData.userInfo.lng,
      currentlat: app.globalData.userInfo.lat,
      buslng: app.globalData.userInfo.lng,
      buslat: app.globalData.userInfo.lat,
    })
    // this.requestCityName(app.globalData.userInfo.lat, app.globalData.userInfo.lng)
  },
  onUnload(){
    let _region = this.data.region.join(",")
    _region = _region.replace(/,/g, '');
    let _data = {
      address: this.data.address,
      reg: _region,
      lat: this.data.buslat,
      lng: this.data.buslng
    }
    if (this.data.address == '') {
      _data.address = ''
    }
    wx.setStorage({
      key: 'address',
      data: _data,
    })
  },
  regionchange(e) { //拖动地图
    if(e.type == 'end'){
      this.getCenterLocation()
    }
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e)
    console.log(e.controlId)
  },
  
  getCenterLocation: function () { //获取当前地图中心坐标
    let that = this 
    this.mapCtx.getCenterLocation({
      success: function (res) {
        that.setData({
          buslng: res.longitude,
          buslat: res.latitude,
        })
        // that.requestCityName(res.latitude, res.longitude)
      }
    })
  },
  requestCityName: function (lat, lng) {//通过经纬度获取当前地理位置
    let that = this
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0) {
          that.setData({
            address: res.data.result.address
          });
        }
      }
    })
  },
  moveToLocation: function () {
    this.setData({
      buslng: this.data.currentlng,
      buslat: this.data.currentlat,
    })
    this.mapCtx.moveToLocation()
  },
  bindRegionChange: function (e) {
    let that = this
    let _value = e.detail.value
    this.setData({
      region: e.detail.value
    })
    wx.request({
      url: 'https://apis.map.qq.com/ws/place/v1/suggestion?keyword=' + _value[2] + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0){
          let _data = res.data.data
          that.setData({
            lng: _data[0].location.lng,
            lat: _data[0].location.lat
          })
        }
      }
    })
  },
  inperFigure(e){
    let _value = e.detail.value
    this.setData({
      address:_value
    })
  },
  define:function(){
    let _region = this.data.region.join(",")
    _region = _region.replace(/,/g, '');
    if (this.data.address == ''){
      wx.showToast({
        title: '请输入详细地址，以方便顾客能准确到店',
        mask: true,
        icon: 'none',
        duration: 2000
      })
      return false
    }
    let _data = {
      address: this.data.address,
      reg: _region,
      lat: this.data.buslat,
      lng: this.data.buslng
    }
    wx.setStorage({
      key: 'address',
      data: _data,
    })
    wx.navigateBack({
      delta: 1
    })
  }
})