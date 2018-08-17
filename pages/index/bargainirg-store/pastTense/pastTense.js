import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    maxtime: "",
    isHiddenLoading: true,
    isHiddenToast: true,
    bargainList: [],
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    bigTimer:null
  },
  onLoad: function() {
    this.setData({
      userId: app.globalData.userInfo.userId
    });
  },
  onShow: function() {
    this.setData({
      bargainList: [],
      bigTimer: null
    });
    this.vegetablesInquire(); //查询菜品
  },
  onHide:function(){
    this.setData({
      bigTimer:null
    })
  },
  vegetablesInquire: function() { //查询菜品列表
    let _parms = {
      userId: this.data.userId
    },that= this;
    Api.bargainList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        let list = res.data.data, _now = (new Date()).getTime();
       
        for (let i = 0; i < list.length; i++) {
          list[i].subtract = (list[i].skuMoneyOut - list[i].skuMoneyNow).toFixed(2);
          let _endTime = (new Date(list[i].endTime.replace(/\-/g, "/"))).getTime();
          if (_now < _endTime ){
            list[i].doing = true;
          }else{
            list[i].doing = false;
          }
        }
        this.setData({
          bargainList: list
        });
        that.updateTime();
      }
    });
  },

  updateTime() {  //倒时计
    let hours = '',
    minutes = '',
    seconds = '',
    countDown = '',
    countDown2 = '',
    miliEndTime = '',
    miliNow = '',
    minus = '', //时间差(秒)
    _list = this.data.bargainList,
    that = this, 
    timer=null,
    frequency=0;
    timer = setInterval(function () {
      if (frequency>30*60){
        clearInterval(timer);
        timer = null;
      }
      for (let i = 0; i < _list.length;i++){
        if (_list[i].doing){
          miliNow = new Date().getTime();
          miliEndTime = (new Date(_list[i].endTime.replace(/\-/g, "/"))).getTime();
          minus = Math.floor((miliEndTime - miliNow) / 1000); //时间差(秒)
          if(minus<=0){
            _list[i].doing= false;
            continue; 
          }
          hours = Math.floor(minus / 3600); //时
          minutes = Math.floor(minus / 60); //分
          seconds = minus % 60; //秒
          hours = hours < 10 ? '0' + hours : hours;
          minutes = minutes < 10 ? '0' + minutes : minutes;
          seconds = seconds < 10 ? '0' + seconds : seconds;
          countDown = hours + ':' + minutes + ':' + seconds;
          countDown2 =  minutes + ':' + seconds;
          frequency++;
          _list[i].countDown = countDown2;
        }
      }
      that.setData({
        bargainList: _list,
        bigTimer:timer
      });
    },1000)
  },
  bargainDetail(e) {
    let id = e.currentTarget.id,
      list = this.data.bargainList;
    for (let i = 0; i < list.length; i++) {
      if (list[i].skuId == id) {
        wx.navigateTo({
          url: '../AprogressBar/AprogressBar?groupId=' + list[i].groupId + '&shopId=' + list[i].shopId + '&refId=' + list[i].skuId + '&skuMoneyOut=' + list[i].skuMoneyOut + '&skuMoneyMin=' + list[i].skuMoneyMin
        })
        return false;
      }
    }
  }
})