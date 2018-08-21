import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import { GLOBAL_API_DOMAIN} from '../../../../utils/config/config.js';
var app = getApp();
var timer = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    initiator: '', //发起人Id
    showModal: false,
    isGif:false,
    groupId: '',
    move:'',
    dishData:{},  //当前菜
    doneBargain: '', //已砍金额
    countDown: '', //倒计时
    getGoldNum: 0, //砍价人获得的金币数
    progress: 0, //进度条
    status: 1, //砍价状态 1.60分钟内  3.过了60分钟或者已买 4.满5人
    otherStatus: 1, //1.可以帮发起人砍价  2.已经砍过  3.人数已满  4.过了60分钟砍价结束
    isMine: false, //不是本人
    page: 1,
    flag: true,
    hotDishList: [],
    issnap: false,
    isnew: false
  },
  onLoad: function(options) {
    this.setData({
      refId: options.refId, //菜品Id
      shopId: options.shopId, //商家Id
      skuMoneyOut: options.skuMoneyOut, //原价
      skuMoneyMin: options.skuMoneyMin, //低价
      userId: app.globalData.userInfo.userId, //登录者Id
      initiator: options.initiator ? options.initiator : '', //发起人Id
      groupId: options.groupId ? options.groupId : '' //团砍Id
    });
  },
  onShow() {
    this.setData({
      flag: true,
      hotDishList: [],
      page: 1
    });
    if (app.globalData.userInfo.userId){
      console.log("show_userid:", app.globalData.userInfo.userId);
      if (!app.globalData.userInfo.mobile) { //是新用户，去注册页面
        wx.navigateTo({
          url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
        })
      }
      this.dishDetail(); //查询菜详情
      if (this.data.groupId){
        this.bargain();
      }else{
        this.createBargain();
      }
      if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
        console.log("show_lat:", app.globalData.userInfo.lat, app.globalData.userInfo.lng, app.globalData.userInfo.city)
        this.hotDishList();
      }else{
        this.getlocation();
      }
    }else{
      this.findByCode();
    }
  },
  onHide() {
    clearInterval(timer);
  },
  findByCode: function () { //通过code查询进入的用户信息，判断是否是新用户
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
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
                url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
              })
            }
            let userInfo = app.globalData.userInfo;
            console.log('findByCode_userInfo:', userInfo);
            if (userInfo.userId && userInfo.lat && userInfo.lng && userInfo.city) {
              if (!that.data.groupId) {
                that.createBargain()
              };
              that.dishDetail();
              that.hotDishList();
              that.bargain();
            } else {
              that.getlocation();
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  getlocation: function () {  //获取用户位置
    let that = this, lat = '', lng = '';
    console.log('getlocation:');
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log('res_location:',res);
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        console.log('111:', latitude, longitude);
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({  //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) {
                          wx.getLocation({
                            type: 'wgs84',
                            success: function (res) {
                              let latitude = res.latitude,
                                longitude = res.longitude
                              app.globalData.userInfo.lat = latitude;
                              app.globalData.userInfo.lng = longitude;
                              console.log('222:', latitude, longitude);
                              that.requestCityName(latitude, longitude);
                            }
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },
  requestCityName(lat, lng) {//获取当前城市
    app.globalData.userInfo.lat = lat;
    app.globalData.userInfo.lng = lng;
    console.log('requestCityName:',lat,lng);
    let that = this;
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
          app.globalData.userInfo.city = _city;
          console.log('_city:', _city);
          that.dishDetail();
          that.hotDishList();
          that.bargain();
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
  },
  //创建一笔砍价
  createBargain() {
    let _parms = {
      refId: this.data.refId,
      userId: app.globalData.userInfo.userId,
      shopId: this.data.shopId,
      amount: (+this.data.skuMoneyOut - this.data.skuMoneyMin).toFixed(2),
      skuMoneyOut: this.data.skuMoneyOut,
      skuMoneyMin: this.data.skuMoneyMin
    };
    Api.createBargain(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '发起成功',
          icon: 'none'
        })
        this.setData({
          isMine: true,
          status: 1,
          otherStatus: 1,
          groupId: res.data.data.groupId //生成团砍Id
        });
        this.bargain();
      }
    });
  },
  //获取砍价券详情
  bargain() {
    let _parms = {
        skuId: this.data.refId, //菜品Id
        parentId: this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId, //发起人的userId
        shopId: this.data.shopId,
        groupId: this.data.groupId
      },
      _this = this;
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
          let _move = doneBargain / max*1;
          _move *=500;
          _move  = _move.toFixed(0);
          this.setData({
            move:_move
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
            //好友进入砍菜页面人数满5人并且超过半小时不能砍价
            if (this.data.peoplenum >= 5) {
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
              timer = setInterval(function() {
                if (minus == 0) {
                  clearInterval(timer);
                  minus = 0;
                  _this.setData({
                    otherStatus: 4,
                    status: 3
                  });
                }else{
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
              }, 1000);
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
    let _parms = {
      Id: this.data.refId,
      zanUserId: this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId,
      shopId: this.data.shopId
    };
    Api.discountDetail(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        let data = res.data.data;
        this.setData({
          dishData:data,
          picUrl: data.picUrl,
          skuName: data.skuName,
          shopName: data.shopName,
          sellNum: data.sellNum
        });
      } else {
        this.setData({
          status: 3,
          otherStatus: 4
        });
      }
    })
  },
  chilkDish(e){
    let id = e.currentTarget.id, _shopId = e.currentTarget.dataset.shipid;
    wx.navigateTo({
      url: '../CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + _shopId
    })
  },
  candyDetails(e){
    let id = e.currentTarget.id, _shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + _shopId
    })
  },
  //查询能否砍价
  isBargain() {
    let _parms = {
      refId: this.data.refId,
      parentId: this.data.initiator,
      userId: app.globalData.userInfo.userId,
      groupId: this.data.groupId
    };
    Api.isHelpfriend(_parms).then((res) => {
      let code = res.data.code, otherStatus = 1;
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
    let that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
   
     // 声音播放
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.autoplay = true
      innerAudioContext.src = 'https://xqmp4-1256079679.file.myqcloud.com/test_kan.mp3'
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
  

   

    let _parms = {
        refId: this.data.refId,
        parentId: this.data.initiator,
        userId: app.globalData.userInfo.userId,
        groupId: this.data.groupId
      },
      _this = this;
    Api.isHelpfriend(_parms).then((res) => {
      let code = res.data.code;
      if (code == 0) {
        _this.setData({
          otherStatus: 1
        });
        _parms.shopId = _this.data.shopId;
        Api.helpfriend(_parms).then((e) => {
          if (e.data.code == 0) {
            wx.showToast({
              title: '砍价成功',
              icon: 'none'
            })
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
  },
  toBuy() { //买菜
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _parms = {
      skuId: this.data.refId, //菜品Id
      parentId: this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId, //发起人的userId
      shopId: this.data.shopId,
      groupId: this.data.groupId
    },
      _this = this;
    Api.bargainDetail(_parms).then((res) => {
      if(res.data.code == 0) {
        this.setData({
          skuMoneyNow: res.data.data[0].skuMoneyNow
        });
      }
      let sellPrice = this.data.skuMoneyNow;
      wx.navigateTo({
        url: '../../order-for-goods/order-for-goods?shopId=' + this.data.shopId + '&groupId=' + this.data.groupId + '&skuName=' + sellPrice + '元砍价券&sell=' + sellPrice + '&skutype=4&dishSkuId=' + this.data.refId + '&dishSkuName=' + this.data.skuName + '&bargainType=2'
      })
    });
  },
  //热门推荐
  hotDishList() {
    //browSort 0附近 1销量 2价格
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 1,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      isDeleted:0,
      page: this.data.page,
      rows: 6
    };
    console.log('hotDishList_parms:', _parms);
    Api.partakerList(_parms).then((res) => {
      console.log('hotDishList_res:',res);
      if (res.data.code == 0 && res.data.data.list && res.data.data.list != 'null') {
        let list = res.data.data.list,
          hotDishList = this.data.hotDishList;
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
  onReachBottom: function() { //用户上拉触底加载更多
    if (!this.data.flag) {
      return false;
    }
    this.setData({
      page: this.data.page + 1
    });
    this.hotDishList();
  },
  onPullDownRefresh: function() {
    this.setData({
      flag: true,
      hotDishList: [],
      page: 1
    });
    this.bargain();
    this.hotDishList();
  },
  // 左上角返回首页
  returnHomepage: function() {
    wx.switchTab({
      url: '../../index'
    })
  },
  // 使用规则
  instructions: function() {
    this.setData({
      showModal: true
    })
  },
  // 关闭弹窗
  understand: function() {
    this.setData({
      showModal: false
    })
  },
  transpond() {
    this.onShareAppMessage();
  },
  onShareAppMessage() { //分享给好友帮忙砍价
    let initiator = this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId;
    return {
      title: '帮好友砍价',
      desc: '享7美食',
      path: '/pages/index/bargainirg-store/AprogressBar/AprogressBar?refId=' + this.data.refId + '&shopId=' + this.data.shopId + '&skuMoneyOut=' + this.data.skuMoneyOut + '&skuMoneyMin=' + this.data.skuMoneyMin + '&initiator=' + initiator + '&groupId=' + this.data.groupId
    }
  }
})