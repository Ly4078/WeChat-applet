//index.js 
import Api from '/../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
var utils = require('../../utils/util.js');
import Public from '../../utils/public.js';
import getToken from '../../utils/getToken.js';
import getCurrentLocation from '../../utils/getCurrentLocation.js';
var app = getApp();
var scrollTimer = null;
var isgetHomeData = false;

Page({
  data: {
    showSkeleton: true,
    timer: null,
    listStart: null,
    toTops: false,
    isnewTips: false,
    allList: [],
    scrollEnd:true,
    _build_url: GLOBAL_API_DOMAIN,
    city: "", //默认值十堰市
    isshowlocation: false, //是否显示请求位置授权弹框
    carousel: [''], //轮播图
    currentTab: 0,
    isformid: true,
    showwandaactivity: false,//活动海报
    loading: false,
    // 改版新增变量 
    showRebbag:false,
    fresh0: {},
    activityList: [],    //活动列表
    navs: [{
      imgUrl: '',
      title: '',
      flag: false,
      isShow:true
    },
    {
      imgUrl: '',
      title: '',
      isShow: true
    },
    {
      imgUrl: '',
      title: '',
      isShow: true
    },
    {
      imgUrl: '',
      title: '',
      isShow: true
    },
    {
      imgUrl: '',
      title: ''
    }
    ]
  },
  hidewandaactivity: function () {
    // app.globalData.newcomer = 0;
    this.setData({ showwandaactivity: false });
    wx.setStorageSync('hideWanda', '2');
  },
  
  tocheckin: function() {
    wx.navigateTo({
      url: '/packageC/pages/checkin/checkin',
    })
  },
  togrourp: function () {
    wx.navigateTo({
      url: '/packageA/pages/redBagIndex/index',
    })
  },
  linkTowanda: function () {
    let that = this;
    wx.navigateTo({
      url: '/packageB/pages/wanda/wandaActivity/wandaActivity',
      success() {
        that.setData({ showwandaactivity: false })
        wx.setStorageSync('hideWanda', '2');
      }
    })


    // wx.showToast({
    //   title: '1月17号正式开放',
    //   icon:'none'
    // })
  },
  toWanda() {
    wx.navigateTo({
      // url: '/packageB/pages/wanda/wanda'
      // url: 'merchant-particulars/merchant-particulars?shopid=500'
      url: '/packageB/pages/wanda/shopZone/shopZone?type=2'
    })
  },
  toWandaCai() {
    wx.navigateTo({
      url: '/packageB/pages/wanda/wanda'
    })
  },
  getfptt: function () {
    wx.navigateTo({
      url: '/packageC/pages/xiangqiLottery/xiangqiLottery',
    })
  },
  onLoad: function (options) {
    // this.getfptt();
    let that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000)
    try {
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
    } catch (err) {
      console.log(err)
    }
   var txtObj = wx.getStorageSync("txtObj") || {};
    if (txtObj.bannerList) {
      that.setData({
        carousel: txtObj.bannerList,
        navs: txtObj.navsList,
        navbannerData: txtObj.navbannerData,
        showRebbag: txtObj.showRebbag,
        showRebbag2: txtObj.showRebbag2,
        fresh0: txtObj.fresh0,
        activityList: txtObj.activityList,
        zoneList: txtObj.zoneList,
        indexShare: txtObj.indexShare,
        hideVideo:txtObj.videoShow
      })
    }
  
  },

  onShow: function() {
    let hideWanda = wx.getStorageSync("hideWanda");
    if (hideWanda == '2') {
        
    }else{
      this.setData({
        showwandaactivity: true
      })
    }
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
      getToken(app).then(() => {
        that.getconfig(); //配置文件
        that.gettips(); //获取推送
        if (app.globalData.userInfo.city) {
          if (that.data.allList.length < 1) {
            that.gethomeData('reset')
          }
          that.setData({ isshowlocation: false, city: app.globalData.userInfo.city })
        } else {
          getCurrentLocation(that).then((res) => {
            that.gethomeData('reset');
            that.setData({ city: res })
          })
        }
        setTimeout(() => {
          that.setData({
            showSkeleton: false
          })
        }, 200)
      })
    } else {
      that.getconfig(); //配置文件
      that.gettips(); //获取推送

      if (app.globalData.userInfo.city) {
        if (that.data.allList.length < 1) {
          that.gethomeData('reset')
        }
        that.setData({ isshowlocation: false, city: app.globalData.userInfo.city })
      }else{
        getCurrentLocation(that).then((res) => {
          that.gethomeData('reset');
          that.setData({ city: res })
        })
      }
    }
    
    that.data.timer = setTimeout(function () {
      if (!app.globalData.token) {
        // that.findByCode();
      } else {
        clearTimeout(that.data.timer)
      }
    }, 5000)
  },
  onHide: function () {
    let that = this;
    try {
      clearTimeout(that.data.timer);
    } catch (err) {

    }
  },
  getconfig: function () { //请求配置数据
    let that = this;
    wx.request({
      url: this.data._build_url + 'globalConfig/list?type=1',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0') {
          let data = res.data.data;
          let txtObj = data;
          for (var k in data) {
            txtObj[k] = JSON.parse(data[k].configValue)
          }
          wx.setStorageSync("txtObj", txtObj);
          that.setData({
            carousel: txtObj.bannerList,
            navs: txtObj.navsList,
            showRebbag: txtObj.showRebbag,
            showRebbag2: txtObj.showRebbag2,
            navbannerData: txtObj.navbannerData,
            fresh0: txtObj.fresh0,
            activityList: txtObj.activityList,
            zoneList: txtObj.zoneList,
            indexShare:txtObj.indexShare,
            hideVideo: txtObj.videoShow
          })
        }
      }
    })
  },
  gethomeData: function (types) {
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
    // console.log(JSON.stringify(data))
    wx.request({
      // url: that.data._build_url + 'hcl/listForHomeObject',
      url: that.data._build_url + 'hcl/listForHomeObjectLv',
      method: 'POST',
      data: JSON.stringify(data),
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh()
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
          for (let i in allList[0].skuKJ) {
            allList[0].skuKJ[i].distance = utils.transformLength(allList[0].skuKJ[i].distance);

          }
          for (let i in allList[0].skuMS) {
            allList[0].skuMS[i].distance = utils.transformLength(allList[0].skuMS[i].distance);
          }
          that.setData({
            listStart: arr,
            allList: allList,
            loading: false,
            showSkeleton: false,
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
      },complete(){
        isgetHomeData = false
        wx.hideLoading();
        that.setData({
          loading: false,
          showSkeleton: false,
        })
      }
    })
  },
  onReachBottom: function () {
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
  gettips: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'msg/unreadMessageTotal',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh()
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
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
            setTimeout( ()=>{
              that.onShow();
            },300)
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
  tonewTips: function (e) {
    wx.navigateTo({
      url: '/pages/index/notification/notification',
    })
  },
  toLink(e) {
    let url = e.currentTarget.dataset.url;
    let msg = e.currentTarget.dataset.msg;
    let isLink = e.currentTarget.dataset.islink;
    console.log(e)
    let type = e.currentTarget.dataset.type;//type=2 代表跳转其他小程序
    if (type == '2') {
      try {
        var urls = JSON.parse(url);
        wx.navigateToMiniProgram(urls)
      } catch (err) { }
      return false;
    }
    if (!isLink) {
      wx.showToast({
        title: msg ? msg : '即将开放',
        icon: "none"
      })
      return
    }
    wx.navigateTo({
      url: url,
      success: function (res) { },
      fail: function (res) {
        wx.switchTab({
          url: url,
        })
      }
    })
    try {

    } catch (err) {}
  },
  closeredBag:function(){
    this.setData({
      hidefiexdredbag:true
    })
  },
  toVideo: function (e) { //视频详情
    let event = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/activityDetails/video-details/video-details?froms=index&id=' + event.id + '&zan=' + event.zan + '&userId=' + app.globalData.userInfo.userId,
    })
  },
  toArticle: function (e) { //文章详情
    let event = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/discover-plate/dynamic-state/article_details/article_details?froms=index&id=' + event.id + '&zan=' + event.zan + '&userId=' + app.globalData.userInfo.userId,
    })
  },
  onTouchItem: function (event) { //餐厅详情
    let id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/merchant-particulars/merchant-particulars?shopid=' + id,
    })
  },
  toSecKillDetail(e) { //跳转至菜品详情
    let curr = e.currentTarget,
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: 'flashSaleHome/secKillDetail/secKillDetail?id=' + curr.id + '&shopId=' + curr.dataset.shopid + '&categoryId=' + categoryId + '&actId=' + curr.dataset.actid
    })
  },
  candyDetails(e) {
    let id = e.currentTarget.id,
      distance = e.currentTarget.dataset.distance,
      actid = e.currentTarget.dataset.actid,
      shopId = e.currentTarget.dataset.index,
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: 'bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&categoryId=' + categoryId + '&actId=' + actid
    })
  },
  onPageScroll: function (e) {
    let that = this;
    if (e.scrollTop > 1200) {
      this.setData({
        toTops: true
      })
    } else {
      this.setData({
        toTops: false
      })
    }
    if (scrollTimer){
      clearTimeout(scrollTimer)
    }
    if (that.data.scrollEnd){
      that.setData({ scrollEnd: false })
    }
    scrollTimer = setTimeout( ()=>{
      that.setData({scrollEnd:true})
    },300)
  },
  onPullDownRefresh: function () { //下拉刷新
    let that = this;
    that.getconfig(); //配置文件
    that.gettips(); //获取推送
    that.gethomeData('reset')
    setTimeout( ()=>{
      wx.stopPullDownRefresh();
    },1200)
  },

  // //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  userLocation: function () { // 用户定位
    wx.navigateTo({
      url: 'user-location/user-location',
    })
  },
  seekTap: function () { //用户搜索
    wx.navigateTo({
      url: 'user-seek/user-seek',
    })
  },

  // //监听页面分享
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: that.data.indexShare.title,
      path: 'pages/index/index',
      imageUrl: that.data.indexShare.imgUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})
