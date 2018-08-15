import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {GLOBAL_API_DOMAIN} from '../../../../utils/config/config.js';
var app = getApp()
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
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
  onLoad: function (options) {
    this.setData({
      shopId: options.shopId,
      id: options.id
    });
    this.dishDetail();
    this.shopDetail();
    this.dishList();
    this.hotDishList();
    this.isbargain();
  },
  onShow: function () {
    
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
        this.setData({
          dishList: res.data.data.list
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
          list[i].distance = utils.transformLength(list[i].distance);
          hotDishList.push(list[i]);
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
    Api.isbargain(_parms).then((res) => {
      console.log(res.data.data)
      if (res.data.data.length > 0) {
        this.setData({
          isbargain: true
        });
        this.toBargainList();
      }
    });
  },
  //发起砍价
  sponsorVgts:function(){
    console.log(this.data.isbargain);
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
  }
})