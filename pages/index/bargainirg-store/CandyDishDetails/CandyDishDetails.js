import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import getToken from '../../../../utils/getToken.js';
var app = getApp();
import canvasShareImg from '../../../../utils/canvasShareImg.js';
var WxParse = require('../../../../utils/wxParse/wxParse.js');
import getCurrentLocation from '../../../../utils/getCurrentLocation.js';
let requesting = false;
var payrequest = true;
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
        '普通商品购买后3个月内使用有效,湖北万达十大招牌菜活动内所购买的商品，在活动期内有效，过期作废。活动截止日期2019年2月27日24:00'
      ]
    }],
    legend: []
  },
  onLoad(options) {
    //在此函数中获取扫描普通链接二维码参数
    console.log('options:', options)
    let that = this,
      _title = '',
      _id = '',
      _categoryId = '',
      _actId = '',
      _shopId = '';
    let q = decodeURIComponent(options.q);
    if (q && q != 'undefined') {
      if (utils.getQueryString(q, 'flag') == 2) {
        _id = utils.getQueryString(q, 'id');
        _shopId = utils.getQueryString(q, 'shopId');
        _categoryId = utils.getQueryString(q, 'categoryId');
        _actId = utils.getQueryString(q, 'actId');
      }
      let _optOjb={
        id: _id,
        shopId: _shopId,
        categoryId: _categoryId,
        actId: _actId
      };
      that.setData({
        optObj: _optOjb,
        flag: true,
        page: 1,
        shopId: _shopId,
        id: _id,
        actId: _actId ? _actId : ''
      })
    }else{
      that.setData({
        optObj: options,
        flag: true,
        page: 1,
        categoryId: options.categoryId,
        shopId: options.shopId ? options.shopId : '',
        id: options.id ? options.id : '',
        actId: options.actId ? options.actId : '',
        _city: options.city ? options.city : ''
      });
      console.log(that.data._city);
      _categoryId = options.categoryId;
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
    app.globalData.currentScene.query = {
      categoryId: that.data.categoryId,
      shopId: that.data.shopId ? that.data.shopId : '',
      id: that.data.id ? that.data.id : '',
      actId: that.data.actId ? that.data.actId : '',
      _city: that.data.city ? that.data.city : ''
    }
    app.globalData.currentScene.path = "pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails"
  },
  onShow() {
    let that = this;
    if(app.globalData.token) {
      if (app.globalData.userInfo.city){
        that.init();
      }else{
        getCurrentLocation(that).then((res) => {
          that.init();
        }).catch( (res)=>{
          that.setData({ showSkeleton: false })
        })
      }
      
    }else{
      getToken(app).then(() => {
        if (app.globalData.userInfo.city) {
          that.init();
        } else {
          getCurrentLocation(that).then((res) => {
            that.init();
          }).catch((res) => {
            that.setData({ showSkeleton:false})
          })
        }
       })
    }
   
  },
  init(){
    let that = this;
    this.setData({
      isApro: true
    })
    this.getmoreData();
    this.isbargain(false);
  },
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          setTimeout(() => {
            that.onShow();
          }, 300)
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
  //点击查看图文详情
  clickopen: function() {
    this.setData({
      isopenimg: !this.data.isopenimg
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
      actId: this.data.actId,
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
              url: '../AprogressBar/AprogressBar?refId=' + _refId + '&shopId=' + _shopId + '&skuMoneyMin=' + _agioPrice + '&skuMoneyOut=' + _sellPrice + '&_actId=' + _actId + '&categoryId=' + that.data.categoryId
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
    let userInfo = wx.getStorageSync("userInfo");
    let locationX = app.globalData.userInfo.lng ? app.globalData.userInfo.lng : userInfo.lng
    let locationY = app.globalData.userInfo.lat ? app.globalData.userInfo.lat : userInfo.lat
    let that = this,
      _parms = {},
      _values = "",
      url = "";
    _parms = {
      Id: this.data.id,
      shopId: this.data.shopId,
      locationX: locationX,
      locationY: locationY
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
          if (data.status == '2') {
            wx.showModal({
              title: '提示',
              content: '该商品已下架',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
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
          } else if (data.remark) {
            that.setData({
              legend: arr
            })
            remark.push(data.remark)
            skuInfo = data.remark;
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
            WxParse.wxParse('article', 'html', article, that, 0);
          }
          data.skuName = utils.uncodeUtf16(data.skuName);
          try{
            if (data.attachments && data.attachments.length ) {
              var obj = {};
              obj.picUrl = data.picUrl ? data.picUrl : data.skuPic;
              data.attachments.unshift(obj)
            }else{
              var obj = {};
              obj.picUrl = data.picUrl ? data.picUrl : data.skuPic;
              data.attachments = [];
              data.attachments.push(obj)
            }
          }catch(err){}
          that.setData({
            pattern: pattern,
            soData: data,
            picUrl: data.picUrl ? data.picUrl : data.skuPic,
            skuName: data.skuName,
            skuInfo: skuInfo ? skuInfo : remark,
            stockNum: data.stockNum,
            agioPrice: data.actGoodsSkuOut.goodsPromotionRules.actAmount,
            sellPrice: data.sellPrice,
            sellNum: data.sellNum,
            showSkeleton: false
          });
          //自定义分享图片中 绘制价格   公共方法utils.js/canvasShareImg.js  调用方法canvasShareImg()
          canvasShareImg(that.data.picUrl, that.data.agioPrice, that.data.soData.marketPrice ? that.data.soData.marketPrice:that.data.sellPrice).then(function(res) {
            that.setData({
              shareImg: res
            })
          })
        } else {
          if(app.globalData.userInfo.token) {
            wx.showModal({
              title: '提示',
              content: '该商品已下架',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
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
  seebigImg:function(e){
    let that = this;
    let currentImg = e.currentTarget.dataset.img;
    let urls = [];
    for (let i = 0; i < that.data.soData.attachments.length;i++) {
      urls.push(that.data.soData.attachments[i].picUrl)
    }
    wx.previewImage({
      urls: urls,
      current: currentImg
    })
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
        actId: this.data.actId,
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
          // categoryId: that.data.categoryId,
          locationX: app.globalData.userInfo.lng,
          locationY: app.globalData.userInfo.lat,
          city: that.data._city ? that.data._city : app.globalData.userInfo.city,
          page: that.data.page,
          rows:10
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
        actId: this.data.actId,
        page: that.data.page,
        rows:10
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
                  if (list[i].id != that.data.id) {
                    list[i].distance = utils.transformLength(list[i].distance);
                    hotDishList.push(list[i]);
                  }
                }
                let istruenodata = that.data.page == '20'?true:false;
                that.setData({
                  istruenodata,
                  hotDishList: hotDishList,
                  pageTotal: Math.ceil(res.data.data.total /10),
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
    let that = this;
    if (that.data.soData.stockNum<=0) {
      wx.showToast({
        title: '该商品已售罄',
        icon:'none'
      })
      return false
    }
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
          url: '/pages/index/crabShopping/crabDetails/submitOrder/submitOrder?num=1&issku=3&flag=1&picUrl=' + this.data.picUrl + '&sellPrice=' + sellPrice + '&id=' + this.data.id  + '&skuName=' + _soData.skuName + '&remark=' + _soData.remark + '&shopId=' + _soData.shopId + '&singleType=' + _soData.singleType + '&spuId=' + _soData.spuId + '&cfom=candy&stockNum=' + _soData.stockNum
        })
      } else {
        wx.navigateTo({
          url: '../../order-for-goods/order-for-goods?shopId=' + _shopId + '&skuName=' + sellPrice + '元砍价券&sell=' + sellPrice + '&skutype=4&dishSkuId=' + this.data.id + '&dishSkuName=' + this.data.skuName + '&bargainType=1&stockNum=' + _soData.stockNum
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
    let that = this;
    let url  = ''
    if(that.data.shopId != '0'){
      url = '/pages/index/crabShopping/getFailure/getFailure?onekey=bargain&twokey=dish'
    }else{
      url = '/pages/index/crabShopping/getFailure/getFailure?onekey=bargain&twokey=goods'
    }
    wx.navigateTo({
      url: url,
    })
  },
  //点击发起砍价按钮 -- 查询当前是否已经发起砍价
  sponsorVgts: function() {
    let that = this,
      url = "";
    if (that.data.soData.actGoodsSkuOut.stockNum<=0) {
      wx.showToast({
        title: '该商品已售罄',
        icon:'none'
      })
      return false
    }
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
      if (this.data.actId) {
        url = that.data._build_url + 'goodsBar/skuRedis?actId=' + this.data.actId +'&skuId=' + this.data.id;
      } else {
        url = that.data._build_url + 'bargain/skuRedis?skuId=' + this.data.id;
      }
      if (!payrequest){
        return false
      }
      payrequest = false;
      wx.request({
        url: url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'GET',
        success: function(res) {
          payrequest = true
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
                  url: '../AprogressBar/AprogressBar?refId=' + that.data.id + '&shopId=' + _shopId + '&skuMoneyMin=' + that.data.agioPrice + '&skuMoneyOut=' + that.data.sellPrice + '&actId=' + that.data.actId + '&categoryId=' + that.data.categoryId + '&city=' + that.data._city
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
        },fail(){
          payrequest = true
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
    if (this.data.pageTotal <= this.data.page ) {
      return false;
    }
    if (this.data.page == '20'){
      return false
    }
    console.log('bottom')
    this.setData({
      page: this.data.page + 1,
      loading: true
    }, () => {
      this.hotDishList();
    });
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
        categoryId: _soData.categoryId,
        shopId: _soData.shopId,
        id: _soData.id
      }
      for (var key in _optObj) {
        _values += key + "=" + _optObj[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      _path = '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?' + _values;
    } else {
      let city = this.data._city ? this.data._city : userInfo.city;
      _path: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?shopId=' + this.data.shopId + '&id=' + this.data.id + '&lat=' + userInfo.lat + '&lng=' + userInfo.lng + '&city=' + city;
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