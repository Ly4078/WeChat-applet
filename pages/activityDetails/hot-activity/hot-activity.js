import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 35,     //活动id
    type: "",
    mainPic: "",    //banner图
    infoPic: "",    //活动详情图
    startTime: "",
    endTime: "",   
    page: 1,
    flag: true,
    searchPage: 1,    //搜索分页
    searchFlag: true, //搜索flag
    searchBool: false,
    ticketArr: [],   //券数组
    isayers: true,
    business: [],    //商家数组  
    players: [],     //选手数组 
    userId: app.globalData.userInfo.userId,
    today: "",
    tomorrow: "",
    searchValue: ""     //搜索内容
  },
  onLoad: function (options) {
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      actId: options.id,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });
    this.actInfo();
    this.actTicket();
    this.isGroup();
  },
  onShow: function () { },
  actInfo: function() {   //活动简介
    let _parms = {
      id: this.data.actId,
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      sourceType: '1'
    }
    Api.actdetail(_parms).then((res) => {
      let startTime = res.data.data.startTime,
        endTime = res.data.data.startTime;
      startTime = startTime.substring(0, startTime.indexOf(" "));
      endTime = endTime.substring(0, endTime.indexOf(" "));
      this.setData({
        mainPic: res.data.data.mainPic,
        infoPic: res.data.data.actUrl,
        startTime: startTime,
        endTime: endTime
      });
    });
  },
  actTicket: function() {  //活动券
    Api.actTicket({}).then((res) => {
      this.setData({
        ticketArr: res.data.data.list
      });
    });
  },
  isGetActCoupons: function() {    //是否可以领取活动券
    let _parms = {
      userId: app.globalData.userInfo.userId,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow
    }
    Api.isGetActCoupons(_parms).then((res) => {
      if(res.data.code != 0) {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
        return false;
      }
      this.getActCoupons();
    });
  },
  getActCoupons: function(e) {     //领取活动券
    this.isGetActCoupons();
    let _parms = {
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      payType: 2,     //1、微信支付 2、享7支付 3、支付宝支付
      skuId: e.target.id,
      skuNum: 1
    }
    Api.getActCoupons(_parms).then((res) => {
      if(res.data.code == 0) {
        wx.showToast({
          title: '领取成功',
          icon: 'none'
        })
      }
    });
  },
  isGroup: function () {   //查询是否分组
    let _parms = { actId: this.data.actId };
    Api.isGroung(_parms).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          type: res.data.data == [] ? "" : 2
        });
      }
      this.shopList();
    })
  },
  shopList: function () {    //商家列表
    let _parms = {
      voteUserId: app.globalData.userInfo.userId, 
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      page: this.data.page,
      rows: 2
    },
    _this = this;
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
    Api.actShopList(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading();
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let list = _this.data.business, actList = res.data.data.list;
        for (let i = 0; i < actList.length; i++) {
          list.push(actList[i]);
        }
        _this.setData({
          business: list
        })
      } else {
        _this.setData({
          flag: false
        });
      }
    });
  },
  playerList: function () {   //选手列表
    let _parms = {
      voteUserId: app.globalData.userInfo.userId,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      page: this.data.page,
      rows: 2
    },
    _this = this;
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
   
    Api.actPlayerList(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading();
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let list = _this.data.players, actList = res.data.data.list;
        for (let i = 0; i < actList.length; i++) {
          list.push(actList[i]);
        }
        _this.setData({
          players: list
        })
      } else {
        _this.setData({
          flag: false
        });
      }
    });
  },
  getInputVal: function(e) {   //获取input的值
      this.setData({
        searchValue: e.detail.value,
      searchPage: 1,
      searchBool: true
    });
  },
  searchList: function(e) {    //搜索
    let _parms = {
      voteUserId: app.globalData.userInfo.userId,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      searchKey: this.data.searchValue,
      page: this.data.searchPage,
      rows: 2
    },
      _this = this;
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
    if (this.data.isayers == true) {
      this.setData({
        business: []
      });
      Api.searchShop(_parms).then((res) => {
        let data = res.data;
        wx.hideLoading();
        if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
          let list = _this.data.business, actList = res.data.data.list;
          for (let i = 0; i < actList.length; i++) {
            list.push(actList[i]);
          }
          _this.setData({
            business: list
          })
        } else {
          _this.setData({
            searchFlag: false
          });
        }
      });
    } else {
      this.setData({
        players: []
      });
      Api.searchUser(_parms).then((res) => {
        let data = res.data;
        wx.hideLoading();
        if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
          let list = _this.data.players, actList = res.data.data.list;
          for (let i = 0; i < actList.length; i++) {
            list.push(actList[i]);
          }
          _this.setData({
            players: list
          })
        } else {
          _this.setData({
            searchFlag: false
          });
        }
      });
    }
  },
  voteAdd: function(e) {     //投票
    let _this = this,
      playerUserId = e.currentTarget.dataset.index,     //userId 
      shopId = e.currentTarget.id;                        //shopId
    let _parms = {
      actId: this.data.actId,
      userId: app.globalData.userInfo.userId
    };
    if (this.data.type == "2") {
      _parms['playerUserId'] = playerUserId;
      _parms['shopId'] = shopId;
    } else {
      this.data.isayers == true ? _parms['shopId'] = shopId : _parms['playerUserId'] = playerUserId;
    }
    Api.voteAdd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '投票成功',
          icon: 'none'
        })
        if (_this.data.isayers == true) {
          for (let i = 0; i < _this.data.business.length; i++) {
            if (_this.data.business[i].shopId == shopId) {
              _this.data.business[i].isVote = 1;
            }
          }  
        } else {
          for (let i = 0; i < _this.data.players.length; i++) {
            if (_this.data.players[i].userId == playerUserId) {
              _this.data.players[i].isVote = 1;
            }
          }
        }
      }
    })
  },
  isvoted: function() {    //已投票的提示
    wx.showToast({
      title: '您已投过票了',
      icon: 'none'
    })
  },
  toApply: function () {    //跳转至报名页面
    if (app.globalData.userInfo.userType == '2' && app.globalData.userInfo.shopId != '') {
      let _parms = {
        refId: app.globalData.userInfo.shopId,
        actId: this.data.actId,
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
        actId: this.data.actId,
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
    let id = e.target.id;
    this.setData({
      searchValue: "",
      searchPage: 1,
      page: 1,
      flag: true,
      searchBool: false
    })
    if (id == 1) {
      this.setData({
        business: [],  
        isayers: true
      });
      this.shopList();
    } else {
      this.setData({
        players: [], 
        isayers: false
      });
      this.playerList();
    }
  },
  eventDetailss: function () {  //活动详情
    wx.navigateTo({
      url: 'eventDetails/eventDetails?url=' + this.data.infoPic
    })
  },
  clickli: function (e) {//跳转到店铺\选手页面
    let _id = e.currentTarget.id
    let _actId = this.data.actId
    if (this.data.isayers) { //商家
      wx.navigateTo({
        url: '../../index/merchant-particulars/merchant-particulars?shopid=' + _id
      })
    } else {  //选手
      wx.navigateTo({
        url: '../details_page/details_page?actId=' + _actId+'&id='+_id
      })
    }
  },
  onReachBottom: function () {  //用户上拉触底
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      if (this.data.searchBool) {
        this.setData({
          searchPage: this.data.searchPage + 1
        });
        this.searchList();
      } else {
        if (this.data.isayers == true) {
          this.shopList();
        } else {
          this.playerList();
        }
      }
    }
  },
  onPullDownRefresh: function () {    //用户下拉刷新
    wx.showLoading({
      title: '加载中..'
    })
    this.setData({
      page: 1,
      flag: true,
      searchValue: ""
    });
    if (this.data.isayers == true) {
      this.setData({
        business: []
      });
      this.shopList();
    } else {
      this.setData({
        players: []
      });
      this.playerList();
    }
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