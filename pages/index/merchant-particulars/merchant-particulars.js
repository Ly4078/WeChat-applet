import Api from '/../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
import getCurrentLocation from '/../../../utils/getCurrentLocation.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation: false,
    isunfold: false,
    isdity: false,
    dishLish: [],
    distance: '',
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
    Bargainlist: [], //砍菜列表
    isBarg: false,
    allactivity: [],
    article_page: 1,
    _page: 1,
    reFresh: true,
    issnap: false,
    istouqu: false,
    ismore: false,
    isactmore: false,
    isnew: false,
    isAgio: false,
    isMpa: false,
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
    zanFlag: true, //点赞节流阀
    shareCity: "",
    hotpage: 1,
    hotrows: 30,
    hottotal: 0,
    hotlist: [], //热销商品
    hotlist2: [], //热销商品
    wandaDish: [] //万达的菜
  },
  onLoad: function(options) {
    let txt = wx.getStorageSync('txtObj');
    this.setData({
      isShowvedeo: txt.videoShow,
    })
    this.setData({
      shopid: options.shopid,
      comment_list: []
    });
    if (options.actId) {
      this.setData({
        actId: options.actId
      })
    }

    if (options.shareCity) {
      this.setData({
        shareCity: options.shareCity
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

    // 分享功能
    wx.showShareMenu({
      withShareTicket: true,
      success: function(res) {},
      fail: function(res) {

      }
    });

    // this.merchantInit();

  },
  onShow: function() {
    let that = this;
    this.merchantInit();
    let _token = wx.getStorageSync('token') || "";
    let userInfo = wx.getStorageSync('userInfo') || {};
    // app.globalData.userInfo = userInfo;
    if (!userInfo.lat || !userInfo.lng || !userInfo.city || !app.globalData.userInfo.lat || !app.globalData.userInfo.lng) {
      // this.getUserlocation();
      getCurrentLocation(that).then((res) => {
        console.log(res);
        that.getstoredata();
        if (that.data.isMpa) {
          that.openmap();
        } else {
          that.shopList();
        }
      })
    }

    return;

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
  //初始化
  merchantInit: function() {
    let that = this;
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          this.getmoredata();
        } else {
          this.authlogin();
        }
      } else {
        that.setData({
          isnew: true
        })
        if (app.globalData.token) {
          this.getmoredata();
        } else {
          this.authlogin();
        }
      }
    } else {
      this.findByCode();
    }
  },
  //通过code查询用户信息
  findByCode: function() {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              that.setData({
                voteUserId: app.globalData.userInfo.userId
              });
              that.authlogin(); //获取token
            } else {
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  //获取token
  authlogin: function() {
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          that.getmoredata();
          if (!app.globalData.userInfo.mobile) {
            that.setData({
              isnew: true
            })
          }
        }
      }
    })
  },
  //点击获取用户unionId
  againgetinfo: function() {
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        let _sessionKey = app.globalData.userInfo.sessionKey,
          _ivData = res.iv,
          _encrypData = res.encryptedData;
        _sessionKey = _sessionKey.replace(/\=/g, "%3d");
        _ivData = _ivData.replace(/\=/g, "%3d");
        _ivData = _ivData.replace(/\+/g, "%2b");
        _encrypData = _encrypData.replace(/\=/g, "%3d");
        _encrypData = _encrypData.replace(/\+/g, "%2b");
        _encrypData = _encrypData.replace(/\//g, "%2f");

        wx.request({
          url: that.data._build_url + 'auth/phoneAES?sessionKey=' + _sessionKey + '&ivData=' + _ivData + '&encrypData=' + _encrypData,
          header: {
            'content-type': 'application/json' // 默认值
          },
          method: 'POST',
          success: function(resv) {
            if (resv.data.code == 0) {
              that.setData({
                istouqu: false
              })
              let _data = JSON.parse(resv.data.data);
              app.globalData.userInfo.unionId = _data.unionId;
            }
          }
        })
      }
    })
  },
  wandaDish() { //万达活动的菜
    let that = this,
      _param = {},
      str = "";
    _param = {
      actId: 45,
      shopId: this.data.shopid,
      page: 1,
      rows: 10
    };
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    wx.request({
      url: that.data._build_url + 'goodsSku/listForAct?' + str,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          let list = res.data.data.list;
          if (list && list.length > 0) {
            that.setData({
              wandaDish: list
            });
          }
        }
      },
      fail() {

      }
    })
  },
  isVote(e) { //是否可以投票
    let that = this,
      id = e.target.id;
    wx.request({
      url: that.data._build_url + 'vote/canVoteToday?actId=45',
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let code = res.data.code;
        if (code == 0) {
          that.vote(id);
        } else if (code == 200029) {
          that.showToast(res.data.message);
        }
      },
      fail() {

      }
    })
  },
  vote(id) { //投票
    let that = this;
    wx.request({
      url: that.data._build_url + 'vote/addVoteFree?actId=45&actGoodsSkuId=' + id,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let code = res.data.code;
        if (code == 0) {
          that.showToast('投票成功');
        } else if (code == 200029) {
          that.showToast(res.data.message);
        }
      },
      fail() {

      }
    })
  },
  //跳转至菜品详情
  toDishDetail(e) {
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
  //对菜品投票
  castvote: function(e) {
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
      // userId: app.globalData.userInfo.userId,
      skuId: id,
      token: app.globalData.token
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
  //查询热销商品
  gethotdish: function() {
    let _parms = {},
      that = this;
    _parms = {
      spuType: 10,
      page: 1,
      hotrows: this.data.hotpage,
      rows: this.data.hotrows,
      status: 1,
      shopId: that.data.shopid,
      token: app.globalData.token
    };
    Api.crabList(_parms).then((res) => { //查询同类规格列表
      if (res.data.code == 0) {
        let _hotlist = res.data.data.list,
          _hotlist2 = [],
          hotdata = that.data.hotlist,
          _discount = '';
        if (_hotlist && _hotlist.length > 0) {
          for (let i in _hotlist) {
            if (_hotlist[i].actGoodsSkuOuts && _hotlist[i].actGoodsSkuOuts.length > 0) {
              let arr = [];
              for (let j in _hotlist[i].actGoodsSkuOuts) {
                _hotlist[i].skuName = utils.uncodeUtf16(_hotlist[i].skuName);
                _hotlist[i].actGoodsSkuOuts[j].skuName = _hotlist[i].skuName;
                _hotlist[i].actGoodsSkuOuts[j].id = _hotlist[i].id;
                _hotlist[i].actGoodsSkuOuts[j].sellPrice = _hotlist[i].sellPrice;
                _discount = _hotlist[i].actGoodsSkuOuts[j].goodsPromotionRules.actAmount / _hotlist[i].sellPrice * 10;
                _hotlist[i].actGoodsSkuOuts[j].discount = _discount.toFixed(2);
                if (j > 0) {
                  let actId = _hotlist[i].actGoodsSkuOuts[j].actId;
                  if (actId != 45) {
                    arr.push(_hotlist[i].actGoodsSkuOuts[j]);
                  }
                }
              }
              _hotlist[i].actGoodsSkuOuts2 = arr;
              _hotlist2.push(_hotlist[i])
            }
          }
          _hotlist2 = _hotlist2.concat(hotdata);
          if (hotdata.length > 0) {
            that.setData({
              hotlist2: _hotlist2
            })
          } else {
            that.setData({
              hotlist2: _hotlist2.slice(0, 3)
            })
          }
          that.setData({
            hotlist: _hotlist2,
            hottotal: 3
          })
        } else {
          that.setData({
            hottotal: 0,
            hotlist: [],
            hotlist2: []
          })
        }
      }
    });
  },
  //点击抢购
  ClickSnatch: function(e) {
    let id = e.currentTarget.id,
      actId = e.currentTarget.dataset.actid,
      actName = e.currentTarget.dataset.actname,
      _stocknum = e.currentTarget.dataset.stocknum,
      shopId = this.data.shopid,
      categoryId = e.currentTarget.dataset.categoryid;
    if (_stocknum == 0) {
      wx.showToast({
        title: '此商品已售罄',
        icon: 'none'
      })
    } else {
      if (actName == '砍价') { //砍价
        wx.navigateTo({
          url: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?categoryId=' + categoryId + '&id=' + id + '&shopId=' + shopId + '&actId=' + actId
        })
      } else if (actName == '秒杀') { //秒杀
        wx.navigateTo({
          url: '/pages/index/flashSaleHome/secKillDetail/secKillDetail?id=' + id + '&shopId=' + shopId + '&actId=' + actId
        })
      } else {
        let _hotlist2 = this.data.hotlist2,
          actObj = {};
        for (let i in _hotlist2) {
          if (id == _hotlist2[i].id) {
            actObj = _hotlist2[i]
          }
        }
        wx.navigateTo({
          url: '/pages/index/crabShopping/crabDetails/submitOrder/submitOrder?num=1&issku=3&flag=1&picUrl=' + actObj.skuPic + '&sellPrice=' + actObj.sellPrice + '&id=' + actObj.id + '&actId=' + actObj.actId + '&skuName=' + actObj.skuName + '&remark=' + actObj.remark + '&shopId=' + actObj.shopId + '&singleType=' + actObj.singleType + '&spuId=' + actObj.spuId
        })
      }
    }
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
  //获取页面参数
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
  //页面参数
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
  getmoredata: function() {


    if (!this.data.hotlist2.length) {
      this.gethotdish();
    }
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
      this.getstoredata();
    }
    this.selectByShopId();
    this.merchantArt();
    this.commentList();
    this.wandaDish();
  },
  //点击拼菜展开
  changeBar() {
    this.setData({
      isBarg: !this.data.isBarg
    });
    // this.hotDishList();
  },
  hotDishList() { //拼价砍菜列表
    //browSort 0附近 1销量 2价格
    let _parms = {},
      that = this;
    _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 1,
      isDeleted: 0,
      shopId: this.data.shopid,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      page: 1,
      rows: 10,
      token: app.globalData.token
    };
    Api.partakerList(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          Bargainlist: []
        });
        let _list = res.data.data.list,
          _oldData = that.data.Bargainlist,
          arr = [];
        if (_list && _list.length) {
          arr = _oldData.concat(_list);
          if (!that.data.isBarg) {
            arr = arr.splice(0, 3);
          }
          that.setData({
            Bargainlist: arr,
            foodTotal: res.data.data.total
          })
        }
      }
    })
  },
  initiate(e) { //跳转至菜品详情
    let id = e.currentTarget.id,
      actId = e.currentTarget.dataset.actid,
      shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../bargainirg-store/CandyDishDetails/CandyDishDetails?categoryId=8&id=' + id + '&shopId=' + shopId + '&actId=' + actId
    })
  },
  //发起砍价
  toBargain(e) {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      let _refId = e.currentTarget.id,
        _shopId = e.currentTarget.dataset.shopid,
        _agioPrice = e.currentTarget.dataset.agioprice,
        _sellPrice = e.currentTarget.dataset.sellprice,
        _parms = {};
      _parms = {
        // userId: app.globalData.userInfo.userId,
        skuId: _refId,
        token: app.globalData.token
      };
      Api.vegetables(_parms).then((res) => {
        if (res.data.data.length > 0) {
          wx.showModal({
            title: '您已发起了砍价，是否查看状态',
            content: '',
            complete(e) {
              if (e.confirm) {
                wx.navigateTo({
                  url: '../bargainirg-store/pastTense/pastTense'
                });
              }
            }
          })
        } else {
          wx.navigateTo({
            url: '../bargainirg-store/AprogressBar/AprogressBar?refId=' + _refId + '&shopId=' + _shopId + '&skuMoneyMin=' + _agioPrice + '&skuMoneyOut=' + _sellPrice
          })
        }
      });
    }
  },
  getstoredata() { //获取店铺详情数据   
    let id = this.data.shopid,
      that = this;
    wx.request({
      url: that.data._build_url + 'shop/get/' + id,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          if (res.data.data) {
            let _data = res.data.data;
            _data.popNum = utils.million(_data.popNum);
            if (_data.address.indexOf('-') > 0) {
              _data.address = _data.address.replace(/-/g, "");
              _data.distance = utils.transformLength(_data.distance);
            }
            if (_data.shopInfo && _data.shopInfo != 'null') {
              _data.shopInfo = utils.uncodeUtf16(_data.shopInfo);
            } else {
              _data.shopInfo = ''
            }
            if (_data.distance == '0' || _data.distance == '0m' || !_data.distance) {
              if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
                _data.distance = utils.calcDistance(_data.locationY, _data.locationX, app.globalData.userInfo.lat, app.globalData.userInfo.lng);
              }
            }
            let _storeType = _data.businessCate ? _data.businessCate.split(',') : [];
            if (_storeType && _storeType.length > 0) {
              for (let i in _storeType) {
                let arr = _storeType[i].split('/');
                _storeType[i] = arr[0];
              }
            }
            if (_data.shopInfo && _data.shopInfo != 'null') {
              _data.shopInfo2 = _data.shopInfo.slice(0, 20) + '...';
            }
            if (_data.shopAllocationOut && _data.shopAllocationOut.paymentMethod == 2 && _data.shopAllocationOut.isDelete == 0) {
              that.setData({
                isoter: true
              })
            } else {
              that.setData({
                isoter: false
              })
            }

            that.setData({
              store_details: _data,
              isCollected: _data.collected,
              store_images: _data.shopTopPics.length,
              storeType: _storeType,
              city: _data.city
            })
            if (_data.otherService != "null" && _data.otherService) {
              that.setData({
                service: _data.otherService ? _data.otherService.split(',') : []
              });
            }
            that.shopList();
          }
        }
      }
    })
  },
  clickjt: function() {
    this.setData({
      isunfold: !this.data.isunfold
    })
  },
  selectByShopId: function() { //获取商家活动列表
    let id = this.data.shopid,
      that = this,
      _parms = {};
    _parms = {
      shopId: id,
      token: app.globalData.token
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
          let _arr = that.data.allactivity.slice(0, 3);
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
  onReachBottom: function() {
    if (this.data._page != 1) {
      this.setData({
        _page: this.data._page + 1
      })
    }
    this.shopList();
  },
  buynow: function(ev) { //点击立即购买
    let id = ev.currentTarget.id,
      _sell = '',
      _inp = '',
      _rule = '';
    for (let i = 0; i < this.data.activity.length; i++) {
      if (id == this.data.activity[i].goodsSkuId) {
        _sell = this.data.activity[i].sellPrice;
        _inp = this.data.activity[i].costPrice;
        _rule = this.data.activity[i].ruleDesc;
      }
    }
    wx.navigateTo({
      url: '../voucher-details/voucher-details?id=' + id + "&sell=" + _sell + "&inp=" + _inp + "&rule=" + _rule + '&shopId=' + this.data.shopid + '&actId=' + this.data.actId + '&skuId=' + this.data.listagio.id
,
    })
  },
  //查看推荐菜详情
  fooddetails: function(e) {
    let ind = e.currentTarget.id
    let shopId = this.data.shopid
    wx.navigateTo({
      url: 'food-details/food-details?id=' + ind + '&shopid=' + shopId
    })
  },
  //餐厅推荐菜
  recommendedRestaurant: function() {
    wx.navigateTo({
      url: 'recommendation/recommendation?id=' + this.data.store_details.id,
    })
  },
  //商家动态
  merchantArt: function() {
    let that = this,
      _parms = {
        shopId: this.data.shopid,
        page: this.data.article_page,
        // zanUserId: app.globalData.userInfo.userId,
        rows: 5,
        token: app.globalData.token
      }
    Api.myArticleList(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let _data = data.data.list;
        for (let i = 0; i < _data.length; i++) {
          _data[i].title = utils.uncodeUtf16(_data[i].title);
          _data[i].timeDiffrence = utils.timeDiffrence(data.currentTime, _data[i].updateTime, _data[i].createTime)
          _data[i].hideVideo = true;
          if (_data[i].topicType == '2') {
            if (that.data.isShowvedeo) {
              _data[i].hideVideo = true;
            }else{
              _data[i].hideVideo = false;
            }
          }
        }
        that.setData({
          merchantArt: _data.slice(0, 3)
        });

      } else {
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
    let _shareCity = this.data.shareCity ? this.data.shareCity : app.globalData.userInfo.city;
    return {
      title: this.data.store_details.shopName,
      path: '/pages/index/merchant-particulars/merchant-particulars?shopid=' + this.data.shopid + '&shareCity=' + _shareCity,
      imageUrl: this.data.store_details.logoUrl,
      success: function(res) {
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {

          }
        })
      },
      fail: function(res) {
        // 分享失败
      }
    }
  },
  // 电话号码功能
  calling: function() {
    let that = this,
      tell = "";
    tell = that.data.store_details.phone ? that.data.store_details.phone : that.data.store_details.mobile;
    if (tell) {
      wx.makePhoneCall({
        phoneNumber: tell,
        success: function() {
          console.log("拨打电话成功！")
        },
        fail: function() {
          console.log("拨打电话失败！")
        }
      })
    } else {
      wx.showToast({
        title: '商家没有设置联系电话',
      })
    }
  },
  //查看店铺图片
  moreImages: function(event) {
    if (!this.data.isshowlocation) {
      wx.navigateTo({
        url: 'preview-picture/preview-picture?id=' + this.data.store_details.id + '&firstImg=' + this.data.store_details.logoUrl,
      })
    } else {
      this.openSetting();
    }
  },
  //打开授权设置界面
  openSetting() {
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          setTimeout(() => {
            getCurrentLocation(that).then((res) => {
              console.log(res);
              that.getstoredata();
              if (that.data.isMpa) {
                that.openmap();
              } else {
                that.shopList();
              }
            })
          }, 200)
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
  //打开地图导航，先查询是否已授权位置
  TencentMap: function(event) {
    let that = this;
    if (event && event.type == 'tap') {
      this.setData({
        isMpa: true
      })
    } else {
      this.setData({
        isMpa: false
      })
    }
    getCurrentLocation(that).then((res) => {
      if (that.data.isMpa) {
        that.openmap();
      } else {
        that.shopList();
      }
    })

  },
  //打开地图，已授权位置
  openmap: function() {
    let that = this,
      storeDetails = that.data.store_details;;
    wx.openLocation({
      longitude: storeDetails.locationX,
      latitude: storeDetails.locationY,
      scale: 18,
      name: storeDetails.shopName,
      address: storeDetails.address,
      success: function(res) {},
      fail: function(res) {}
    })
  },

  //评论列表
  commentList: function() {
    let that = this;
    if (this.data.comment_list.length > 7) {
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
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          const data = res.data;
          if (res.data.data) {
            let data = res.data;
            if (res.data.data && res.data.data.list) {
              let _data = res.data.data.list,
                reg = /^1[34578][0-9]{9}$/;
              for (let i = 0; i < _data.length; i++) {
                _data[i].zan = utils.million(_data[i].zan);
                _data[i].content = utils.uncodeUtf16(_data[i].content);
                if (!isNaN(_data[i].userName)) {
                  _data[i].userName = _data[i].userName.substr(0, 3) + "****" + _data[i].userName.substr(7);
                }
                if (reg.test(_data[i].nickName)) {
                  _data[i].nickName = _data[i].nickName.substr(0, 3) + "****" + _data[i].nickName.substr(7);
                }
              }
              that.setData({
                comment_list: _data.slice(0, 3)
              })
            }
          }
          that.setData({
            commentNum: res.data.data.total
          })
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
    if (!app.globalData.userInfo.mobile) {
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
        header: {
          "Authorization": app.globalData.token
        },
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
    if (!app.globalData.userInfo.mobile) {
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
        header: {
          "Authorization": app.globalData.token
        },
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
  //收藏  / 取消收藏
  onCollect: function(event) {
    let that = this,
      url = "",
      _title = "";
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      if (this.data.isCollected) {
        url = that.data._build_url + 'fvs/delete?shopId=' + that.data.shopid;
        _title = '已取消';
      } else {

        url = that.data._build_url + 'fvs/add?shopId=' + that.data.shopid;
        _title = '收藏成功';
      }
      wx.request({
        url: url,
        method: "POST",
        header: {
          "Authorization": app.globalData.token
        },
        success: function(res) {
          if (res.data.code == 0) {
            that.setData({
              isCollected: !that.data.isCollected
            })
            wx.showToast({
              mask: true,
              icon: 'none',
              title: _title
            }, 1500)
          }
        }
      })
    }
  },
  //确定or取消   未注册用户
  closetel: function(e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/init/init?isback=1'
      })
    }
  },
  //领取/使用免费券
  receive: function() {
    let that = this,
      _parms = {},
      _values = "";
    if (!this.data.isAgio) {
      wx.navigateTo({
        url: '../../personal-center/my-discount/my-discount',
      })
    } else {
      _parms = {
        // userId: app.globalData.userInfo.userId,
        // userName: app.globalData.userInfo.userName,
        payType: '1',
        skuId: this.data.listagio.id,
        skuNum: '1'
      }
      for (var key in _parms) {
        _values += key + "=" + _parms[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      wx.request({
        url: that.data._build_url + 'so/freeOrderForAgio?' + _values,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function(res) {
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
        }
      })
    }
  },
  //券
  moreinfo: function(e) {
    let _id = e.currentTarget.id;
    wx.navigateTo({
      url: './coupon_details/coupon_details?id=' + _id + '&shopid=' + this.data.shopid,
    })
  },
  //查看全部
  clickactmore: function() {
    this.setData({
      isactmore: !this.data.isactmore
    })
    let arr = this.data.allactivity
    if (this.data.isactmore) {
      arr = arr.slice(0, 3);
      this.setData({
        activity: arr
      })
    } else {
      this.setData({
        activity: arr
      })
    }
  },
  //查看部分
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
  clickdity: function() {
    this.setData({
      isdity: !this.data.isdity
    })
    let hotlist = this.data.hotlist;
    if (this.data.isdity) {
      this.setData({
        hotlist2: hotlist,
        hottotal: hotlist.length
      })
    } else {
      this.setData({
        hotlist2: hotlist.slice(0, 3),
        hottotal: 3
      })
    }
  },
  //去代金券页面
  gotouse: function() {
    wx.navigateTo({
      url: '../voucher-details/voucher-details?cfrom=pack',
    })
  },
  //商家推荐列表
  shopList() {
    let that = this,
      _parms = {};
    if (!app.globalData.userInfo.lng && !app.globalData.userInfo.lat) {
      this.TencentMap();
      return;
    }
    _parms = {
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city ? app.globalData.userInfo.city : this.data.shareCity,
      page: this.data._page,
      rows: 10,
      token: app.globalData.token
    }
    if (this.data.store_details.businessCate) {
      _parms.businessCate = this.data.store_details.businessCate.split('/')[0].split(',')[0];
    }
    console.log('_parms:', _parms)
    Api.shoplist(_parms).then((res) => {
      if (res.data.code == 0) {
        let data = res.data;
        if (data.data.list != null && data.data.list != "" && data.data.list != []) {
          let _data = data.data.list,
            _dataSub = [];
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
  //跳转至店铺详情
  toShopDetail(e) {
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
    this.onShow();
  },
  //买单
  paymentPay: function() {
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
  //查看全部动态
  toActivity() {
    wx.navigateTo({
      url: 'shop-activity/shop-activity?shopid=' + this.data.shopid,
    })
  },
  //去评论
  toComment() {
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
  //页面滚动
  onPageScroll() {
    this.queryMultipleNodes('#merchantBox');
  },
  //页面滚动
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
  //时间转换
  dateConv: function(dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  },
  //店铺螃蟹栏
  crabSection: function() {
    wx.navigateTo({
      url: '../crabShopping/crabShopping?currentTab=1',
    })
  },
  toWDActivity() {
    wx.navigateTo({
      url: '/packageB/pages/wanda/wandaActivity/wandaActivity',
    })
  },
  isVote(e) { //是否可以投票
    let that = this,
      id = e.target.id;
    wx.request({
      url: that.data._build_url + 'vote/canVoteToday?actId=45',
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let code = res.data.code;
        if (code == 0) {
          that.vote(id);
        } else if (code == 200029) {
          that.showToast(res.data.message);
        }
      },
      fail() {

      }
    })
  },
  vote(id) { //投票
    let that = this;
    wx.showModal({
      title: '是否对该菜进行投票?',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: that.data._build_url + 'vote/addVoteFree?actGoodsSkuId=' + id + '&actId=45',
            method: 'GET',
            header: {
              "Authorization": app.globalData.token
            },
            success: function(res) {
              if (res.data.code == 0) {
                that.showToast('投票成功');
              }
            },
            fail() {

            }
          })
        }
      }
    });
  },
  toBuy(e) { //买菜
    let id = e.currentTarget.id,
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: '../bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + this.data.shopid + '&actId=45&categoryId=' + categoryId
    })
  },
  showToast(title) {
    wx.showToast({
      title: title,
      icon: 'none'
    })
  }
})