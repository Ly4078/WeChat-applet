import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import getToken from '../../../utils/getToken.js';
import getCurrentLocation from '../../../utils/getCurrentLocation.js';
var app = getApp();
var timer = null;
let gameFlag = true; //防止重复点击


Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isMpa: false,
    isshowlocation: false,
    shareId: 0,
    userId: '',
    _city: '',
    currentCity: '',
    _lat: '',
    _lng: '',
    regulation: [
      ],
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
    if (options.shareId) {
      this.setData({
        shareId: options.shareId
      });
    }
    this.circleShow();
    this.setData({
      inviter: options.inviter ? options.inviter : app.globalData.userInfo.userId
    });
    this.createUser()
  },
  getwinningList() {
    let that = this
    wx.request({
      url: that.data._build_url + 'orderInfo/listFree?page=1&rows=50&payType=0',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh()
        if (res.data.code == '0' && res.data.data) {
          let data = res.data.data
          if (!data.list) {
            return
          }
          if (data.list.length) {
            const msgList = [];

            data.list.forEach((item, index) => {
              let phone = '', obj = {};
              if (item.userName) {
                phone = item.userName.substring(0, 3) + '****' + item.userName.substring(7, item.userName.length)
              }else{
                phone = item.userId
              }
             
              obj.title = '恭喜' + phone + '获得' + item.orderItemOuts[0].goodsSkuName;
              if(obj.title.length > 23) {
                obj.title = obj.title.substring(0,23)+'...'
              }
              obj.url = 'url'
              obj.id = item.id
              msgList.push(obj)
            })
            that.setData({
              msgList: msgList
            })
          }
        }
      }, fail() {
        wx.stopPullDownRefresh()
        wx.hideLoading()
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
    getCurrentLocation(that).then( (res)=>{
      that.setData({ currentCity:res })
    })
    this.setData({
      isshowlocation: false
    })
    if(!app.globalData.token) {
      getToken(app).then( ()=>{
        //调接口
        that.createUser();
        that.getUserNum();
        that.getwinningList()
        if (!that.data.prizeList.length) {
          wx.showLoading({
            title: '加载中...',
          })
          that.getData();
        }
      })
    }else{
      that.getUserNum();
      that.getwinningList()
      if (!that.data.prizeList.length) {
        wx.showLoading({
          title: '加载中...',
        })
        that.getData();
      }
    }

  },
  openSetting() {//打开授权设置界面
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
  },

  createUser() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'actGoodsSku/jackpotList?actId=42',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0' && res.data.data && res.data.data.list) {
          // var prize = '';
          // for (let i = 0; i < res.data.data.list.length; i++) {
          //   prize += res.data.data.list[i].name + '、'
          // }
          // prize = prize.substring(0, prize.length - 1);
          that.setData({ prize: res.data.data.list })
        }
      },
      fail() {

      }
    })

  },
  getUserNum() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'actLottery/get?actId=45',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh()
        if (res.data.code == '0') {
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
        wx.stopPullDownRefresh()
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
      url: that.data._build_url + 'actGoodsSku/getSpuList?actId=42',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0' && res.data.data.length) {
          wx.hideLoading()
          let data = res.data.data
          that.computed(data)
          let arr = '';
          arr = data[0].actInfo.actDesc.split(',');
          that.setData({
            regulation:arr
          })

        } else {
          wx.hideLoading()
          wx.showToast({
            title: '加载数据失败，请重新进入',
            icon: 'none'
          })
        }
      },
      fail() {
        wx.hideLoading()
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
    let userData = that.data.lotteryData;
    if (!that.data.currentCity) {
      getCurrentLocation(that).then((res) => {
        that.setData({ currentCity: res })
        that.drawBtn();
      })
      
      return false
    }
    if (!gameFlag) { //游戏正在运行中
      return false
    }

    if (!userData || userData.totalNumber < 1  ) {
      wx.showToast({
        title: '抽奖次数不足!',
        icon: 'none'
      })
      return false
    }
    if (that.data.frameClass1 == 'z2 back' || that.data.frameClass2 == 'z1 front') {
      that.setData({
        winningIndex: '',
        frameClass1: "z1 front",
        frameClass2: "z2 back",
      })
    }

    gameFlag = false
    that.sendGamerequest() //请求游戏开奖结果
  },
  sendGamerequest() {
    let that = this;
    let url = encodeURI(that.data._build_url + 'actGoodsSku/zoneLottery?actId=42&city=' + that.data.currentCity);
    wx.request({
      url: url ,
      method: 'post',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.code == '0' && res.data.data && res.data.data.goodsSkuOut[0] && res.data.data.categoryId) {
          that.setData({
            winning: res.data.data
          })
          that.turn(120);
        } else {
          gameFlag = true
          wx.hideLoading()
          wx.showToast({
            title: '抽奖失败，请再试一次',
            icon: 'none'
          })
        }
      },
      fail() {
        wx.hideLoading();
        gameFlag = true
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }

    })
  },

  turn(interval) { //转盘动画
    let _this = this,
      turnIdx = this.data.turnIdx;
    if (timer != null) {
      clearInterval(timer)
    }
    timer = setInterval(() => {
      let Countdown = _this.data.Countdown
      Countdown += interval;
      turnIdx = turnIdx < 8 ? turnIdx + 1 : 1;
      _this.setData({
        turnIdx: turnIdx,
        Countdown: Countdown
      });
      var time = myFunction(1500, 3000);
      if (Countdown >= time) {
        let lotteryData = _this.data.lotteryData
        lotteryData.totalNumber = lotteryData.totalNumber - 1 //减少一次抽奖次数
        _this.setData({
          Countdown: 0,
          lotteryData: lotteryData
        });
        clearInterval(timer);
        _this.getTick();
      }
    }, interval);
  },
  onHide() {
    gameFlag = true;
    clearInterval(timer)
  },
  onUnload: function () {
    gameFlag = true;
    clearInterval(timer)
  },

  getTick() {
    let _this = this;
    _this.setData({
      frameClass1: "z2 back",
      frameClass2: "z1 front",
    })
    if (_this.data.winning.skuId == '8053') {//谢谢参与
      wx.showToast({
        title: '谢谢参与，请再接再厉',
        icon: 'none'
      })
      gameFlag = true
      return false;
    }
    setTimeout(() => {
      wx.showModal({
        title: '恭喜',
        confirmText: '立即查看',
        content: _this.data.winning.goodsSkuOut[0].skuName,
        success(res) {
          if (res.confirm) {
            gameFlag = true
            wx.navigateTo({
              url: '/packageB/pages/wanda/wandaActivity/myGift/myGift',
            })
          } else if (res.cancel) {
            gameFlag = true
          }

        }
      })
    }, 1500)
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
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  share() { //分享
    if (!app.globalData.userInfo.mobile) {
      this.closetel();
    } else {
      //调接口

      return
      if (this.data.isInvite) {
        this.onShareAppMessage();
      } else {
      }
    }
  },
  //分享给好友
  onShareAppMessage: function () { //分享给好友帮忙砍价
    return {
      title: '幸运九宫格，人人有机会!',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_choujiang.jpg',
      path: '/pages/activityDetails/holdingActivity/holdingActivity?shareId=1',
      success: function (res) { },
      fail: function (res) { }
    }
  },
  toIndex() { //跳转至首页
    wx.switchTab({
      url: '../../index/index'
    })
  },
  myGift() {    //跳转至我的奖品
    wx.navigateTo({
      url: '/packageB/pages/wanda/wandaActivity/myGift/myGift'
    })
  },
 
  onPullDownRefresh: function () {
    let that = this;
    that.createUser()
    that.getwinningList()
    if (!that.data.prizeList.length) {
      wx.showLoading({
        title: '加载中...',
      })
      that.getData();
    }
  },
 
 
})
function myFunction(begin, end) {
  var num = Math.round(Math.random() * (end - begin) + begin);
  return num;
}