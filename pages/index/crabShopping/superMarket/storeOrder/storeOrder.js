import Api from '../../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var utils = require('../../../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
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
    salepointId: '' //自提点id
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      id: options.id,
      salepointId: options.salepointId
    });
    if (options.isShare) {
      this.setData({
        isShare: options.isShare
      });
    }
  },
  onShow: function() {
    let _ruleImg = '',
      _crabImgUrl = [],
      that = this;
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          this.getTXT();
          this.getDetailBySkuId();
        } else {
          this.authlogin();
        }
      } else {//是新用户，去注册页面
        this.authlogin();
        // wx.navigateTo({
        //   url: '/pages/personal-center/securities-sdb/securities-sdb?back == 1'
        // })
      }
    } else {
      this.findByCode();
    }

    return
    this.getDetailBySkuId();
    console.log("txtobj:", app.globalData.txtObj)
    if (app.globalData.txtObj.ruleImg) {
      console.log('111111')
      _crabImgUrl = app.globalData.txtObj.crabImgUrl, _ruleImg = app.globalData.txtObj.ruleImg;
      _crabImgUrl = _crabImgUrl.slice(2);
      _crabImgUrl.pop();
      _crabImgUrl.pop();
      that.setData({
        crabImgUrl: _crabImgUrl,
        ruleImg: _ruleImg
      })
    } else {
      console.log('222')
      wx.request({
        url: this.data._build_url + 'version.txt',
        success: function(res) {
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
  onHide: function() {
    wx.hideLoading();
  },
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            app.globalData.userInfo.userId = data.id;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }
            if (!data.mobile) {
              wx.navigateTo({
                url: '/pages/personal-center/securities-sdb/securities-sdb?back == 1'
              })
            }else{
              that.authlogin();//获取token
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          that.getTXT();
          that.getDetailBySkuId();
          if (app.globalData.userInfo.mobile) {
            // that.getTXT();
            // that.getDetailBySkuId();
          }
        }
      }
    })
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
    let that = this;
    Api.DetailBySkuId({
      id: this.data.id,
      token: app.globalData.token
    }).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0) {
        let data = res.data.data;
        this.setData({
          skuName: data.skuName,
          skuPic: data.skuPic,
          sellNum: data.sellNum,
          marketPrice: data.marketPrice,
          sellPrice: data.sellPrice,
          orderPrice: (data.sellPrice * this.data.num).toFixed(2),
          spuId: data.spuId,
          shopId: data.shopId
        })
      }
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
                url: '../../../../personal-center/securities-sdb/securities-sdb?back=1'
              })
              return false;
            }
            if (app.globalData.userInfo.userId) {
              if (that.data.num <= 0) {
                wx.showToast({
                  title: '请至少选择一只',
                  icon: 'none'
                })
                return false;
              }
              //issku=3为到店自提
              wx.navigateTo({
                url: '../../crabDetails/submitOrder/submitOrder?spuId=' + that.data.spuId + '&id=' + that.data.id + '&num=' + that.data.num + '&issku=3&shopId=' + that.data.shopId + '&salepointId=' + that.data.salepointId
              })
            }
          } else {
            that.findByCode();
          }
        })
      }
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
  }
})