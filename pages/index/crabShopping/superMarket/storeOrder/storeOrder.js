import Api from '../../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
import getToken from '../../../../../utils/getToken.js';
var WxParse = require('../../../../../utils/wxParse/wxParse.js');
var utils = require('../../../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation: false,
    id: '',
    skuPic: '',
    skuName: '',
    sellNum: 0,
    marketPrice: 0,
    sellPrice: 0,
    orderPrice: '',
    num: 1,
    shopId: '',
    spuId: 1, //判断是散装还是礼盒
    salepointId: '', //自提点id
    isopenimg: true,
    article: '',
    attachments: []
  },
  onLoad: function(options) {
    let that = this;
    this.setData({
      id: options.id,
      salepointId: options.salepointId
    });
    if (options.isShare) {
      this.setData({
        isShare: options.isShare
      });
    }
    if (!app.globalData.token) { //没有token 获取token
      getToken(app).then(() => {
        that.getTXT();
        that.getDetailBySkuId();
      })
    } else {
      this.getTXT();
      this.getDetailBySkuId();
    }
  },
  onHide: function() {
    wx.hideLoading();
  },
  getTXT: function () {
    let _crabImgUrl = [],
      _ruleImg = '',
      that = this;
    app.globalData.Express = {};
    if (app.globalData.txtObj.crabImgUrl) {
      _crabImgUrl = app.globalData.txtObj.crabImgUrl, _ruleImg = app.globalData.txtObj.ruleImg;
      _crabImgUrl = _crabImgUrl.slice(2);
      _crabImgUrl.pop();
      _crabImgUrl.pop();
      that.setData({
        crabImgUrl: _crabImgUrl,
        ruleImg: _ruleImg
      })
    } else {
      wx.request({
        url: this.data._build_url + 'version.txt',
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
          app.globalData.txtObj = res.data;
          _crabImgUrl = app.globalData.txtObj.crabImgUrl, _ruleImg = app.globalData.txtObj.ruleImg;
          _crabImgUrl = _crabImgUrl.slice(2);
          _crabImgUrl.pop();
          _crabImgUrl.pop();
          that.setData({
            crabImgUrl: _crabImgUrl,
            ruleImg: _ruleImg
          })
        }
      })
    }
  },
  //查询单个详情
  getDetailBySkuId: function(val) {
    let that = this, _url = '';
    _url = this.data._build_url + 'goodsSku/selectDetailBySkuIdNew?id=' + this.data.id + '&token=' + app.globalData.token;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let data = res.data.data,
            article = '';
          console.log(data);
          that.setData({
            skuName: data.skuName ? data.skuName : 0,
            skuPic: data.skuPic ? data.skuPic : data.smallSkuPic,
            sellNum: data.sellNum,
            marketPrice: data.marketPrice ? data.marketPrice : 0,
            sellPrice: data.sellPrice ? data.sellPrice : 0,
            orderPrice: (data.sellPrice * that.data.num).toFixed(2),
            spuId: data.spuId,
            shopId: data.shopId,
            attachments: data.attachments ? data.attachments : []
          })
          if (data.goodsSpuOut && data.goodsSpuOut.goodsSpuDesc && data.goodsSpuOut.goodsSpuDesc.content) {
            article = data.goodsSpuOut.goodsSpuDesc.content;
            WxParse.wxParse('article', 'html', article, that, 0);
          }
        }
      },
      fail() {}
    });
  },
  seebigImg: function (e) {   //查看大图
    let that = this;
    let currentImg = e.currentTarget.dataset.img;
    let urls = [];
    for (let i = 0; i < that.data.attachments.length; i++) {
      urls.push(that.data.attachments[i].picUrl)
    }
    wx.previewImage({
      urls: urls,
      current: currentImg
    })
  },
  add() { //点击加号
    let num = this.data.num + 1,
      sellPrice = this.data.sellPrice;
    this.setData({
      num: num,
      orderPrice: (sellPrice * num).toFixed(2)
    });
  },
  minus() { //点击减号
    if (this.data.num > 1) {
      let num = this.data.num - 1,
        sellPrice = this.data.sellPrice;
      this.setData({
        num: num,
        orderPrice: (sellPrice * num).toFixed(2)
      });
    }
  },
  toBuy: function() { //去下单
    let that = this;
    //通过code查询进入的用户信息，判断是否是新用户
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            if(res.data.data.id){
              let data = res.data.data;
              app.globalData.userInfo.userId = data.id;
              app.globalData.userInfo.lat = data.locationX;
              app.globalData.userInfo.lng = data.locationY;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              if (!data.mobile) { //是新用户，去注册页面
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                })
              } else if (app.globalData.userInfo.userId) {
                if (that.data.num <= 0) {
                  wx.showToast({
                    title: '请至少选择一个',
                    icon: 'none'
                  })
                  return false;
                }
                //issku=3为到店自提
                wx.navigateTo({
                  url: '../../crabDetails/submitOrder/submitOrder?spuId=' + that.data.spuId + '&id=' + that.data.id + '&num=' + that.data.num + '&issku=3&shopId=' + that.data.shopId + '&salepointId=' + that.data.salepointId + '&flag=1'
                })
              }
            }else{
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
          } else {
            
          }
        })
      }
    })
  },
  //点击查看图文详情
  clickopen: function () {
    this.setData({
      isopenimg: !this.data.isopenimg
    })
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //分享给好友
  onShareAppMessage: function () {
    return {
      title: this.data.skuName,
      path: '/pages/index/crabShopping/superMarket/storeOrder/storeOrder?id=' + this.data.id + '&salepointId=' + this.data.salepointId + '&isShare=true'
    }
  },
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权          
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  }
})