import Api from '/../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    dishLish: [],
    city: '', //商家所在的城市
    sku: 0, //可用票数
    isclick: true,
    shopid: '', //商家ID
    store_details: {}, //店铺详情
    commentNum: 0, //评论数量
    isCollected: false, //是否收藏，默认false
    isComment: false,
    store_images: '',
    merchantArt: [], //商家动态列表
    activity: [], //商家活动列表
    Bargainlist:[],//砍菜列表
    isBarg:false,
    allactivity: [],
    article_page: 1,
    reFresh: true,
    issnap: false,
    istouqu: false,
    ismore: false,
    isactmore: false,
    isnew:false,
    isAgio: false,
    listagio: [],
    newpackage: [],
    oldpackage: [],
    actId: '',
    service: '',
    isoter: false,
    // toView: 'list1',
    shopList: [],
    isFixed: false,
    text: '十堰“100菜”菜评选 暨《十堰食典》汇编、美食天使赛事评选',
    marqueePace: 1, //滚动速度
    marqueeDistance: 0, //初始滚动距离
    marqueeDistance2: 0,
    marquee2copy_status: false,
    marquee2_margin: 60,
    size: 14,
    orientation: 'left', //滚动方向
    interval: 50, // 时间间隔
    zanFlag: true //点赞节流阀
  },
  onLoad: function(options) {
    this.setData({
      shopid: options.shopid,
      comment_list:[]
    });
    this.selectForOne(options.shopid)
    if (options.flag == 1) {
      this.getuserInfo();
    }
    if (options.actId) {
      this.setData({
        actId: options.actId
      })
    }
    if (options.shopName && options.shopCode) {
      let _Name = options.shopName;
      if (options.groupCode) {
        this.setData({
          _shopCode: options.groupCode
        })
      } else {
        this.setData({
          _shopCode: options.shopCode
        })
      }
      this.setData({
        _shopName: _Name,
        _actName: options.actName
      })
    }
    this.getmoredata();
    // 分享功能
    wx.showShareMenu({
      withShareTicket: true,
      success: function(res) {
      },
      fail: function(res) {
        console.log(res)
      }
    });
  },
  onShow: function() {
    let that = this;
    this.commentList();
    this.getsetget();
    if (!app.globalData.userInfo.mobile) {
      this.getinfouser();
    }
    // 文本横向滚动条
    var vm = this;
    var length = vm.data.text.length * vm.data.size; //文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
    vm.setData({
      length: length,
      windowWidth: windowWidth,
      marquee2_margin: length < windowWidth ? windowWidth - length : vm.data.marquee2_margin //当文字长度小于屏幕长度时，需要增加补白
    });
    vm.antifriction(); // 水平一行字滚动完了再按照原来的方向滚动
    vm.bearing(); // 第一个字消失后立即从右边出现
  },
  getinfouser: function () { //获取用户openId、sessionKey
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
              that.getmyuserinfo();
            } else {
              that.findByCode();
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
  findByCode: function () {//获取用户unionId 如未获取到，则调用againgetinfo事件
    console.log('findByCode')
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
          wx.hideLoading();
          if (res.data.code == 0) {
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo()
            } else {
              that.setData({
                istouqu: true
              })
            }
          }
        })
      }
    })
  },
  againgetinfo: function () { //点击获取用户unionId
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        let _pars = {
          sessionKey: app.globalData.userInfo.sessionKey,
          ivData: res.iv,
          encrypData: res.encryptedData
        }
        Api.phoneAES(_pars).then((resv) => {
          if (resv.data.code == 0) {
            that.setData({
              istouqu: false
            })
            let _data = JSON.parse(resv.data.data);
            app.globalData.userInfo.unionId = _data.unionId;
            that.getmyuserinfo();
          }
        })
      }
    })
  },
  getmyuserinfo: function () {
    let _parms = {
      openId: app.globalData.userInfo.openId,
      unionId: app.globalData.userInfo.unionId
    }, that = this;
    Api.addUserUnionId(_parms).then((res) => {
      if (res.data.data) {
        app.globalData.userInfo.userId = res.data.data;
        wx.request({  //从自己的服务器获取用户信息
          url: this.data._build_url + 'user/get/' + res.data.data,
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 0) {
              let data = res.data.data;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              };
              that.setData({
                voteUserId: app.globalData.userInfo.userId
              });
              that.availableVote();
              if (!data.mobile) {
                that.setData({
                  isnew: true
                })
              }
            }
          }
        })
      }
    })
  },
  getsetget:function(){
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/listForAgio',
      data: {
        userId: app.globalData.userInfo.userId
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          let _data = data.data.list[0]
          if (_data.isAgio) { //已领取
            that.setData({
              isAgio: false
            })
          } else { //未领取
            that.setData({
              isAgio: true
            })
          }
          that.setData({
            listagio: _data
          });
        }
      }
    })
  },
  getDishList() { //参赛菜品列表
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    let _parms = {
      shopId: this.data.shopid,
      actId: 37,
      beginTime: this.dateConv(dateStr),
      endTime: this.dateConv(new Date(milisecond)),
      voteUserId: app.globalData.userInfo.userId,
      city: this.data.city,
      page: 1,
      rows: 6
    };
    Api.dishList(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        let list = data.data.list;
        if (list != "null" && list != null && list != "" && list != []) {
          this.setData({
            dishLish: list
          });
        }
      }
    });
  },
  toDishDetail(e) { //跳转至菜品详情
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: '../../activityDetails/dish-detail/dish-detail?actId=37&skuId=' + e.target.id
    })
  },
  availableVote() {
    let _parms = {
      actId: 37,
      userId: app.globalData.userInfo.userId
    }
    Api.availableVote(_parms).then((res) => {
      let sku = 0;
      if (res.data.code == 0) {
        sku = res.data.data.sku;
      }
      this.setData({
        sku: sku
      });
    });
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        sku: 0
      });
    }
  },
  castvote: function(e) { //对菜品投票
    let that = this,
      id = e.currentTarget.id;
    if (!this.data.isclick) {
      return false;
    }
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _parms = {
      actId: 37,
      userId: app.globalData.userInfo.userId,
      skuId: id
    };
    if (this.data.sku <= 0) {
      wx.showToast({
        title: '请使用食典券后投票',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    this.setData({
      isclick: false
    })
    Api.voteAdd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '投票成功',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
        let _num = 0;
        _num = that.data.sku - 1;
        if (_num < 0) {
          _num = 0;
        }
        let dishLish = that.data.dishLish;
        for (let i = 0; i < dishLish.length; i++) {
          dishLish[i].voteNum = dishLish[i].voteNum + 1;
        }
        that.setData({
          sku: _num,
          dishLish: dishLish
        });
      }
      setTimeout(function() {
        that.setData({
          isclick: true
        })
      }, 1000)
    });
  },
  payDish(e) { //购买活动菜
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let dishLish = this.data.dishLish,
      id = e.target.dataset.index,
      prSkuId = e.target.id,
      skuId = 0,
      manAmount = 0,
      jianAmount = 0,
      shopId = 0;
    for (let i = 0; i < dishLish.length; i++) {
      if (id == dishLish[i].id) {
        manAmount = dishLish[i].manAmount;
        jianAmount = dishLish[i].jianAmount;
        shopId = dishLish[i].shopId;
        skuId = dishLish[i].skuId;
      }
    }
    wx.navigateTo({
      url: '../voucher-details/voucher-details?id=' + prSkuId + "&skuId=" + skuId + "&sell=" + jianAmount + "&inp=" + manAmount + "&actId=37&shopId=" + shopId
    })
  },
  antifriction: function() {
    var vm = this;
    var interval = setInterval(function() {
      if (-vm.data.marqueeDistance < vm.data.length) {
        vm.setData({
          marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
        });
      } else {
        clearInterval(interval);
        vm.setData({
          marqueeDistance: vm.data.windowWidth
        });
        vm.antifriction();
      }
    }, vm.data.interval);
  },
  bearing: function() {
    var vm = this;
    var interval = setInterval(function() {
      if (-vm.data.marqueeDistance2 < vm.data.length) {
        // 如果文字滚动到出现marquee2_margin=30px的白边，就接着显示
        vm.setData({
          marqueeDistance2: vm.data.marqueeDistance2 - vm.data.marqueePace,
          marquee2copy_status: vm.data.length + vm.data.marqueeDistance2 <= vm.data.windowWidth + vm.data.marquee2_margin,
        });
      } else {
        if (-vm.data.marqueeDistance2 >= vm.data.marquee2_margin) { // 当第二条文字滚动到最左边时
          vm.setData({
            marqueeDistance2: vm.data.marquee2_margin // 直接重新滚动
          });
          clearInterval(interval);
          vm.bearing();
        } else {
          clearInterval(interval);
          vm.setData({
            marqueeDistance2: -vm.data.windowWidth
          });
          vm.bearing();
        }
      }
    }, vm.data.interval);
  },
  selectForOne: function(val) {
    let _parms = {
      shopId: val
    }
    Api.selectForOne(_parms).then((res) => {
      if (res.data.code == 0) {
        let data = res.data.data;
        console.log(data && data.paymentMethod == 2 && data.isDelete == 0)
        if (data && data.paymentMethod == 2 && data.isDelete == 0) {
          this.setData({
            isoter: true
          })
        } else {
          this.setData({
            isoter: false
          })
        }
      } else {
        this.setData({
          isoter: false
        })
      }
    })
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    this.getstoredata();
    this.recommendation();
    this.isCollected();
    this.commentList();
  },
  getuserInfo() { //如果是扫码直接进入到这里，则查询其用户信息，若查询到的用户信息中没有电话号码，要求用户注册
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.useradd(_parms).then((res) => {
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
                    }
                    if (!data.mobile) {
                      that.setData({
                        isnew: true
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
  },
  getmoredata: function() {
    console.log("getmoredata")
    this.getstoredata();
    this.selectByShopId();
    this.recommendation();
    this.isCollected();
    this.merchantArt();
    this.getpackage();
    this.availableVote();
    this.commentList();
    this.getsetget();
    this.hotDishList();
  },
  changeBar(){  //点击拼菜展开
   this.setData({
     isBarg: !this.data.isBarg
   });
    this.hotDishList();
  },
  hotDishList() {  //拼价砍菜列表
    //browSort 0附近 1销量 2价格
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 1,
      isDeleted: 0,
      shopId: this.data.shopid,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      page: 1,
      rows: 10
    };
    Api.partakerList(_parms).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          Bargainlist:[]
        });
        let _list = res.data.data.list, _oldData = this.data.Bargainlist, arr = []; 
        if (_list && _list.length){
          arr = _oldData.concat(_list);
          if (!this.data.isBarg){
            arr = arr.splice(0,3);
          }
          this.setData({
            Bargainlist: arr
          })
        }
      }
    })
  },
  initiate(e){//发起砍价
    let id = e.currentTarget.id, shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId
    })
  },
  getstoredata() { //获取店铺详情数据   
    let id = this.data.shopid;
    let that = this;
    wx.request({
      url: that.data._build_url + 'shop/get/' + id,
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function(res) {
        let _data = res.data.data;
        if (_data) {
          _data.popNum = utils.million(_data.popNum);
          if (_data.address.indexOf('-') > 0) {
            _data.address = _data.address.replace(/-/g, "");
          }
          that.setData({
            store_details: _data,
            store_images: _data.shopTopPics.length,
            storeType: _data.businessCate ? _data.businessCate.split(',') : [],
            city: _data.city
          })
          if (_data.otherService != "null" && _data.otherService) {
            that.setData({
              service: _data.otherService ? _data.otherService.split(',') : []
            });
          } 
          that.shopList();
          that.getDishList();
        }
      }
    })
  },
  selectByShopId: function() { //获取商家活动列表
    let id = this.data.shopid;
    let that = this;
    let _parms = {
      shopId: id
    }
    Api.selectByShopId(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          allactivity: res.data.data
        })
        if (that.data.allactivity.length >= 2) {
          that.setData({
            isactmore: true
          })
          let _arr = that.data.allactivity.slice(0, 2);
          that.setData({
            activity: _arr
          })
        } else {
          that.setData({
            activity: that.data.allactivity
          })
        }
      }
    })
  },
  onPageScroll: function() { //监听页面滑动
    this.setData({
      isComment: false
    })
  },
  //商户动态上拉加载
  // onReachBottom: function () {
  //   if (this.data.currentTab == 1 && this.data.reFresh) {
  //     wx.showLoading({
  //       title: '加载中..'
  //     })
  //     this.setData({
  //       article_page: this.data.article_page + 1
  //     });
  //     this.merchantArt();
  //   }
  // },
  buynow: function(ev) { //点击立即购买
    let skuid = ev.currentTarget.id
    let _sell = '',
      _inp = '',
      _rule = ''
    for (let i = 0; i < this.data.activity.length; i++) {
      if (skuid == this.data.activity[i].skuId) {
        _sell = this.data.activity[i].sellPrice;
        _inp = this.data.activity[i].inPrice;
        _rule = this.data.activity[i].ruleDesc;
      }
    }
    wx.navigateTo({
      url: '../voucher-details/voucher-details?id=' + skuid + "&sell=" + _sell + "&inp=" + _inp + "&rule=" + _rule,
    })
  },
  //推荐菜列表
  recommendation: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/tsc',
      data: {
        shopId: that.data.shopid,
        page: 1,
        rows: 3
      },
      success: function(res) {
        let data = res.data;
        if (data.code == 0) {
          that.setData({
            recommend_list: data.data.list ? data.data.list : []
          });
        }
      }
    })
  },
  fooddetails: function(e) {
    let ind = e.currentTarget.id
    let shopId = this.data.shopid
    wx.navigateTo({
      url: 'food-details/food-details?id=' + ind + '&shopid=' + shopId
    })
  },
  getpackage: function() { //套餐数据
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/agioList',
      data: {
        shopId: this.data.shopid
      },
      success: function(res) {
        let data = res.data;
        if (data.code == 0) {
          that.setData({
            oldpackage: data.data.list
          });
          if (that.data.oldpackage) {
            if (that.data.oldpackage.length > 3) {
              that.setData({
                ismore: true
              })
              let _arr = that.data.oldpackage.slice(0, 2);
              that.setData({
                newpackage: _arr
              })
            } else {
              that.setData({
                newpackage: that.data.oldpackage
              })
            }
          }
        }
      }
    })



  },
  liuynChange: function(e) {
    var that = this;
    that.setData({
      llbView: true,
      pid: e.currentTarget.dataset.id,
      to_user_id: e.currentTarget.dataset.user
    })
  },
  //餐厅推荐菜
  recommendedRestaurant: function() {
    wx.navigateTo({
      url: 'recommendation/recommendation?id=' + this.data.store_details.id,
    })
  },
  //活动点赞
  storeActivity: function() {
    wx.navigateTo({
      url: '../../activityDetails/hot-activity/hot-activity?id=' + this.data.actId
    })
  },
  //商家动态
  merchantArt: function() {
    let that = this,
      _parms = {
        shopId: this.data.shopid,
        page: this.data.article_page,
        zanUserId: app.globalData.userInfo.userId,
        rows: 5
      }
    Api.myArticleList(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading();
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let _data = data.data.list;
        for (let i = 0; i < _data.length; i++) {
          _data[i].title = utils.uncodeUtf16(_data[i].title);
          _data[i].timeDiffrence = utils.timeDiffrence(data.currentTime, _data[i].updateTime, _data[i].createTime)
        }
        that.setData({
          merchantArt: _data
        });

      } else {
        wx.hideLoading();
        that.setData({
          reFresh: false
        });
        if (that.data.article_page != 1) {
          wx.showToast({
            title: data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  //跳转至文章详情
  toArticleInfo: function(e) {
    const id = e.currentTarget.id
    let _data = this.data.merchantArt
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan
        if (_data[i].topicType == 1) {
          wx.navigateTo({
            url: '/pages/discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
          })
        } else if (_data[i].topicType == 2) {
          wx.navigateTo({
            url: '/pages/activityDetails/video-details/video-details?id=' + id + '&zan=' + zan
          })
        }
      }
    }
  },
  //分享给好友
  onShareAppMessage: function() {
    return {
      title: this.data.store_details.shopName,
      path: '/pages/index/merchant-particulars/merchant-particulars?shopid=' + this.data.shopid,
      imageUrl: this.data.store_details.logoUrl,
      success: function(res) {
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function(res) {
            console.log(res)
          },
          fail: function(res) {
            console.log(res)
          },
          complete: function(res) {
            console.log(res)
          }
        })
      },
      fail: function(res) {
        // 分享失败
        console.log(res)
      }
    }
  },
  // 电话号码功能
  calling: function() {
    let that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.store_details.phone ? that.data.store_details.phone : that.data.store_details.mobile,
      success: function() {
        console.log("拨打电话成功！")
      },
      fail: function() {
        console.log("拨打电话失败！")
      }
    })
  },
  moreImages: function(event) {
    wx.navigateTo({
      url: 'preview-picture/preview-picture?id=' + this.data.store_details.id,
    })
  },
  //打开地图导航
  TencentMap: function(event) {
    let that = this;

    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户位置信息
          wx.showModal({
            title: '提示',
            content: '授权获得更多功能和体验',
            success: function(res) {
              if (res.confirm) {
                wx.openSetting({ //打开授权设置界面
                  success: (res) => {
                    if (res.authSetting['scope.userLocation']) {
                      wx.getLocation({
                        type: 'wgs84',
                        success: function(res) {
                          let latitude = res.latitude;
                          let longitude = res.longitude;
                          that.requestCityName(latitude, longitude);
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        } else {
          this.openmap();
        }
      }
    })

  },
  //获取城市
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
          // app.globalData.userInfo.city = _city;
          this.openmap();
        }
      }
    })
  },
  //打开地图
  openmap: function() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        let storeDetails = that.data.store_details
        wx.openLocation({
          longitude: storeDetails.locationX,
          latitude: storeDetails.locationY,
          scale: 18,
          name: storeDetails.shopName,
          address: storeDetails.address,
          success: function(res) {
            console.log('打开地图成功')
          }
        })
      }
    })
  },
  // tab栏
  // navbarTap: function(e) {
  //   let id = e.currentTarget.id;
  //   this.setData({
  //     toView: id
  //   })
  //   console.log(id)
  // },
  //评论列表
  commentList: function() {
    let that = this;
    if (this.data.comment_list.length>7){
      return
    };
    wx.request({
      url: that.data._build_url + 'cmt/list',
      data: {
        refId: that.data.shopid,
        cmtType: 5,
        zanUserId: app.globalData.userInfo.userId,
        page: 1,
        rows: 5
      },
      success: function(res) {
        let data = res.data;
        if (data.code == 0 && data.data.list != null && data.data.list != "") {
          if (res.data.code == 0) {
            if (res.data.data && res.data.data.list){
              let _data = res.data.data.list, reg = /^1[34578][0-9]{9}$/;
              for (let i = 0; i < _data.length; i++) {
                _data[i].zan = utils.million(_data[i].zan)
                _data[i].content = utils.uncodeUtf16(_data[i].content)
                if (!isNaN(_data[i].userName)) {
                  _data[i].userName = _data[i].userName.substr(0, 3) + "****" + _data[i].userName.substr(7);
                }
                if (reg.test(_data[i].nickName)) {
                  _data[i].nickName = _data[i].nickName.substr(0, 3) + "****" + _data[i].nickName.substr(7);
                }
              }
              that.setData({
                comment_list: _data
              })
            }
            
          }
          that.setData({
            commentNum: res.data.data.total
          })
          wx.stopPullDownRefresh();
        }
      }

    })
  },
  //跳转至所有评论
  jumpTotalComment: function() {
    let that = this;
    wx.navigateTo({
      url: 'total-comment/total-comment?id=' + that.data.shopid + '&cmtType=5'
    })
  },
  //评论点赞
  toLike: function(event) {
    let that = this
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.zanFlag) {
      this.setData({
        zanFlag: false
      });
      let id = event.currentTarget.id,
        index = "";
      for (var i = 0; i < this.data.comment_list.length; i++) {
        if (this.data.comment_list[i].id == id) {
          index = i;
        }
      }
      wx.request({
        url: that.data._build_url + 'zan/add?refId=' + id + '&type=4&userId=' + app.globalData.userInfo.userId,
        method: "POST",
        success: function(res) {
          setTimeout(function() {
            that.setData({
              zanFlag: true
            });
          }, 3000);
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '点赞成功'
            }, 1500)
            var comment_list = that.data.comment_list
            comment_list[index].isZan = 1;
            comment_list[index].zan++;
            that.setData({
              comment_list: comment_list
            });
          }
        }
      })
    }
  },
  //取消点赞
  cancelLike: function(event) {
    let that = this,
      id = event.currentTarget.id,
      cmtType = "",
      index = "";
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.zanFlag) {
      this.setData({
        zanFlag: false
      });
      for (var i = 0; i < this.data.comment_list.length; i++) {
        if (this.data.comment_list[i].id == id) {
          index = i;
        }
      }
      wx.request({
        url: that.data._build_url + 'zan/delete?refId=' + id + '&type=4&userId=' + app.globalData.userInfo.userId,
        method: "POST",
        success: function(res) {
          setTimeout(function() {
            that.setData({
              zanFlag: true
            });
          }, 3000);
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '已取消'
            }, 1500)
            var comment_list = that.data.comment_list
            comment_list[index].isZan = 0;
            comment_list[index].zan == 0 ? comment_list[index].zan : comment_list[index].zan--;
            that.setData({
              comment_list: comment_list
            });
          }
        }
      })
    }
  },
  //查询是否收藏
  isCollected: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'fvs/isCollected?userId=' + app.globalData.userInfo.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function(res) {
        const data = res.data;
        if (data.code == 0) {
          that.setData({
            isCollected: data.data
          })

        }
      }
    })
  },
  //收藏
  onCollect: function(event) {
    let that = this;
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.request({
      url: that.data._build_url + 'fvs/add?userId=' + app.globalData.userInfo.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            isCollected: !that.data.isCollected
          })
          wx.showToast({
            mask: true,
            icon: 'none',
            title: "收藏成功"
          }, 1500)
        }
      }
    })
  },
  //取消收藏
  cancelCollect: function() {
    let that = this;
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.request({
      url: that.data._build_url + 'fvs/delete?userId=' + app.globalData.userInfo.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            isCollected: !that.data.isCollected
          })
          wx.showToast({
            mask: true,
            icon: 'none',
            title: "已取消"
          }, 1500)
        }
      }
    })
  },
  //显示发表评论框
  showAreatext: function() {
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    this.setData({
      isComment: true
    })
  },
  //获取评论输入框
  getCommentVal: function(e) {
    this.setData({
      commentVal: e.detail.value
    })
  },
  //发表评论
  sendComment: function(e) {
    let that = this;
    if (this.data.commentVal == "" || this.data.commentVal == undefined) {
      wx.showToast({
        mask: true,
        title: '请先输入评论',
        icon: 'none'
      }, 1500)
    } else {
      let content = utils.utf16toEntities(that.data.commentVal);
      let _parms = {
        refId: that.data.shopid,
        cmtType: '5',
        content: content,
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        nickName: app.globalData.userInfo.nickName
      }
      Api.cmtadd(_parms).then((res) => {
        if (res.data.code == 0) {
          that.setData({
            isComment: false,
            commentVal: ""
          })
          that.commentList()
        }
      })
    }
  },
  onShareAppMessage: function(res) {
    return {
      title: this.data.store_details.shopName,
      path: '',
      imageUrl: '',
      success: function(res) {
        // 转发成功
        // console.log("res:", res)
      },
      fail: function(res) {
        // 转发失败
        console.log("res:", res)
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
  receive: function() {
    let that = this;
    if (!this.data.isAgio) {
      wx.navigateTo({
        url: '../../personal-center/my-discount/my-discount',
      })
    } else {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        payType: '1',
        skuId: this.data.listagio.id,
        skuNum: '1'
      }
      Api.freeOrderForAgio(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功！',
            mask: 'true',
            icon: 'none',
          }, 1500)
          that.setData({
            isAgio: false
          })
        } else {
          wx.showToast({
            title: res.data.message,
            mask: 'true',
            icon: 'none',
          }, 1500)
        }
      })
    }

  },
  moreinfo: function(e) {
    let _id = e.currentTarget.id;
    wx.navigateTo({
      url: './coupon_details/coupon_details?id=' + _id + '&shopid=' + this.data.shopid,
    })
  },
  clickactmore: function() {
    this.setData({
      isactmore: !this.data.isactmore,
      activity: []
    })
    let arr = this.data.allactivity
    if (this.data.isactmore) {
      arr = arr.slice(0, 2);
      this.setData({
        activity: arr
      })
    } else {
      this.setData({
        activity: arr
      })
    }
  },
  clickmore: function() {
    this.setData({
      ismore: !this.data.ismore,
      newpackage: []
    })
    let arr = this.data.oldpackage
    if (this.data.ismore) {
      arr = arr.slice(0, 2);
      this.setData({
        newpackage: arr
      })
    } else {
      this.setData({
        newpackage: arr
      })
    }
  },
  gotouse: function() {
    wx.navigateTo({
      url: '../voucher-details/voucher-details?cfrom=pack',
    })
  },
  shopList() { //商家推荐列表
    let _parms = {
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      page: 1,
      rows: 10,
      businessCate: this.data.store_details.businessCate.split('/')[0].split(',')[0]
    }
    Api.shoplist(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        if (data.data.list != null && data.data.list != "" && data.data.list != []) {
          let _data = data.data.list, _dataSub = [];
          for (let i = 0; i < _data.length; i++) {
            if (_data[i].id != this.data.shopid) {
              _data[i].distance = utils.transformLength(_data[i].distance);
              _data[i].businessCate = _parms.businessCate;
              _dataSub.push(_data[i]);
            }
          }
          this.setData({
            shopList: _dataSub
          });
        }
      }
    })
  },
  toShopDetail(e) { //跳转至店铺详情
    let that = this;
    this.setData({
      shopid: e.currentTarget.id,
      dishLish: [],
      comment_list: [],
      merchantArt: [],
      activity: [],
      allactivity: [],
      oldpackage: [],
      newpackage: [],
      recommend_list: [],
      shopList: []
    });
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 1]; //上一个页面
    prevPage.options.shopid = e.currentTarget.id;
    prevPage.onLoad(prevPage.options)
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 100
    })
  },
  paymentPay: function() { //买单
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      wx.navigateTo({
        url: 'paymentPay-page/paymentPay-page?shopid=' + this.data.shopid,
      })
    }
  },
  toActivity() {
    wx.navigateTo({
      url: 'shop-activity/shop-activity?shopid=' + this.data.shopid,
    })
  },
  toComment() { //去评论
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: 'answer-comment/answer-comment?shopid=' + this.data.shopid + '&actId=' + this.data.actId
    })
  },
  onPageScroll() {
    this.queryMultipleNodes('#merchantBox');
  },
  queryMultipleNodes: function(dom) {
    var query = wx.createSelectorQuery(),
      that = this;
    query.select(dom).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res) {
      let isFixed = false;
      if (res[1].scrollTop >= 330) {
        isFixed = true;
      }
      that.setData({
        isFixed: isFixed
      });
    })
  },
  bindscroll(e) {
    console.log(e);
  },
  dateConv: function(dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  }
})