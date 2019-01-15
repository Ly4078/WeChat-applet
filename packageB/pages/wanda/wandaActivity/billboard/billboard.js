import Api from '../../../../../utils/config/api.js';
var utils = require('../../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var app = getApp();
let gameFlag = true; //防止重复点击
var village_LBS = function (that) {
  wx.getLocation({
    success: function (res) {
      console.log('vill_res:', res)
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}
var swichrequestflag = false;

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    loading: false,
    toTops: false,
    shareId: 0,
    actId: '',
    navOrder: 1,
    foodArr: [],
    voteArr: [],
    rows: 16,
    page: 1,
    foodPage: 1,
    votePage: 1
  },
  onLoad: function (options) {
    if (options.shareId) {
      this.setData({
        shareId: options.shareId
      });
    }
    this.setData({
      actId: options.actId
    });
    wx.showLoading({
      title: '加载中...'
    })
  },
  onShow: function () {
    if (!app.globalData.token) { //没有token 获取token
      let that = this;
      getToken(app).then(() => {
        if (that.data.foodArr.length <= 0) {
          that.setData({
            navOrder: 1
          });
          that.foodsBillboard();
        }
      })
    } else {
      if (this.data.foodArr.length <= 0) {
        this.setData({
          navOrder: 1
        });
        this.foodsBillboard();
      }
    }
  },
  onUnload: function () {
    
  },
  foodsBillboard() {    //美食榜
    let that = this, _param = {}, str = "";
    _param = {
      actId: this.data.actId,
      rankingByVoteNum: 1,
      page: this.data.page,
      rows: this.data.rows
    };
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    swichrequestflag = true;
    let _url = this.data._build_url + 'goodsSku/listForAct?' + str;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        that.setData({
          loading: false
        })
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let list = res.data.data.list, foodArr = that.data.foodArr;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              foodArr.push(list[i]);
            }
            that.setData({
              foodArr: foodArr,
              foodPage: Math.ceil(res.data.data.total / 10)
            });
          }
        }
        swichrequestflag = false;
        wx.hideLoading();
      },
      fail() {
        that.setData({
          loading: false
        })
        wx.stopPullDownRefresh();
        wx.hideLoading();
      }
    }, () => {
      swichrequestflag = false;
    })
  },
  voteBillboard() {    //投票榜
    let that = this, _param = {}, str = "";
    _param = {
      actId: this.data.actId,
      page: this.data.page,
      rows: this.data.rows
    };
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    swichrequestflag = true;
    let _url = this.data._build_url + 'vote/getUserRanking?' + str;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        that.setData({
          loading: false
        })
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let list = res.data.data.list, voteArr = that.data.voteArr;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              if (list[i].user) {
                if (!list[i].user.nickName) {
                  list[i].user.nickName = that.substr(list[i].user.userName);
                }
                voteArr.push(list[i]);
              }
            }
            that.setData({
              voteArr: voteArr,
              votePage: Math.ceil(res.data.data.total / 10)
            });
          }
          swichrequestflag = false;
        }
        wx.hideLoading();
      },
      fail() {
        that.setData({
          loading: false
        })
        wx.stopPullDownRefresh();
        wx.hideLoading();
      }
    }, () => {
      swichrequestflag = false;
    })
  },
  switchTab(e) {
    if (swichrequestflag) {
      return;
    }
    let id = e.target.id;
    if (this.data.navOrder == id) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      navOrder: id,
      foodArr: [],
      voteArr: [],
      page: 1
    });
    id == 1 ? this.foodsBillboard() : this.voteBillboard();
  },
  onPullDownRefresh: function () {   //刷新
    if (swichrequestflag) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      foodArr: [],
      voteArr: [],
      page: 1
    });
    this.data.navOrder == 1 ? this.foodsBillboard() : this.voteBillboard();
  },
  onReachBottom: function () { // 翻页
    if (swichrequestflag) {
      return;
    }
    if (this.data.navOrder == 1) {
      if (this.data.page > this.data.foodPage) {
        return;
      }
      this.setData({
        page: this.data.page + 1,
        loading: true
      });
      this.foodsBillboard();
    } else if (this.data.navOrder == 2) {
      if (this.data.page > this.data.votePage) {
        return;
      }
      this.setData({
        page: this.data.page + 1,
        loading: true
      });
      this.voteBillboard();
    }
    
  },
  onShareAppMessage: function () {
    return {
      title: '湖北万达十大招牌菜榜单',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_wandashare.jpg',
      path: '/packageB/pages/wanda/wandaActivity/billboard/billboard?shareId=1&actId=' + this.data.actId,
      success: function (res) { },
      fail: function (res) { }
    }
  },
  substr(str) {
    return str.slice(0, 3) + '****' + str.slice(7);
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  //滚动事件
  onPageScroll: function (e) {
    if (e.scrollTop > 400) {
      this.setData({
        toTops: true
      })
    } else {
      this.setData({
        toTops: false
      })
    }
  },
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权          
          wx.getLocation({
            success: function (res) {
              let latitude = res.latitude,
                longitude = res.longitude;
              that.requestCityName(latitude, longitude);
            },
          })
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
  getlocation: function () { //获取用户位置
    let that = this,
      lat = '',
      lng = '';
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.requestCityName(latitude, longitude);
      },

      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              that.setData({
                isshowlocation: true
              })
            } else {
              village_LBS(that);
            }
          }
        })
      }
    })
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    app.globalData.userInfo.lat = lat;
    app.globalData.userInfo.lng = lng;
    if (app.globalData.userInfo.city || this.data._city) {
      this.foodsBillboard();
    } else {
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          if (res.data.status == 0) {
            let _city = res.data.result.address_component.city;
            if (_city == '十堰市') {
              app.globalData.userInfo.city = _city;
            } else {
              app.globalData.userInfo.city = '十堰市';
            }
            app.globalData.oldcity = app.globalData.userInfo.city;
            wx.setStorageSync('userInfo', app.globalData.userInfo);
            that.foodsBillboard();
          }
        }
      })
    }
  }
})