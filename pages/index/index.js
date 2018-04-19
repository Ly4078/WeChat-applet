//index.js 
import Api from '/../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var utils = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    city: "",
    carousel: [],  //轮播图
    business: [], //商家列表，推荐餐厅
    actlist: [],  //热门活动
    hotlive: [],  //热门直播
    food: [],   //美食墙
    logs: [],
    topics: [],   //专题
    restaurant: [], //菜系专题
    service: [],  //服务专题
    alltopics: [],
    currentTab: 0,
    issnap:false,  //是否是临时用户
    isNew: false,   //是否新用户
    userGiftFlag: false,    //新用户礼包是否隐藏
    isphoneNumber: false,  //是否拿到手机号
    isfirst:false,
    navbar: ['菜系专题', '服务专题'],
    sort: ['川湘菜', '海鲜', '火锅', '烧烤', '西餐', '自助餐', '聚会', '商务', '约会']
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中..'
    })
    let that = this
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
    wx.login({
      success: res => {
        if (res.code) {
          // console.log("code:", res.code)
          // return false
          let _parms = {
            code: res.code
          }
          Api.findByCode(_parms).then((res) => {
            let _data = res.data.data
            app.globalData.userInfo.openId = _data.openId
            if (res.data.code == 0) {
              app.globalData.userInfo.userId = _data.id
              this.setData({
                isfirst:false
              })
              if (_data.mobile){
                this.getuseradd()
              }else{
                this.setData({
                  isfirst:true
                })
                this.getuseradd()
                // this.requestCityName()
              }
            }else{
              this.setData({
                isfirst: true
              })
              app.globalData.userInfo.userId = '667'  //667是数据库里临时用户，需与数据里保持一致
              this.getuser()
              this.getlocation()
            }
          })
        }
      }
    })
  },
  onShow: function () {
    let that = this
    if (app.globalData.userInfo.userId) {
      this.isNewUser()
    }
    let lat = wx.getStorageSync('lat')
    let lng = wx.getStorageSync('lng')
    // if(!app.globalData.userInfo.city){
    //   lat = '30.51597', lng = '114.34035';
    // }else{
    //   return false
    // }
    if (lat && lng) {
      setTimeout(function () {
        that.requestCityName(lat, lng)
        wx.removeStorageSync('lat')
        wx.removeStorageSync('lng')
      }, 500)
    }
  },
  onHide:function(){
    this.userGiftCancle()
  },
  getuseradd: function () {  //获取用户userid
    // this.isNewUser()
    this.getuser()
    this.getlocation()
  },
  getuser: function () { //从自己的服务器获取用户信息
    let that = this
    wx.request({
      url: this.data._build_url + 'user/get/' + app.globalData.userInfo.userId,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let data = res.data.data;
            app.globalData.userInfo.userType = data.userType,
            app.globalData.userInfo.openId = data.openId,
            app.globalData.userInfo.password = data.password,
            app.globalData.userInfo.shopId = data.shopId ? data.shopId : '',
            app.globalData.userInfo.userName = data.userName,
            app.globalData.userInfo.nickName = data.nickName,
            app.globalData.userInfo.loginTimes = data.loginTimes,
            app.globalData.userInfo.iconUrl = data.iconUrl,
            app.globalData.userInfo.sourceType = data.sourceType,
            app.globalData.userInfo.sex = data.sex
            app.globalData.userInfo.mobile = data.mobile
        }
      }
    })
  },
  navbarTap: function (e) {// 专题推荐栏
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  getmoredata: function () {  //获取更多数据
    this.getcarousel();
    this.getdata();
    this.getactlist();
    this.gethotlive();
    this.gettopic();
    // this.gettopics();
  },
  onReachBottom: function () {  //用户上拉触底加载更多
    if (!app.globalData.userInfo.mobile) {
      return false
    }
    if (this.data.alltopics.length < 1) {
      this.gettopics()
    }
  },
  gettopics: function () {  //加载分类数据
    let _list = [], _shop = []
    wx.showLoading({
      title: '更多数据加载中。。。',
      mask: true
    })
    Api.listForHomePage().then((res) => {
      if (res.data.code == 0) {
        _list = res.data.data
      }
      // console.log("_list:", _list)
    })

    let _parms = {
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      browSort: 2,
      page: 1,
      rows: 5
    }
    Api.shoplistForHomePage(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.hideLoading()
        let arr = []
        _shop = res.data.data
        for (let i = 0; i < _list.length; i++) {
          for (let j in _shop) {
            if (j == _list[i].type) {
              let obj = {
                img: _list[i],
                cate: this.data.sort[i],
                data: _shop[j]
              }
              arr.push(obj)
            }
          }
        }
        let [...newarr] = arr

        this.setData({
          alltopics: newarr,
          restaurant: arr.slice(0, 6), //菜系专题
          service: arr.slice(6, arr.length)
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.data.message,
          icon: 'none',
        })
      }
    })
  },
  getlocation: function () {  //获取用户位置
    let that = this
    let lat = '', lng = ''
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude
        let longitude = res.longitude
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        let lat = '30.51597', lng = '114.34035';
        that.requestCityName(lat, lng);
      }
    })
  },

  requestCityName(lat, lng) {//获取当前城市
    app.globalData.userInfo.lat = lat
    app.globalData.userInfo.lng = lng
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        this.getmoredata()
        if (res.data.status == 0) {
          this.setData({
            city: res.data.result.address_component.city,
            alltopics: [],
            restaurant: [],
            service: []
          })
          app.globalData.userInfo.city = res.data.result.address_component.city
        }
      }
    })
  },
  getcarousel: function () {  //轮播图
    let that = this;
    Api.hcllist().then((res) => {
      // console.log("carousel:",res.data.data)
      this.setData({
        carousel: res.data.data
      })
    })
  },
  getdata: function () { // 获取推荐餐厅数据
    let lat = '30.51597', lng = '114.34035';
    let _parms = {
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
    }
    Api.shoptop(_parms).then((res) => {
      // console.log("businss:",res.data.data)
      this.setData({
        business: res.data.data
      })
    })
  },
  gettopic: function () {  // 美食墙
    Api.topictop().then((res) => {
      // console.log("food:", res.data.data)
      let _data = res.data.data
      for (let i = 0; i < _data.length; i++) {
        _data[i].summary = utils.uncodeUtf16(_data[i].summary)
        _data[i].content = utils.uncodeUtf16(_data[i].content)
      }
      this.setData({
        food: res.data.data
      })
      wx.hideLoading();
    })
  },
  getactlist() {  //获取热门活动数据
    Api.actlist().then((res) => {
      // console.log("actlist:",res)
      this.setData({
        actlist: res.data.data.list.slice(0, 10)
      })
    })
  },
  gethotlive() {  //获取热门直播数据 
    let that = this;
    wx.request({
      url: that.data._build_url + 'zb/top/',
      success: function (res) {
        // console.log("hotlive:",res.data.data)
        that.setData({
          hotlive: res.data.data
        })
      }
    })
  },
  userLocation: function () {   // 用户定位

    wx.navigateTo({
      url: 'user-location/user-location',
    })
  },
  seekTap: function () {   //用户搜索
    wx.navigateTo({
      url: 'user-seek/user-seek',
    })
  },
  discountCoupon: function () {  //用户优惠券
    wx.navigateTo({
      url: '../personal-center/my-discount/my-discount',
    })
  },
  shopping: function () {
    wx.navigateTo({
      url: 'consume-qibashare/consume-qibashare',
    })
  },
  entertainment: function () {  //掌上生活
    // wx.navigateTo({
    //   url: 'webview/webview',
    // })
    wx.showToast({
      title: '该功能更新中...',
    })
  },
  recommendCt: function (event) {  //跳转到商家列表页面
    wx.navigateTo({
      url: 'dining-room/dining-room',
    })
  },
  cateWall: function (event) {  //美食墙 查看更多
    wx.switchTab({
      url: '../discover-plate/discover-plate',
    })
  },
  preferential: function (event) {
    wx.switchTab({
      url: '../activityDetails/activity-details',
    })
  },
  diningHhall: function (event) {  //跳转到商家（餐厅）内页
    const shopid = event.currentTarget.id
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },
  fooddetails: function (e) {  //跳转美食墙内页
    const id = e.currentTarget.id
    let _data = this.data.food
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan
      }
    }
    wx.navigateTo({
      url: '../discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan,
    })
  },
  detailOfTheActivity: function (event) { //跳转到活动内页
    const actid = event.currentTarget.id
    // console.log("actid:",actid)
    wx.navigateTo({
      url: '../activityDetails/details-like/details-like?actid=' + actid,
    })
  },
  tolive: function (ev) { //跳转到直播内页
    const liveid = ev.currentTarget.id
    // console.log("liveid:",liveid)
    // wx.navigateTo({
    //   url: 'test?liveid=' + liveid,
    // })
  },
  cctvwebview: function (event) {  //享7直播页面路径
    wx.showToast({
      title: "即将开发",
      icon: 'none',
    })
  },
  toNewExclusive: function (e) {   //跳转至新人专享页面
    let id = e.currentTarget.id;
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap:true
      })
      return false
    } 
    if (id == 4) {
      wx.navigateTo({
        url: 'new-exclusive/new-exclusive',
      })
    } else if (id == 1) {
      wx.navigateTo({
        url: '../personal-center/free-of-charge/free-of-charge',
      })
    }
  },
  clickimg: function (e) {  //点击专题图片 --某个分类
    let ind = e.currentTarget.id
    let arr = this.data.alltopics, cate = ''
    for (let i = 0; i < arr.length; i++) {
      if (ind == arr[i].img.id) {
        cate = arr[i].cate
      }
    }
    wx.navigateTo({
      url: 'dining-room/dining-room?cate=' + cate,
    })
  },
  clickcon: function (e) {  //點擊某一傢點
    let shopid = e.currentTarget.id
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '享7美食',
      path: 'pages/index/index',
      imageUrl: 'https://xq-1256079679.file.myqcloud.com/aaa_wxf91e2a026658e78e.o6zAJs-7D9920jC4XTKdzt72lobs.86hwazjh0Vhk732646790661f7af79f59e5d782d6c2f_0.8.jpg',
      success: function (res) {
        // 转发成功
        console.log("res:", res)
      },
      fail: function (res) {
        // 转发失败
        console.log("res:", res)
      }
    }
  },
  isNewUser: function () {   //判断是否新用户
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId
    };
    Api.isNewUser(_parms).then((res) => {
      console.log("res:",res)
      if (res.data.code == 0) {
        that.setData({
          isNew:true
        })
      } else {
        that.setData({
          isNew: false
        })
      }
      console.log("isnew:", this.data.isNew)
    })
  },
  userGiftCancle: function () {    //新用户领取代金券
    this.setData({
      userGiftFlag: false,
      isfirst: false,
      isNew:false
    })
    
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null){
      app.globalData.userInfo.userId = '667'
      this.getuseradd()
    }
  },
  newUserToGet: function () {    //新用户跳转票券
    let that = this
    if (!this.data.isphoneNumber && app.globalData.userInfo.mobile == 'a'){
      this.setData({
        isphoneNumber: true
      })
      return false
    }
    this.setData({
      isfirst: false
    })
    let _parms = {
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      payType: '2',
      skuId: '8',
      skuNum: '1'
    }
    Api.getFreeTicket(_parms).then((res) => {
      this.setData({
        userGiftFlag: true
      })
      if (res.data.code == 0) {
        this.userGiftCancle()
        wx.navigateTo({
          url: '../personal-center/lelectronic-coupons/lectronic-coupons?id=' + res.data.data + '&isPay=1'
        })
      }
    })
  },
  getPhoneNumber: function (e) { //获取用户授权的电话号码
    let that = this
    let msg = e.detail
    this.setData({
      isphoneNumber:false
    })
    if (!e.detail.iv){ //拒绝授权
      return false
    }
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            app.globalData.userInfo.openId = res.data.data.openId
            app.globalData.userInfo.sessionKey = res.data.data.sessionKey
            if (res.data.code == 0) {
              let _pars = {
                sessionKey: res.data.data.sessionKey,
                ivData: msg.iv,
                encrypData: msg.encryptedData
              }
              Api.phoneAES(_pars).then((res) => {
                if (res.data.code == 0) {
                  let _data = JSON.parse(res.data.data)
                  app.globalData.userInfo.mobile = _data.phoneNumber,
                  this.setData({
                    isphoneNumber: false,
                    issnap: false
                  })
                  // this.getuseradd()
                  this.addUserForVersion()
                }
              })
            }
          })
        }
      }
    })
  },
  addUserForVersion:function(){  //创建新用户
    let _parms = {
      openId: app.globalData.userInfo.openId,
      mobile: app.globalData.userInfo.mobile
    }
    Api.addUserForVersion(_parms).then((res)=>{
      if(res.data.code == 0){
        let _data = res.data.data
        app.globalData.userInfo.userId = res.data.data
        this.getuseradd()
      }else{
        Api.updateuser(_parms).then((res) => {
          if (res.data.code == 0) {
            app.globalData.userInfo.nickName = data.nickName
            app.globalData.userInfo.iconUrl = data.avatarUrl
            app.globalData.userInfo.mobile = data.mobile
          }
        })
      }
    })
  },
  closetel:function(){
    this.setData({
      issnap:false
    })
  }
})
