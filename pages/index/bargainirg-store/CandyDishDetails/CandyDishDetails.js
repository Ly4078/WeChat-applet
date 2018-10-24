import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import { GLOBAL_API_DOMAIN} from '../../../../utils/config/config.js';
var app = getApp();
let requesting = false;

var village_LBS = function (that) {
  wx.getLocation({
    success: function (res) {
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}


Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation:false,
    issnap: false, //新用户
    isnew: false, //新用户
    shopId: '', //店铺id
    id: '', //菜id
    picUrl: '', //菜图
    skuName: '', //菜名
    stockNum: '', //库存
    agioPrice: '', //底价
    sellPrice: '', //原价
    sellNum: '', //已售
    shopName: '', //店名
    address: '', //地址
    popNum: '', //人气值
    dishList: [], //同店推荐
    preDishList: [],
    hotDishList: [], //热门推荐
    isBarg: false,
    flag: true,
    page: 1,
    isbargain: false, //是否砍过价
    _city:'',
    _lat:'',
    _lng:''
  },
  onLoad(options) {
    this.setData({
      flag: true,
      hotDishList: [],
      page: 1,
      shopId: options.shopId,
      id: options.id,
      _city: options.city ? options.city:''
    });
    this.getUserlocation();
  },
  onShow() {
    if (!app.globalData.userInfo.city) {
      app.globalData.userInfo.city = '十堰市';
    }
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          this.getmoreData();
          this.isbargain(false);
        } else {
          this.authlogin();
        }
      } else {
        this.setData({
          isnew: true
        });
        this.authlogin();
        // wx.navigateTo({
        //   url: '/pages/personal-center/registered/registered'
        // })
      }
    } else {
      this.findByCode();
    }
  },
  findByCode: function () { //通过code查询用户信息
    wx.showLoading({
      title: '数据加载中....',
    });
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({code: res.code}).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            app.globalData.userInfo.userId = data.id;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }
            if (!data.mobile) { //是新用户，去注册页面
              that.setData({
                isnew: true
              });
              // wx.navigateTo({
              //   url: '/pages/personal-center/registered/registered'
              // })
            }
            let userInfo = app.globalData.userInfo;
            if (userInfo.lat || userInfo.lng || userInfo.city) {
              that.authlogin();//获取token
            } else{
              that.getlocation(); //获取位置信息
            }
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          that.isbargain(false);
          that.getmoreData();
          if (app.globalData.userInfo.mobile) {
            // that.isbargain(false);
            // that.getmoreData();
          } 
        }
      }
    })
  },
  getUserlocation: function () { //获取用户位置经纬度
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude,
          longitude = res.longitude;
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其位置信息          
              that.setData({
                isshowlocation: true
              })

            } else {
              that.getCutDish();
            }
          }
        })
      }
    })
  },
  openSetting() {//打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) { //打开位置授权          
          // that.getUserlocation();
          // village_LBS(that);
          console.log('userLocation')
          
          that.setData({
            isshowlocation: true
          })
        } else {
          wx.getLocation({
            success: function (res) {
              let latitude = res.latitude,
                longitude = res.longitude;
              that.requestCityName(latitude, longitude);
            },
          })
          // let lat = '32.6226',
          //   lng = '110.77877';
          // that.requestCityName(lat, lng);
        }
      }
    })
  },
  getmoreData() { //查询 更多数据 
    this.dishDetail();
    this.shopDetail();
    if (app.globalData.userInfo.lng && app.globalData.userInfo.lat) {
      if (this.data._city || app.globalData.userInfo.city) {
        this.setData({
          flag: true,
          hotDishList: [],
          page: 1
        });
        this.dishList();
        this.hotDishList();
      }else{
        this.getlocation();
      }
    } 
  },
  chilkDish(e) { //点击某个推荐菜
    let id = e.currentTarget.id,
      shopId = e.currentTarget.dataset.shopid;
    this.setData({
      id: id,
      shopId: shopId,
      page: 1,
      flag: true,
      hotDishList: []
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    this.getmoreData();
    this.isbargain(false);
  },
  chickinItiate(e) { //点击某个发起砍价
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _refId = e.currentTarget.id,
      _shopId = e.currentTarget.dataset.shopid,
      _agioPrice = e.currentTarget.dataset.agioprice,
      _sellPrice = e.currentTarget.dataset.sellprice;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      skuId: _refId,
      token: app.globalData.token
    };
    Api.vegetables(_parms).then((res) => {
      if (res.data.data.length > 0) {
        this.setData({
          isbargain: true
        });
        this.toBargainList();
      } else {
        wx.navigateTo({
          url: '../AprogressBar/AprogressBar?refId=' + _refId + '&shopId=' + _shopId + '&skuMoneyMin=' + _agioPrice + '&skuMoneyOut=' + _sellPrice
        })
      }
    });
  },
  //点击同店推荐菜品
  dishesDiscounts(e) {
    let id = e.currentTarget.id;
    this.setData({
      id: id,
      page: 1,
      flag: true,
      hotDishList: []
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    this.getmoreData();
    this.isbargain(false);
  },
  //查询单个砍价菜
  dishDetail() {
    wx.showLoading({
      title: '数据加载中....',
    });
    let _parms = {
      Id: this.data.id,
      zanUserId: app.globalData.userInfo.userId,
      shopId: this.data.shopId,
      token: app.globalData.token
    };
    Api.discountDetail(_parms).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0 && res.data.data) {
        let data = res.data.data;
        let skuInfo = '';
        if (data.skuInfo && data.skuInfo != 'null' && data.skuInfo != 'undefined') {
          skuInfo = data.skuInfo.split('Œ');
        }
        this.setData({
          picUrl: data.picUrl,
          skuName: data.skuName,
          skuInfo: skuInfo,
          stockNum: data.stockNum,
          agioPrice: data.agioPrice,
          sellPrice: data.sellPrice,
          sellNum: data.sellNum
        });
      } 
    })
  },
  //查询商家信息
  shopDetail() {
    wx.showLoading({
      title: '数据加载中....',
    });
    let _this = this;
    wx.request({
      url: _this.data._build_url + 'shop/get/' + _this.data.shopId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data;
          _this.setData({
            shopName: data.shopName,
            address: data.address,
            popNum: data.popNum
          });
        } 
      }
    });

  },
  //跳转至商家主页
  toShopDetail() {
    wx.navigateTo({
      url: '../../merchant-particulars/merchant-particulars?shopid=' + this.data.shopId
    })
  },
  //同店推荐
  dishList() {
    //browSort 0附近 1销量 2价格
    wx.showLoading({
      title: '数据加载中...',
    });
    let that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng){
      let _parms = {
        shopId: this.data.shopId,
        zanUserId: app.globalData.userInfo.userId,
        browSort: 0,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        isDeleted: 0,
        page: 1,
        rows: 10,
        token: app.globalData.token
      };
      Api.partakerList(_parms).then((res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let list = res.data.data.list,
              newList = [], preDishList = [];
            for (let i = 0; i < list.length; i++) {
              if (list[i].id != this.data.id) {
                newList.push(list[i]);
              }
            }
            preDishList = newList.length > 5 ? newList.slice(0, 4) : newList;
            this.setData({
              dishList: newList,
              preDishList: preDishList
            });
          }
        }

      })
    } else{
      that.getlocation();
    }
    
  },
  //热门推荐
  hotDishList() {
    let that = this, _parms={};
    if(this.data.page == 1) {
      this.setData({
        flag: true,
        hotDishList: []
      });
    }
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
      //browSort 0附近 1销量 2价格
      _parms = {
        zanUserId: app.globalData.userInfo.userId,
        browSort: 1,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        city: this.data._city ? this.data._city : app.globalData.userInfo.city,
        isDeleted: 0,
        page: this.data.page,
        rows: 6,
        token: app.globalData.token
      };
      requesting = true;
      Api.partakerList(_parms).then((res) => {
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let list = res.data.data.list,
              hotDishList = this.data.hotDishList;
            if (list && list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                for (let j = 0; j < hotDishList.length; j++) {
                  if (hotDishList[j].id == list[i].id) {
                    hotDishList.splice(j, 1)
                  }
                }
              }

              for (let i = 0; i < list.length; i++) {
                if (list[i].id != this.data.id) {
                  list[i].distance = utils.transformLength(list[i].distance);
                  hotDishList.push(list[i]);
                }
              }

              this.setData({
                hotDishList: hotDishList,
                pageTotal: Math.ceil(res.data.data.total / 6),
                loading: false
              },()=>{
                requesting = false
                wx.hideLoading();
              });
              if (list.length < 6) {
                this.setData({
                  flag: false
                });
              }
            }

          } else {
            this.setData({
              flag: false,
              loading: false
            });
            requesting = false
          }
        }else{
          wx.hideLoading();
          requesting = false
          this.setData({
            loading: false
          });
        }
      },()=>{
        wx.hideLoading();
        requesting = false
        this.setData({
          loading: false
        });
      })
    }else{
      that.getlocation();
    }
  },
  //点击跳转至砍价列表
  toBargainList() {
    wx.showModal({
      title: '您已发起了砍价，是否查看状态',
      content: '',
      complete(e) {
        if (e.confirm) {
          wx.navigateTo({
            url: '../pastTense/pastTense'
          });
        }
      }
    })
  },
  //是否发起过砍价
  isbargain(isHref) {
    let _parms = {
      // userId: app.globalData.userInfo.userId,
      skuId: this.data.id,
      token: app.globalData.token
    };
    Api.vegetables(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data.length > 0) {
          this.setData({
            isbargain: true
          });
          if (isHref) {
            this.toBargainList();
          }
        }
      }
    });
  },
  //原价购买
  originalPrice() {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      let sellPrice = this.data.sellPrice;
      wx.navigateTo({
        url: '../../order-for-goods/order-for-goods?shopId=' + this.data.shopId + '&skuName=' + sellPrice + '元砍价券&sell=' + sellPrice + '&skutype=4&dishSkuId=' + this.data.id + '&dishSkuName=' + this.data.skuName + '&bargainType=1'
      })
    }
  },
  //查看全部砍价菜
  changeBar() {
    this.setData({
      isBarg: !this.data.isBarg
    });
  },
  //发起砍价
  sponsorVgts: function() {
    let that = this, _parms = {};
    if (!app.globalData.userInfo.mobile) {
        that.setData({
        issnap: true
      })
    }else{
      _parms = {
        userId: app.globalData.userInfo.userId,
        skuId: that.data.id,
        token: app.globalData.token
      };
      Api.vegetables(_parms).then((res) => {
        if (res.data.code == 0) {
          if (res.data.data.length > 0) {
            that.setData({
              isbargain: true
            });
            that.toBargainList();
          } else {
            wx.navigateTo({
              url: '../AprogressBar/AprogressBar?refId=' + that.data.id + '&shopId=' + that.data.shopId + '&skuMoneyMin=' + that.data.agioPrice + '&skuMoneyOut=' + that.data.sellPrice
            })
          }
        }
      });
    }
    
  },
  // 左上角返回首页
  returnHomeArrive: function() {
    wx.switchTab({
      url: '../../index',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  onReachBottom: function() { //用户上拉触底加载更多
    if (!this.data.flag) {
      return false;
    }
    if (requesting){
      return
    }
    if (this.data.pageTotal <= this.data.page){
      return
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    },()=>{
      this.hotDishList();
    });
    
  },
  onPullDownRefresh: function() {  //下拉刷新 
    this.setData({
      flag: true,
      hotDishList: [],
      page: 1
    });
    this.hotDishList();
    this.dishList();
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
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                showCancel:false,
                confirmText: '确认授权',
                success: function(res) {
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
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    if(!lat && !lng){
      this.getlocation();
    }else{
      app.globalData.userInfo.lat = lat;
      app.globalData.userInfo.lng = lng;
      if (app.globalData.userInfo.city || this.data._city) {
        that.getmoreData();
        that.isbargain(false);
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
              app.globalData.picker = res.data.result.address_component;
              wx.setStorageSync('userInfo', app.globalData.userInfo);
              
              that.getmoreData();
              that.isbargain(false);
            }
          }
        })
      }
    }
    
    
  },
  closetel: function(e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },
  //分享给好友
  onShareAppMessage: function() {
    let userInfo = app.globalData.userInfo;
    return {
      title: this.data.skuName,
      path: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?shopId=' + this.data.shopId + '&id=' + this.data.id + '&lat=' + userInfo.lat+'&lng='+userInfo.lng+'&city='+userInfo.city,
      success: function(res) {
        
      },
      fail: function(res) {
        // 分享失败
        
      }
    }
  },
})