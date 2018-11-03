//index.js 
import Api from '/../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
var utils = require('../../utils/util.js');
import Public from '../../utils/public.js';
var app = getApp();

var village_LBS = function(that) {
  wx.getLocation({
    success: function(res) {
      let latitude = res.latitude;
      let longitude = res.longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    city: "",
    isshowlocation: false, //是否显示请求位置授权弹框
    carousel: [], //轮播图
    business: [], //商家列表，推荐餐厅
    alltopics: [],
    currentTab: 0,
    isformid: true,
    loading: false,
    istouqu: false,
    isclose: false,
    activityImg: '', //活动图
    settime: null,
    // 改版新增变量 
    _page: 1,
    bargainList: [], //砍价拼菜
    bargainListall: [], //拼菜砍价
    secKillList: [], //限量秒杀
    fresh1: {}, //享7生鲜图片1
    fresh2: {}, //享7生鲜图片2
    fresh3: {}, //享7生鲜图片3
    whhotdish: [],
    syhotdish: [],
    hotdish: [],
    bannthree: [],
    navs: [{
        img: 'https://xqmp4-1256079679.file.myqcloud.com/text_701070039850928092.png',
        id: 1,
        name: '砍价'
      },
      {
        img: '/images/icon/navcaiting.png',
        id: 2,
        name: '餐厅'
        // }, {
        //   img: '/images/icon/navruzhu.png',
        //   id: 3,
        //   name: '活动'
      }, {
        img: '/images/icon/navshiping.png',
        id: 4,
        name: '短视频'
      }, {
        img: '/images/icon/navhuodong.png',
        id: 5,
        name: '商家入驻'
      }, {
        img: '/images/icon/home.png',
        id: 6,
        name: '酒店'
      }, {
        img: '/images/icon/mountain.png',
        id: 7,
        name: '景点'
      }
    ],
    Res: [{
      img: '/images/icon/jxcanting.png',
      name: '精选餐厅',
      id: 1
    }],
    Act: [{
      img: '/images/icon/home_sign.png',
      name: '热门活动',
      id: 3
    }],
    Bargain: [{
      img: '/images/icon/bargainImg.png',
      name: '拼菜砍价',
      id: 4
    }],
    secKillArr: [{
      img: '/images/icon/clock.png',
      name: '限量秒杀',
      id: 5
    }],
    crab: [{
      img: '/images/icon/crab.png',
      name: '享7生鲜',
      id: 5
    }]
  },
  onLoad: function(options) {
    let that = this;
    //版本更新
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    });
    updateManager.onUpdateReady(function() {
      // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      updateManager.applyUpdate()
    });
    updateManager.onUpdateFailed(function() {
      // 新的版本下载失败
    });
    let carousel = wx.getStorageSync("carousel") || [];
    let bannthree = wx.getStorageSync("bannthree") || [];
    let txtObj = wx.getStorageSync('txtObj') || {};
    // let _token = wx.getStorageSync('userInfo').token || '';
    // let userInfo = wx.getStorageSync('userInfo') || {};
    // userInfo.city = userInfo.city ? userInfo.city:'十堰市'
    // app.globalData.userInfo = userInfo
    if (txtObj.sydish && txtObj.sydish.length > 0) {
      this.setData({
        fresh1: txtObj ? txtObj.fresh1 : '',
        fresh2: txtObj ? txtObj.fresh2 : '',
        fresh3: txtObj ? txtObj.fresh3 : '',
        syhotdish: txtObj ? txtObj.sydish : {},
        whhotdish: txtObj ? txtObj.whdish : {}
      });
    }
    this.setData({
      bannthree,
      carousel
    });
  },
  onShow: function() {
    let that = this;
    that.indexinit();
    if (app.globalData.userInfo.city) {
      if (app.globalData.userInfo.city != app.globalData.oldcity) {
        app.globalData.oldcity = app.globalData.userInfo.city;
        that.setData({
          city: app.globalData.userInfo.city,
          bargainListall: [],
          bargainList: [],
          _page: 1
        })
      }
    }
    // that.getUserlocation();
    this.setData({
      loading: false,
      isshowlocation: false
    })
    if (app.globalData.userInfo.city) {
      this.setData({
        city: app.globalData.userInfo.city
      })
      let userInfo = wx.getStorageSync('userInfo')
      userInfo = app.globalData.userInfo;
      wx.setStorageSync('userInfo', userInfo)
    }

    if (app.globalData.changeCity) {
      app.globalData.changeCity = false;
      this.setData({
        _page: 1
      })
    }
  },
  indexinit: function() {
    let that = this;
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          that.getUserlocation();
          that.getdatamore();
        } else {
          that.authlogin();
        }
      } else { //是新用户，
        if (app.globalData.token) {
          that.getdatamore();
        } else {
          that.authlogin();
        }
      }
    } else {
      that.findByCode();
    }
  },
  submit: function(e) {
    let _formId = e.detail.formId;
    this.setData({
      isformid: false
    })
    Public.addFormIdCache(_formId);
  },
  // 初始化start
  findByCode: function() { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
            if (_data && _data.id) {
              app.globalData.userInfo.userId = _data.id;
              for (let key in _data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = _data[key]
                  }
                }
              };
              if(_data.mobile){
                that.authlogin();
              }else{
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                })
              }
            }else{
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
          }
        })
      }
    })
  },

  authlogin: function() { //获取token
    let that = this;
    Public.authlogin(app.globalData.userInfo.userName);
    setTimeout(()=>{
      let _token = wx.getStorageSync("token") || "";
      app.globalData.token=_token;
      console.log(_token.length)
      if (_token.length>2) {
        that.getdatamore();
      } else {
        that.authlogin();
      }
    },2000)
  },
  getdatamore: function() { //请求配置数据
    let that = this;
    wx.request({
      url: this.data._build_url + 'version.txt',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        console.log('res:',res)
        app.globalData.txtObj = res.data;
        wx.setStorageSync("txtObj", res.data);
        if (res.data.flag == 0) { //0显示  
          app.globalData.isflag = true;
          let _navs = that.data.navs;
          _navs[2].name = "短视频";
          that.setData({
            navs: _navs
          })
        } else if (res.data.flag == 1) { //1不显示
          app.globalData.isflag = false;
          let _navs = that.data.navs;
          _navs[2].name = "微生活";
          that.setData({
            navs: _navs
          })
        }
        if (res.data.fresh1) {
          that.setData({
            fresh1: res.data.fresh1,
            fresh2: res.data.fresh2,
            fresh3: res.data.fresh3,
          })
        }
        if (res.data.kancai == 0) { //砍价0显示   
          let _Bargain = that.data.Bargain;
          _Bargain[0].name = '拼菜砍价';
          that.setData({
            Bargain: _Bargain
          })
        } else if (res.data.kancai == 1) { //砍价1不显示
          let _Bargain = that.data.Bargain;
          let _navs = that.data.navs;
          _Bargain[0].name = '精选美食';
          _navs = _navs.slice(1, 4);
          that.setData({
            Bargain: _Bargain,
            navs: _navs
          })
        }
        if (res.data.sydish.length > 0) {
          that.setData({
            syhotdish: res.data.sydish,
            hotdish: res.data.sydish
          })
        }
        if (res.data.whdish.length > 0) {
          that.setData({
            whhotdish: res.data.whdish
          })
        }
        that.getuserIdLater2();
        that.activityBanner();
        that.getcarousel();
        // that.getactlist();
        that.gettoplistFor();
      }
    })
  },
  getuserIdLater2: function() { //获取到userId之后要执行的事件2
    let that = this,
      userInfo = app.globalData.userInfo;
    if (userInfo.lat && userInfo.lng && userInfo.city) {
      this.getCutDish();
    }else{
      this.getUserlocation();
    }
  },
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          village_LBS(that);
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },

  getUserlocation: function() { //获取用户位置经纬度
    let that = this,
      _userInfo = app.globalData.userInfo;
    // let lat = '32.6226',
    //   lng = '110.77877';
    // that.requestCityName(lat, lng);
    // return
    if (_userInfo.lat && _userInfo.lat && _userInfo.city) {
      return
    }
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        let latitude = res.latitude,
          longitude = res.longitude;
        that.requestCityName(latitude, longitude);
      },
      fail: function(res) {
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

  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    app.globalData.userInfo.lat = lat;
    app.globalData.userInfo.lng = lng;
    if (app.globalData.userInfo.city) {
      this.getCutDish();
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
            let userInfo = app.globalData.userInfo;
            wx.setStorageSync('userInfo', userInfo);
            that.getCutDish();
            that.setData({
              city: app.globalData.userInfo.city
            })
          }
        }
      })
    }
  },
  toSeckillList() { //限量秒杀查看更多
    wx.navigateTo({
      url: 'flashSaleHome/flashSaleHome'
    })
  },
  getCutDish: function() { // 获取砍菜数据
    let that = this;
    if(app.globalData.token.length>2){
      this.setData({
        bargainList: [],
        bargainListall: [],
        _page: 1
      })
      if (app.globalData.userInfo.city == '十堰市') {
        this.setData({
          hotdish: this.data.syhotdish
        })
      } else if (app.globalData.userInfo.city == '武汉市') {
        this.setData({
          hotdish: this.data.whhotdish
        })
      }

      if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
        this.setData({
          bargainList: [],
          _page: 1
        });
        this.hotDishList();
        this.getsecKill();

        for (let i = 0; i < this.data.hotdish.length; i++) {
          let _hotdish = this.data.hotdish[i];
          this.getdishDetail(_hotdish.dishId, _hotdish.shopId);
        }
      } else {
        this.getUserlocation();
      }
    }
  },
  // 初始化end
  activityBanner: function() { //获取活动banner图
    let that = this;
    if (this.data.activityImg.length > 0) {

    } else {
      Api.activityImg().then((res) => {
        if (res.data.code == 0) {
          if (res.data.data && res.data.data[9] && res.data.data[9].imgUrl) {
            let imgUrl = res.data.data[9].imgUrl;
            if (imgUrl != '' && imgUrl != null && imgUrl != undefined) {
              that.setData({
                activityImg: imgUrl
              })
            }
          }
        }
      })
    }
  },

  getcarousel: function() { //轮播图
    let that = this,
      _parms = {};
    if (this.data.carousel.length > 0) {} else {
      _parms = {
        token: app.globalData.token
      }
      Api.hcllist(_parms).then((res) => {
        if (res.data.data) {
          wx.setStorageSync('carousel', res.data.data)
          this.setData({
            carousel: res.data.data
          })
        }
      })
    }
  },

  hotDishList() { //拼价砍菜列表
    //browSort 0附近 1销量 2价格
    let _parms = {},
      that = this;
    this.setData({
      city: this.data.city ? this.data.city : app.globalData.userInfo.city
    })
    if (app.globalData.userInfo.lng && app.globalData.userInfo.lat) {
      _parms = {
        zanUserId: app.globalData.userInfo.userId,
        browSort: 2,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        city: app.globalData.userInfo.city,
        page: this.data._page,
        isDeleted: 0,
        rows: 10,
        token: app.globalData.token
      };
      this.setData({
        _page: this.data._page + 1,
        loading: true
      })
      Api.partakerList(_parms).then((res) => {
        that.setData({
          loading: false
        })
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let _list = res.data.data.list,
              _oldData = this.data.bargainListall,
              arr = [];
            for (let i = 0; i < _list.length; i++) {
              for (let j = 0; j < _oldData.length; j++) {
                if (_oldData[j].id == _list[i].id) {
                  _oldData.splice(j, 1)
                }
              }
            }
            for (let i = 0; i < _list.length; i++) {
              _list[i].distance = utils.transformLength(_list[i].distance);
              _oldData.push(_list[i])
            }
            this.setData({
              bargainListall: _oldData,
              pageTotal: Math.ceil(res.data.data.total / 10),
              loading: false
            })

          }
        }
      })
    } else {
      that.getUserlocation();
    }
  },
  getdishDetail: function(Id, shopId) { //查询单个砍菜详情
    let that = this,
      _parms = {},
      _arr = [],
      arr = [];
    _parms = {
      Id: Id,
      zanUserId: app.globalData.userInfo.userId,
      shopId: shopId,
      token: app.globalData.token
    };
    Api.discountDetail(_parms).then((res) => {
      if (res.data.code == 0) {
        arr = that.data.bargainList;
        if (res.data.data) {
          arr.push(res.data.data);
          if (arr.length > 3) {
            _arr = arr.slice(0, 3);
            that.setData({
              bargainList: _arr
            })
          } else {
            that.setData({
              bargainList: arr
            })
          }
        }
      }
    })
  },
  getsecKill() { //查询限量秒杀列表
    let _parms = {},
      that = this;
    _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 0,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      isDeleted: 0,
      page: 1,
      rows: 8,
      token: app.globalData.token
    };
    console.log("_parms:",_parms)
    Api.secKillList(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data.list && res.data.data.list.length > 0) {
          that.setData({
            secKillList: res.data.data.list.slice(0, 3)
          });
        } else {
          that.setData({
            secKillList: []
          });
        }
      }
    });
  },

  toSecKillDetail(e) { //跳转至菜品详情
    let curr = e.currentTarget;
    wx.navigateTo({
      url: 'flashSaleHome/secKillDetail/secKillDetail?id=' + curr.id + '&shopId=' + curr.dataset.shopid
    })
  },
  // 点击One某个nav
  handnavOne(e) {
    let id = e.currentTarget.id;
    if (id == 1) { //砍菜
      wx.navigateTo({
        url: 'bargainirg-store/bargainirg-store',
      })
    } else if (id == 2) { //餐厅
      wx.navigateTo({
        url: 'dining-room/dining-room',
      })
    } else if (id == 3) { //活动
      wx.switchTab({
        url: '../activityDetails/activity-details',
      })
    } else if (id == 4) { //短视频
      wx.switchTab({
        url: '../discover-plate/discover-plate',
      })
    } else if (id == 5) { //商家入驻  APP下载
      wx.navigateTo({
        url: '../../pages/index/download-app/download?isshop=ind',
      })
    } else if (id == 6 || id == 7) { //酒店景点
      wx.navigateTo({
        url: '../../pages/index/productCategory/productCategory',
      })
    }
  },
  //点击某个“查看更多”
  handVeoRes(e) {
    let id = e.currentTarget.id,
      that = this;
    if (id == 1) { //商家列表
      wx.navigateTo({
        url: 'dining-room/dining-room',
      })
    } else if (id == 2) { //短视频
      wx.switchTab({
        url: '../discover-plate/discover-plate',
      })
    } else if (id == 3) { //活动列表
      wx.switchTab({
        url: '../activityDetails/activity-details',
      })
    } else if (id == 4) { //拼菜砍价列表
      wx.navigateTo({
        url: 'bargainirg-store/bargainirg-store',
      })
    }
  },

  //点击推荐的三个餐厅之一
  handResitem(e) {
    let shopid = e.currentTarget.id;
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },
  //点击拼菜砍价之一
  candyDetails(e) {
    let id = e.currentTarget.id,
      shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: 'bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId
    })
  },

  onPullDownRefresh: function() { //下拉刷新
    this.setData({
      bargainList: [], //砍价拼菜
      bargainListall: [], //拼菜砍价
      _page: 1
    })
    this.getCutDish();
  },
  onReachBottom: function() { //用户上拉触底加载更多
    if (this.data.pageTotal < this.data._page) { //当前页码大于等于数据总页码

    } else {
      // this.getshoplist();
      this.hotDishList();
      if (!this.data.alltopics) {
        this.gettoplistFor()
      }
    }
  },

  //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    this.setData({
      _page: 1
    })
  },

  gettoplistFor: function() { //加载分类数据
    let _list = [],
      _shop = [],
      _parms = {},
      that = this;
    _parms = {
      token: app.globalData.token
    };
    Api.listForHomePage(_parms).then((res) => {
      if (res.data.code == 0) {
        if (!res.data.data && res.data.data.length > 0) {
          that.gettoplistFor();
        } else {
          // bannthree
          let listarr = res.data.data.slice(0, 3);
          that.setData({
            bannthree: listarr
          })
          wx.setStorageSync('bannthree', listarr) //商家广告位-砍价拼菜banner图
        }
      }
    })
  },

  userLocation: function() { // 用户定位
    wx.navigateTo({
      url: 'user-location/user-location',
    })
  },
  seekTap: function() { //用户搜索
    wx.navigateTo({
      url: 'user-seek/user-seek',
    })
  },

  toNewExclusive: function(e) { //跳转至新人专享页面
    let id = e.currentTarget.id,
      _linkUrl = '',
      _type = '',
      _obj = {};

    for (let k in this.data.carousel) {
      if (id == this.data.carousel[k].id) {
        _linkUrl = this.data.carousel[k].linkUrl,
          _type = this.data.carousel[k].type
      }
    }
    if (_linkUrl.indexOf('&') >= 0) {
      let arr = _linkUrl.split("&");
      for (let i in arr) {
        let arr2 = arr[i].split("=");
        _obj[arr2[0]] = arr2[1];
      }
    }

    if (_linkUrl == 'lingquan') {
      wx.navigateTo({
        url: 'new-exclusive/new-exclusive',
      })
    } else if (_linkUrl == 'ruzhu') {
      wx.navigateTo({
        url: '../../pages/index/download-app/download?isshop=ind',
      })
    } else if (_obj.type == 2) { //换螃蟹活动
      wx.navigateTo({ //换螃蟹活动
        url: '../activityDetails/holdingActivity/holdingActivity'
      })
    } else if (_obj.type == 3) { //店铺主页
      wx.navigateTo({
        url: 'merchant-particulars/merchant-particulars?shopid=' + _obj.shopId,
      })
    } else if (_obj.id) { // 生鲜商品详情
      wx.navigateTo({
        url: '../index/crabShopping/crabDetails/crabDetails?id=' + _obj.id + '&spuId=' + _obj.spuId,
      })
    }
  },

  //监听页面分享
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '享7美食',
      path: 'pages/index/index',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_ajdlfadjfal.png',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  // 螃蟹使用攻略
  crabSteamed: function(e) {
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=1'
    })
  },
  //点击精选餐厅下的入驻图片
  handbaoming(e) {
    let id = e.currentTarget.id,
      ind = e.currentTarget.dataset.ind,
      reg1 = new RegExp("shopId"),
      reg2 = new RegExp("topicId"),
      reg3 = new RegExp("actId"),
      reg4 = new RegExp("type"),
      arr = this.data.bannthree;

    if (id == 3) { //点击商家广告位，进入指定商家页面
      let str = arr[2].linkUrl;
      if (reg1.test(str)) {
        let _arr = str.split("=");
        wx.navigateTo({
          url: 'merchant-particulars/merchant-particulars?shopid=' + _arr[1]
        })
      }
    }
  },
  chartOfDisheses: function() { // 砍菜砍价详情
    wx.navigateTo({
      url: 'chartOfDisheses/chartOfDisheses',
    })
  },
  //享7生鲜查看更多
  toFresh: function() {
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=0'
    })
  },
  // 螃蟹进入商品详情
  crabPrtDetails: function(e) {
    let id = e.currentTarget.id,
      spuId = e.target.dataset.spuid;
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=0' + '&spuval=' + spuId
    })
  },

  toStore() { //跳转至到店自提列表
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=2'
    })
  },
  chartOfDisheses: function() { // 砍菜砍价详情
    wx.navigateTo({
      url: 'chartOfDisheses/chartOfDisheses',
    })
  },

  // 螃蟹使用攻略
  crabSteamed: function(e) {
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=1'
    })
  },

  //去消息通知页面
  tomsg:function(){
    wx.navigateTo({
      url: '/pages/index/notification/notification',
    })
  }
})