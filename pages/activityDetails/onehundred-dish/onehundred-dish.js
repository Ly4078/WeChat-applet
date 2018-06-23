import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 37,     //活动id
    voteUserId: 0,
    city: [{ name: '十堰', id: 1 }, { name: '武汉', id: 2 }],
    selected: '十堰',
    issnap: false,
    switchTab: true,
    flag: true,
    searchValue: '',
    page: 1,
    stage: 1,
    dishLish: [],
    playerList: [],
    sortType: 1,
    isOption: false
  },
  onLoad: function (options) {
    console.log(app.globalData.userInfo);
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      voteUserId: app.globalData.userInfo.userId,
      actId: options.actid,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });
  },
  onShow: function () {
    this.setData({
      flag: true,
      page: 1,
      switchTab: true,
      isOption: false,
      searchValue: '',
      dishLish: [],
      playerList: []
    });
    this.actInfo();
    this.getDishList();
    this.availableVote();
  },
  actInfo: function () {   //活动简介
    let _parms = {
      id: this.data.actId,
      userId: this.data.voteUserId,
      userName: '15072329516',
      sourceType: '1'
    }
    Api.actdetail(_parms).then((res) => {
      let startTime = res.data.data.startTime,
        endTime = res.data.data.endTime,
        stage = 1;
      startTime = startTime.substring(0, startTime.indexOf(" "));
      endTime = endTime.substring(0, endTime.indexOf(" "));
      if (startTime == '2018-08-01') {
        stage = 2;
      } else if (startTime == '2018-08-26') {
        stage = 3;
      }
      this.setData({
        stage: stage,
        mainPic: res.data.data.mainPic,
        infoPic: res.data.data.actUrl,
        actName: res.data.data.actName,
        actDesc: res.data.data.actDesc
      });
    });
  },
  eventDetailss: function () {  //活动详情
    wx.navigateTo({
      url: '../hot-activity/eventDetails/eventDetails?url=' + this.data.infoPic
    })
  },
  toApply: function () {    //跳转至报名页面
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (app.globalData.userInfo.userType == '2' && app.globalData.userInfo.shopId != '') {
      wx.showToast({
        title: '您是商家，请移步至商家端App报名',
        icon: 'none'
      })
    } else {
      let _parms = {
        refId: this.data.voteUserId,
        actId: this.data.actId,
        type: 1
      }
      Api.actisSign(_parms).then((res) => {
        let data = res.data;
        if (data.code == 0) {
          wx.navigateTo({
            url: '../hot-activity/apply-player/apply-player?id=' + this.data.actId + '&_actName=' + this.data.actName
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
  bestSwitch(e) {   //最热最新切换
    this.setData({
      page: 1,
      flag: true,
      dishLish: [],
      playerList: [],
      sortType: e.target.id,
      searchValue: ''
    });
    if (this.data.switchTab) {
      this.getDishList();
    } else {
      this.getPlayerList();
    }
  },
  getDishList() {    //获取列表数据
    let _parms = {
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      voteUserId: this.data.voteUserId,
      sortType: this.data.sortType,
      city: this.data.selected,
      page: this.data.page,
      rows: 2
    };
    if (this.data.searchValue) {
      _parms['searchKey'] = this.data.searchValue;
    }
    Api.dishList(_parms).then((res) => {
      let data = res.data, dishLish = this.data.dishLish;
      if (data.code == 0) {
        wx.hideLoading();
        if (!data.data) {
          this.setData({
            flag: false
          });
          return false;
        }
        let list = data.data.list;
        if (list != null && list != "" && list != []) {
          for (let i = 0; i < list.length; i++) {
            dishLish.push(list[i]);
          }
          this.setData({
            dishLish: dishLish
          });
        } else {
          this.setData({
            flag: false
          });
        }
      } else {
        wx.showToast({
          title: '系统繁忙',
          icon: 'none'
        })
      }
    });
  },
  getPlayerList() {
    let _parms = {
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      voteUserId: this.data.voteUserId,
      sortType: this.data.sortType,
      page: this.data.page,
      rows: 2
    };
    if (this.data.searchValue) {
      _parms['searchKey'] = this.data.searchValue;
    }
    Api.hotActPlayerList(_parms).then((res) => {
      let data = res.data, list = data.data.list, playerList = this.data.playerList;
      if (data.code == 0) {
        wx.hideLoading();
        if (list != null && list != "" && list != []) {
          for (let i = 0; i < list.length; i++) {
            playerList.push(list[i]);
          }
          this.setData({
            playerList: playerList
          });
        } else {
          this.setData({
            flag: false
          });
        }
      } else {
        wx.showToast({
          title: '系统繁忙',
          icon: 'none'
        })
      }
    });
  },
  getInputVal: function (e) {   //获取input的值
    this.setData({
      searchValue: e.detail.value
    });
  },
  searchList: function () {    //搜索
    this.setData({
      dishLish: [],
      playerList: [],
      page: 1,
      flag: true
    });
    if (this.data.switchTab) {
      this.getDishList();
    } else {
      this.getPlayerList();
    }
  },
  dishTab(e) {
    this.setData({
      dishLish: [],
      playerList: [],
      page: 1,
      flag: true,
      sortType: 1,
      searchValue: ''
    });
    let id = e.target.id;
    if (id == 1) {
      this.setData({
        switchTab: true
      });
      this.getDishList();
    } else if (id == 2) {
      this.setData({
        switchTab: false
      });
      this.getPlayerList();
    }
  },
  isShowOption() {
    this.setData({
      isOption: !this.data.isOption
    });
  },
  selectCity(e) {
    let city = this.data.city, id = e.target.id;
    for (let i = 0; i < city.length; i++) {
      if (id == city[i].id) {
        this.setData({
          selected: city[i].name,
          isOption: false,
          dishLish: [],
          playerList: [],
          page: 1,
          flag: true
        });
        if (this.data.switchTab) {
          this.getDishList();
        } else {
          this.getPlayerList();
        }
        return false;
      }
    }
  },
  toDishDetail(e) {
    wx.navigateTo({
      url: '../dish-detail/dish-detail?actId=' + this.data.actId + '&skuId=' + e.target.id
    })
  },
  playerDetail(e) {
    wx.navigateTo({
      url: '../player-detail/player-detail?actId=' + this.data.actId + '&id=' + e.currentTarget.id
    })
  },
  availableVote() {
    let _parms = {
      actId: this.data.actId,
      userId: this.data.voteUserId
    }
    Api.availableVote(_parms).then((res) => {
      let sku = 0, user = 0;
      if (res.data.code == 0) {
        sku = res.data.data.sku;
        user = res.data.data.user;
      }
      this.setData({
        sku: sku,
        user: user
      });
    });
  },
  castvote: function (e) {  //選手投票
    let id = e.currentTarget.id;
    let _parms = {
      actId: this.data.actId,
      userId: this.data.voteUserId
    };
    let availableNum = 0;
    if (this.data.switchTab) {
      _parms['skuId'] = id;
      availableNum = this.data.sku;
    } else {
      _parms['playerUserId'] = id;
      availableNum = this.data.user;
    }
    if (availableNum <= 0) {
      wx.showToast({
        title: '今天票数已用完,请明天再来',
        icon: 'none'
      })
      return false;
    }
    Api.voteAdd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '投票成功',
          icon: 'none'
        })
        if (this.data.switchTab) {
          let dishLish = this.data.dishLish;
          for (let i = 0; i < dishLish.length; i++) {
            if (dishLish[i].skuId == id) {
              dishLish[i].voteNum++;
            }
          }
          this.setData({
            dishLish: dishLish,
            sku: this.data.sku - 1
          });
        } else {
          let playerList = this.data.playerList;
          for (let i = 0; i < playerList.length; i++) {
            if (playerList[i].userId == id) {
              playerList[i].voteNum++;
            }
          }
          this.setData({
            playerList: playerList,
            user: this.data.user - 1
          });
        }
      }
    });
  },
  payDish(e) {    //购买推荐菜
    let dishLish = this.data.dishLish, id = e.target.dataset.index, prSkuId = e.target.id, skuId = 0, manAmount = 0, jianAmount = 0, shopId = 0;
    for (let i = 0; i < dishLish.length; i++) {
      if (id == dishLish[i].id) {
        manAmount = dishLish[i].manAmount;
        jianAmount = dishLish[i].jianAmount;
        shopId = dishLish[i].shopId;
        skuId = dishLish[i].skuId;
      }
    }
    wx.navigateTo({
      url: '../../index/voucher-details/voucher-details?id=' + prSkuId + "&skuId=" + skuId + "&sell=" + jianAmount + "&inp=" + manAmount + "&actId=" + this.data.actId + "&shopId=" + shopId
    })
  },
  onReachBottom: function () {  //用户上拉触底
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      if (this.data.switchTab) {
        this.getDishList();
      } else {
        this.getPlayerList();
      }
    }
  },
  onPullDownRefresh: function () {  //用户下拉刷新
    this.setData({
      dishLish: [],
      playerList: [],
      page: 1,
      flag: true
    });
    if (this.data.switchTab) {
      this.getDishList();
    } else {
      this.getPlayerList();
    }
  },
  dateConv: function (dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
  }
})