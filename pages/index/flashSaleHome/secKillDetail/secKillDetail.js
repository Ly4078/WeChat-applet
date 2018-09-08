import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    issnap: false, //新用户
    isnew: false, //新用户
    id: '', //菜id
    picUrl: '',
    skuName: '',
    stockNum: '',
    sellNum: '',
    agioPrice: '',
    sellPrice: '',
    shopName: '',
    address: '',
    initiator: '', //发起人
    newList: [], //邀请新人列表
    timer: null, //倒计时
    countDown: ''
  },
  onLoad: function(options) {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null,
      initiator: options.initiator ? options.initiator : '', //发起人Id
      id: options.id,
      shopId: options.shopId
    });
  },
  onShow: function() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
    this.shopDetail();
    if (app.globalData.userInfo.userId) {
      if (!app.globalData.userInfo.mobile) { //是新用户，去注册页面
        wx.navigateTo({
          url: '../../../../pages/personal-center/securities-sdb/securities-sdb?parentId=' + this.data.initiator + '&skuId=' + this.data.id + '&shopId=' + this.data.shopId
        })
      } else {
        this.getDish(); //查询菜详情
        let _parms = {
          skuId: this.data.id,
          parentId: app.globalData.userInfo.userId
        };
        //判断之前是否创建过，并查看邀请了多少人注册
        Api.inviteNum(_parms).then((res) => {
          if (res.data.code == 0) {
            if (res.data.data.length > 0 && res.data.data[0]) {
              let data = res.data.data;
              this.setData({
                newList: data[0].newUser ? data[0].newUser : [],
                peoPleNum: data[0].peoPleNum ? data[0].peoPleNum : 0
              });
              this.countDownFunc(data[0].endTime);
            } else {
              //创建一个秒杀菜
              this.createSecKill();
            }
          }
        })
      }
    } else {
      this.findByCode();
    }
  },
  onHide() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
  },
  onUnload() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
  },
  //查询菜
  getDish() {
    let _parms = {
      Id: this.data.id,
      zanUserId: app.globalData.userInfo.userId,
      shopId: this.data.shopId
    };
    Api.secKillDetail(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        let data = res.data.data;
        this.setData({
          picUrl: data.picUrl,
          skuName: data.skuName,
          stockNum: data.stockNum,
          agioPrice: data.agioPrice,
          sellPrice: data.sellPrice,
          sellNum: data.sellNum
        });
      }
    })
  },
  //查询商家信息
  shopDetail() {
    let _this = this;
    wx.request({
      url: _this.data._build_url + 'shop/get/' + _this.data.shopId,
      success: function(res) {
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data;
          _this.setData({
            shopName: data.shopName,
            address: data.address
          });
        } else {

        }
      }
    });

  },
  //发起秒杀菜
  createSecKill() {
    let _parms = {
      parentId: app.globalData.userInfo.userId,
      skuId: this.data.id,
      shopId: this.data.shopId
    };
    Api.createSecKill(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        wx.showToast({
          title: '发起成功，快去邀请好友参与秒杀吧',
          icon: 'none'
        })
        this.countDownFunc(res.data.data.endTime);
      }
    })
  },
  //倒计时回调
  countDownFunc(endTime) {
    let miliEndTime = new Date(endTime).getTime(),
      miliNow = new Date().getTime();
    if (miliEndTime > miliNow) {
      let minus = Math.floor((miliEndTime - miliNow) / 1000),
        hours = '',
        minutes = '',
        seconds = '',
        countDown = '',
        _this = this;
      this.setData({
        timer: setInterval(function() {
          console.log('倒计时');
          if (minus == 0) {
            _this.setData({
              countDown: 'isEnd'
            });
            minus = 0;
            clearInterval(_this.data.timer);
          } else {
            hours = Math.floor(minus / 3600); //时
            minutes = Math.floor(minus / 60); //分
            seconds = minus % 60; //秒
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            countDown = minutes + ':' + seconds;
            _this.setData({
              countDown: countDown
            });
            minus--;
          }
        }, 1000)
      });
    }
  },
  toBuy() { //买菜
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.peoPleNum >= 2) {
      let sellPrice = this.data.agioPrice; //折后价
      wx.navigateTo({
        url: '../../order-for-goods/order-for-goods?shopId=' + this.data.shopId + '&skuName=' + sellPrice + '元抢购券&sell=' + sellPrice + '&skutype=8&dishSkuId=' + this.data.id + '&dishSkuName=' + this.data.skuName
      })
    } else {
      wx.showToast({
        title: '未满足条件',
        icon: 'none'
      })
    }
  },
  //查询邀请人数
  // getInviteNum() {
  //   let _parms = {
  //     skuId: this.data.id,
  //     parentId: app.globalData.userInfo.userId
  //   };
  //   Api.inviteNum(_parms).then((res) => {
  //     console.log(res);
  //     if (res.data.code == 0 && res.data.data) {
  //       let data = res.data.data;
  //       this.setData({

  //       });
  //     }
  //   })
  // },
  findByCode: function() { //通过code查询进入的用户信息，判断是否是新用户
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
            if (!data.mobile) { //是新用户，去注册页面
              wx.navigateTo({
                url: '../../../../pages/personal-center/securities-sdb/securities-sdb?parentId=' + this.data.initiator + '&skuId=' + this.data.id + '&shopId=' + this.data.shopId
              })
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  // 左下角返回首页
  returnHomeArrive: function() {
    wx.switchTab({
      url: '../../index',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  inviteOthers() {
    this.onShareAppMessage();
  },
  //分享给好友
  onShareAppMessage: function() {
    let initiator = this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId;
    let userInfo = app.globalData.userInfo;
    return {
      title: this.data.skuName,
      path: '/pages/index/flashSaleHome/secKillDetail/secKillDetail?initiator=' + initiator + '&shopId=' + this.data.shopId + '&id=' + this.data.id,
      success: function(res) {

      },
      fail: function(res) {
        // 分享失败

      }
    }
  }
})