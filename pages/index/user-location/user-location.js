
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var app = getApp();
Page({
  data: {
    currentSite: "",
    latlng: [],
    resultPosition: [],
    hotcity: [
      { name: '武汉', open: '1' },
      { name: '十堰', open: '1' },
      { name: '北京', open: '0' },
      { name: '上海', open: '0' },
      { name: '广州', open: '0' },
      { name: '深圳', open: '0' },
      { name: '杭州', open: '0' },
      { name: '南京', open: '0' },
      { name: '长沙', open: '0' },
      { name: '成都', open: '0' },
      { name: '烏魯木齊', open: '0' }
    ]
  },
  onShow() {
    this.wxgetsetting()
    this.setData({
      resultPosition: []
    })
  },
  wxgetsetting: function () {  //若用户之前没用授权位置信息，则调整此函数请求用户授权
    let that = this
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
          wx.showModal({
            title: '提示',
            content: '享7要你的位置信息，快去授权',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({  //打开授权设置界面
                  success: (res) => {
                    if (res.authSetting['scope.userLocation']) {
                      wx.getLocation({
                        type: 'wgs84',
                        success: function (res) {
                          let latitude = res.latitude
                          let longitude = res.longitude
                          that.requestCityName(latitude, longitude)
                        }
                      })
                    }
                    if (res.authSetting['scope.userInfo']) {
                      wx.getUserInfo({
                        success: res => {
                          if (res.userInfo) {
                            that.setData({
                              iconUrl: res.userInfo.avatarUrl,
                              nickName: res.userInfo.nickName,
                            })
                            that.updatauser(res.userInfo)
                          }
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  requestCityName(lat, lng) {//获取当前城市
    app.globalData.userInfo.lat = lat
    app.globalData.userInfo.lng = lng
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        this.getmoredata()
        if (res.data.status == 0) {
          this.setData({
            city: res.data.result.address_component.city,
            alltopics: [],
            restaurant: [],
            service: []
          })
          app.globalData.userInfo.city = res.data.result.address_component.city
        }
      }
    })
  },
  updatauser: function (data) { //更新用户信息
    let that = this
    let _parms = {
      id: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId,
    }
    if (data.avatarUrl) {
      _parms.iconUrl = data.avatarUrl
    }
    if (data.nickName) {
      _parms.nickName = data.nickName
    }
    if (data.gender) {
      _parms.sex = data.gender
    }
    Api.updateuser(_parms).then((res) => {
      if (res.data.code == 0) {
        app.globalData.userInfo.nickName = data.nickName
        app.globalData.userInfo.iconUrl = data.avatarUrl
      }
    })
  },
  anewPosition() { //重新定位
    this.setData({
      currentSite: ""
    })
    this.getLoaction();
  },
  getLoaction() { //获取当前定位
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        let lat = res.latitude
        let lng = res.longitude
        this.requestCityName(lat, lng)
        that.setData({
          latlng: res
        })
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
  dangqian: function () {  //点击当前位置
    let _data = this.data.latlng
    wx.setStorageSync('lat', _data.latitude)
    wx.setStorageSync('lng', _data.longitude)
    wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
      url: '../../index/index'
    })
  },
  searchAddress(e) {  //输入搜索
    let value = e.detail.value;
    if (!value) {
      wx.showToast({
        title: '请输入地址',
        icon: 'none',
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
    let lat = '', lng = '';
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        lat = _data[i].location.lat;
        lng = _data[i].location.lng;
      }
    }
    wx.setStorageSync('lat', lat)
    wx.setStorageSync('lng', lng)
    wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
      url: '../../index/index'
    })
  },
  clickcity: function (e) {  //点击某个热门城市
    let that = this
    let ind = e.currentTarget.id
    let _data = this.data.hotcity
    for (let i = 0; i < _data.length; i++) {
      if (ind == i) {
        if (_data[i].open == 1) {
          wx.request({
            url: 'https://apis.map.qq.com/ws/place/v1/suggestion?keyword=' + _data[i].name + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: (res) => {
              that.setData({
                resultPosition: res.data.data
              })
            }
          })
        } else {
          wx.showToast({
            title: _data[i].name + '暂未开通，敬请期待!',
            mask: true,
            icon:'none',
            duration: 2000
          })
        }
      }
    }
  }
})
