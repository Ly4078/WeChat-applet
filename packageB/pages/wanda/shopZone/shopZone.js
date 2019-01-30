import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import getToken from '../../../../utils/getToken.js';
import getCurrentLocation from '../../../../utils/getCurrentLocation.js';
var app = getApp();
let gameFlag = true; //防止重复点击
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    shareId: 0,
    isshowlocation: false,
    list: [], //列表
    type: 1
  },
  onLoad: function(options) {
    let that = this;
    //在此函数中获取扫描普通链接二维码参数
    let q = decodeURIComponent(options.q), _val = "";
    if (q) {
      if (utils.getQueryString(q, 'flag') == 11) {
        _val = utils.getQueryString(q, 'type');
        that.setData({
          type: _val
        })
      }
    }
    if (!_val) {
      that.setData({
        type: options.type
      });
    }

    let title = that.data.type == 1 ? '万达专区' : '武商专区';
    wx.setNavigationBarTitle({
      title: title
    })
    if (options.shareId) {
      that.setData({
        shareId: options.shareId
      })
    }
    if (!app.globalData.token) { //没有token获取
      getToken(app).then(() => {
        that.getData();
      })
    } else {
      that.getData();
    }
  },
  getData() { //获取数据
    let that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      if (this.data.list.length <= 0) {
        this.listData();
      }
    } else {
      getCurrentLocation(that).then((res) => {
        that.listData();
      })
    }
  },
  listData() {
    wx.showLoading({
      title: '加载中...'
    });
    let _param = {},
      str = "",
      _url = "",
      type = this.data.type;
    if (type == 1) {
      _param = {
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        regionName: "万达"
      };
      _url = this.data._build_url + 'shopZone/listItem';
      _url = encodeURI(_url);
      _param = JSON.stringify(_param);
      this.requestFunc(_url, _param, 'POST');
    } else if (type == 2) {
      _param = {
        page: 1,
        rows: 20,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        chainType: 1,
        type: 1
      };
      for (let key in _param) {
        str += key + "=" + _param[key] + "&";
      };
      str = str.substring(0, str.length - 1);
      let _url = this.data._build_url + 'salePoint/listNew?' + str;
      _url = encodeURI(_url);
      this.requestFunc(_url, '', 'GET');
    }
  },
  requestFunc(url, data, method) { //请求接口回调
    let that = this;
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = res.data.data.list;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
            }
            that.setData({
              list: list
            });
          }
        }
      },
      fail() {
        wx.hideLoading();
      }
    })
  },
  toBranch(e) { //跳转至各店
    let type = this.data.type,
      list = this.data.list;
    let id = e.currentTarget.id,
      picUrl = '',
      name = '',
      address = '',
      distance = '',
      city = '',
      locationX = '',
      locationY = '';
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        picUrl = type == 1 ? list[i].picUrl : list[i].indexUrl;
        name = type == 1 ? list[i].name : list[i].salepointName;
        address = list[i].address;
        distance = list[i].distance;
        city = list[i].city;
        locationX = list[i].locationX;
        locationY = list[i].locationY;
      }
    }
    wx.navigateTo({
      url: '../wandaBranch/wandaBranch?id=' + id + '&picUrl=' + picUrl + '&name=' + name + '&address=' + address + '&distance=' + distance + '&city=' + city + '&locationX=' + locationX + '&locationY=' + locationY + '&type=' + type
    })
  },
  onShareAppMessage: function() {
    return {
      title: '万达专区活动',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_wandazhuanqu.jpg',
      path: '/packageB/pages/wanda/shopZone/shopZone?shareId=1&type=' + this.data.type,
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