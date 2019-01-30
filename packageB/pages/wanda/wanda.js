import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import getToken from '../../../utils/getToken.js';
import getCurrentLocation from '../../../utils/getCurrentLocation.js';
var app = getApp();
let gameFlag = true; //防止重复点击
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    shareId: 0,
    isshowlocation: false,
    wandaL: [], //万达列表
    wushangL: [] //武商列表
  },
  onLoad: function(options) {
    this.setData({
      isshowlocation: false
    });
    if (options.shareId) {
      this.setData({
        shareId: options.shareId
      })
    }
    if (!app.globalData.token) { //没有token 获取token
      let that = this;
      getToken(app).then(() => {
        that.getData();
      })
    } else {
      this.getData();
    }
  },
  getData() { //获取数据
    let that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      if (this.data.wandaL.length <= 0) {
        this.wandaList();
      }
      console.log(app.globalData.userInfo.city);
      // if (app.globalData.userInfo.city == '十堰市' && this.data.wushangL.length <= 0) {
      if (this.data.wushangL.length <= 0) {
        this.wushangList();
      }
    } else {
      getCurrentLocation(that).then((res) => {
        that.wandaList();
        // if (app.globalData.userInfo.city == '十堰市') {
          that.wushangList();
        // }
      })

    }
  },
  wandaList() {
    wx.showLoading({
      title: '加载中...'
    })
    let _param = {},
      str = "",
      that = this;
    _param = {
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      // city: app.globalData.userInfo.city,
      regionName: "万达"
    }
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    let _url = this.data._build_url + 'shopZone/listItem';
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      data: JSON.stringify(_param),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let wandaL = res.data.data.list;
          if (wandaL && wandaL.length > 0) {
            for (let i = 0; i < wandaL.length; i++) {
              wandaL[i].distance = utils.transformLength(wandaL[i].distance);
              wandaL[i].listType = 1;
            }
            that.setData({
              wandaL: wandaL
            });
          }
        }
      },
      fail() {
        wx.hideLoading();
      }
    })
  },
  wushangList() {
    let _param = {},
      str = "",
      that = this;
    _param = {
      page: 1,
      rows: 20,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      // city: "十堰市",
      chainType: 1,
      type: 1
    }
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    let _url = this.data._build_url + 'salePoint/listNew?' + str;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let wushangL = res.data.data.list;
          if (wushangL && wushangL.length > 0) {
            for (let i = 0; i < wushangL.length; i++) {
              wushangL[i].distance = utils.transformLength(wushangL[i].distance);
              wushangL[i].listType = 2;
            }
            that.setData({
              wushangL: wushangL
            });
          }
        }
      },
      fail() {
        wx.hideLoading();
      }
    })
  },
  toBranch(e) { //跳转至万达各店
    let type = e.currentTarget.dataset.type, list = [];
    if (type == 1) {
      list = this.data.wandaL;
    } else if (type == 2) {
      list = this.data.wushangL;
    }
    let id = e.currentTarget.id,
      picUrl = '',
      name = '',
      address = '',
      distance = '',
      locationX = '',
      locationY = '';
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        picUrl = type == 1 ? list[i].picUrl : list[i].indexUrl;
        name = type == 1 ? list[i].name : list[i].salepointName;
        address = list[i].address;
        distance = list[i].distance;
        locationX = list[i].locationX;
        locationY = list[i].locationY;
      }
    }
    wx.navigateTo({
      url: 'wandaBranch/wandaBranch?id=' + id + '&picUrl=' + picUrl + '&name=' + name + '&address=' + address + '&distance=' + distance + '&city=' + app.globalData.userInfo.city + '&locationX=' + locationX + '&locationY=' + locationY + '&type=' + type
    })
  },
  onShareAppMessage: function() {
    return {
      title: '万达专区活动',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_wandazhuanqu.jpg',
      path: '/packageB/pages/wanda/wanda?shareId=1',
      success: function(res) {},
      fail: function(res) {}
    }
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
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
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
})