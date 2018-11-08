import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp();
let gameFlag = true; //防止重复点击
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
    prizeList: [], //奖品列表
    turnIdx: 2, //转动序号
    // turnFlag: false,  //转动标识
    Countdown: 0, //倒计时默认2秒，如果后端返回过慢 时间延长
    frameClass1: 'z1', //默认正面在上面
    frameClass2: 'z2',
    circleList: [], //圆点数组
    colorCircleFirst: '#FFDF2F', //圆点颜色1
    colorCircleSecond: '#FE4D32', //圆点颜色2
  },
  onLoad: function (options) {
    this.circleShow();
    this.setData({
      inviter: options.inviter ? options.inviter : app.globalData.userInfo.userId
    });
    this.setData({
      regulation: [
        { title: "1、活动时间：2018-11-11至2018-12-31日。", use: "1、如中奖iPhone X ：请务必联系享7美食客服人员确认详细信息后配送，有效期3个月。" },
        { title: "2、奖品设置：iPhone X 、十堰旅游券、十堰酒店房卡、十堰美食券。", use: "2、如中奖十堰旅游券：请根据中奖旅游景区到指定景区出使券票二维码即可使用；有效期1年。" },
        { title: "3、通过享7美食小程序每邀请2个好友成为享7美食新用户，即可抽奖一次，百分百中奖！", use: "3、如中奖十堰酒店房卡：请根据中奖酒店到指定酒店前台出使券票二维码即可使用，有效期1年。" },
        { title: "4、邀请新用户抽奖成功后实时发放入您的券包，您可在享7美食小程序-我的-券包中查看。", use: "4、如中奖美食券：请根据中奖菜品对应的商家到指定商家用餐出使券票二维码即可使用，有效期3个月。" },
        { title: "5、您邀请的好友必须是享7美食新用户，同一手机号、同一设备、同一支付账号视为统一用户。" },
        { title: "6、抽奖存入券包里的券中奖商品不用有效期不同，在有效期内均可使用。" },
        { title: "7、如有其他疑问请咨询享7美食客服。" },]
    });
  },
  getwinningList () {
    let that = this
    wx.request({
      url: that.data._build_url + 'orderInfo/listFree?page=1&rows=20&payType=0&categoryId=6',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
          console.log(res)
          if(res.data.code=='0' && res.data.data ){
            let data = res.data.data
            if(!data.list){
              return
            }
              if(data.list.length){
                  const msgList = [];
                  
                data.list.forEach( (item ,index)=>{
                  let phone = '', obj = {};
                  phone = item.userName.substring(0, 3) + '****' + item.userName.substring(7, item.userName.length)
                  obj.title = '恭喜' + phone + '获得' + item.orderItemOuts[0].goodsSkuName;
                  obj.url = 'url'
                  obj.id = item.id
                  msgList.push(obj)
                })
                console.log(msgList)
                that.setData({
                  msgList: msgList
                })
              }
          }
      }
    })
  },
  circleShow() {
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
      circleList.push({
        topCircle: topCircle,
        leftCircle: leftCircle
      });
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
  },
  onShow: function () {
    let that = this;
    console.log('onShow:', app.globalData.userInfo)
    this.setData({
      isshowlocation: false
    })
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          //调接口
          that.createUser()
          that.getwinningList()
          if (!that.data.prizeList.length) {
            that.getData();
          }
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
  createUser() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'pullUser/insertUserPull?type=3',
      method: 'post',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        that.getUserNum();
      },
      fail() {
        that.getUserNum();
      }
    })

  },
  getUserNum() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'pullUser/getForNum?type=3',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0' && res.data.data) {
          that.setData({
            lotteryData: res.data.data
          })
        } else {
          wx.showToast({
            title: '服务器开了点小差，请重新进入',
            icon: 'none'
          })
        }
      },
      fail() {
        wx.showToast({
          title: '服务器开了点小差，请重新进入',
          icon: 'none'
        })
      }
    })
  },
  getData() {
    let that = this;
    wx.request({
      url: that.data._build_url + '/actGoodsSku/getSpuList?actId=42',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0' && res.data.data.length) {
          let data = res.data.data
          that.computed(data)
        } else {
          wx.showToast({
            title: '加载数据失败，请重新进入',
            icon: 'none'
          })
        }
      },
      fail() {
        wx.showToast({
          title: '服务器繁忙，请重新进入',
          icon: 'none'
        })
      }
    })
  },
  computed(data) {
    let that = this;
    let arr = [],
      arr2 = [],
      list = [];
    data.forEach((item, index) => {
      if (item.categoryId == '9') {
        arr2.push(item)
      } else {
        arr.push(item)
      }
    })
    list = arr;
    for (var i = 0; i < 8; i++) {
      if (list.length < 7) {
        if (arr[i]) {
          list.push(arr[i])
        } else {
          i = 0
        }
      }
    }
    if (arr2.length) {
      list.push(arr2[0])
    } else {
      list.push(arr[0])
    }
    list.splice(4, 0, '')
    let sortArr = [1, 2, 3, 8, '', 4, 7, 6, 5]
    that.setData({
      prizeList: list,
      sortArr: sortArr
    })
  },
  drawBtn() { //点击抽奖按钮
    let that = this;
    let userData = that.data.lotteryData
    if (!gameFlag) { //游戏正在运行中
      return false
    }
    if (!userData) {
      return false
    }
    if (userData.haveNum < 1) {
      wx.showToast({
        title: '邀请2个好友即可抽奖!',
        icon: 'none'
      })
      return false
    }
    that.setData({
      winningIndex: '',
      frameClass1: "z1 front",
      frameClass2: "z2 back",
    })
    gameFlag = false
    that.turn(100); //游戏运行
    that.sendGamerequest() //请求游戏开奖结果
  },
  sendGamerequest() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'actGoodsSku/lottery?actId=42&type=3',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0' && res.data.data && res.data.data.goodsSkuOut[0] && res.data.data.categoryId) {
          let currentData = that.data.prizeList;
          currentData.forEach((item, index) => {
            if (item.categoryId == res.data.data.categoryId) {
              let sortArr = [1, 2, 3, 8, '', 4, 7, 6, 5]
              that.setData({
                winning: res.data.data,
                winningIndex: sortArr[index]
              })
              return
            }
          })

        } else {
          that.setData({
            winningIndex: -1
          })
        }
      },
      fail() {
        that.setData({
          winningIndex: -1
        })
      }

    })
  },
  turn(interval) { //转盘动画
    let _this = this,
      turnIdx = this.data.turnIdx;

    let timer = setInterval(function () {
      let Countdown = _this.data.Countdown
      Countdown += interval;
      turnIdx = turnIdx < 8 ? turnIdx + 1 : 1;
      _this.setData({
        turnIdx: turnIdx,
        Countdown: Countdown
      });
      if (_this.data.winningIndex == -1) {
        wx.showToast({
          title: '系统开了小差',
          icon: 'none'
        })
        clearInterval(timer);
        gameFlag = true
        return false
      }
      if (Countdown >= 2000) {
        if (_this.data.winningIndex == turnIdx) {
          let lotteryData = _this.data.lotteryData
          lotteryData.haveNum = lotteryData.haveNum - 1 //减少一次抽奖次数
          lotteryData.pullNum = lotteryData.pullNum - 3

          _this.setData({
            Countdown: 0,
            lotteryData: lotteryData
          });
          clearInterval(timer);
          _this.getTick();
        }
      }

    }, interval);
  },
  onHide () {
    gameFlag = true
  },
  reverse() { //翻转动画
    if (this.data.frameClass1.indexOf('z1') != -1) {
      this.setData({

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
    _this.setData({
      frameClass1: "z2 back",
      frameClass2: "z1 front"
    })
    setTimeout(() => {
      wx.showModal({
        title: '恭喜',
        confirmText: '立即查看',
        content: _this.data.winning.goodsSkuOut[0].skuName,
        success(res) {
          if (res.confirm) {
            gameFlag = true
            wx.navigateTo({
              url: '/pages/personal-center/my-discount/my-discount',
            })
          } else if (res.cancel) {
            gameFlag = true
          }

        }
      })
    }, 1500)
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
                url: '/pages/personal-center/securities-sdb/securities-sdb?inviter=' + this.data.inviter + '&back=1&currentType=3'
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
            that.createUser()
            that.getwinningList()
            if (!that.data.prizeList.length) {
              that.getData();
            }
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
      url: '/pages/personal-center/securities-sdb/securities-sdb?inviter=' + this.data.inviter + '&back=1&currentType=3'
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
        let latitude = res.latitude,
          longitude = res.longitude;
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
  openSetting() { //打开授权设置界面
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