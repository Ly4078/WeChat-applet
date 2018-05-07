import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 34,     //活动id
    type: "",
    isayers: true,
    business: [],    //商家数组  
    players: [],     //选手数组 
    userId: app.globalData.userInfo.userId,
    today: "",
    tomorrow: ""
  },
  onLoad: function (options) {
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });
    this.isGroup();
    this.shopList();
    this.playerList();
  },
  onShow: function () { },
  isGroup: function () {   //查询是否分组
    let _parms = { actId: this.data.actId };
    Api.isGroung(_parms).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          type: res.data.data == [] ? "" : 2
        });
      }
    })
  },
  shopList: function () {    //商家列表
    let _parms = {
      voteUserId: app.globalData.userInfo.userId, 
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow
    };
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
    Api.actShopList(_parms).then((res) => {
      this.setData({
        business: res.data.data.list,
        actlist: res.data.data.list
      });
    });
  },
  playerList: function () {   //选手列表
    let _parms = {
      voteUserId: app.globalData.userInfo.userId,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow
    }
    Api.actPlayerList(_parms).then((res) => {
      this.setData({
        players: res.data.data.list
      });
    });
  },
  toApply: function () {    //跳转至报名页面

    if (app.globalData.userInfo.userType == '2' && app.globalData.userInfo.shopId != '') {

      let _parms = {
        refId: app.globalData.userInfo.shopId,
        actId: 34,
        type: 2
      }
      Api.actisSign(_parms).then((res) => {
        let data = res.data;
        if (data.code == 0) {
          wx.navigateTo({
            url: 'apply-shop/apply-shop',
          })
        } else {
          wx.showToast({
            title: data.message,
            icon: 'none'
          })
        }
      });

    } else {

      let _parms = {
        refId: app.globalData.userInfo.userId,
        actId: 34,
        type: 1
      }
      Api.actisSign(_parms).then((res) => {
        let data = res.data;
        if (data.code == 0) {
          wx.navigateTo({
            url: 'apply-player/apply-player',
          })
        } else {
          wx.showToast({
            title: data.message,
            icon: 'none'
          })
        }
      });

    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  switching: function (e) { //切换商家/选手
    //切换商家/选手
    let id = e.target.id, isayers = true, actlist = [];
    if(id == 1) {
      isayers = true;
    } else {
      isayers = false;
    }
    this.setData({
      isayers: isayers
    })
  },
  eventDetailss: function () {  //活动详情
    wx.navigateTo({
      url: 'eventDetails/eventDetails',
    })
  },
  clickli: function (e) {//跳转到详情页面
    let id = e.currentTarget.id
    console.log(id)
    console.log("isayers:", this.data.isayers)
    if (this.data.isayers) { //选手
      wx.navigateTo({
        url: '../details_page/details_page'
      })
    } else {  //商家
      // wx.navigateTo({
      // url:'../../index/merchant-particulars/merchant-particulars?shopid='+id
      // })
    }
  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  dateConv: function (dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  }
})