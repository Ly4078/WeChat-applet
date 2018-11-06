import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp();


var village_LBS = function (that) {
  wx.getLocation({
    success: function (res) {
      console.log('vill_res:', res)
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
    isMpa: false,
    isshowlocation: false,
    userId: '',
    _city: '',
    _lat: '',
    _lng: '',
    times: 5,   //次数
    turnIdx: 2,   //转动序号
    // turnFlag: false,  //转动标识
    Countdown: 0,   //倒计时（随机，但要考虑后台返回值的时间）
    frameClass1: 'z1', //默认正面在上面
    frameClass2: 'z2',
    circleList: [],//圆点数组
    colorCircleFirst: '#FFDF2F',//圆点颜色1
    colorCircleSecond: '#FE4D32',//圆点颜色2
  },
  onLoad: function (options) {
    var _this = this;
    //圆点设置
    var leftCircle = 7.5;
    var topCircle = 7.5;
    var circleList = [];
    for (var i = 0; i < 24; i++) {
      if (i == 0) {
        topCircle = 15;
        leftCircle = 15;
      } else if (i < 6) {
        topCircle = 7.5;
        leftCircle = leftCircle + 102.5;
      } else if (i == 6) {
        topCircle = 15
        leftCircle = 640;
      } else if (i < 12) {
        topCircle = topCircle + 94;
        leftCircle = 640;
      } else if (i == 12) {
        topCircle = 565;
        leftCircle = 640;
      } else if (i < 18) {
        topCircle = 636;
        leftCircle = leftCircle - 102.5;
      } else if (i == 18) {
        topCircle = 585;
        leftCircle = 15;
      } else if (i < 24) {
        topCircle = topCircle - 94;
        leftCircle = 7.5;
      } else {
        return
      }
      circleList.push({ topCircle: topCircle, leftCircle: leftCircle });
    }
    this.setData({
      circleList: circleList
    })
    //圆点闪烁
    setInterval(function () {
      if (_this.data.colorCircleFirst == '#FFDF2F') {
        _this.setData({
          colorCircleFirst: '#4ab2f3',
          colorCircleSecond: '#ffcb3a',
        })
      } else {
        _this.setData({
          colorCircleFirst: '#FFDF2F',
          colorCircleSecond: '#7a4af3',
        })
      }
    }, 500)

    this.setData({
      inviter: options.inviter ? options.inviter : app.globalData.userInfo.userId
    });
    this.setData({
      msgList: [
        { url: "url", title: "公告：恭喜186****5816获得九寨沟门票" },
        { url: "url", title: "公告：恭喜186****5816获得九寨沟门票" },
        { url: "url", title: "公告：恭喜186****5816获得九寨沟门票" }]
    });
    this.setData({
      regulation: [
        { title: "1、活动时间：2018-11-11至2018-12-31日。", use: "1、如中奖iPhone X ：请务必联系享7美食客服人员确认详细信息后配送，有效期3个月。"},
        { title: "2、奖品设置：iPhone X 、十堰旅游券、十堰酒店房卡、十堰美食券。", use: "2、如中奖十堰旅游券：请根据中奖旅游景区到指定景区出使券票二维码即可使用；有效期1年。" },
        { title: "3、通过享7美食小程序每邀请2个好友成为享7美食新用户，即可抽奖一次，百分百中奖！", use: "3、如中奖十堰酒店房卡：请根据中奖酒店到指定酒店前台出使券票二维码即可使用，有效期1年。" },
        { title: "4、邀请新用户抽奖成功后实时发放入您的券包，您可在享7美食小程序-我的-券包中查看。", use: "4、如中奖美食券：请根据中奖菜品对应的商家到指定商家用餐出使券票二维码即可使用，有效期3个月。"},
        { title: "5、您邀请的好友必须是享7美食新用户，同一手机号、同一设备、同一支付账号视为统一用户。" },
        { title: "6、抽奖存入券包里的券中奖商品不用有效期不同，在有效期内均可使用。" },
        { title: "7、如有其他疑问请咨询享7美食客服。" },]
    });
  },
  onShow: function () {
    this.setData({
      isshowlocation: false
    })
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          //调接口

        } else {
          this.authlogin();
        }
      } else { //是新用户，去注册页面
        this.authlogin();
        // wx.navigateTo({
        //   url: '/pages/personal-center/securities-sdb/securities-sdb?back=1&inviter=' + this.data.inviter
        // })
      }
    } else {
      this.findByCode();
    }
  },
  drawBtn() {   //点击抽奖按钮
    if (this.data.Countdown == 0) {
      this.setData({
        Countdown: 2000
      });
      this.turn(100);
    } else {
      wx.showToast({
        title: '请勿重复点击',
        icon: 'none'
      })
    }
  },
  turn(interval) {    //转盘动画
    let _this = this, turnIdx = this.data.turnIdx, Countdown = this.data.Countdown;
    let timer = setInterval(function () {
      Countdown = Countdown - interval;
      turnIdx = turnIdx < 8 ? turnIdx + 1 : 1;
      _this.setData({
        turnIdx: turnIdx
      });
      if (Countdown <= 0) {
        _this.setData({
          Countdown: 0
        });
        clearInterval(timer);
        _this.getTick();
      }
    }, interval);
  },
  reverse() {    //翻转动画
    if (this.data.frameClass1.indexOf('z1') != -1) {
      this.setData({
        frameClass1: "z2 back",
        frameClass2: "z1 front",
      })
    } else {
      this.setData({
        frameClass1: "z1 front",
        frameClass2: "z2 back",
      })
    }
  },
  getTick() {
    let _this = this;
    this.reverse();
    wx.showModal({
      title: '恭喜',
      content: '获得门票一张',
      success(res) {
        _this.reverse();
      }
    })
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
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              that.authlogin(); //获取token
            } else {
              wx.navigateTo({
                url: '/pages/personal-center/securities-sdb/securities-sdb?inviter=' + this.data.inviter + '&back=1'
              })
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    console.log('authlogin')
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
          if (app.globalData.userInfo.mobile) {
            //调接口

          } else {
            console.log('closetel')
            that.closetel();
          }
        }
      }
    })
  },
  share() { //分享
    console.log('share:', app.globalData.userInfo.mobile)
    if (!app.globalData.userInfo.mobile) {
      console.log('share111')
      this.closetel();
    } else {
      //调接口

      return
      if (this.data.isInvite) {
        console.log('share2222')
        this.onShareAppMessage();
      } else {
        console.log('share3333')
      }
    }
  },
  //分享给好友
  onShareAppMessage: function () {
    console.log("onShareAppMessageuserId:", app.globalData.userInfo.userId)
    return {
      title: '邀请好友，换大闸蟹',
      path: '/pages/activityDetails/holdingActivity/holdingActivity?inviter=' + app.globalData.userInfo.userId,
      success: function (res) {
        console.log('successres:', res)
      }
    }
  },
  closetel: function (e) { //跳转至新用户注册页面
    wx.navigateTo({
      url: '/pages/personal-center/securities-sdb/securities-sdb?inviter=' + this.data.inviter + '&back=1'
    })

    return;
    app.globalData.currentScene.path = '/pages/activityDetails/holdingActivity/holdingActivity';
    app.globalData.currentScene.query = {};
    app.globalData.currentScene.query.inviter = this.data.inviter;
    wx.reLaunch({
      url: '/pages/init/init',
    })

  },
  toIndex() { //跳转至首页
    wx.switchTab({
      url: '../../index/index'
    })
  },
  //打开地图导航
  TencentMap: function (event) {
    this.setData({
      shopId: event.currentTarget.id
    });
    let that = this;
    if (event && event.type == 'tap') {
      this.setData({
        isMpa: true
      })
    } else {
      this.setData({
        isMpa: false
      })
    }
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude, longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户位置信息
              that.setData({
                isshowlocation: true
              })

            } else {
              that.openmap();
            }
          }
        })
      }
    })
  },
  openSetting() {//打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })

    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权          
          // that.getUserlocation();
          // village_LBS(that);
          console.log('userLocation')
          wx.getLocation({
            success: function (res) {
              let latitude = res.latitude,
                longitude = res.longitude;
              that.requestCityName(latitude, longitude);
            },
          })
        } else {
          // let lat = '32.6226',
          //   lng = '110.77877';
          // that.requestCityName(lat, lng);
        }
      }
    })

  },
  //获取城市
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    if (!lat && !lng) {
      this.TencentMap();
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
            app.globalData.picker = res.data.result.address_component;
            let userInfo = app.globalData.userInfo;
            wx.setStorageSync('userInfo', userInfo);
            if (this.data.isMpa) {
              this.openmap();
            }
          }
        }
      })
    }

  },
  //打开地图
  openmap: function () {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        let postList = that.data.postList;
        for (let i = 0; i < postList.length; i++) {
          if (postList[i].id == that.data.shopId) {
            console.log(postList[i].locationX)
            wx.openLocation({
              longitude: postList[i].locationX * 1,
              latitude: postList[i].locationY * 1,
              scale: 18,
              name: postList[i].name,
              address: postList[i].name + postList[i].place,
              success: function (res) { }
            })
          }
        }
      }
    })
  }
})