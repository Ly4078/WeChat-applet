import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import getToken from '../../../../utils/getToken.js';
import getCurrentLocation from '../../../../utils/getCurrentLocation.js';
var app = getApp();
let gameFlag = true; //防止重复点击
var swichrequestflag = false;

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation: false,
    showSkeleton: true,
    loading: false,
    toTops: false,
    instruct: false,
    hidecai: false,
    shareId: 0,
    shareImg: '', //分享图片
    actId: '45',
    city: [],
    branch: [],
    SkeletonData: ['', '', '', ''],
    currCity: 0,
    currBranch: '',
    dishList: [],
    rows: 10,
    page: 1,
    pageTotal: 1,
    actDesc: [],
    rankingColor: ['#FFC30E', '#A1A1A1', '#D5783A']
  },
  onLoad: function (options) {
    let that = this, _currCity = this.data.currCity;
    let q = decodeURIComponent(options.q);
    if (q && q != 'undefined') {
      if (utils.getQueryString(q, 'flag') == 12) {
        _currCity = utils.getQueryString(q, 'currCity');
      }
      that.setData({
        currCity: _currCity
      })
    }

    this.setData({
      isshowlocation: false
    })
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000);
    if (options.shareId) {
      this.setData({
        shareId: options.shareId
      });
    }
    if (!app.globalData.token) { //没有token 获取token
      getToken(app).then(() => {
        that.getRule();
        that.getData();
      })
    } else {
      this.getRule();
      this.getData();
    }
  },
  onShow: function () {

  },
  getData() { //获取数据
    let that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      that.dishL();
    } else {
      that.setData({ showSkeleton: false })
      getCurrentLocation(that).then(() => {
        that.dishL();
      })
    }
  },

  dishL() {
    let that = this,
      _param = {},
      str = "",
      shopZoneCity = "";
    shopZoneCity = this.data.city[this.data.currCity];
    _param = {
      actId: '45',
      type: '3',
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,

    };
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    swichrequestflag = true;
    let _url = this.data._build_url + 'actRanking/list?' + str;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let list = res.data.data;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
            }
            that.setData({
              dishList: list
            });
          }
        }
      },
      fail() {

      }, complete() {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        swichrequestflag = false;
        that.setData({
          showSkeleton: false,
          loading: false
        });
      }
    }, () => {
      swichrequestflag = false;
    })
  },
  getRule() { //获取规则
    let that = this, _url = '';
    _url = this.data._build_url + 'act/detail?id=' + this.data.actId;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        let data = res.data.data;
        that.setData({
          mainPic: data.mainPic,
          actDesc: data.actDesc.split(',')
        });
        console.log("actDesc:", that.data.actDesc)
      },
      fail() {

      }
    })
  },
  onPullDownRefresh: function () { //刷新
    if (swichrequestflag) {
      return;
    }
    this.dishL();
  },
  onReachBottom: function () { // 翻页
  },
  onShareAppMessage: function () {
    return {
      title: '湖北万达十大招牌菜-排行榜',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_1551765377_bb620e5e49e24d24ef2cdafd031006c.jpg',
      path: '/packageB/pages/wanda/wandaActivity/wandaActivity?shareId=1',
      success: function (res) { },
      fail: function (res) { }
    }
  },
  showToast(title, time) { //提示信息
    wx.showToast({
      title: title,
      icon: 'none',
      duration: time ? time : 1500
    })
  },
  openRule() { //打开规则
    this.setData({
      instruct: true
    });
  },
  toBuy(e) { //买菜
    let id = e.currentTarget.id,
      shopId = e.currentTarget.dataset.shopid,
      city = e.currentTarget.dataset.city,
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=' + this.data.actId + '&categoryId=' + categoryId + '&city=' + city
    })
  },
  closeRule() { //关闭规则
    this.setData({
      instruct: false
    });
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
          that.setData({ showSkeleton: true, isshowlocation: false })
          setTimeout(() => {
            getCurrentLocation(that).then(() => {
              that.dishL();
            })
          }, 300)
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },


})