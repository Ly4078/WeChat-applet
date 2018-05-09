//index.js 
import Api from '/../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var utils = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    city: "",
    phone: '',
    verify: '', //输入的验证码
    verifyId: '',//后台返回的短信验证码
    veridyTime: '',//短信发送时间
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
    issnap: false,  //是否是临时用户
    isNew: false,   //是否新用户
    userGiftFlag: false,    //新用户礼包是否隐藏
    isphoneNumber: false,  //是否拿到手机号
    isfirst: false,
    isclose: false,
    goto: false,
    navbar: ['菜系专题', '服务专题'],
    sort: ['川湘菜', '海鲜', '火锅', '烧烤', '西餐', '自助餐', '聚会', '商务', '约会'],
    activityImg: '',   //活动图
    settime: '',
    rematime: '获取验证码',
    isclick: true,
    activityIMg: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1975347470,2770072390&fm=27&gp=0.jpg'
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
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            // app.globalData.userInfo.openId = res.data.data.openId
            // app.globalData.userInfo.sessionKey = res.data.data.sessionKey
            // console.log(res.data.data)
          })
        }
      }
    })
    wx.login({
      success: res => {
        if (res.code) {
          // console.log("code:", res.code)
          // return false
          let _parms = {
            code: res.code
          }

          // Api.findByCode(_parms).then((res) => {
          Api.useradd(_parms).then((res) => {
            if (res.data.data) {
              app.globalData.userInfo.userId = res.data.data
              this.getlocation()
              wx.request({  //从自己的服务器获取用户信息
                url: this.data._build_url + 'user/get/' + res.data.data,
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  if (res.data.code == 0) {
                    let data = res.data.data
                    for (let key in data) {
                      for (let ind in app.globalData.userInfo) {
                        if (key == ind) {
                          app.globalData.userInfo[ind] = data[key]
                        }
                      }
                    };
                    if (data && data.mobile) {
                      that.setData({
                        isfirst: false
                      })
                    } else {
                      that.setData({
                        isfirst: true
                      })
                    }
                  }
                }
              })
            }
          })
        }
      }
    })
    this.activityBanner();
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
  onHide: function () {
    this.userGiftCancle()
  },
  getuseradd: function () {  //获取用户userid
    // this.isNewUser()
    // this.getuser()
    this.getlocation()
  },
  navbarTap: function (e) {// 专题推荐栏
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  onPullDownRefresh: function () {
    this.getmoredata();
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
          app.globalData.picker = res.data.result.address_component
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
    wx.navigateTo({
      url: 'webview/webview',
    })
  },
  activityBanner: function () {      //获取活动banner图
    let that = this;
    Api.activityImg().then((res) => {
      let imgUrl = res.data.data[9].imgUrl;
      if (imgUrl != '' && imgUrl != null && imgUrl != undefined) {
        that.setData({
          activityImg: imgUrl
        })
      }
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
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
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
    } else if (id == 2) {
      wx.navigateTo({
        url: '../activityDetails/hot-activity/hot-activity?id=35',
      })
    } else if (id == 3) {
      wx.navigateTo({
        url: '../activityDetails/hot-activity/hot-activity?id=34',
      })
    }
  },
  hotactivityHref: function (e) {     //热门活动跳转
    let _id = e.currentTarget.id
    
    if (_id == 34) {
      wx.navigateTo({
        url: '../activityDetails/hot-activity/hot-activity?id='+_id,
      })
    } else if (_id == 35) {
      wx.navigateTo({
        url: '../activityDetails/hot-activity/hot-activity?id=' + _id,
      })
    } else {
      wx.navigateTo({
        url: '../activityDetails/details-like/details-like?actid=' + _id,
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
      if (res.data.code == 0) {
        that.setData({
          isNew: true
        })
      } else {
        that.setData({
          isNew: false
        })
      }
    })
  },
  userGiftCancle: function () {    //新用户领取代金券
    this.setData({
      userGiftFlag: false,
      isfirst: false,
      isNew: false
    })

    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        getPhoneNumber: true
      })
      this.getuseradd()
    }
  },
  newUserToGet: function () {    //新用户跳转票券
    let that = this
    if (!this.data.isphoneNumber && app.globalData.userInfo.mobile == '' || !app.globalData.userInfo.mobile) {
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
      // this.setData({
      //   userGiftFlag: true
      // })
      if (res.data.code == 0) {
        this.userGiftCancle()
        wx.navigateTo({
          url: '../personal-center/lelectronic-coupons/lectronic-coupons?id=' + res.data.data + '&isPay=1'
        })
      }
    })
  },


  // numbindinput:function(e){
  //   let _value = e.detail.value
  //   if (_value){
  //     this.setData({
  //       isclose:true,
  //       phone: _value
  //     })
  //   }else{
  //     this.setData({
  //       isclose: false,
  //       phone: _value
  //     })
  //   }
  // },
  // closephone:function(){  //手机号置空
  //   console.log("closephone")
  //   this.setData({
  //     phone: ''
  //   })
  // },
  // submitphone:function(){  //提交手机号码
  //   let that = this
  //   if (!this.data.phone){
  //     wx.showToast({
  //       title: '请先输入手机号',
  //       icon: 'none',
  //       mask: 'true',
  //       duration: 2000
  //     })
  //     return false
  //   }
  //   let RegExp = /^[1][3,4,5,7,8][0-9]{9}$/;
  //   if (RegExp.test(this.data.phone)) {
  //     let _parms = {
  //       shopMobile: this.data.phone,
  //       userId: app.globalData.userInfo.userId,
  //       userName: app.globalData.userInfo.userName
  //     }
  //     Api.sendForRegister(_parms).then((res) => {
  //       if (res.data.code == 0) {
  //         console.log("sendForRegister:", res)
  //         that.setData({
  //           verifyId: res.data.data.verifyId,
  //           veridyTime: res.data.data.veridyTime
  //         })
  //       }
  //     })
  //   } else {
  //     wx.showToast({
  //       title: '电话号码输入有误，请重新输入',
  //       icon: 'none',
  //       mask: 'true',
  //       duration: 2000
  //     })
  //     this.setData({
  //       isclose: false,
  //       phone: ''
  //     })
  //   }

  // },
  // yzmbindblur: function (e) {  //输入验证码框失焦时获取输入的验证码
  //   let _value = e.detail.value
  //   this.setData({
  //     verify:_value
  //   })
  // },
  // submitverify:function(){  //提交验证码
  //   let that = this
  //   let _time = utils.reciprocal(this.data.veridyTime)
  //   if (_time == 'no'){
  //     wx.showToast({
  //       title: '请先提交电话号码，获取验证码',
  //       icon: 'none',
  //       mask: 'true',
  //       duration: 2000
  //     })
  //     return false
  //   } else {
  //     if (this.data.verify == this.data.verifyId) {
  //       let _parms = {
  //         shopMobile: this.data.phone,
  //         SmsContent: this.data.verify,
  //         userId: app.globalData.userInfo.userId,
  //         userName: app.globalData.userInfo.userName
  //       }
  //       Api.isVerify(_parms).then((res) => {
  //         if (res.data.code == 0) {
  //           app.globalData.userInfo.userId = res.data.data,
  //           app.globalData.userInfo.mobile = this.data.phone,
  //           that.setData({
  //             isphoneNumber: false
  //           })
  //         }
  //       })
  //     } else {
  //       wx.showToast({
  //         title: '验证码输入有误，请重新输入',
  //         icon: 'none',
  //         mask: 'true',
  //         duration: 2000
  //       })
  //     }
  //   } 
  //   // else {
  //   //   wx.showToast({
  //   //     title: _time+'后再试',
  //   //     icon: 'none',
  //   //     mask: 'true',
  //   //     duration: 2000
  //   //   })
  //   //   return false
  //   // }
  // },
  // getPhoneNumber: function (e) { //获取用户授权的电话号码
  //   let that = this
  //   let msg = e.detail
  //   // this.setData({
  //   //   isphoneNumber:false
  //   // })
  //   if (!e.detail.iv){ //拒绝授权
  //     return false
  //   }
    // wx.login({
    //   success: res => {
    //     if (res.code) {
    //       let _parms = {
    //         code: res.code
    //       }
    //       Api.getOpenId(_parms).then((res) => {
    //         app.globalData.userInfo.openId = res.data.data.openId
    //         app.globalData.userInfo.sessionKey = res.data.data.sessionKey
    //         if (res.data.code == 0) {
    //           let _pars = {
    //             sessionKey: res.data.data.sessionKey,
    //             ivData: msg.iv,
    //             encrypData: msg.encryptedData
    //           }
    //           Api.phoneAES(_pars).then((res) => {
    //             if (res.data.code == 0) {
    //               let _data = JSON.parse(res.data.data)
    //                 this.setData({
    //                   phone: _data.phoneNumber
    //                 })
    //               // this.submitphone();
    //             }
    //           })
    //         }
    //       })
    //     }
    //   }
    // })
  // },


  closebut: function () {
    this.setData({
      isphoneNumber: false
    })
  },
  closetel: function () {
    this.setData({
      issnap: false
    })
  },



  numbindinput: function (e) {  //监听号码输入框
    let _value = e.detail.value
    if (_value) {
      this.setData({
        isclose: true,
        phone: _value
      })
    } else {
      this.setData({
        isclose: false,
        phone: _value
      })
    }
  },
  closephone: function () {  //手机号置空
    clearTimeout(this.data.settime)
    this.setData({
      phone: '',
      rematime: '获取验证码',
      isclick: true
    })
  },
  submitphone: function () {  //获取验证码
    let that = this
    if (!this.data.phone) {
      wx.showToast({
        title: '请先输入手机号',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    }
    if (!this.data.isclick) {
      return false
    }
    if (this.data.verifyId) {
      return false
    }
    if (this.data.goto) {
      return false
    }
    let RegExp = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (RegExp.test(this.data.phone)) {
      this.setData({
        goto: true
      })
      let _parms = {
        shopMobile: that.data.phone,
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName
      }
      Api.sendForRegister(_parms).then((res) => {
        if (res.data.code == 0) {
          that.setData({
            verifyId: res.data.data.verifyId,
            veridyTime: res.data.data.veridyTime,
            goto: false
          })
          if (this.data.settime) {
            clearTimeout(that.data.settime)
          }
          let sett = setInterval(function () {
            that.remaining();
          }, 1000)
          wx.setStorage({
            key: "phone",
            data: that.data.phone
          })
          wx.setStorage({
            key: "veridyTime",
            data: that.data.veridyTime
          })
        }
      })
    } else {
      wx.showToast({
        title: '电话号码输入有误，请重新输入',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      this.setData({
        isclose: false,
        phone: ''
      })
    }
  },
  yzmbindblur: function (e) {  //输入验证码框失焦时获取输入的验证码
    let _value = e.detail.value
    this.setData({
      verify: _value
    })
  },
  remaining: function (val) {  //倒计时
    let rema = utils.reciprocal(this.data.veridyTime)
    if (rema == 'no' || rema == 'yes') {
      clearTimeout(this.data.settime)
      this.setData({
        rematime: '获取验证码',
        isclick: true,
        phone: ''
      })
      wx.removeStorage({
        key: 'phone',
        success: function (res) {
          // console.log(res.data)
        }
      })
      wx.removeStorage({
        key: 'veridyTime',
        success: function (res) {
          // console.log(res.data)
        }
      })
    } else {
      this.setData({
        rematime: rema
      })
    }
  },
  submitverify: function () {  //确定
    let that = this
    if (this.data.phone && this.data.verify) {
      if (this.data.verify == this.data.verifyId) {
        that.setData({
          isphoneNumber: false
        })
        let _parms = {
          shopMobile: this.data.phone,
          SmsContent: this.data.verify,
          userId: app.globalData.userInfo.userId,
          userName: app.globalData.userInfo.userName
        }
        Api.isVerify(_parms).then((res) => {
          if (res.data.code == 0) {
            app.globalData.userInfo.userId = res.data.data
            wx.request({  //从自己的服务器获取用户信息
              url: this.data._build_url + 'user/get/' + res.data.data,
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                if (res.data.code == 0) {
                  let data = res.data.data;
                  let users = app.globalData.userInfo
                  for (let key in data) {
                    for (let ind in users) {
                      if (key == ind) {
                        users[ind] = data[key]
                      }
                    }
                  }
                }
              }
            })
            that.setData({
              verifyId: ''
            })
          }
        })
      } else {
        wx.showToast({
          title: '验证码输入有误，请重新输入',
          icon: 'none',
          mask: 'true',
          duration: 2000
        })
      }
    } else if (!this.data.phone) {
      wx.showToast({
        title: '请输入电话号码，获取验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      });
    } else if (!this.data.verify) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      });
    }
  }
})
