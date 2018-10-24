import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp()
var village_LBS = function (that) { //获取用户经纬度
  wx.getLocation({
    success: function (res) {
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.marketList(2);
      that.requestCityName(latitude, longitude);
    },
  })
}
var swichrequestflag = [false, false, false];

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    listData: [], //送货到家
    storeData: [], //品质好店
    marketList: [],//到店自提
    navbar: ['平台邮购', '到店消费', '门店自提'],
    // oneTab: ["礼盒装", "散装", "提蟹券"],
    oneTab: ["提蟹券", "散装"],
    currentTab: 0,
    tabId: 0,
    spuval: 3,
    page: 1,
    _page: 1,
    sPage: 1,
    articleid: '',
    dshImg: '',
    platFormPages: 1,
    shopPages: 1,
    marketPages: 1
  },
  onLoad: function (option) {
    // console.log('option:', option)
    let that = this;
    if (option.currentTab) {
      this.setData({
        currentTab: option.currentTab
      });
    }
   

    if (option.spuval) {
      let _val = 0;
      if (option.spuval == 3) {
        _val = 0;
      } else if (option.spuval == 1) {
        _val = 1;
      }
      this.setData({
        spuval: option.spuval,
        tabId: _val
      })
    }
    let txtObj = wx.getStorageSync('txtObj') || {};
    if (txtObj){
      app.globalData.txtObj = txtObj;
    }
    if (!app.globalData.txtObj) {
      wx.request({
        url: that.data._build_url + 'version.txt',
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
          app.globalData.txtObj = res.data;
          that.setData({
            dshImg: app.globalData.txtObj.dsh.imgUrl
          })
        }
      })
    } else {
      this.setData({
        dshImg: app.globalData.txtObj.dsh.imgUrl
      })
    };

    this.setData({
      listData: [], //送货到家
      storeData: [],
      page: 1,
      _page: 1
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    if (this.data.currentTab == 0) {
      if (this.data.listData.length < 1) {
        this.commodityCrabList(0);
      } else {
        wx.hideLoading();
      }
    } else if (this.data.currentTab == 1) {
      this.listForSkuAllocation(1);
    } else if (this.data.currentTab == 2) {
      this.marketList(2);
    }
  },
  onShow: function () { },
  onHide() {
    wx.hideLoading();
  },
  onUnload() {
    wx.hideLoading();
  },
  //切换顶部tab
  navbarTap: function (e) {
    let oldIdx = this.data.currentTab, idx = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: idx,
      page: 1,
      _page: 1,
      sPage: 1
    }, () => {
      console.log(swichrequestflag);
      if (swichrequestflag[idx]) {
        return;
      }
      if (this.data.currentTab == 0) {
        if (idx != oldIdx && this.data.listData.length == 0) {
          this.commodityCrabList(0);
        }
      } else if (this.data.currentTab == 1) {
        if (idx != oldIdx && this.data.storeData.length == 0) {
          this.listForSkuAllocation(1);
        }
      } else if (this.data.currentTab == 2) {
        if (idx != oldIdx && this.data.marketList.length == 0) {
          this.marketList(2);
        }
      }
    });
  },
  //点击二级目录
  handonetab: function (e) {
    let oldId = this.data.tabId, id = e.currentTarget.id,
      val = 3;
    if (oldId == id) {
      return false;
    }
    if (id == 0) {
      val = 3;
    } else if (id == 1) {
      val = 1;
    }
    this.setData({
      tabId: id,
      spuval: val,
      listData: [],
      page: 1
    });
    this.commodityCrabList(0);
  },
  //监听分享
  onShareAppMessage: function () {
    let _title = this.data.navbar[this.data.currentTab];
    return {
      title: _title,
      path: '/pages/index/crabShopping/crabShopping?currentTab=' + this.data.currentTab,
      success: function (res) { }
    }
  },
  //查询平台邮购列表
  commodityCrabList: function (types) {
    let that = this;
    let _parms = {
      spuType: 10,
      isDeleted: 0,
      page: this.data.page,
      spuId: this.data.spuval,
      rows: 10,
      token: app.globalData.token
    };
    swichrequestflag[types] = true;
    Api.crabList(_parms).then((res) => {
      let _listData = this.data.listData;
      if (res.data.code == 0) {
        if (this.data.page == 1) {
          this.setData({
            listData: []
          })
        }
        let _list = res.data.data.list;
        if (_list && _list.length > 0) {
          for (let i = 0; i < _list.length; i++) {
            _listData.push(_list[i])
          }
          this.setData({
            listData: _listData,
            platFormPages: Math.ceil(res.data.data.total / 10),
            loading: false
          }, () => {
            wx.hideLoading();
          })
        } else {
          wx.hideLoading();
          this.setData({loading: false})
        }
        swichrequestflag[types] = false;
      }else{
        this.setData({ loading: false })
        wx.hideLoading();
      }
    }, () => {
      this.setData({ loading: false })
      wx.hideLoading();
      swichrequestflag[types] = false;
    })
  },

  //查询到店消费列表
  listForSkuAllocation: function (types) {
    let that = this;
    if (!app.globalData.userInfo.lat || !app.globalData.userInfo.lng || !app.globalData.userInfo.city) {
      wx.hideLoading();
      this.getlocation();
    } else {
      let _parms = {
        Type: 1,
        page: this.data._page,
        rows: 8,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        city: app.globalData.userInfo.city,
        token: app.globalData.token
      };
      swichrequestflag[types] = true;
      Api.listForSkuAllocation(_parms).then((res) => {
        if (res.data.code == 0) {
          if (this.data._page == 1) {
            this.setData({
              storeData: []
            })
          };
          if (res.data.data.list && res.data.data.list.length > 0) {
            let _list = res.data.data.list,
              _storeData = that.data.storeData;
            for (let i = 0; i < _list.length; i++) {
              _list[i].distance = utils.transformLength(_list[i].distance);
              _list[i].logoUrl = _list[i].logoUrl ? _list[i].logoUrl : _list[i].indexUrl;
              _storeData.push(_list[i]);
            };
            that.setData({
              storeData: _storeData,
              shopPages: Math.ceil(res.data.data.total / 8),
              loading: false
            }, () => {
              wx.hideLoading();
            })
          } else {
            wx.hideLoading();
            this.setData({loading: false})
          }
          swichrequestflag[types] = false;
        }else{
          wx.hideLoading();
          this.setData({ loading: false })
        }
      }, () => {
        wx.hideLoading();
        this.setData({ loading: false })
        swichrequestflag[types] = false;
      })
    }
  },

  //查询门店自提列表
  marketList(types) {
    let that = this;
    if (!app.globalData.userInfo.lat || !app.globalData.userInfo.lng || !app.globalData.userInfo.city) {
      wx.hideLoading();
      this.getlocation();
    } else {
      let _parms = {
        page: this.data.sPage,
        rows: 5,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        token: app.globalData.token
      };
      swichrequestflag[types] = true;
      Api.superMarketUrl(_parms).then((res) => {
        if (res.data.code == 0) {
          if (this.data.sPage == 1) {
            this.setData({
              marketList: []
            })
          };
          let _list = res.data.data.list,
            marketList = this.data.marketList;
          if (_list && _list.length > 0) {
            for (let i = 0; i < _list.length; i++) {
              _list[i].distance = utils.transformLength(_list[i].distance);
              _list[i].logoUrl = _list[i].logoUrl ? _list[i].logoUrl : _list[i].indexUrl;
              marketList.push(_list[i]);
            };
            this.setData({
              marketList: marketList,
              marketPages: Math.ceil(res.data.data.total / 5),
              loading: false
            }, () => {
              wx.hideLoading();
            })
          } else {
            this.setData({loading: false})
            wx.hideLoading();
          }
          swichrequestflag[types] = false;
        }else{
          this.setData({ loading: false })
          wx.hideLoading();
        }
      }, () => {
        wx.hideLoading();
        this.setData({ loading: false })
        swichrequestflag[types] = false;
      })
    }
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
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
          if (_city == '十堰市' || city == '武汉市') {
            app.globalData.userInfo.city = _city;
          } else {
            app.globalData.userInfo.city = '十堰市';
          }
          that.listForSkuAllocation(1);
          app.globalData.picker = res.data.result.address_component;
        }
      }
    })

  },
  //下拉刷新
  onPullDownRefresh: function () {
    console.log(swichrequestflag)
    if (this.data.currentTab == 0) {
      if (swichrequestflag[0]) {
        return;
      }
      this.setData({
        page: 1,
        listData: []
      }, () => {
        this.commodityCrabList(0);
      });
    } else if (this.data.currentTab == 1) {
      if (swichrequestflag[1]) {
        return;
      }
      this.setData({
        _page: 1,
        storeData: [],
      }, () => {
        this.listForSkuAllocation(1);
      });
    } else if (this.data.currentTab == 2) {
      if (swichrequestflag[2]) {
        return;
      }
      this.setData({
        sPage: 1,
        marketList: []
      }, () => {
        this.marketList(2);
      });
    }
  },
  //用户上拉触底加载更多
  onReachBottom: function () {
    if (this.data.currentTab == 0) {
      if (swichrequestflag[0]) {
        return;
      }
      if (this.data.platFormPages > this.data.page) {
        this.setData({
          page: this.data.page + 1,
          loading: true
        }, () => {
          this.commodityCrabList(0);
        });
      }
    } else if (this.data.currentTab == 1) {
      if (swichrequestflag[1]) {
        return;
      }
      if (this.data.shopPages > this.data._page) {
        this.setData({
          _page: this.data._page + 1,
          loading: true
        });
        this.listForSkuAllocation(1);
      }
    } else if (this.data.currentTab == 2) {
      if (swichrequestflag[2]) {
        return;
      }
      if (this.data.marketPages > this.data.sPage) {
        this.setData({
          sPage: this.data.sPage + 1,
          loading: true
        });
        this.marketList(2);
      }
    }
  },

  getlocation: function () { //获取用户位置
    let that = this,
      lat = '',
      lng = '';
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude, longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.marketList(2);
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                showCancel: false,
                confirmText: '确认授权',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({ //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) {
                          // village_LBS(that);
                          that.getlocation();
                        }else{
                          let latitude = '30.51597',
                            longitude = '114.34035';
                          that.requestCityName(latitude, longitude);
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
    })
  },



  // 进入菜品详情
  crabPrticulars: function (e) {
    let id = e.currentTarget.id,
      spuId = e.currentTarget.dataset.spuid;
    wx.navigateTo({
      url: 'crabDetails/crabDetails?id=' + id + '&spuId=' + spuId,
    })
  },

  //进入品质好店发起砍价
  crabBargainirg: function (e) {
    let shopId = e.currentTarget.id,
      greensID = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: 'crabDetails/crabDetails?shopId=' + shopId + '&greensID=' + greensID + '&isShop=true'
    })
  },
  toStoreDetail(e) {  //跳转至到店自提详情
    let id = e.currentTarget.id, distance = e.currentTarget.dataset.distance;
    wx.navigateTo({
      url: 'superMarket/superMarket?id=' + id + '&distance=' + distance
    })
  }
})