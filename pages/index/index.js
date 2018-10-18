//index.js 
import Api from '/../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
var utils = require('../../utils/util.js')
var app = getApp();


var village_LBS = function(that) {
  wx.getLocation({
    success: function(res) {
      console.log('vill_res:', res)
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
    phone: '',
    phonetwo: '',
    verify: '', //输入的验证码
    verifyId: '', //后台返回的短信验证码
    veridyTime: '', //短信发送时间
    carousel: [], //轮播图
    business: [], //商家列表，推荐餐厅
    actlist: [], //热门活动
    hotlive: [], //热门直播
    food: [], //美食墙
    logs: [],
    topics: [], //专题
    // restaurant: [], //菜系专题
    // service: [],  //服务专题
    alltopics: [],
    currentTab: 0,
    issnap: false, //是否是临时用户
    isNew: false, //是否新用户
    userGiftFlag: false, //新用户礼包是否隐藏
    isphoneNumber: false, //是否拿到手机号
    isfirst: false,
    isopen: false,
    item: '',
    selAddress: '',
    istouqu: false,
    isclose: false,
    goto: false,
    navbar: ['菜系专题', '服务专题'],
    sort: ['川湘菜', '海鲜', '火锅', '烧烤', '西餐', '自助餐', '聚会', '商务', '约会'],
    activityImg: '', //活动图
    settime: null,
    rematime: '获取验证码',
    afirst: false,
    isclick: true,
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
    videolist: [],
    bannthree: [],
    actitem: '附近',
    isfile: false,
    iskancai: false,
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
      }
    ],
    navs2: [{
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
        name: '微生活'
      }, {
        img: '/images/icon/navhuodong.png',
        id: 5,
        name: '商家入驻'
      }
    ],
    Res: [{
      img: '/images/icon/jxcanting.png',
      name: '精选餐厅',
      id: 1
    }],
    Vid: [{
      img: '/images/icon/duansp.png',
      name: '短视频',
      id: 2
    }],
    Vid2: [{
      img: '/images/icon/duansp.png',
      name: '微生活',
      id: 2
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
    }],
    fooddatas: ['附近', '人气', "自助餐", "湖北菜", "川菜", "湘菜", "粤菜", "咖啡厅", "小龙虾", "火锅", "海鲜", "烧烤", "江浙菜", "西餐", "料理", "其它美食"],
    ResThree: [{
      img: 'https://xq-1256079679.file.myqcloud.com/test_798888529104573275_0.8.jpg',
      id: 1,
      name: '享7券',
      dishtype: "湘菜",
      juli: '289',
      shopname: "恩施印像"
    }, {
      img: 'https://xq-1256079679.file.myqcloud.com/test_798888529104573275_0.8.jpg',
      id: 2,
      name: '餐厅',
      dishtype: "湘菜",
      juli: '289',
      shopname: "恩施印像"
    }, {
      img: 'https://xq-1256079679.file.myqcloud.com/test_798888529104573275_0.8.jpg',
      id: 3,
      name: '活动',
      dishtype: "湘菜",
      juli: '289',
      shopname: "恩施印像",
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

    //请求配置数据
    wx.request({ //isflag
      url: this.data._build_url + 'version.txt',
      success: function(res) {
        // console.log('version:',res)
        app.globalData.txtObj = res.data;
        if (res.data.flag == 0) { //0显示  
          app.globalData.isflag = true;
          that.setData({
            isfile: true
          })
        } else if (res.data.flag == 1) { //1不显示
          app.globalData.isflag = false;
          that.setData({
            isfile: false
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
            iskancai: true,
            Bargain: _Bargain
          })
        } else if (res.data.kancai == 1) { //砍价1不显示
          let _Bargain = that.data.Bargain;
          let _navs = that.data.navs;
          _Bargain[0].name = '精选美食';
          _navs = _navs.slice(1, 4);
          that.setData({
            iskancai: false,
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
      }
    })

    this.activityBanner();
    this.getcarousel();

    this.gettoplistFor();
    this.findByCode();
    // this.indexinit();
  },
  onShow: function() {
    let that = this;
    if (this.data.verifyId && this.data.phone && this.data.phonetwo) {
      this.setData({
        userGiftFlag: false,
        isNew: true,
        isfirst: true,
        isphoneNumber: true
      })
    }

    if (app.globalData.userInfo.userId) {
      this.isNewUser();
    }

    if (app.globalData.userInfo.city) {
      if (app.globalData.userInfo.city != app.globalData.oldcity) {
        app.globalData.oldcity = app.globalData.userInfo.city;
        this.setData({
          city: app.globalData.userInfo.city,
          bargainListall: [],
          bargainList: [],
          _page: 1
        })
        this.getCutDish();
      }
    }

  },
  onHide: function() {
    let that = this;
    // clearInterval(that.data.settime);
    that.setData({
      userGiftFlag: false,
      isfirst: false,
      isNew: false
    });
  },


  // 初始化start
  findByCode: function() { //通过code查询用户ID，如没有用户ID返回为null，
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
            for (let key in _data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = _data[key]
                }
              }
            };
            if (_data.id && _data != null) {
              app.globalData.userInfo.userId = _data.id;
              that.getuserIdLater();
            } else {
              if (app.globalData.userInfo.openId && app.globalData.userInfo.unionId) {
                that.createNewUser();
              } else {
                that.getOpendId();
              }
            }
          } else {
            that.findByCode();
            wx.hideLoading();
            that.setData({
              istouqu: true
            })
          }
        })
      }
    })
  },
  getOpendId: function() {
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.createNewUser();
            } else {
              that.setData({
                istouqu: true
              })
            }
          })
        }
      }
    })
  },
  bindGetUserInfo: function() { //点击安全弹框获取用户openId和unionId
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        let _parms = {
          sessionKey: app.globalData.userInfo.sessionKey,
          ivData: res.iv,
          encrypData: res.encryptedData
        }
        Api.phoneAES(_parms).then((resv) => {
          if (resv.data.code == 0) {
            that.setData({
              istouqu: false
            })
            let _data = JSON.parse(resv.data.data);
            app.globalData.userInfo.unionId = _data.unionId;
            app.globalData.userInfo.openId = _data.openId;
            that.createNewUser();
          }
        })
      }
    })
  },
  createNewUser: function() { //创建新用户
    let _parms = {
        openId: app.globalData.userInfo.openId,
        unionId: app.globalData.userInfo.unionId
      },
      that = this;
    Api.addUserUnionId(_parms).then((res) => {
      if (res.data.data) {
        app.globalData.userInfo.userId = res.data.data;
        wx.request({ //从自己的服务器获取用户信息
          url: this.data._build_url + 'user/get/' + res.data.data,
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            if (res.data.code == 0) {
              let data = res.data.data;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              };
              that.getuserIdLater();
            }
          }
        })
      }
    })
  },
  isNewUser: function() { //查询新用户是否已经领券
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
  getuserIdLater: function() { //获取到userId之后要执行的事件
    let that = this,
      userInfo = app.globalData.userInfo;
    if (userInfo.lat && userInfo.lng && userInfo.city) {
      this.getCutDish();
    } else {
      this.getUserlocation();
    }
    that.isNewUser();
    if (userInfo && userInfo.mobile) {
      that.setData({
        isfirst: false,
        isNew: false
      })
    } else {
      that.setData({
        isfirst: true,
        isNew: true
      })
    }
  },
  getUserlocation: function() { //获取用户位置经纬度
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        that.requestCityName(latitude, longitude);
      },
      fail: function(res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其位置信息
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                showCancel: false,
                confirmText: '确认授权',
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting({ //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) { //打开位置授权                
                          village_LBS(that);
                        } else {
                          that.getCutDish();
                        }
                      }
                    })
                  } else if (res.cancel) {
                    that.getCutDish();
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
    if (!lat && !lng) {
      this.getUserlocation();
    } else {
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
              this.getCutDish();
              this.setData({
                city: app.globalData.userInfo.city
              })
              app.globalData.picker = res.data.result.address_component;
            }
          }
        })
      }
    }

  },
  getCutDish: function() { // 获取砍菜数据
    let that = this;
    this.setData({
      bargainList: [],
      bargainListall: []
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
      this.hotDishList();
      this.getsecKill();
      this.setData({
        bargainList: []
      });
      for (let i = 0; i < this.data.hotdish.length; i++) {
        let _hotdish = this.data.hotdish[i];
        this.getdishDetail(_hotdish.dishId, _hotdish.shopId);
      }
    } else {
      this.getUserlocation();
    }
  },
  // 初始化end


  activityBanner: function() { //获取活动banner图
    let that = this;
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
  },
  getcarousel: function() { //轮播图
    let that = this;
    if (!this.data.carousel) {
      return false
    }
    Api.hcllist().then((res) => {
      // console.log("carousel:",res.data.data)
      if (res.data.data) {
        this.setData({
          carousel: res.data.data
        })
        // console.log('carousel:', this.data.carousel)
      } else {
        this.getcarousel();
      }
    })
  },
  hotDishList() { //拼价砍菜列表
    //browSort 0附近 1销量 2价格
    this.setData({
      city: this.data.city ? this.data.city : app.globalData.userInfo.city
    })
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 2,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      page: this.data._page,
      isDeleted: 0,
      rows: 10
    };
    wx.showLoading({
      title: '数据加载中...',
    });
    Api.partakerList(_parms).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0) {
        let _list = res.data.data.list,
          _oldData = this.data.bargainListall,
          arr = [];
        if (_list && _list.length > 0) {

          for (let i = 0; i < _list.length; i++) {
            for (let j = 0; j < _oldData.length; j++) {
              if (_oldData[j].id == _list[i].id) {
                console.log(_oldData[j].id)
                _oldData.splice(j, 1)
              }
            }
          }

          for (let i = 0; i < _list.length; i++) {
            _list[i].distance = utils.transformLength(_list[i].distance);
            _oldData.push(_list[i])
          }

          this.setData({
            bargainListall: _oldData
          })

        }
      }
    })
  },
  getdishDetail: function(Id, shopId) { //查询单个砍菜详情
    let that = this,
      _parms = {},
      arr = [];
    _parms = {
      Id: Id,
      zanUserId: app.globalData.userInfo.userId,
      shopId: shopId
    };
    Api.discountDetail(_parms).then((res) => {
      if (res.data.code == 0) {
        arr = this.data.bargainList;
        if (res.data.data) {
          arr.push(res.data.data);
          that.setData({
            bargainList: arr
          })
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
      rows: 8
    };
    Api.secKillList(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data.list.length > 0) {
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
  toSeckillList() {
    wx.navigateTo({
      url: 'flashSaleHome/flashSaleHome'
    })
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
  //点击推荐短视频之一
  handViditem(e) {
    let id = e.currentTarget.id,
      _videolist = this.data.videolist,
      zan = '',
      userid = '';
    if (app.globalData.isflag) {
      for (let i in _videolist) {
        if (id == _videolist[i].id) {
          zan = _videolist[i].zan;
          userid = _videolist[i].userId;
        }
      }
      wx.navigateTo({
        url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan + '&userId=' + userid,
      })
    }

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
    this.setData({
      _page: this.data._page + 1
    })
    this.hotDishList();
    if (!this.data.alltopics) {
      this.gettoplistFor()
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
      that = this;
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    Api.listForHomePage().then((res) => {
      if (res.data.code == 0) {
        _list = res.data.data;
        if (!_list) {
          that.gettoplistFor();
        } else {
          // bannthree
          let listarr = _list.slice(0, 3);
          that.setData({
            bannthree: listarr
          })
        }
        return false;
        let _parms = {
          locationX: app.globalData.userInfo.lng,
          locationY: app.globalData.userInfo.lat,
          browSort: 2,
          page: 1
        }
        Api.shoplistForHomePage(_parms).then((res) => {
          if (res.data.code == 0) {
            wx.hideLoading()
            let arr = [];
            _shop = res.data.data;
            for (let i = 0; i < _list.length; i++) {
              for (let j in _shop) {
                if (j == _list[i].type) {
                  let obj = {
                    img: _list[i],
                    cate: that.data.sort[i],
                    data: _shop[j]
                  }
                  arr.push(obj)
                }
              }
            };
            let [...newarr] = arr;
            that.setData({
              alltopics: newarr
            })
          } else {
            wx.hideLoading()
            wx.showToast({
              title: res.data.message,
              icon: 'none',
            })
          }
        });
      } else {
        this.gettoplistFor();
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
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
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
      console.log(res.target)
    }
    return {
      title: '享7美食',
      path: 'pages/index/index',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_ajdlfadjfal.png',
      success: function(res) {
        // 转发成功
        console.log("res:", res)
      },
      fail: function(res) {
        // 转发失败
        console.log("res:", res)
      }
    }
  },

  //  注册start
  closetel: function(e) { //新用户提示按钮选项
    let id = e.target.id;
    clearInterval(this.data.settime)
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },
  numbindinput: function(e) { //监听号码输入框
    let _value = e.detail.value,
      that = this;
    if (!_value) {
      this.closephone()
    }
    let RegExp = /^[1][3456789][0-9]{9}$/;
    if (RegExp.test(_value)) {
      this.setData({
        isclose: true,
        phonetwo: _value,
        phone: _value
      })
    } else {
      clearInterval(that.data.settime);
      this.setData({
        phonetwo: _value,
        phone: '',
        isclose: false,
        rematime: '获取验证码',
        verifyId: '',
        settime: null
      })
    }
  },
  closephone: function() { //手机号置空
    clearInterval(this.data.settime)
    this.setData({
      phone: '',
      phonetwo: '',
      rematime: '获取验证码',
      isclick: true,
      goto: false,
      settime: null
    })
  },
  submitphone: function() { //获取验证码
    let that = this,
      sett = null;
    if (!this.data.phone) {
      that.closephone();
      wx.showToast({
        title: '请正确输入手机号',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    }
    if (this.data.goto) {
      return false
    }
    let RegExp = /^[1][3456789][0-9]{9}$/;
    if (RegExp.test(this.data.phone)) {
      this.setData({
        goto: true
      })
      if (this.data.settime) {
        clearInterval(that.data.settime)
      }
      let _parms = {
        shopMobile: that.data.phone,
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName
      }
      Api.sendForRegister(_parms).then((res) => { //获取手机验证码
        if (res.data.code == 0) {
          that.setData({
            verifyId: res.data.data.verifyId,
            veridyTime: res.data.data.veridyTime,
            goto: false
          })
          sett = setInterval(function() {
            that.remaining();
          }, 1000)
          that.setData({
            settime: sett
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
  yzmbindblur: function(e) { //监听获取输入的验证码
    let _value = e.detail.value
    this.setData({
      verify: _value
    })
  },
  remaining: function(val) { //倒计时
    let _vertime = this.data.veridyTime.replace(/\-/ig, "\/"),
      rema = 60;
    rema = utils.reciprocal(_vertime);
    if (rema == 'no' || rema == 'yes' || !rema) {
      clearInterval(this.data.settime)
      this.setData({
        rematime: '获取验证码',
        goto: false,
        isclick: true
      })
    } else {
      this.setData({
        rematime: rema
      })
    }
  },
  submitverify: function() { // 注册时确定
    let that = this;
    if (this.data.phone && this.data.verify) {
      if (this.data.verify == this.data.verifyId) {
        that.setData({
          isphoneNumber: false
        })
        if (this.data.afirst) {
          return false
        }
        let _parms = {
          shopMobile: this.data.phone,
          SmsContent: this.data.verify,
          userId: app.globalData.userInfo.userId
        }
        if (app.globalData.userInfo.userName) {
          _parms.userName = app.globalData.userInfo.userName
        }
        if (!this.data.afirst) {
          that.setData({
            afirst: true
          })
        }
        Api.isVerify(_parms).then((res) => {
          if (res.data.code == 0) {
            app.globalData.userInfo.userId = res.data.data;
            that.setData({
              isNew: false,
              isfirst: false,
              userGiftFlag: false,
              phone: '',
              veridyTime: '',
              verifyId: '',
              isphoneNumber: false,
              phonetwo: ''
            })
            wx.request({ //从自己的服务器获取用户信息
              url: this.data._build_url + 'user/get/' + res.data.data,
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function(res) {
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
                  that.isNewUser();
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
  },
  closebut: function() { //注册取消
    this.setData({
      isphoneNumber: false
    })
  },
  userGiftCancle: function() { //新用户领取代金券
    this.setData({
      userGiftFlag: false,
      isfirst: false,
      isNew: false,
      phone: '',
      veridyTime: ''
    })
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        getPhoneNumber: true
      })
    }
  },
  newUserToGet: function() { //新用户跳转票券
    let that = this;
    if (!app.globalData.userInfo.mobile) {
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
      if (res.data.code == 0) {
        this.userGiftCancle()
        wx.navigateTo({
          url: '../personal-center/my-discount/my-discount'
        })
      } else {
        that.setData({
          userGiftFlag: false,
          isfirst: false,
          isNew: false
        })
        wx.showToast({
          title: res.data.message,
          mask: 'true',
          icon: 'none',
          duration
        })
      }
    })
  },

  // 螃蟹使用攻略
  crabSteamed: function(e) {
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=1'
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
  // 螃蟹进入商品详情
  crabPrtPackage: function(e) {
    wx.navigateTo({
      url: 'crabShopping/crabDetails/crabDetails?id=' + 6 + '&spuId=' + 2,
    })
  },
  //图片加载出错，替换为默认图片
  imageError: function(e) {
    let id = e.target.id;
    let bargainList = this.data.bargainList,
      bargainListall = this.data.bargainListall;
    for (let i = 0; i < bargainList.length; i++) {
      if (bargainList[i].id == id) {
        bargainList[i].picUrl = "/images/icon/morentu.png";
      }
    }
    for (let i = 0; i < bargainListall.length; i++) {
      if (bargainListall[i].id == id) {
        bargainListall[i].picUrl = "/images/icon/morentu.png";
      }
    }
    this.setData({
      bargainList: bargainList,
      bargainListall: bargainListall
    });
  },
  toStore() { //跳转至到店自提列表
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=2'
    })
  },
  chartOfDisheses: function () { // 砍菜砍价详情
    wx.navigateTo({
      url: 'chartOfDisheses/chartOfDisheses',
    })
  },
  //点击精选餐厅下的入驻图片
  handbaoming(e) {
    let id = e.currentTarget.id,
      ind = e.currentTarget.dataset.ind;
    let reg1 = new RegExp("shopId"),
      reg2 = new RegExp("topicId"),
      reg3 = new RegExp("actId"),
      reg4 = new RegExp("type");
    let arr = this.data.bannthree;
    console.log("arr:", arr)
    if (id == 1) {
      let str = arr[0].linkUrl;
      if (str == "ruzhu") { //进入下载APP页面
        wx.navigateTo({
          url: '../../pages/index/download-app/download?isshop=ind',
        })
      } else if (reg1.test(str)) { //进入某个店铺
        let _arr = str.split("=");
        wx.navigateTo({
          url: 'merchant-particulars/merchant-particulars?shopid=' + _arr[1]
        })
      } else if (reg3.test(str) && reg4.test(str)) { //进入某个活动页面
        let _arr = str.split("&");
        let arr1 = _arr[0].split('='),
          arr2 = _arr[1].split('=');
        if (arr2[1] == 1) {
          wx.navigateTo({
            url: '../activityDetails/onehundred-dish/onehundred-dish?actid=' + arr1[1],
          })
        } else if (arr2[1] == 2) {
          wx.navigateTo({
            url: '../activityDetails/video-list/video-list?id=' + arr[1],
          })
        }
      }
    } else if (id == 2) {
      let str = arr[1].linkUrl;
      if (reg2.test(str)) { //去文章或视频详情页面
        let _arr = str.split("=");
        this.getoddtopic(_arr[1]);
      } else if (reg3.test(str) && reg4.test(str)) { //去某一活动页面
        let _arr = str.split("&");
        let arr1 = _arr[0].split('='),
          arr2 = _arr[1].split('=');
        if (arr2[1] == 1) {
          wx.navigateTo({
            url: '../activityDetails/onehundred-dish/onehundred-dish?actid=' + arr1[1],
          })
        } else if (arr2[1] == 2) {
          let _linkUrl = arr[1].linkUrl;
          let aarr = _linkUrl.split("&"),
            _obj = {};
          for (let i in aarr) {
            let arr2 = aarr[i].split("=");
            _obj[arr2[0]] = arr2[1];
          }
          wx.navigateTo({
            url: '../activityDetails/video-list/video-list?id=' + _obj.actId,
          })
        }
      }
    } else if (id == 3) { //点击商家广告位，进入指定商家页面
      let str = arr[2].linkUrl;
      if (reg1.test(str)) {
        let _arr = str.split("=");
        wx.navigateTo({
          url: 'merchant-particulars/merchant-particulars?shopid=' + _arr[1]
        })
      }
    }
  },
  // 螃蟹使用攻略
  crabSteamed: function (e) {
    wx.navigateTo({
      url: 'crabShopping/crabShopping?currentTab=1'
    })
  }
})