
var app = getApp();
var getCurrentLocation = function (that) {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude,
          longitude = res.longitude;
        getCurrentCity(latitude, longitude, resolve)
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其位置信息     

              that.setData({
                isshowlocation: true
              })
            } else {
              
            }
          }
        })
      }
    })
  })
}
var getCurrentCity = function (lat, lng, resolve) {
  app.globalData.userInfo.lat = lat;
  app.globalData.userInfo.lng = lng;
  wx.request({
    url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: (res) => {
      if (res.data.status == 0) {
        let _city = res.data.result.address_component.city;
        if (_city.indexOf('十堰') != -1 || _city.indexOf('武汉') != -1 || _city.indexOf('黄冈') != -1 || _city.indexOf('襄阳') != -1) {
          app.globalData.userInfo.city = _city;
        } else {
          app.globalData.userInfo.city = '十堰市';
        }
        app.globalData.oldcity = app.globalData.userInfo.city;
        app.globalData.picker = res.data.result.address_component;
        let userInfo = app.globalData.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        return resolve(app.globalData.userInfo.city);
      }
    }, fail() {
      return reject();
    }
  })

}

module.exports = getCurrentLocation
