import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var app = getApp();
import canvasShareImg from '../../../../utils/canvasShareImg.js';
var WxParse = require('../../../../utils/wxParse/wxParse.js');
let requesting = false;

var village_LBS = function(that) {
  wx.getLocation({
    success: function(res) {
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
    isshowlocation: false,
    showModal: false,
    soData: {},
    distance:'',
    isApro:true,//是否支持跳转
    showSkeleton: true,
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
    store_details: [],
    hotDishList: [], //热门推荐
    isBarg: false,
    flag: true,
    page: 1,
    isbargain: false, //是否砍过价
    _city: '',
    _lat: '',
    _lng: '',
    categoryId: '',
    optObj: {},
    isopenimg: true,
    id: '', //商品ID
    actId: '', //活动ID
    pattern: '',
    article: '',
    legends: [{
      name: '有效期',
      info: [
        '购买后3个月内使用有效'
      ]
    }],
    legend: []
  },
  onLoad(options) {
    //在此函数中获取扫描普通链接二维码参数
    console.log('options:', options)
    let _categoryId = '', _title = '', _id = '', _shopId = '',_actId='',that = this;
    let q = decodeURIComponent(options.q);
    if (q && q != 'undefined') {
      if (utils.getQueryString(q, 'flag') == 2) {
        _id = utils.getQueryString(q, 'id');
        _shopId = utils.getQueryString(q, 'shopId');
        _actId = utils.getQueryString(q, 'actId');
        _categoryId = utils.getQueryString(q, 'categoryId');
      }
      let _optOjb={
        id:_id,
        shopId:_shopId,
        categoryId: _categoryId,
        actId: _actId ? _actId:''
      };
      that.setData({
        optObj: _optOjb,
        flag: true,
        page: 1,
        _categoryId: _categoryId,
        shopId: _shopId,
        id: _id,
        actId: _actId ? _actId : ''
      })
    }else{
      _categoryId= options.categoryId;
      that.setData({
        optObj: options,
        flag: true,
        page: 1,
        shopId: options.shopId ? options.shopId : '',
        id: options.id ? options.id : '',
        actId: options.actId ? options.actId : '',
        _city: options.city ? options.city : ''
      });
    }
    if (_categoryId == 5) {
      _title = '酒店详情';
    } else if (_categoryId == 6) {
      _title = '门票详情';
    } else if (_categoryId == 8) {
      _title = '菜品详情';
    } else {
      _title = '商品详情';
    }
    wx.setNavigationBarTitle({
      title: _title
    })
  },
  onShow() {
    let that = this;
    this.setData({
      isApro: true
    })
    if (!app.globalData.userInfo.city && !app.globalData.userInfo.lat && !app.globalData.userInfo.lng) {
      this.getUserlocation();
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
      }
    } else {
      this.findByCode();
    }
  },
  //点击查看图文详情
  clickopen: function() {
    this.setData({
      isopenimg: !this.data.isopenimg
    })
  },
  findByCode: function() { //通过code查询用户信息
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
              if (!data.mobile) { //是新用户，去注册页面
                that.setData({
                  isnew: true
                });
              }
              let userInfo = app.globalData.userInfo;
              if (userInfo.lat || userInfo.lng || userInfo.city) {
                that.authlogin(); //获取token
              } else {
                that.getlocation(); //获取位置信息
              }
            } else {
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
          that.isbargain(false);
          that.getmoreData();
        }
      }
    })
  },
  getUserlocation: function() { //获取用户位置经纬度
    let that = this;
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
              // that.getCutDish();
              that.dishList();
            }
          }
        })
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
        if (!res.authSetting['scope.userLocation']) { //打开位置授权          
          that.setData({
            isshowlocation: true
          })
        } else {
          village_LBS(that);
        }
      }
    })
  },
  getmoreData() { //查询 更多数据 
    this.dishDetail();
    // if (!this.data.actId) {
    this.shopDetail();
    // }
    if (app.globalData.userInfo.lng && app.globalData.userInfo.lat) {
      if (this.data._city || app.globalData.userInfo.city) {
        this.setData({
          flag: true,
          page: 1
        });
        // if (!this.data.actId) {
        this.dishList();
        // }
        this.hotDishList();
      } else {
        this.getlocation();
      }
    }
  },
  chilkDish(e) { //点击某个推荐菜
    let id = e.currentTarget.id,
      shopId = e.currentTarget.dataset.shopid;
    this.setData({
      actId:41,
      id: id,
      shopId: shopId,
      page: 1,
      flag: true
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
    } else {
      let _refId = e.currentTarget.id,
        _shopId = e.currentTarget.dataset.shopid,
        _agioPrice = e.currentTarget.dataset.agioprice,
        _actId = e.currentTarget.dataset.actId,
        _categoryId = e.currentTarget.dataset.categoryId,
        _parms = {},
        _this = this,
        _sellPrice = e.currentTarget.dataset.sellprice;
      _parms = {
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
          if (_this.data.isApro){
            wx.navigateTo({
              url: '../AprogressBar/AprogressBar?refId=' + _refId + '&shopId=' + _shopId + '&skuMoneyMin=' + _agioPrice + '&skuMoneyOut=' + _sellPrice + '&_actId=' + _actId + '&categoryId=' + _categoryId
            })
            _this.setData({
              isApro:false
            })
          }else{
            wx.showToast({
              title: '跳转中...',
              icon:'none'
            })
          }
        }
      });
    }
  },
  //点击同店推荐菜品
  dishesDiscounts(e) {
    let id = e.currentTarget.id,
      actid = e.currentTarget.dataset.actid;
    this.setData({
      actId: actid,
      id: id,
      page: 1,
      flag: true
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
    let that = this,
      _parms = {},
      _values = "",
      url = "";
    _parms = {
      Id: this.data.id,
      shopId: this.data.shopId,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      // actId:41
    };
    if (that.data.actId) {
      _parms.actId = this.data.actId
    } else {
      _parms.zanUserId = app.globalData.userInfo.userId
    }

    for (var key in _parms) {
      _values += key + "=" + _parms[key] + "&";
    }
    _values = _values.substring(0, _values.length - 1);
    if (that.data.actId) {
      url = that.data._build_url + 'goodsSku/selectDetailBySkuIdNew?' + _values;
    } else {
      url = that.data._build_url + 'sku/getKjc?' + _values;
    }
    url=encodeURI(url);
    wx.request({
      url: url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data,
            skuInfo = '',
            _RegExp = new RegExp('<p.*?>(.*?)<\/p>', 'i'),
            pattern = '',
            article = '',
            remark = [];
          let arr = that.data.legends;
          let obj = {
            name: '使用规则',
            info: []
          };
          console.log('data:', data)
          if (data.skuInfo) {
            skuInfo = data.skuInfo;

            if (skuInfo && skuInfo.indexOf("Œ") != -1) {
              skuInfo = skuInfo.split('Œ');
              obj.info = skuInfo;
              arr.push(obj);
              if (arr.length > 2) {
                arr.splice(1, 1);
              }
              that.setData({
                legend: arr
              })
            } else if (skuInfo) {
              obj.info.push(skuInfo);
              arr.push(obj);
              if (arr.length > 2) {
                arr.splice(1, 1);
              }
              that.setData({
                legend: arr
              })
            } else {
              if (arr.length > 1) {
                arr.splice(1);
              }
              that.setData({
                legend: that.data.legends
              })
            }
          } else if (data.remark) {
            that.setData({
              legend: arr
            })
            remark.push(data.remark)
          } else if (data.actGoodsSkuOuts && data.actGoodsSkuOuts[0].ruleDesc) {
            skuInfo = data.actGoodsSkuOuts[0].ruleDesc;
            if (skuInfo.indexOf("Œ") != -1) {
              skuInfo = skuInfo.split('Œ');
              obj.info = skuInfo;
              arr.push(obj);
              if (arr.length > 2) {
                arr.splice(1, 1);
              }
              that.setData({
                legend: arr
              })
            } else {
              obj.info.push(skuInfo);
              arr.push(obj);
              if (arr.length > 2) {
                arr.splice(1, 1);
              }
              that.setData({
                legend: arr
              })
            }
          } else {
            if (arr.length > 1) {
              arr.splice(1);
            }
            that.setData({
              legend: arr
            })
          }

          if (data.goodsSpuOut && data.goodsSpuOut.goodsSpuDesc && data.goodsSpuOut.goodsSpuDesc.content) {
            article = data.goodsSpuOut.goodsSpuDesc.content;
            // if (article.match(pattern)[1]) {
            //   pattern = article.match(_RegExp)[1];
            // }
            WxParse.wxParse('article', 'html', article, that, 0);
          }
          data.skuName = utils.uncodeUtf16(data.skuName);
          that.setData({
            // pattern: pattern,
            soData: data,
            picUrl: data.picUrl ? data.picUrl : data.skuPic,
            skuName: data.skuName,
            skuInfo: skuInfo ? skuInfo : remark,
            stockNum: data.stockNum,
            agioPrice: data.agioPrice ? data.agioPrice : data.actGoodsSkuOuts[0].goodsPromotionRules.actAmount,
            sellPrice: data.sellPrice,
            sellNum: data.sellNum,
            showSkeleton: false
          });
          //自定义分享图片中 绘制价格   公共方法utils.js/canvasShareImg.js  调用方法canvasShareImg()
          canvasShareImg(that.data.picUrl, that.data.agioPrice, that.data.sellPrice).then(function(res) {
            that.setData({
              shareImg: res
            })
          })
        } else {
          that.setData({
            showSkeleton: false
          })
        }
      },
      fail: function() {
        that.setData({
          showSkeleton: false
        })
      }
    })
  },
  //查询商家信息
  shopDetail() {
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
            store_details: data,
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
  //同店推荐
  dishList() {
    //browSort 0附近 1销量 2价格
    let that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
      let _parms = {
        shopId: this.data.shopId,
        actId: 41,
        zanUserId: app.globalData.userInfo.userId,
        browSort: 0,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        isDeleted: 0,
        page: 1,
        rows: 10,
        token: app.globalData.token
      };
      Api.listForActs(_parms).then((res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let list = res.data.data.list,
              newList = [],
              preDishList = [];
            for (let i = 0; i < list.length; i++) {
            //   if (list[i].id != this.data.id) {
                newList.push(list[i]);
            //   }
            }
            preDishList = newList.length > 5 ? newList.slice(0, 4) : newList;

            that.setData({
              dishList: newList,
              preDishList: preDishList
            });
          }
        }
      })
    } else {
      that.getlocation();
    }
  },
  //热门推荐
  hotDishList() {
    let that = this,
      url = "",
      _Url = "",
      _values = "",
      _parms = {};
    if (this.data.page == 1) {
      this.setData({
        flag: true,
        hotDishList: []
      });
    }
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
      //browSort 0附近 1销量 2价格
      requesting = true;
      if (that.data.actId) {
        _parms = {
          id: that.data.id,
          actId: that.data.actId,
          categoryId: that.data.categoryId,
          locationX: app.globalData.userInfo.lng,
          locationY: app.globalData.userInfo.lat,
          city: that.data._city ? that.data._city : app.globalData.userInfo.city,
          page: that.data.page,
          rows: 10
        }
        for (var key in _parms) {
          _values += key + "=" + _parms[key] + "&";
        }
        _values = _values.substring(0, _values.length - 1);
        url = that.data._build_url + 'goodsSku/listForActOut?' + _values;
      } else {
      _parms = {
        zanUserId: app.globalData.userInfo.userId,
        browSort: 1,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        city: that.data._city ? that.data._city : app.globalData.userInfo.city,
        isDeleted: 0,
        actId: 41,
        page: that.data.page,
        rows: 10
      };
      for (var key in _parms) {
        _values += key + "=" + _parms[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      url = that.data._build_url + 'goodsSku/listForAct?' + _values;
      }
      _Url = encodeURI(url);
      wx.request({
        url: _Url,
        method: 'GET',
        header: {
          "Authorization": app.globalData.token
        },
        success: function(res) {
          if (res.data.code == 0) {
            if (res.data.data.list && res.data.data.list.length > 0) {
              let list = res.data.data.list,
                hotDishList = that.data.hotDishList;
              if (list && list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                  for (let j = 0; j < hotDishList.length; j++) {
                    if (hotDishList[j].id == list[i].id) {
                      hotDishList.splice(j, 1)
                    }
                  }
                }
                for (let i = 0; i < list.length; i++) {
                  if (list[i].id != that.data.id) {
                    list[i].distance = utils.transformLength(list[i].distance);
                    hotDishList.push(list[i]);
                  }
                }
                that.setData({
                  hotDishList: hotDishList,
                  pageTotal: Math.ceil(res.data.data.total / 6),
                  loading: false
                }, () => {
                  requesting = false
                  wx.hideLoading();
                });
                if (list.length < 6) {
                  that.setData({
                    flag: false
                  });
                }
              }

            } else {
              that.setData({
                flag: false,
                loading: false
              });
              requesting = false
            }
          } else {
            wx.hideLoading();
            requesting = false
            that.setData({
              loading: false
            });
          }
        }
      })
    } else {
      that.getlocation();
    }
  },
  //点击跳转至砍价列表
  toBargainList() {
    let that = this;
    wx.showModal({
      title: '您已发起了砍价，是否查看状态',
      content: '',
      complete(e) {
        if (e.confirm) {
          wx.navigateTo({
            url: '../pastTense/pastTense?actid=' + that.data.actId
          });
        }
      }
    })
  },
  //是否发起过砍价
  isbargain(isHref) {
    let _parms = {
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
    } else {
      let sellPrice = this.data.sellPrice,
        _soData = this.data.soData,
        _shopId = this.data.shopId ? this.data.shopId : this.data.soData.shopId;
      if (this.data.actId) {
        wx.navigateTo({
          url: '/pages/index/crabShopping/crabDetails/submitOrder/submitOrder?num=1&issku=3&flag=1&picUrl=' + this.data.picUrl + '&sellPrice=' + sellPrice + '&id=' + this.data.id + '&actId=' + this.data.actId + '&skuName=' + _soData.skuName + '&remark=' + _soData.remark + '&shopId=' + _soData.shopId + '&singleType=' + _soData.singleType + '&spuId=' + _soData.spuId+'&cfom=candy'
        })
      } else {
        wx.navigateTo({
          url: '../../order-for-goods/order-for-goods?shopId=' + _shopId + '&skuName=' + sellPrice + '元砍价券&sell=' + sellPrice + '&skutype=4&dishSkuId=' + this.data.id + '&dishSkuName=' + this.data.skuName + '&bargainType=1'
        })
      }

    }
  },
  //查看全部砍价菜
  changeBar() {
    this.setData({
      isBarg: !this.data.isBarg
    });
  },
  understand: function() {
    this.setData({
      showModal: !this.data.showModal
    })
  },
  //点击发起砍价按钮 -- 查询当前是否已经发起砍价
  sponsorVgts: function() {
    let that = this,
      url = "";
    if (!app.globalData.userInfo.mobile) {
      that.setData({
        issnap: true
      })
    } else if(!this.data.isApro){
      wx.showToast({
        title: '跳转中...',
        icon:'none'
      })
    } else {
      that.setData({
        isApro:false
      })
      if (this.data.actId && this.data.actId != 41) {
        url = that.data._build_url + 'goodsBar/skuRedis?skuId=' + this.data.id;
      } else if (this.data.actId == 41) {
        url = that.data._build_url + 'goodsBar/skuRedis?actId=41&skuId=' + this.data.id;
      } else {
        url = that.data._build_url + 'bargain/skuRedis?skuId=' + this.data.id;
      }
      wx.request({
        url: url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'GET',
        success: function(res) {
          let _shopId = that.data.shopId ? that.data.shopId : that.data.soData.shopId;
          if (res.data.code == 0) {
            if (res.data.data.length > 0) {
              that.setData({
                isbargain: true
              });
              that.toBargainList();
            } else {
              if (that.data.actId) {
                wx.navigateTo({
                  url: '../AprogressBar/AprogressBar?refId=' + that.data.id + '&shopId=' + _shopId + '&skuMoneyMin=' + that.data.agioPrice + '&skuMoneyOut=' + that.data.sellPrice + '&actId=' + that.data.actId + '&categoryId=' + that.data.categoryId
                })
              } else {
                wx.navigateTo({
                  url: '../AprogressBar/AprogressBar?refId=' + that.data.id + '&shopId=' + _shopId + '&skuMoneyMin=' + that.data.agioPrice + '&skuMoneyOut=' + that.data.sellPrice + '&categoryId=' + that.data.categoryId
                })
                
              }
            }
            that.setData({
              isApro: true
            })
          } else {
            if (that.data.actId) {
              wx.navigateTo({
                url: '../AprogressBar/AprogressBar?refId=' + that.data.id + '&shopId=' + _shopId + '&skuMoneyMin=' + that.data.agioPrice + '&skuMoneyOut=' + that.data.sellPrice + '&actId=' + that.data.actId + '&categoryId=' + that.data.categoryId
              })
            } else {
              wx.navigateTo({
                url: '../AprogressBar/AprogressBar?refId=' + that.data.id + '&shopId=' + _shopId + '&skuMoneyMin=' + that.data.agioPrice + '&skuMoneyOut=' + that.data.sellPrice + '&categoryId=' + that.data.categoryId
              })
            }
            that.setData({
              isApro: true
            })
          }
        }
      })
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
    // if (!this.data.flag) {
    //   return false;
    // }
    // if (requesting) {
    //   return
    // }
    if (this.data.pageTotal <= this.data.page) {
      return
    }
    // if (!this.data.actId) {
    this.setData({
      page: this.data.page + 1,
      loading: true
    }, () => {
      this.hotDishList();
    });
    // }
  },
  onPullDownRefresh: function() { //下拉刷新 
    this.setData({
      flag: true,
      page: 1
    });
    this.hotDishList();
    // if (!this.data.actId) {
    this.dishList();
    // }
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
              that.setData({
                isshowlocation: true
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
      this.getlocation();
    } else {
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
  //打开地图
  openmap: function() {
    let that = this,
      storeDetails = that.data.store_details;
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
  //拨打电话
  callphone: function() {
    let phone = '';
    if (this.data.soData.salePointOuts && this.data.soData.salePointOuts.length > 0) {
      phone = this.data.soData.salePointOuts[0].phone;
    }

    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      })
    } else {
      wx.showToast({
        title: '商家暂未提示联系方式',
        icon: 'none'
      })
    }
  },
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
  //分享给好友
  onShareAppMessage: function() {
    let that = this;
    let userInfo = app.globalData.userInfo,
      _path = '',
      _values = '',
      _optObj={};
    if (this.data.actId) {
      let _soData = this.data.soData;
      _optObj={
        actId: _soData.actGoodsSkuOut.actId,
        categoryId:'8',
        shopId: _soData.shopId,
        id: _soData.id
      }
      for (var key in _optObj) {
        _values += key + "=" + _optObj[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      _path = '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?' + _values;
    } else {
      _path: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?shopId=' + this.data.shopId + '&id=' + this.data.id + '&lat=' + userInfo.lat + '&lng=' + userInfo.lng + '&city=' + userInfo.city;
    }
    return {
      // title: this.data.skuName,
      title: "邀人砍价，享实惠~~ " + this.data.skuName,
      path: _path,
      imageUrl: that.data.shareImg,
      success: function(res) {

      },
      fail: function(res) {
        // 分享失败

      }
    }
  }
})