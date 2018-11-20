import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    showSkeleton: true,
    _build_url: GLOBAL_API_DOMAIN,
    isHiddenLoading: true,
    isHiddenToast: true,
    bargainList: [],
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    page: 1,
    page1: 1,
    timer: null,
    isAct: false, //是否是活动
    timeArr: [], //时间集合
    actid:'',
    titlenub: '0',
    titles: ["菜品砍价", "商品砍价"],
    flag: true
  },
  onLoad: function (options) {
    let that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000)
    if (options.actid) {
      this.setData({
        actid: options.actid,
        isAct: true,
        titlenub: 1
      })
    } else {
      this.setData({
        isAct: false,
        titlenub: 0
      })
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
  bindTab: function(e) {
    let ind = e.currentTarget.id;
    clearInterval(this.data.timer);
    this.setData({
      titlenub: ind,
      bargainList: []
    })
    if(this.data.titlenub == 0){
      this.setData({page:0})
    }else{
      this.setData({ page1: 0 })
    }
    this.vegetablesInquire(); //查询菜品列表
  },
  vegetablesInquire: function() { //查询菜品列表
    let _parms = {},
      _this = this,
      url = "";
    if (this.data.titlenub == 0) {
      url = _this.data._build_url + 'bargain/userRedis';
    } else {
      url = _this.data._build_url + 'goodsBar/userRedis?actId=41';
    }
    this.setData({
      flag: false
    });
    wx.request({
      url: url,
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
          setTimeout(() => {
            _this.setData({
              showSkeleton: false,
              flag: true
            })
          }, 400)
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
  bargainDetail(e) {
    let id = e.currentTarget.id,
      list = this.data.bargainList,
      skuType = e.currentTarget.dataset.skutype,
      actId="",
      that = this;
    for (let i = 0; i < list.length; i++) {
      if (list[i].skuId == id) {
        actId = list[i].actId ? list[i].actId:'';
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
            url: '../AprogressBar/AprogressBar?groupId=' + list[i].groupId + '&shopId=' + list[i].shopId + '&refId=' + list[i].skuId + '&skuMoneyOut=' + list[i].skuMoneyOut + '&skuMoneyMin=' + list[i].skuMoneyMin + '&initiator=' + app.globalData.userInfo.userId + '&actId=' + actId
          })
        }
      }
    }
  }
})