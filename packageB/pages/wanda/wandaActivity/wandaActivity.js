import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import getToken from '../../../../utils/getToken.js';
var app = getApp();
let gameFlag = true; //防止重复点击
var village_LBS = function(that) {
  wx.getLocation({
    success: function(res) {
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
    isshowlocation: false,
    loading: false,
    shareImg: '', //分享图片
    actId: '45',
    city: [],
    branch: [],
    currCity: 0,
    currBranch: '',
    dishList: [],
    rows: 10,
    page: 1,
    pageTotal: 1,
    drawNum: 0 //抽奖次数
  },
  onLoad: function(options) {
    if (!app.globalData.token) { //没有token 获取token
      let that = this;
      getToken(app).then(() => {
        that.getData();
      })
    } else {
      this.getData();
    }
  },
  onShow: function() {
    this.setData({
      isshowlocation: false
    });
    if (!app.globalData.token) { //没有token 获取token
      let that = this;
      getToken(app).then(() => {
        this.drawNum();
      })
    } else {
      this.drawNum();
    }
  },
  getData() { //获取数据
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      wx.showLoading({
        title: '加载中...'
      })
      this.cityQuery();
    } else {
      this.getlocation();
    }
  },
  cityQuery() {
    let that = this;
    let _url = this.data._build_url + 'shopZone/listAllShopZone';
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data,
            city = [],
            branch = [];
          for (let i = 0; i < data.length; i++) {
            city.push(data[i].city);
            branch.push(data[i].shopZoneItem);
            if (data[i].city == app.globalData.userInfo.city) {
              that.setData({
                currCity: i
              });
            }
          }
          that.setData({
            city: city,
            branch: branch,
            currBranch: branch[that.data.currCity][0].name,
            dishList: []
          });
          that.dishL();
        }
      },
      fail() {
        wx.hideLoading();
      }
    })
  },
  dishL() {
    let that = this,
      _param = {},
      str = "",
      shopZoneCity = "";
    shopZoneCity = this.data.city[this.data.currCity];
    _param = {
      actId: this.data.actId,
      shopZoneCity: shopZoneCity,
      shopZoneItem: this.data.currBranch,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
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
      success: function(res) {
        that.setData({
          loading: false
        })
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let list = res.data.data.list;
          if (list && list.length > 0) {
            let dishList = that.data.dishList;
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
              dishList.push(list[i]);
            }
            that.setData({
              dishList: dishList,
              pageTotal: Math.ceil(res.data.data.total / 10)
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
  isVote(e) { //是否可以投票
    let that = this,
      id = e.target.id,
      _url = this.data._build_url + 'vote/canVoteToday?actId=' + this.data.actId;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let code = res.data.code;
        if (code == 0) {
          that.vote(id);
        } else if (code == 200029) {
          that.showToast(res.data.message);
        }
      },
      fail() {

      }
    })
  },
  vote(id) { //投票
    let that = this,
      _url = this.data._build_url + 'vote/addVoteFree?actGoodsSkuId=' + id + '&actId=' + this.data.actId;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.showToast('投票成功');
          let dishList = that.data.dishList;
          for (let i = 0; i < dishList.length; i++) {
            if (dishList[i].actGoodsSkuOut.id == id) {
              dishList[i].actGoodsSkuOut.voteNum++;
            }
          }
          that.setData({
            dishList: dishList
          });
        } else if (code == 200029) {
          that.showToast(res.data.message);
        }
      },
      fail() {

      }
    })
  },
  toBuy(e) { //买菜
    let id = e.target.id,
      shopId = e.currentTarget.dataset.shopid,
      city = this.data.city[this.data.currCity];
    wx.navigateTo({
      url: '../../../../pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=45&categoryId=8' + '&city=' + city
    })
  },
  drawNum() { //可抽奖次数
    let that = this,
      _url = this.data._build_url + 'actLottery/get?actId=' + this.data.actId;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            drawNum: res.data.data ? res.data.data.totalNumber : 0
          });
        }
      },
      fail() {

      }
    })
  },
  holdingActivity() {
    // if (this.data.drawNum <= 0) {
    //   this.showToast('抽奖次数已用完，参与活动获得更多抽奖次数');
    //   return;
    // }
    wx.navigateTo({
      url: '/pages/activityDetails/holdingActivity/holdingActivity'
    })
  },
  toBillboard() { //至排行榜
    wx.navigateTo({
      url: 'billboard/billboard?actId=' + this.data.actId
    })
  },
  switchTab(e) { //切换tab
    if (swichrequestflag) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    let id = e.target.id,
      branch = this.data.branch;
    this.setData({
      currCity: id,
      currBranch: branch[id][0].name,
      dishList: [],
      page: 1
    });
    this.dishL();
  },
  switchWd(e) { //切换万达分店
    if (swichrequestflag) {
      return;
    }
    let name = e.target.dataset.name;
    if (this.data.currBranch == name) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      currBranch: name,
      dishList: [],
      page: 1
    });
    this.dishL();
  },
  onPullDownRefresh: function() { //刷新
    if (swichrequestflag) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      page: 1,
      dishList: []
    });
    this.drawNum();
    this.dishL();
  },
  onReachBottom: function() { // 翻页
    if (this.data.page > this.data.pageTotal) {
      return;
    }
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    this.dishL();
  },
  onShareAppMessage: function() { //分享给好友帮忙砍价
    return {
      title: '湖北万达十大招牌菜',
      imageUrl: '/images/icon/wd_2.png',
      path: '/packageB/pages/wanda/wandaActivity/wandaActivity',
      success: function(res) {},
      fail: function(res) {}
    }
  },
  showToast(title) { //提示信息
    wx.showToast({
      title: title,
      icon: 'none'
    })
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
            success: function(res) {
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
  getlocation: function() { //获取用户位置
    let that = this,
      lat = '',
      lng = '';
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.requestCityName(latitude, longitude);
      },

      fail: function(res) {
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
      this.cityQuery();
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
            that.cityQuery();
          }
        }
      })
    }
  }
})