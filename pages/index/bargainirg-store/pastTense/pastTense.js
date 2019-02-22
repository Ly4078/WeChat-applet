import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();
let requestflag = false;
Page({
  data: {
    showSkeleton: true,
    _build_url: GLOBAL_API_DOMAIN,
    bargainList: [],
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    timer: null,
    timeArr: [], //时间集合
    actid:'',
    flag: true,
    dishList: [],
    dishPage: 1,
    dishPages: 1
  },
  onLoad: function (options) {
    let that = this;
    if (options.actid) {
      this.setData({
        actid: options.actid
      })
    }
    if (this.data.dishList.length <= 0) {
      this.hotDishList(); //砍价菜精选推荐列表
    }
  },
  onShow: function() {
    this.setData({
      bargainList: []
    });
    this.vegetablesInquire(); //查询菜品砍价列表
  },

  onHide: function() {
    let _this = this;
    this.setData({
      bargainList: []
    })
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
  vegetablesInquire: function() { //查询菜品列表
    let _parms = {},
      _this = this;
    this.setData({
      flag: false
    });
    wx.request({
      url: this.data._build_url + 'goodsBar/userRedis?type=4',
      header: {
        "Authorization": app.globalData.token
      },
      method: 'GET',
      success: function(res) {
        if (res.data.code == 0) {
          if (res.data.data && res.data.data.length > 0) {
            let list = res.data.data,
              _bargainList = _this.data.bargainList,
              arr = [],
              _now = (new Date()).getTime();
            for (let i = 0; i < list.length; i++) {
              list[i].subtract = (list[i].skuMoneyOut - list[i].skuMoneyNow).toFixed(2);
              let _endTime = (new Date(list[i].endTime.replace(/\-/g, "/"))).getTime();
              arr.push({
                endTime: list[i].endTime.replace(/\-/g, "/"),
                countDown: ''
              });
              _bargainList.push(list[i]);
            }
            _this.setData({
              bargainList: _bargainList
            });
            _this.updateTime(arr);
          }
        } else {
          _this.setData({
            flag: false
          });
        }
      }
    }, () => {
      _this.setData({
        flag: true
      });
    });
  },
  updateTime(arr) { //倒时计
    let hours = '',
      minutes = '',
      seconds = '',
      timeArr = arr,
      countDown = '',
      miliEndTime = '',
      miliNow = '',
      timer = null,
      minus = '', //时间差(秒)
      that = this;

    timer = setInterval(function() {
      that.setData({
        timer: timer
      });
      let isEnd = 0;
      for (let i = 0; i < arr.length; i++) {
        miliNow = new Date().getTime(); //现在时间
        miliEndTime = (new Date(timeArr[i].endTime)).getTime(); //结束时间
        minus = Math.floor((miliEndTime - miliNow) / 1000); //时间差(秒)
        if (minus <= 0) {
          isEnd++;
          timeArr[i].countDown = '';
        } else {
          isEnd--;
          hours = Math.floor(minus / 3600); //时
          minutes = Math.floor(minus / 60); //分
          seconds = minus % 60; //秒
          hours = hours < 10 ? '0' + hours : hours;
          minutes = minutes < 10 ? '0' + minutes : minutes;
          seconds = seconds < 10 ? '0' + seconds : seconds;
          timeArr[i].countDown = hours + ':' + minutes + ':' + seconds;
        }
        that.setData({
          timeArr: timeArr
        });
        timeArr = that.data.timeArr;
      }
      that.setData({
        timeArr: timeArr
      });
      if (isEnd == timeArr.length) {
        clearInterval(that.data.timer);
        return false;
      }
      minus--;
    }, 1000)
  },
  bargainDetail(e) {   //详情
    console.log("ee:",e)
    let id = e.currentTarget.id,
      list = this.data.bargainList,
      skuType = e.currentTarget.dataset.skutype,
      categoryId = e.currentTarget.dataset.categoryid,
      groupId = e.currentTarget.dataset.groupid,
      actId="",
      city = "",
      that = this;
    for (let i = 0; i < list.length; i++) {
      if (list[i].skuId == id && list[i].groupId == groupId ) {
        actId = list[i].actId ? list[i].actId:'';
        city = list[i].shop ? list[i].shop.city : '';
        this.setData({
          bargainList: []
        })
        clearInterval(that.data.timer);
        if (skuType == 9) {
          wx.navigateTo({
            url: '../../crabShopping/crabDetails/crabShare/crabShare?groupId=' + list[i].groupId + '&shopId=' + list[i].shopId + '&refId=' + list[i].skuId + '&skuMoneyOut=' + list[i].skuMoneyOut + '&skuMoneyMin=' + list[i].skuMoneyMin + '&initiator=' + app.globalData.userInfo.userId
          })
        } else if (skuType == 6 || !skuType){
          wx.navigateTo({
            url: '../AprogressBar/AprogressBar?groupId=' + list[i].groupId + '&shopId=' + list[i].shopId + '&refId=' + list[i].skuId + '&skuMoneyOut=' + list[i].skuMoneyOut + '&skuMoneyMin=' + list[i].skuMoneyMin + '&initiator=' + app.globalData.userInfo.userId + '&actId=' + actId + '&categoryId=' + categoryId + '&city=' + city
          })
        }
      }
    }
  },
  //精选推荐列表
  hotDishList() {
    let that = this,
      _parms = {},
      str = "",
      _url = "";
    _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 1,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      isDeleted: 0,
      actId: 41,
      page: this.data.dishPage,
      rows: 10
    };
    for (var key in _parms) {
      str += key + "=" + _parms[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    _url = that.data._build_url + 'goodsSku/listForAct?' + str;
    _url = encodeURI(_url);
    requestflag = true;
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let list = res.data.data.list, total = res.data.data.total;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
            }
            let dishList = that.data.dishPage == 1 ? [] : that.data.dishList;
            that.setData({
              loading: false,
              dishList: dishList.concat(list),
              dishPages: Math.ceil(total / 10)
            });
          } else {
            that.setData({
              loading: false
            });
          }
          requestflag = false;
          setTimeout(() => {
            that.setData({
              showSkeleton: false
            })
          }, 400)
        }
      },
      fail() {
        that.setData({
          loading: false
        });
        requestflag = false;
      }
    }, () => {
      that.setData({
        loading: false
      });
      requestflag = false;
    })
  },
  //菜品砍价详情
  candyDetails: function (e) {
    let id = e.currentTarget.id,
      distance = e.currentTarget.dataset.distance,
      shopId = e.currentTarget.dataset.index,
      categoryId = e.currentTarget.dataset.categoryid;
    this.setData({
      notShow: true
    })
    wx.navigateTo({
      url: '../CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=41&categoryId=' + categoryId
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (!requestflag && this.data.dishPage < this.data.dishPages && this.data.dishPage < 11) {
      this.setData({
        loading: true,
        dishPage: this.data.dishPage + 1
      })
      this.hotDishList();
    }
  },
  toindex() { //去首页
    wx.switchTab({
      url: '../../index'
    })
  }
})