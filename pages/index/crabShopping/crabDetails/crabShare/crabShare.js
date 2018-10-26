import Api from '../../../../../utils/config/api.js';
var utils = require('../../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var app = getApp();

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
    initiator: '', //发起人Id
    showModal: false,
    instruct: false,
    showCanvas: false,
    groupId: '',
    move: '',
    dishData: {}, //当前菜
    doneBargain: '', //已砍金额
    countDown: '', //倒计时
    getGoldNum: 0, //砍价人获得的金币数
    progress: 0, //进度条
    status: 1, //砍价状态 1.60分钟内  3.过了60分钟或者已买 4.满3人
    otherStatus: 1, //1.可以帮发起人砍价  2.已经砍过  3.人数已满  4.过了60分钟砍价结束
    isMine: false, //不是本人
    issnap: false,
    isnew: false,
    timer: null,
    canvasSrc: '',
    audioSrc: '',
    _city: '',
    _lat: '',
    _lng: ''
  },
  onLoad: function(options) {
    this.setData({
      refId: options.refId, //菜品Id
      shopId: options.shopId, //商家Id
      skuMoneyOut: options.skuMoneyOut, //原价
      skuMoneyMin: options.skuMoneyMin, //低价
      userId: app.globalData.userInfo.userId, //登录者Id
      initiator: options.initiator ? options.initiator : '', //发起人Id
      groupId: options.groupId ? options.groupId : '', //团砍Id
      _city: options.city ? options.city : '',
      _lat: options.lat ? options.lat : '',
      _lng: options.lng ? options.lng : '',
    });
  },
  onShow() {
    let that = this;
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          this.dishDetail(); //查询菜详情
          if (this.data.groupId) {
           
            this.bargain();
          } else {
            this.createBargain();
          }
        } else {
          this.authlogin();
        }
      } else {
        if (app.globalData.token) {
          if (this.data.groupId) {
            this.dishDetail();
            this.bargain();
          } else {
            this.createBargain();
          }
        } else {
          this.authlogin();
        }
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
            app.globalData.userInfo.lat = data.locationX;
            app.globalData.userInfo.lng = data.locationY;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }
            that.authlogin();
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
          that.dishDetail(); //查询菜详情
          if (that.data.groupId) {
            that.bargain();
          } else {
            that.createBargain();
          }
        }
      }
    })
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
      // this.getlocation();
    } else {
      app.globalData.userInfo.lat = lat;
      app.globalData.userInfo.lng = lng;
      if (app.globalData.userInfo.city || this.data._city) {

        that.bargain();
      } else {
        wx.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: (res) => {
            if (res.data.status == 0) {
              if (!that.data.groupId) {
                that.createBargain()
              };
              let _city = res.data.result.address_component.city;
              if (_city == "十堰市") {
                app.globalData.userInfo.city = _city;
              } else {
                app.globalData.userInfo.city = "十堰市";
              }
              that.bargain();
            }
          }
        })
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
        url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
    }
  },
  //创建一笔砍价
  createBargain() {
    let _parms = {},_value="",that = this;
    _parms = {
      refId: this.data.refId,
      userId: app.globalData.userInfo.userId,
      shopId: this.data.shopId,
      amount: (+this.data.skuMoneyOut - this.data.skuMoneyMin).toFixed(2),
      skuMoneyOut: this.data.skuMoneyOut,
      skuMoneyMin: this.data.skuMoneyMin
    };
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    wx.request({
      url: that.data._build_url + 'gold/createQg?' + _value,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '发起成功',
            icon: 'none'
          })
          that.setData({
            isMine: true,
            status: 1,
            otherStatus: 1,
            groupId: res.data.data.groupId //生成团砍Id
          });
          that.bargain();
        }
      }
    })
  },
  //获取砍价券详情
  bargain() {
    let _this = this, _parms = {};
    _parms = {
      skuId: this.data.refId, //菜品Id
      parentId: this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId, //发起人的userId
      shopId: this.data.shopId,
      groupId: this.data.groupId,
      token: app.globalData.token
    };
    Api.bargainDetail(_parms).then((res) => {
      let code = res.data.code,
        data = res.data.data,
        reg = /^1[34578][0-9]{9}$/;
      if (code == 0) {
        if (data) {
          let endTime = data[0].endTime.replace(/\-/g, "/"),
            max = (+this.data.skuMoneyOut - this.data.skuMoneyMin).toFixed(2),
            doneBargain = (+this.data.skuMoneyOut - data[0].skuMoneyNow).toFixed(2),
            progress = 0;
          progress = doneBargain / max * 100;
          let _move = doneBargain / max * 1;
          _move *= 500;
          _move = _move.toFixed(0);
          if (_move == 500) {
            _move = +_move + 14;
          }
          this.setData({
            move: _move - 14
          })
          if (this.data.initiator && (this.data.initiator != app.globalData.userInfo.userId)) {
            this.setData({
              isMine: false
            });
            this.isBargain();
          }
          if (this.data.initiator == app.globalData.userInfo.userId) {
            this.setData({
              isMine: true
            });
          }
          this.setData({
            skuMoneyNow: data[0].skuMoneyNow,
            doneBargain: doneBargain,
            progress: progress <= 100 ? progress : 100,
            endTime: endTime,
            peoplenum: data[0].peoplenum * 1 - 1
          });
          let peopleList = data.slice(1);
          for (let i = 0; i < peopleList.length; i++) {
            if (peopleList[i].userName && reg.test(peopleList[i].userName)) {
              peopleList[i].userName = peopleList[i].userName.substr(0, 3) + "****" + peopleList[i].userName.substr(7)
            }
            if (peopleList[i].userId == app.globalData.userInfo.userId) {
              this.setData({
                getGoldNum: peopleList[i].goldAmount
              });
            }
          }
          this.setData({
            peopleList: peopleList
          });

          let miliEndTime = new Date(endTime).getTime(),
            miliNow = new Date().getTime();
          let minus = Math.floor((miliEndTime - miliNow) / 1000);
          if (minus > 0 && minus <= 3600) { //小于60分钟
            //好友进入砍菜页面人数满3人并且超过半小时不能砍价
            if (this.data.peoplenum >= 3) {
              this.setData({
                status: 4,
                otherStatus: 3
              });
            } else {
              this.setData({
                status: 1,
                otherStatus: 1
              });
              let hours = '',
                minutes = '',
                seconds = '',
                countDown = '';
              this.setData({
                timer: setInterval(function() {
                  if (minus == 0) {
                    clearInterval(_this.data.timer);
                    minus = 0;
                    _this.setData({
                      otherStatus: 4,
                      status: 3
                    });
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
          } else {
            this.setData({
              status: 3,
              otherStatus: 4
            });
          }
        } else {
          this.setData({
            status: 3,
            otherStatus: 4
          });
        }
      } else {
        this.setData({
          status: 3,
          otherStatus: 4
        });
      }
    });
  },
  //查询砍价菜详情
  dishDetail() {
    let that = this, _parms={};
    _parms = {
      Id: this.data.refId,
      zanUserId: this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId,
      shopId: this.data.shopId,
      token: app.globalData.token
    };
    Api.crabDishDetail(_parms).then((res) => {
      if(res.data.code == 0){
        if(res.data.data){
          let data = res.data.data;
          this.setData({
            dishData: data,
            picUrl: data.picUrl,
            skuName: data.skuName,
            shopName: data.shopName,
            sellNum: data.sellNum
          });
        }
      }else {
        this.setData({
          status: 3,
          otherStatus: 4
        });
      }
    })
  },
  chilkDish(e) {
    let id = e.currentTarget.id,
      _shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: '../crabDetails?greensID=' + id + '&shopId=' + _shopId + '&isShop=true'
    })
  },
  //查询能否砍价
  isBargain() {
    let _parms = {
      refId: this.data.refId,
      parentId: this.data.initiator,
      userId: app.globalData.userInfo.userId,
      groupId: this.data.groupId,
      token: app.globalData.token
    };
    Api.isBargainCrab(_parms).then((res) => {
      let code = res.data.code,
        otherStatus = 1;
      if (code == 0) {
        otherStatus = 1;
      } else if (code == 200065) {
        otherStatus = 2;
      } else if (code == 200066) {
        otherStatus = 3;
      } else if (code == 200068) {
        otherStatus = 4;
        this.setData({
          status: 3
        });
      }
      this.setData({
        otherStatus: otherStatus
      });
    });
  },
  //帮好友砍价
  helpfriend() {
    let _this = this, _parms = {};
    if (!app.globalData.userInfo.mobile) {
      wx.navigateTo({
        url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
    }else{
      _parms = {
        refId: this.data.refId,
        parentId: this.data.initiator,
        userId: app.globalData.userInfo.userId,
        groupId: this.data.groupId,
        token: app.globalData.token
      };
      Api.isBargainCrab(_parms).then((res) => {
        if (res.data.code == 0) {
          _this.setData({
            otherStatus: 1
          });
          _this.tobargainCrab();
          return
          Api.bargainCrab(_parms).then((e) => {
            if (e.data.code == 0) {
              _this.setData({
                showModal: true,
                showCanvas: true,
                canvasSrc: '/images/icon/kan.gif',
                audioSrc: 'https://xqmp4-1256079679.file.myqcloud.com/test_kan.mp3'
              });
              setTimeout(function () {
                const innerAudioContext = wx.createInnerAudioContext();
                innerAudioContext.autoplay = true
                innerAudioContext.src = _this.data.audioSrc;
                innerAudioContext.onPlay(() => { })
              }, 700);
              setTimeout(function () {
                _this.setData({
                  showModal: false,
                  showCanvas: false,
                  canvasSrc: '',
                  audioSrc: ''
                });
              }, 2000);
              _this.setData({
                otherStatus: 2
              });
              _this.bargain();
            }
          });
        } else if (code == 200065) {
          this.setData({
            otherStatus: 2
          });
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else if (code == 200066) {
          this.setData({
            otherStatus: 3
          });
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else if (code == 200068) {
          this.setData({
            otherStatus: 4,
            status: 3
          });
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      });
    }
  },
  tobargainCrab:function(){//帮好友砍螃蟹
    let _parms = {}, _this = this, _value = "";
    _parms = {
      refId: this.data.refId,
      parentId: this.data.initiator,
      userId: app.globalData.userInfo.userId,
      groupId: this.data.groupId,
      shopId : _this.data.shopId
    };
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    wx.request({
      url: this.data._build_url + 'gold/helpfriendQg?' + _value,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          _this.setData({
            showModal: true,
            showCanvas: true,
            canvasSrc: '/images/icon/kan.gif',
            audioSrc: 'https://xqmp4-1256079679.file.myqcloud.com/test_kan.mp3'
          });
          setTimeout(function () {
            const innerAudioContext = wx.createInnerAudioContext();
            innerAudioContext.autoplay = true
            innerAudioContext.src = _this.data.audioSrc;
            innerAudioContext.onPlay(() => { })
          }, 700);
          setTimeout(function () {
            _this.setData({
              showModal: false,
              showCanvas: false,
              canvasSrc: '',
              audioSrc: ''
            });
          }, 2000);
          _this.setData({
            otherStatus: 2
          });
          _this.bargain();
        }
      }
    })
  },
  toBuy() { //买菜
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      let _parms = {
        skuId: this.data.refId, //菜品Id
        parentId: this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId, //发起人的userId
        shopId: this.data.shopId,
        groupId: this.data.groupId,
        token: app.globalData.token
      },
        _this = this;
      Api.bargainDetail(_parms).then((res) => {
        if (res.data.code == 0) {
          this.setData({
            skuMoneyNow: res.data.data[0].skuMoneyNow
          });
        }
        let sellPrice = this.data.skuMoneyNow;
        wx.navigateTo({
          url: '../../../order-for-goods/order-for-goods?shopId=' + this.data.shopId + '&groupId=' + this.data.groupId + '&skuName=' + sellPrice + '元兑换券&sell=' + sellPrice + '&skutype=10&dishSkuId=' + this.data.refId + '&dishSkuName=' + this.data.skuName + '&bargainType=2'
        })
      });
    }
  },
  onPullDownRefresh: function() {
    this.bargain();
  },
  // 左上角返回首页
  returnHomepage: function() {
    wx.switchTab({
      url: '../../../index'
    })
  },
  // 使用规则
  instructions: function() {
    this.setData({
      showModal: true,
      instruct: true
    })
  },
  // 关闭弹窗
  understand: function() {
    this.setData({
      showModal: false,
      instruct: false,
      showCanvas: false
    })
  },
  transpond() {
    this.onShareAppMessage();
  },
  onShareAppMessage() { //分享给好友帮忙砍价
    let initiator = this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId;
    let userInfo = app.globalData.userInfo;
    return {
      title: '帮好友砍价',
      desc: '享7美食',
      path: '/pages/index/crabShopping/crabDetails/crabShare/crabShare?refId=' + this.data.refId + '&shopId=' + this.data.shopId + '&skuMoneyOut=' + this.data.skuMoneyOut + '&skuMoneyMin=' + this.data.skuMoneyMin + '&initiator=' + initiator + '&groupId=' + this.data.groupId + '&lat=' + userInfo.lat + '&lng=' + userInfo.lng + '&city=' + userInfo.city,
      success: function(res) {

      },
      fail: function(res) {
        // 分享失败

      }
    }
  }
})