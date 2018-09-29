import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp()
var village_LBS = function(that) { //获取用户经纬度
  wx.getLocation({
    success: function(res) {
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.marketList();
      that.requestCityName(latitude, longitude);
    },
  })
}
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    listData: [], //送货到家
    storeData: [], //品质好店
    marketList: [],//到店自提
    storeFlag: true, //品质好店节流阀
    marketFlag: true,   //到店自提节流阀
    navbar: ['平台邮购', '到店消费', '门店自提'],
    // oneTab: ["礼盒装", "散装", "提蟹券"],
    oneTab: ["提蟹券","散装"],
    currentTab: 0,
    tabId: 0,
    spuval: 3,
    page: 1,
    _page: 1,
    sPage: 1,
    articleid: '',
    dshImg: ''
  },
  onLoad: function(option) {
    console.log('option:', option)
    let that = this;
    if (option.currentTab){
      this.setData({
        currentTab: option.currentTab 
      });
    }
    
    if(option.spuval){
      let _val =0;
      if (option.spuval ==3){
        _val =0;
      } else if (option.spuval == 1 ){
        _val = 1;
      }
      this.setData({
        spuval: option.spuval,
        tabId: _val
      })
    }
    if (app.globalData.txtObj) {
      wx.request({
        url: this.data._build_url + 'version.txt',
        success: function(res) {
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
      storeFlag: true,
      page: 1,
      _page: 1
    })
    wx.showLoading({
      title: '加载中...'
    })
    console.log('sdf:', this.data.currentTab)
    if (this.data.currentTab == 0) {
      if (this.data.listData.length < 1) {
        this.commodityCrabList();
      } else {
        wx.hideLoading();
      }
    } else if (this.data.currentTab == 1) {
      this.listForSkuAllocation();
    } else if (this.data.currentTab == 2) {
      console.log('aaaaaa')
      this.marketList();
    }
  },
  onShow: function() {},
  //切换顶部tab
  navbarTap: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      listData: [], //送货到家
      storeData: [],
      marketList: [],
      storeFlag: true,
      marketFlag: true,
      page: 1,
      _page: 1,
      sPage: 1
    })
    if (this.data.currentTab == 0) {
      if (this.data.listData.length == 0) {
        this.commodityCrabList();
      }
    } else if (this.data.currentTab == 1) {
      if (this.data.storeData.length == 0) {
        this.listForSkuAllocation();
      }
    } else if (this.data.currentTab == 2) {
      this.marketList();
    }
  },
  //点击二级目录
  handonetab: function(e) {
    let id = e.currentTarget.id,
      val = 3;
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
    this.commodityCrabList();
  },
  //监听分享
  onShareAppMessage: function() {
    let _title = this.data.navbar[this.data.currentTab];
    return {
      title: _title,
      path: '/pages/index/crabShopping/crabShopping?currentTab=' + this.data.currentTab,
      success: function (res) { }
    }
  },
  //查询送货到家列表
  commodityCrabList: function() {
    let that = this;
    let _parms = {
      spuType: 10,
      isDeleted:0,
      page: this.data.page,
      spuId: this.data.spuval,
      rows: 10
    };
    if (this.data.page == 1) {
      this.setData({
        listData: []
      })
    }
    Api.crabList(_parms).then((res) => {
      let _listData = this.data.listData;
      wx.hideLoading();
      if (res.data.code == 0) {
        let _list = res.data.data.list;
        if (_list && _list.length > 0) {
          for (let i = 0; i < _list.length; i++) {
            _listData.push(_list[i])
          }
          this.setData({
            listData: _listData,
          })
        }
      }
    })
  },

  //查询品质好店列表
  listForSkuAllocation: function() {
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
        city: app.globalData.userInfo.city
      };
      if (this.data._page == 1) {
        this.setData({
          storeData: []
        })
      };
      Api.listForSkuAllocation(_parms).then((res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          let _list = res.data.data.list,
            _storeData = this.data.storeData;
          if (_list && _list.length > 0) {
            for (let i = 0; i < _list.length; i++) {
              _list[i].distance = utils.transformLength(_list[i].distance);
              _list[i].logoUrl = _list[i].logoUrl ? _list[i].logoUrl : _list[i].indexUrl;
              _storeData.push(_list[i]);
            };
            this.setData({
              storeData: _storeData,
            })
            if (_list.length < 8) {
              this.setData({
                storeFlag: false
              });
            }
          } else {
            this.setData({
              storeFlag: false
            });
          }
        }
      })
    }
  },

  //查询到店自提列表
  marketList() {
    let that = this;
    console.log('bbbb')
    if (!app.globalData.userInfo.lat || !app.globalData.userInfo.lng || !app.globalData.userInfo.city) {
      console.log("ccccc")
      wx.hideLoading();
      this.getlocation();
    } else {
      let _parms = {
        page: this.data.sPage,
        rows: 5,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat
      };
      if (this.data.sPage == 1) {
        this.setData({
          marketList: []
        })
      };
      console.log("_pamms:",_parms)
      Api.superMarketUrl(_parms).then((res) => {
        console.log("res:",res)
        wx.hideLoading();
        if (res.data.code == 0) {
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
            })
            if (_list.length < 5) {
              this.setData({
                marketFlag: false
              });
            }
          } else {
            this.setData({
              marketFlag: false
            });
          }
        }
      })
    }
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0) {
          let _city = res.data.result.address_component.city;
          if (_city != '十堰市' || city != '武汉市') {
            app.globalData.userInfo.city = '十堰市';
          } else {
            app.globalData.userInfo.city = _city;
          }
          that.listForSkuAllocation();
          app.globalData.picker = res.data.result.address_component;
        }
      }
    })

  },
  //下拉刷新
  onPullDownRefresh: function() {
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      page: 1,
      _page: 1,
      sPage: 1,
      listData: [], //送货到家
      storeData: [],
      marketList: [],
      storeFlag: true,
      marketFlag: true
    });
    if (this.data.currentTab == 0) {
      this.commodityCrabList();
    } else if (this.data.currentTab == 1) {
      this.listForSkuAllocation();
    } else if (this.data.currentTab == 2) {
      this.marketList();
    }
  },
  //用户上拉触底加载更多
  onReachBottom: function() {
    if (this.data.currentTab == 0) {
      wx.showLoading({
        title: '加载中...'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.commodityCrabList();
    } else if (this.data.currentTab == 1) {
      if (this.data.storeFlag) {
        wx.showLoading({
          title: '加载中...'
        })
        this.setData({
          _page: this.data._page + 1
        });
        this.listForSkuAllocation();
      }
    } else if (this.data.currentTab == 2) {
      if (this.data.marketFlag) {
        wx.showLoading({
          title: '加载中...'
        })
        this.setData({
          sPage: this.data.sPage + 1
        });
        this.marketList();
      }
    }
  },

  getlocation: function() { //获取用户位置
    let that = this,
      lat = '',
      lng = '';
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        let latitude = res.latitude,longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.marketList();
        that.requestCityName(latitude, longitude);
      },
      fail: function(res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                showCancel: false,
                confirmText: '确认授权',
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting({ //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) {
                          village_LBS(that);
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
  crabPrticulars: function(e) {
    let id = e.currentTarget.id,
      spuId = e.currentTarget.dataset.spuid;
    wx.navigateTo({
      url: 'crabDetails/crabDetails?id=' + id + '&spuId=' + spuId,
    })
  },

  //进入品质好店发起砍价
  crabBargainirg: function(e) {
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