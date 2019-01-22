var app = getApp();
var getCurrentCity = function (lat, lng) {
  app.globalData.userInfo.lat = lat;
  app.globalData.userInfo.lng = lng;
  return new Promise((resolve, reject) => {
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
          return resolve();
        }
      },fail(){
        return reject();
      }
    })
  })
}
module.exports = getCurrentCity