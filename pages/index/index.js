//index.js 
import Api from '/../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
var utils = require('../../utils/util.js');
import Public from '../../utils/public.js';
import getToken from '../../utils/getToken.js';
var app = getApp();
var isgetHomeData = false
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
    showSkeleton: true,
    timer: null,
    listStart: null,
    toTops: false,
    isnewTips: false,
    allList: [],
    _build_url: GLOBAL_API_DOMAIN,
    city: "", //默认值十堰市
    isshowlocation: false, //是否显示请求位置授权弹框
    carousel: [''], //轮播图
    currentTab: 0,
    isformid: true,
    loading: false,
    // 改版新增变量 
    fresh1: {}, //享7生鲜图片1
    fresh2: {}, //享7生鲜图片2
    fresh3: {}, //享7生鲜图片3
    bannthree: [],
    navs: [{
        imgUrl: '',
        title: '',
        flag: false
      },
      {
        imgUrl: '',
        title: ''
      },
      {
        imgUrl: '',
        title: ''
      },
      {
        imgUrl: '',
        title: ''
      },
      {
        imgUrl: '',
        title: ''
      }
    ],

  },
  togrourp:function(){
    wx.navigateTo({
      url: '/packageA/pages/tourismAndHotel/tourismAndHotel?id=43',
    })
  },
  getfptt:function(){
    wx.navigateTo({
      url: '/pages/personal-center/personnel-order/logisticsDetails/applyBilling/applyBilling',
    })
   
  },
  onLoad: function(options) {
    let that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000)
    try{
      //版本更新
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        // console.log(res.hasUpdate)
      });
      updateManager.onUpdateReady(function () {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      });
      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
      });
    }catch(err){
      console.log(err)
    }
    let carousel = wx.getStorageSync("carousel") || [''];
    let bannthree = wx.getStorageSync("bannthree") || [];
    let txtObj = wx.getStorageSync('txtObj') || {};
    if (Object.keys(txtObj).length != 0) {
      that.setData({
        fresh1: txtObj ? txtObj.fresh1 : '',
        fresh2: txtObj ? txtObj.fresh2 : '',
        fresh3: txtObj ? txtObj.fresh3 : '',
        navs: txtObj.navs ? txtObj.navs : that.data.navs
      });
    }
    that.setData({
      bannthree,
      windowHeight: app.globalData.systemInfo.windowHeight,
      carousel
    });
  },
  onShow: function() {
    let that = this;
    //获取地理位置
    if (app.globalData.userInfo.city) {
      if (app.globalData.userInfo.city != app.globalData.oldcity) {
        app.globalData.oldcity = app.globalData.userInfo.city;
        that.setData({
          city: app.globalData.userInfo.city,
        })
      }
    }
    if (app.globalData.changeCity) {
      that.setData({
        notData: false
      })
      that.gethomeData('reset')
      app.globalData.changeCity = false;
    }
    if (!app.globalData.token) { //没有token 获取token
      getToken(app).then( ()=>{
        that.getcarousel(); //首页轮播图
        that.gettoplistFor() //快捷入口
        that.getconfig(); //配置文件
        that.gettips(); //获取推送
        that.gethomeData('reset'); //获取下面列表数据
        setTimeout(() => {
          that.setData({
            showSkeleton: false
          })
        }, 200)
      })
    } else {
      that.getconfig(); //配置文件
      that.gettips(); //获取推送
      if (that.data.allList.length < 1) {
        that.gethomeData('reset')
      }
      if (that.data.carousel[0] == '') {
        that.getcarousel(); //没有轮播图，请求轮播图
      }
      if (that.data.bannthree.length < 1) {
        that.gettoplistFor();
      }
    }
    that.getUserlocation();
    that.data.timer = setTimeout(function() {
      if (!app.globalData.token) {
        that.findByCode();
      } else {
        clearTimeout(that.data.timer)
      }
    }, 5000)
  },
  onHide: function() {
    let that = this;
    try {
      clearTimeout(that.data.timer);
    } catch (err) {

    }
  },
  getUserlocation: function() { //获取用户位置经纬度
    let that = this,
      _userInfo = app.globalData.userInfo;
    if (_userInfo.lat && _userInfo.lat && _userInfo.city) {
      that.setData({
        city: _userInfo.city
      })
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
          that.setData({
            city: app.globalData.userInfo.city
          })
          that.gethomeData('reset')
        }
      }
    })

  },
  getconfig: function() { //请求配置数据
    let that = this;
    wx.request({
      url: this.data._build_url + 'version.txt',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        app.globalData.txtObj = res.data;
        wx.setStorageSync("txtObj", res.data);
        if (res.data.flag == 0) { //0显示  
          app.globalData.isflag = true;
          try {
            res.data.navs[4].title = "短视频";
          } catch (err) {
          }
        } else if (res.data.flag == 1) { //1不显示
          app.globalData.isflag = false;
          try {
            res.data.navs[4].title = "微生活";
          } catch (err) {}

        }
        if (res.data.fresh1) {
          that.setData({
            fresh1: res.data.fresh1,
            fresh2: res.data.fresh2,
            fresh3: res.data.fresh3,
            navs: res.data.navs || [],
            indexShare: res.data.indexShare || ''
          })
        }
      }
    })
  },

  gettoplistFor: function() { //加载广告位，快捷入口
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
          let listarr = res.data.data.slice(0, 3);
          that.setData({
            bannthree: listarr
          })
          wx.setStorageSync('bannthree', listarr) //商家广告位-砍价拼菜banner图
        }
      }
    })
  },
  gethomeData: function(types) {
    isgetHomeData = true;
    let locations = {}
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      locations.lat = app.globalData.userInfo.lat
      locations.lng = app.globalData.userInfo.lng
      locations.city = app.globalData.userInfo.city
    } else {
      locations.lat = '32.6226'
      locations.lng = '110.77877'
      locations.city = '十堰市'
    }
    let that = this;
    let data = {
      locationX: locations.lng,
      locationY: locations.lat,
      city: locations.city,
      rows: 48,
    }
    if (that.data.listStart != null && types != 'reset') {
      data.listStart = that.data.listStart
    }
    wx.request({
      url: that.data._build_url + 'hcl/listForHomeObject',
      method: 'POST',
      data: JSON.stringify(data),
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == '0') {

          var notData = true
          let data = res.data.data
          var arr = [];
          for (var k in data) {
            if (data[k]) {
              if (data[k].length) {
                notData = false
                if (data[k][0].homeTotle) {
                  var obj = {};
                  obj.type = k
                  obj.start = data[k][0].homeTotle
                  arr.push(obj)
                }
              }
            }
          }
          if (!res.data.data) {
            notData = true
          }
          if (data.topicVideo) {
            if (data.topicVideo.length) {
              for (var i = 0; i < data.topicVideo.length; i++) {
                if (data.topicVideo[i].content) {
                  data.topicVideo[i].content = JSON.parse(data.topicVideo[i].content);
                }
              }
            }
          }
          try {
            data.skuMS = data.skuMS.slice(0, data.skuMS.length - (data.skuMS.length % 2))
          } catch (err) {
  
          }
          var allList = that.data.allList ? that.data.allList : [];
          if (types == 'reset') {
            allList = []
            allList[0] = data
          } else {
            allList.push(data)
          }
          for (let i in allList[0].skuKJ){
            allList[0].skuKJ[i].distance = utils.transformLength(allList[0].skuKJ[i].distance);
            
          }
          for (let i in allList[0].skuMS) {
            allList[0].skuMS[i].distance = utils.transformLength(allList[0].skuMS[i].distance);
            
          }
          console.log('allList:', allList)
          that.setData({
            listStart: arr,
            allList: allList,
            loading: false,
            showSkeleton:false,
            notData: notData
          }, () => {
            isgetHomeData = false
            wx.hideLoading();
          })

        } else {
          isgetHomeData = false
          wx.hideLoading();
          that.setData({
            loading: false,
            showSkeleton: false,
          })
        }
      },
      fail() {
        isgetHomeData = false
        wx.hideLoading();
        that.setData({
          loading: false,
          showSkeleton: false,
        })
      }
    })
  },
  onReachBottom: function() {
    let that = this;
    if (that.data.notData) { //没有数据啦
      return
    }

    if (!that.data.allList) {
      return false
    }
    if (!that.data.allList.length) {
      return false
    }
    if (isgetHomeData) {
      return false
    }
    this.setData({
      loading: true
    }, () => {
      that.gethomeData();
    })

  },
  gettips: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'msg/unreadMessageTotal',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == '0') {
          let total = '';
          if (res.data.data.length) {
            for (let i = 0; i < res.data.data.length; i++) {
              total += res.data.data[i].total
            }
          }
          that.setData({
            isnewTips: total >= 1 ? true : false
          })
        }
      }
    })
  },
  getcarousel: function() { //轮播图
    let that = this,
      _parms = {};
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

  },

  // indexinit: function() {
  //   let that = this;
  //   if (app.globalData.userInfo.userId) {
  //     if (app.globalData.userInfo.mobile) {
  //       if (app.globalData.token) {
  //         that.getUserlocation();
  //         that.getdatamore();
  //       } else {
  //         that.authlogin();
  //       }
  //     } else { //是新用户，
  //       if (app.globalData.token) {
  //         that.getdatamore();
  //       } else {
  //         that.authlogin();
  //       }
  //     }
  //   } else {
  //     that.findByCode();
  //   }
  // },
  // submit: function(e) {
  //   let _formId = e.detail.formId;
  //   this.setData({
  //     isformid: false
  //   })
  //   Public.addFormIdCache(_formId);
  // },


  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          that.getUserlocation();
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
  tonewTips: function(e) {
    wx.navigateTo({
      url: '/pages/index/notification/notification',
    })
  },
  toLink(e) {
    let url = e.currentTarget.dataset.url;
    let msg = e.currentTarget.dataset.msg;
    if (!url) {
      wx.showToast({
        title: msg ? msg:'十二月正式开放',
        icon: "none"
      })
      return
    }
    wx.navigateTo({
      url: url,
      success: function(res) {},
      fail: function(res) {
        wx.switchTab({
          url: url,
        })
      }
    })
    try {

    } catch (err) {
    }
  },
  toVideo: function(e) { //视频详情
    let event = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/activityDetails/video-details/video-details?froms=index&id=' + event.id + '&zan=' + event.zan + '&userId=' + app.globalData.userInfo.userId,
    })
  },
  toArticle: function(e) { //文章详情
    let event = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/discover-plate/dynamic-state/article_details/article_details?froms=index&id=' + event.id + '&zan=' + event.zan + '&userId=' + app.globalData.userInfo.userId,
    })
  },
  onTouchItem: function(event) { //餐厅详情
    let id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/merchant-particulars/merchant-particulars?shopid=' + id,
    })
  },
  toSecKillDetail(e) { //跳转至菜品详情
    let curr = e.currentTarget;
    wx.navigateTo({
      url: 'flashSaleHome/secKillDetail/secKillDetail?id=' + curr.id + '&shopId=' + curr.dataset.shopid + '&distance=' + curr.dataset.distance
    })
  },
  candyDetails(e) {
    let id = e.currentTarget.id,
      distance = e.currentTarget.dataset.distance,
      shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: 'bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&categoryId=8' 
    })
  },
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
  // // 点击One某个nav
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
    } else if (id == 6) { //酒店景点
      wx.navigateTo({
        url: '/pages/index/productCategory/productCategory',
      })
    } else if (id == 7) { //生鲜
      wx.navigateTo({
        url: '/pages/index/crabShopping/crabShopping',
      })
    }
  },
  onPullDownRefresh: function() { //下拉刷新
    let that = this;
    that.onShow();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 3000)
  },

  // //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
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

  // //监听页面分享
  onShareAppMessage: function(res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: that.data.indexShare.title,
      path: 'pages/index/index',
      imageUrl: that.data.indexShare.url,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  // // 螃蟹使用攻略
  // crabSteamed: function(e) {
  //   wx.navigateTo({
  //     url: 'crabShopping/crabShopping?currentTab=1'
  //   })
  // },
  // //点击精选餐厅下的入驻图片

  // chartOfDisheses: function() { // 砍菜砍价详情
  //   wx.navigateTo({
  //     url: 'chartOfDisheses/chartOfDisheses',
  //   })
  // },
  // //享7生鲜查看更多
  // toFresh: function() {
  //   wx.navigateTo({
  //     url: 'crabShopping/crabShopping?currentTab=0'
  //   })
  // },
  // // 螃蟹进入商品详情
  // crabPrtDetails: function(e) {
  //   let id = e.currentTarget.id,
  //     spuId = e.target.dataset.spuid;
  //   wx.navigateTo({
  //     url: 'crabShopping/crabShopping?currentTab=0' + '&spuval=' + spuId
  //   })
  // },

  // toStore() { //跳转至到店自提列表
  //   wx.navigateTo({
  //     url: 'crabShopping/crabShopping?currentTab=2'
  //   })
  // },
  // chartOfDisheses: function() { // 砍菜砍价详情
  //   wx.navigateTo({
  //     url: 'chartOfDisheses/chartOfDisheses',
  //   })
  // },

  // // 螃蟹使用攻略
  // crabSteamed: function(e) {
  //   wx.navigateTo({
  //     url: 'crabShopping/crabShopping?currentTab=1'
  //   })
  // },

  // //去消息通知页面
  // tomsg:function(){
  //   wx.navigateTo({
  //     url: '/pages/index/notification/notification',
  //   })
  // }
})