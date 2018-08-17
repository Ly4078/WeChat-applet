import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {GLOBAL_API_DOMAIN} from '../../../../utils/config/config.js';
var app = getApp()
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    issnap: false,   //新用户
    isnew: false,   //新用户
    shopId: '',   //店铺id
    id: '',       //菜id
    picUrl: '',     //菜图
    skuName: '',    //菜名
    stockNum: '',   //库存
    agioPrice: '',  //底价
    sellPrice: '',  //原价
    sellNum: '',     //已售
    shopName: '',     //店名
    address: '', //地址
    popNum: '',   //人气值
    dishList: [],   //同店推荐
    hotDishList: [],  //热门推荐
    flag: true,
    page: 1,
    isbargain: false   //是否砍过价
  },
  onLoad(options) {
    this.findByCode();
    this.setData({
      shopId: options.shopId,
      id: options.id
    });
  },
  onShow() {
    this.getuserInfo();
    this.getmoreData();
    this.isbargain();
  },
  getmoreData(){  //查询 更多数据 
    this.dishDetail();
    this.shopDetail();
    this.dishList();
    this.hotDishList();
  },
  chilkDish(e){  //点击某个推荐菜
    let id = e.currentTarget.id;
    this.setData({
      id: id,
      page: 1,
      flag: true,
      hotDishList: []
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    this.getmoreData();
    this.isbargain();
  },
  chickinItiate(e){  //点击某个发起砍价
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _refId = e.currentTarget.id,
      _shopId = e.currentTarget.dataset.shopid,
      _agioPrice = e.currentTarget.dataset.agioprice,
      _sellPrice = e.currentTarget.dataset.sellprice;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      skuId: _refId
    };
    Api.vegetables(_parms).then((res) => {
      if (res.data.data.length > 0) {
        this.setData({
          isbargain: true
        });
        this.toBargainList();
      } else {
        wx.navigateTo({
          url: '../AprogressBar/AprogressBar?refId=' + _refId + '&shopId=' + _shopId + '&skuMoneyMin=' + _agioPrice + '&skuMoneyOut=' + _sellPrice
        })
      }
    });
  },
  //查询单个砍价菜
  dishDetail() {    
    let _parms = {
      Id: this.data.id, 
      zanUserId: app.globalData.userInfo.userId, 
      shopId: this.data.shopId
    };
    Api.discountDetail(_parms).then((res) => {
      if(res.data.code == 0 && res.data.data) {
        let data = res.data.data;
        this.setData({
          picUrl: data.picUrl,
          skuName: data.skuName,     
          stockNum: data.stockNum,   
          agioPrice: data.agioPrice,  
          sellPrice: data.sellPrice,  
          sellNum: data.sellNum       
        });
      } else {
        wx.showToast({
          title: '系统繁忙'
        })
      }
    })
  },
  //查询商家信息
  shopDetail() {
    let _this = this;
    wx.request({
      url: _this.data._build_url + 'shop/get/' + _this.data.shopId,
      success: function (res) {
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data;
          _this.setData({
            shopName: data.shopName,
            address: data.address,
            popNum: data.popNum
          });
        } else {
          wx.showToast({
            title: '系统繁忙'
          })
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
  //同店推荐
  dishList() {
    //browSort 0附近 1销量 2价格
    let _parms = {
      shopId: this.data.shopId,
      zanUserId: app.globalData.userInfo.userId,
      browSort: 0,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      page: 1,
      rows: 10
    };
    Api.partakerList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data.list && res.data.data.list != 'null') {
        let list = res.data.data.list, newList = [];
        for (let i = 0; i < list.length; i++) {
          if (list[i].id != this.data.id) {
            newList.push(list[i]);
          } 
        }
        this.setData({
          dishList: newList
        });
      } 
    })
  },
  //热门推荐
  hotDishList() {
    //browSort 0附近 1销量 2价格
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 1,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      page: this.data.page,
      rows: 6
    };
    Api.partakerList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data.list && res.data.data.list != 'null') {
        let list = res.data.data.list, hotDishList = this.data.hotDishList;
        for (let i = 0; i < list.length; i++) {
          if (list[i].id != this.data.id) {
            list[i].distance = utils.transformLength(list[i].distance);
            hotDishList.push(list[i]);
          }
        }
        this.setData({
          hotDishList: hotDishList
        });
        if (list.length < 6) {
          this.setData({
            flag: false
          });
        }
      } else {
        this.setData({
          flag: false
        });
      }
    })
  },
  //点击跳转至砍价列表
  toBargainList() {
    wx.showModal({
      title: '您已发起了砍价，是否查看状态',
      content: '',
      complete(e) {
        if (e.confirm) {
          wx.navigateTo({
            url: '../pastTense/pastTense'
          });
        }
      }
    })
  },
  //是否发起过砍价
  isbargain() {
    let _parms = {
      userId: app.globalData.userInfo.userId,  
      skuId: this.data.id
    };
    Api.vegetables(_parms).then((res) => {
      if (res.data.data.length > 0) {
        this.setData({
          isbargain: true
        });
        this.toBargainList();
      }
    });
  },
  //原价购买
  originalPrice() {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let sellPrice = this.data.sellPrice;
    wx.navigateTo({
      url: '../../order-for-goods/order-for-goods?shopId=' + this.data.shopId + '&skuName=' + sellPrice + '元砍价券&sell=' + sellPrice + '&skutype=4&dishSkuId=' + this.data.id + '&dishSkuName=' + this.data.skuName + '&bargainType=1'
    })
  },
  //发起砍价
  sponsorVgts:function(){
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.isbargain) {
      this.toBargainList();
    } else {
      wx.navigateTo({
        url: '../AprogressBar/AprogressBar?refId=' + this.data.id + '&shopId=' + this.data.shopId + '&skuMoneyMin=' + this.data.agioPrice + '&skuMoneyOut=' + this.data.sellPrice
      })
    }
  },
  // 左上角返回首页
  returnHomeArrive: function () {
    wx.switchTab({
      url: '../../index',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  shareCand:function(){  //点击分享

  },
  onReachBottom: function () {  //用户上拉触底加载更多
    if (!this.data.flag) {
      return false;
    }
    this.setData({
      page: this.data.page + 1
    });
    this.hotDishList();
  },
  onPullDownRefresh: function () {
    this.setData({
      flag: true,
      hotDishList: [],
      page: 1
    });
    this.hotDishList();
  },
  findByCode: function () { //通过code查询进入的用户信息，判断是否是新用户
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
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
                // wx.navigateTo({
                //   url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
                // })
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  getuserInfo: function (val) {//从自己的服务器获取用户信息
    let that = this;
    wx.request({
      url: that.data._build_url + 'user/get/' + app.globalData.userInfo.userId,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let data = res.data.data;
          if (val == 1) {
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            };
          }
        }
      }
    })
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  }
})