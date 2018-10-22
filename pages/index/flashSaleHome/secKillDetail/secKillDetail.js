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
    countDown: '',
    isEnd: true, //是否结束
    isCreated: true, //是否创建菜品
    btnTxt: '发起邀请', //按钮文字
    peoPleNum: 0 //邀请人数
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
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          _this.shopDetail();
          _this.getDish(); //查询菜详情
          _this.isCreateFunc();
        } else {
          _this.authlogin();
        }
      } else {//是新用户，
        wx.navigateTo({
          url: '../../../../pages/personal-center/securities-sdb/securities-sdb?parentId=' + this.data.initiator + '&skuId=' + this.data.id + '&shopId=' + this.data.shopId
        })
      }
    } else {
      _this.findByCode();
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
  onPullDownRefresh: function () { //下拉刷新
    this.isCreateFunc();
  },
  findByCode: function () { //通过code查询进入的用户信息，判断是否是新用户
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
            }else{
              that.authlogin();
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function (val) { //获取token
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
          that.shopDetail();
          that.getDish(); //查询菜详情
          that.isCreateFunc();
        }
      }
    })
  },
  //查询菜
  getDish() {
    let _parms = {
      Id: this.data.id,
      zanUserId: app.globalData.userInfo.userId,
      shopId: this.data.shopId,
      token: app.globalData.token
    };
    Api.secKillDetail(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        let data = res.data.data, skuInfo = data.skuInfo;
        skuInfo = skuInfo ? '1个小时内完成邀请并成功购买，逾期失效Œ' + skuInfo : '1个小时内完成邀请并成功购买，逾期失效'
        this.setData({
          picUrl: data.picUrl,
          skuName: data.skuName,
          stockNum: data.stockNum,
          agioPrice: data.agioPrice,
          sellPrice: data.sellPrice,
          sellNum: data.sellNum,
          skuInfo: skuInfo.split('Œ')
        });
      }
    })
  },
  isCreateFunc() { //判断之前是否创建过，并查看邀请了多少人注册
    console.log('isCreateFunc')
    let _parms = {
      skuId: this.data.id,
      parentId: app.globalData.userInfo.userId,
      token: app.globalData.token
    };
    Api.inviteNum(_parms).then((res) => {
      console.log('res:',res)
      wx.stopPullDownRefresh();
      if (res.data.code == 0) {
        let isCreated = false;
        if (res.data.data.length > 0 && res.data.data[0]) {
          isCreated = true;
          let data = res.data.data,
            newList = data[0].newUser ? data[0].newUser : [];
          if (newList.length > 2) {
            newList = newList.slice(0, 2);
          }
          this.getUserIcon(newList);
          this.setData({
            peoPleNum: data[0].peoPleNum ? data[0].peoPleNum : 0,
            btnTxt: '邀请好友'
          });
          this.countDownFunc(data[0].endTime);
        }
        this.setData({
          isCreated: isCreated
        });
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
      shopId: this.data.shopId,
      token: app.globalData.token
    };
    Api.createSecKill(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        wx.showToast({
          title: '发起成功，快去邀请好友参与秒杀吧',
          icon: 'none',
          duration: 3000
        })
        this.setData({
          isCreated: true,
          btnTxt: '邀请好友'
        });
        this.countDownFunc(res.data.data.endTime);
        // this.onShareAppMessage();
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
          if (minus == 0) {
            _this.setData({
              countDown: '',
              isEnd: true
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
              countDown: countDown,
              isEnd: false
            });
            minus--;
          }
        }, 1000)
      });
    }
  },
  getUserIcon(obj) { //获取用户头像
    let userArr = obj,
      _this = this;
    for (let i = 0; i < userArr.length; i++) {
      wx.request({ //从自己的服务器获取用户信息
        url: _this.data._build_url + 'user/get/' + userArr[i].id,
        header: {
          "Authorization": app.globalData.token
        },
        success: function(res) {
          if (res.data.code == 0) {
            userArr[i].iconUrl = res.data.data.iconUrl;
            _this.setData({
              newList: userArr
            });
          }
        }
      })
    }
  },
  toBuy() { //买菜
    if (this.data.stockNum <= 0) {
      wx.showToast({
        title: '该菜品已售罄',
        icon: 'none'
      })
      return false;
    }
    let _this = this;
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
    } else if (!this.data.isCreated) {
      wx.showModal({
        title: '是否发起邀请',
        complete(res) {
          if (res.confirm) {
            _this.createSecKill();
          }
        }
      })
    } else if (this.data.isCreated && this.data.peoPleNum < 2) {
      wx.showToast({
        title: '邀请2个新用户注册1分钱享美食,快去邀请吧',
        icon: 'none',
        duration: 3000
      });
    }
  },
  //跳转至商家主页
  toShopDetail() {
    wx.navigateTo({
      url: '../../merchant-particulars/merchant-particulars?shopid=' + this.data.shopId
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
    if (this.data.stockNum <= 0) {
      wx.showToast({
        title: '该菜品已售罄',
        icon: 'none'
      })
      return false;
    }
    if (this.data.isCreated) {
      this.onShareAppMessage();
    } else {
      //创建一个秒杀菜
      this.createSecKill();
    }
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

      }
    }
  }
})