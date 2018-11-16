
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var app = getApp();

var village_LBS = function (that) {
  wx.getLocation({
    success: function (res) {
      console.log("aaaares:",res)
      let latitude = res.latitude;
      let longitude = res.longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}


Page({
  data: {
    currentSite: "",
    latlng: [],
    resultPosition: [],
    isshowlocation:false,
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
  onLoad(){
   
  },
  onShow() {
    this.setData({
      resultPosition: []
    })
    this.wxgetsetting()
  },
  wxgetsetting: function () {  //若用户之前没用授权位置信息，则调整此函数请求用户授权
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        // let latitude = res.latitude, longitude = res.longitude;
        // that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
            that.setData({
              isshowlocation: true
            })

            }
          }
        })
      }
    })
  },
  openSetting() {//打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权          
          
          // that.getUserlocation();
          // village_LBS(that);
          wx.getLocation({
            success: function (res) {
              let latitude = res.latitude,
                longitude = res.longitude;
              that.requestCityName(latitude, longitude);
            },
          })
        } else {
  
        //   let lat = '32.6226',
        //     lng = '110.77877';
        //   that.requestCityName(lat, lng);
        }
      }
    })
    
  },
  updatauser: function (data) { //更新用户信息
    let that = this, _parms = {};
    _parms = {
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
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        let lat = res.latitude,lng = res.longitude;
        app.globalData.userInfo.lat = lat;
        app.globalData.userInfo.lng = lng;
        that.requestCityName(lat, lng)
        that.setData({
          latlng: res
        })
      }
    })
  },
  requestCityName(latitude, longitude) {//获取当前位置
    let that = this;
    console.log('requestCityName:', latitude, longitude)
    app.globalData.userInfo.lat = latitude;
    app.globalData.userInfo.lng = longitude;
   
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + "," + longitude + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log('cityres:',res);
        let _city = res.data.result.address_component.city;
        if (_city == '十堰市' || _city == '武汉市') {
          app.globalData.userInfo.city = _city;
        } else {
          app.globalData.userInfo.city = '十堰市';
        }
        that.setData({
          currentSite: res.data.result.address
        })
        app.globalData.changeCity=true;
        console.log('2132131')
        setTimeout(function(){
          wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
            url: '../../index/index'
          })
        },2000)
      }
    })
  },
  dangqian: function () {  //点击当前位置
    let _data = this.data.latlng;
    wx.setStorageSync('lat', _data.latitude);
    wx.setStorageSync('lng', _data.longitude);
    app.globalData.userInfo.lat = _data.latitude;
    app.globalData.userInfo.lng = _data.longitude;
    // app.globalData.userInfo.city = city;
    app.globalData.changeCity = true;
    wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
      url: '../../index/index'
    })
  },
  searchAddress(e) {  //输入搜索
    let value = e.detail.value, that = this;
    if (!value) {
      wx.showToast({
        title: '请输入地址',
        icon: 'none',
        duration: 1500
      })
    }else{
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
    }
  },
  selectAddress: function (event) { //选择地点
    const id = event.currentTarget.id, _data = this.data.resultPosition;
    let lat = '', lng = '',city='';
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        lat = _data[i].location.lat;
        lng = _data[i].location.lng;
        city = _data[i].city;
      }
    }
    let userInfo = wx.getStorageSync('userInfo')
    userInfo.city = city
    wx.setStorageSync("userInfo", userInfo)
    // app.globalData.userInfo.lat = lat;
    // app.globalData.userInfo.lng = lng;
    app.globalData.userInfo.city = city;
    app.globalData.changeCity = true;
    // console.log(" app.globalData.userInfo：", app.globalData.userInfo)
    wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
      url: '../../index/index'
    })
  },
  clickcity: function (e) {  //点击某个热门城市
    let that = this,ind = e.currentTarget.id,_data = this.data.hotcity,newData=[];
    for (let i = 0; i < _data.length; i++) {
      let _name = _data[i].name;
      if (ind == i) {
        if (_data[i].open == 1) {
          wx.request({
            url: 'https://apis.map.qq.com/ws/place/v1/suggestion?keyword=' + _name + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: (res) => {
              let _olddata = res.data.data, reg = 'RegExp(/'+_name+'/)';
              for (let i in _olddata){
                let _city = _olddata[i].city+'';
                if (_city.indexOf(_name) != -1 ){
                  newData.push(_olddata[i])
                }
              }
              that.setData({
                resultPosition: newData
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
