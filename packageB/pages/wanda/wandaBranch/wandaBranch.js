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
    isEmpty: false, //列表是否为空
    shareId: 0,
    actId: '41',
    id: '',
    name: '',
    address: '',
    distance: '',
    picUrl: '',
    city: '',
    type: '',
    rows: 10,
    page: 1,
    pageTotal: 1,
    dishList: [],
    SkeletonData: ['', '', '', '', '', '']
  },
  onLoad: function(options) {
    let that = this;
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
    this.setData({
      isshowlocation: false,
      id: options.id,
      address: options.address,
      distance: options.distance,
      name: options.name,
      picUrl: options.picUrl,
      city: options.city,
      locationX: options.locationX,
      locationY: options.locationY,
      type: options.type
    });
    wx.setNavigationBarTitle({
      title: options.name,
    })
    if (!app.globalData.token) { //没有token 获取token
      getToken(app).then(() => {
        that.getData();
      })
    } else {
      this.getData();
    }
  },
  onShow: function() {

  },
  getData() { //获取数据
  let that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      if (this.data.dishList.length <= 0) {
        this.dishL();
      }
    } else {
      getCurrentLocation(that).then( (res)=>{
        that.dishL();
      })
    }
  },
  dishL() { //砍菜列表
    let that = this,
      str = "",
      _url = "",
      _parms = {};
    if (this.data.type == 1) {    //万达
      let lng = wx.getStorageInfoSync('userInfo').lng ? wx.getStorageInfoSync('userInfo').lng : "110.77877",
      lat = wx.getStorageInfoSync('userInfo').lat ? wx.getStorageInfoSync('userInfo').lat : "32.6226";
      _parms = {
        actId: this.data.actId,
        zanUserId: app.globalData.userInfo.userId,
        browSort: 0, //0附近 1销量 2价格
        locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
        locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
        // city: this.data.city,
        isDeleted: 0,
        page: this.data.page,
        rows: this.data.rows,
        token: app.globalData.token,
        shopZoneItemId: that.data.id
      };
      _url = this.data._build_url + 'goodsSku/listForAct?';
    } else {    //武商
      _parms = {
        id: this.data.id, 
        sendType: 2,
        page: this.data.page,
        rows: this.data.rows
      };
      _url = this.data._build_url + 'salePoint/getGoodsListBySalePointIdNew?';
    }
    swichrequestflag = true;
    for (let key in _parms) {
      str += key + "=" + _parms[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    wx.request({
      url: _url + str,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let list = res.data.data.list,
              dishList = that.data.dishList;
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
              if (that.data.type == 1) {
                list[i].stockNum = list[i].actGoodsSkuOut.stockNum;
              }
              dishList.push(list[i]);
            }
            that.setData({
              dishList: dishList,
              pageTotal: Math.ceil(res.data.data.total / 10)
            });
          } else {
            if (that.data.dishList.length <= 0) {
              that.setData({
                isEmpty: true
              });
            }
          }
          that.setData({
            showSkeleton: false,
            loading: false
          });
        } else {
          that.setData({
            showSkeleton: false,
            loading: false
          });
        }
        swichrequestflag = false;
      },
      fail() {
        
      }
    }, () => {
      swichrequestflag = false;
      that.setData({
        loading: false
      });
    })
  },
  toBuy(e) { //买菜
    let id = e.currentTarget.id, dishList = this.data.dishList;
    if (this.data.type == 1) {
      let actId = '', shopId = '', categoryId = '';
      for (let i = 0; i < dishList.length; i++) {
        if (dishList[i].id == id){
          actId = dishList[i].actGoodsSkuOut.actId;
          shopId = dishList[i].shop.id;
          categoryId = dishList[i].categoryId;
        }
      }
      wx.navigateTo({
        url: '../../../../pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=' + actId + '&categoryId=' + categoryId + '&city=' + this.data.city
      })
    } else {
      wx.navigateTo({
        url: '../../../../pages/index/crabShopping/superMarket/storeOrder/storeOrder?id=' + id + '&salepointId=' + this.data.id
      })
    }
  },
  onPullDownRefresh: function() { //刷新
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: 1,
      dishList: []
    });
    this.dishL();
  },
  onReachBottom: function() { // 翻页
    if (this.data.page >= this.data.pageTotal) {
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
  onShareAppMessage: function(res) {
    console.log(res);
    return {
      title: this.data.name + '专区菜品',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_wandazhuanqu.jpg',
      path: '/packageB/pages/wanda/wandaBranch/wandaBranch?shareId=1&id=' + this.data.id + '&picUrl=' + this.data.picUrl + '&name=' + this.data.name + '&address=' + this.data.address + '&distance=' + this.data.distance + '&city=' + this.data.city + '&locationX=' + this.data.locationX + '&locationY=' + this.data.locationY,
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
  // //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  //滚动事件
  onPageScroll: function(e) {
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
  //打开地图导航，先查询是否已授权位置
  TencentMap: function(event) {
    let that = this;
    that.openmap();       
  },
  //打开地图，已授权位置
  openmap() {
    console.log(typeof this.data.locationX);
    let that = this;
    wx.openLocation({
      longitude: Number(that.data.locationX),
      latitude: Number(that.data.locationY),
      scale: 14,
      name: that.data.name,
      address: that.data.address,
      success: function(res) {},
      fail: function(res) {}
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
  }
})