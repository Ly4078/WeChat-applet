import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 35,     //活动id
    area: "武汉",
    switchId: 1,    //切换的id
    type: "",
    mainPic: "",    //banner图
    infoPic: "",    //活动详情图
    startTime: "",
    endTime: "",
    page: 1,
    flag: true,
    searchPage: 1,    //搜索分页
    searchBool: false,
    ticketArr: [],   //券数组
    isReceive: 0,  //是否领取活动券
    isayers: true,
    arrangeType: 1,
    business: [],    //商家数组  
    players: [],     //选手数组 
    userId: app.globalData.userInfo.userId,
    today: "",
    tomorrow: "",
    _shopCode: '',
    _shopName: '',
    issnap: false,
    searchValue: "",     //搜索内容
    actName: '',     //活动名称
    actDesc: '',      //活动描述
    availableNum: 0   //可用票数
  },
  onLoad: function (options) {
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      actId: options.id,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });
    if (this.data.actId == 35) {
      this.setData({
        area: "武汉"
      });
    } else if (this.data.actId == 34) {
      this.setData({
        area: "十堰"
      });
    }
    this.actInfo();
    this.actTicket();
  },
  onShow: function () {
    if (this.data.actId == 35 || this.data.actId == 34) {
      this.isGroup();
    } else {
      this.availableVote();
      this.data.switchId = 2;
      this.switchList(this.data.switchId);
    }
  },
  availableVote(){
    let _parms = { userId: app.globalData.userInfo.userId};
    Api.availableVote(_parms).then((res) => {
      this.setData({
        availableNum: res.data.data
      });
      console.log(this.data.availableNum);
    });
  },
  actInfo: function () {   //活动简介
    let _parms = {
      id: this.data.actId,
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      sourceType: '1'
    }
    Api.actdetail(_parms).then((res) => {
      let startTime = res.data.data.startTime,
        endTime = res.data.data.endTime;
      startTime = startTime.substring(0, startTime.indexOf(" "));
      endTime = endTime.substring(0, endTime.indexOf(" "));
      this.setData({
        mainPic: res.data.data.mainPic,
        infoPic: res.data.data.actUrl,
        actName: res.data.data.actName,
        actDesc: res.data.data.actDesc,
        startTime: startTime,
        endTime: endTime
      });
    });
  },
  actTicket: function () {  //活动券
    let id = '383';
    if(this.data.actId == 36) {
      id = '848'
    }
    let _parms = {
      userId: app.globalData.userInfo.userId,
      id: id
    }
    Api.actTicket(_parms).then((res) => {
      if (res.data.code == 0) {
        let list = res.data.data.list;
        for (let i = 0; i < list.length; i++) {
          list[i].actType = this.data.actId;
        }
        this.setData({
          ticketArr: list,
          isReceive: res.data.data.list[0].isAct
        })
      }
    })
  },
  toMyTicket: function () {    //跳转至我的票券
    if (this.data.isReceive == 1) {
      wx.navigateTo({
        url: '../../personal-center/my-discount/my-discount'
      })
    }
  },
  isGetActCoupons: function (e) {    //是否可以领取活动券
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    if(this.data.actId == 36) {
      let id = e.target.id, arr = this.data.ticketArr
      for (let i = 0; i < arr.length; i++) {
        if (id == arr[i].id) {
          wx.navigateTo({
            url: '../../index/voucher-details/voucher-details?id=' + id + "&sell=" + arr[i].sellPrice + "&inp=" + arr[i].inPrice
          })
        }
      }
    } else {
      let _parms = {
        // userId: app.globalData.userInfo.userId,
        actId: this.data.actId,
        beginTime: this.data.today,
        endTime: this.data.tomorrow,
        token: app.globalData.token
      }
      Api.isGetActCoupons(_parms).then((res) => {
        if (res.data.code != 0) {
          wx.showToast({
            title: res.data.message,
            mask: 'true',
            duration: 2000,
            icon: 'none'
          })
          return false;
        }
        this.getActCoupons(e);
      });
    }
  },
  gotoUse() {    //去使用活动券
    wx.navigateTo({
      url: '../../personal-center/my-discount/my-discount'
    })
  },
  getActCoupons: function (e) {     //领取活动券
    let _parms = {
      // userId: app.globalData.userInfo.userId,
      // userName: app.globalData.userInfo.userName,
      payType: 1,     //1、享7支付 2、微信支付 3、支付宝支付
      skuId: e.target.id,
      skuNum: 1,
      token: app.globalData.token
    }
    Api.getActCoupons(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '领取成功',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
        this.setData({
          isReceive: 1
        });
      } else {
        wx.showToast({
          title: res.data.message,
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
      }
    });
  },
  isGroup: function () {   //查询是否分组
    let _parms = { actId: this.data.actId },
      id = this.data.switchId;
    Api.isGroung(_parms).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          type: res.data.data.length == 0 ? "" : 2
        });
      }
      this.switchList(id);
      // if (id == 1) {
      //   this.setData({
      //     business: [],
      //     isayers: true,
      //     page: 1
      //   });
      //   this.shopList();
      // } else {
      //   this.setData({
      //     players: [],
      //     isayers: false,
      //     page: 1
      //   });
      //   this.playerList();
      // }
    })
  },
  switchList: function (id) {     //切换个人和商家
    if (id == 1) {
      this.setData({
        business: [],
        isayers: true,
        page: 1
      });
      this.shopList();
    } else {
      this.setData({
        players: [],
        isayers: false,
        page: 1
      });
      this.playerList();
    }
  },
  shopList: function () {    //商家列表   "actshop/listNewAct"
    let _parms = {
      // voteUserId: app.globalData.userInfo.userId,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      page: this.data.page,
      rows: 6,
      token: app.globalData.token
    },
      _this = this;
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
    //this.data.switchId --- 1推荐菜   --- 2选手
    //this.data.arrangeType --- 1最热/武汉  --- 2最新/十堰

    if (this.data.switchId == 1 && this.data.arrangeType == 1) {     //武汉的推荐菜
      _parms['city'] = "武汉";
    } else if (this.data.switchId == 1 && this.data.arrangeType == 2) {     //十堰的推荐菜
      _parms['city'] = "十堰";
    } else if (this.data.switchId == 2 && this.data.arrangeType == 1) {    //最热选手

    } else if (this.data.switchId == 2 && this.data.arrangeType == 2) {    //最新选手
      _parms['sortType'] = 1;
    }

    Api.hotActShopList(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading();
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let list = _this.data.business, actList = res.data.data.list;
        for (let i = 0; i < actList.length; i++) {
          if(_this.data.actId == 36) {
            actList[i].actType = 36;
          }
          list.push(actList[i]);
        }
        _this.setData({
          business: list
        })
      } else {
        if (_parms.page == 1) {
          _this.setData({
            players: []
          });
        }
        _this.setData({
          flag: false
        });
      }
    });
  },
  playerList: function () {   //选手列表   "actUser/listNewAct"
    let _parms = {
      // voteUserId: app.globalData.userInfo.userId,
      token: app.globalData.token,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      page: this.data.page,
      rows: 6
    },
      _this = this;
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
    //this.data.switchId --- 1推荐菜   --- 2选手
    //this.data.arrangeType --- 1最热/武汉  --- 2最新/十堰

    if (this.data.switchId == 1 && this.data.arrangeType == 1) {     //武汉的推荐菜
      _parms['city'] = "武汉";
    } else if (this.data.switchId == 1 && this.data.arrangeType == 2) {     //十堰的推荐菜
      _parms['city'] = "十堰";
    } else if (this.data.switchId == 2 && this.data.arrangeType == 1) {    //最热选手

    } else if (this.data.switchId == 2 && this.data.arrangeType == 2) {    //最新选手
      _parms['sortType'] = 1;
    }

    Api.hotActPlayerList(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading();
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let list = _this.data.players, actList = res.data.data.list;
        for (let i = 0; i < actList.length; i++) {
          if (_this.data.actId == 36) {
            actList[i].actType = 36;
          }
          list.push(actList[i]);
        }
        _this.setData({
          players: list
        })
      } else {
        if (_parms.page == 1) {
          _this.setData({
            players: []
          });
        }
        _this.setData({
          flag: false
        });
      }
    });
  },
  getInputVal: function (e) {   //获取input的值
    this.setData({
      searchValue: e.detail.value
    });
  },
  searchList: function (e) {    //搜索
    this.setData({
      searchPage: 1,
      searchBool: true,
      flag: true
    });
    let _parms = {
      // voteUserId: app.globalData.userInfo.userId,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      searchKey: this.data.searchValue,
      page: this.data.searchPage,
      rows: 6,
      token: app.globalData.token
    },
      _this = this;
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
    if (this.data.switchId == 1 && this.data.arrangeType == 1) {     //武汉的推荐菜
      _parms['city'] = "武汉";
    } else if (this.data.switchId == 1 && this.data.arrangeType == 2) {     //十堰的推荐菜
      _parms['city'] = "十堰";
    } else if (this.data.switchId == 2 && this.data.arrangeType == 1) {    //最热选手

    } else if (this.data.switchId == 2 && this.data.arrangeType == 2) {    //最新选手
      _parms['sortType'] = 1;
    }
    if (this.data.isayers == true) {
      this.setData({
        business: []
      });
      Api.hotActShopList(_parms).then((res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          _this.setData({
            business: res.data.data.list
          })
        } else {
          wx.showToast({
            title: '系统繁忙，稍后再试',
            mask: 'true',
            duration: 2000,
            icon: 'none'
          })
        }
      });
    } else {
      this.setData({
        players: []
      });
      Api.searchUser(_parms).then((res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          _this.setData({
            players: res.data.data.list
          })
        } else {
          wx.showToast({
            title: '系统繁忙，稍后再试',
            mask: 'true',
            duration: 2000,
            icon: 'none'
          })
        }
      });
    }
  },
  searchFlipover: function () {      //搜索分页
    let _parms = {
      // voteUserId: app.globalData.userInfo.userId,
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      searchKey: this.data.searchValue,
      page: this.data.searchPage,
      rows: 6,
      token: app.globalData.token
    },
      _this = this;
    if (this.data.type == 2) {   //判断是否分组
      _parms['type'] = 2;
    }
    if (this.data.switchId == 1 && this.data.arrangeType == 1) {     //武汉的推荐菜
      _parms['city'] = "武汉";
    } else if (this.data.switchId == 1 && this.data.arrangeType == 2) {     //十堰的推荐菜
      _parms['city'] = "十堰";
    } else if (this.data.switchId == 2 && this.data.arrangeType == 1) {    //最热选手

    } else if (this.data.switchId == 2 && this.data.arrangeType == 2) {    //最新选手
      _parms['sortType'] = 1;
    }
    if (this.data.isayers == true) {
      Api.hotActShopList(_parms).then((res) => {
        wx.hideLoading();
        let data = res.data;
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
    } else {
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
            flag: false
          });
        }
      });
    }
  },
  voteAdd: function (e) {  //投票
    let _this = this;
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.actId == 36) {
      let playerUserId = e.currentTarget.dataset.index;
      let _parms = { 
        // userId: app.globalData.userInfo.userId,
        actId: this.data.actId,
        playerUserId: playerUserId,
        beginTime: this.data.today,
        endTime: this.data.tomorrow
      };
      Api.availableVote(_parms).then((res) => {
        this.setData({
          availableNum: res.data.data
        });
        if (this.data.availableNum == 0) {
          wx.showToast({
            title: '今天票数已用完了',
            mask: 'true',
            duration: 2000,
            icon: 'none'
          })
          return false;
        } else if (this.data.availableNum > 0) {
          Api.voteAdd(_parms).then((res) => {
            if (res.data.code == 0) {
              wx.showToast({
                title: '投票成功',
                mask: 'true',
                duration: 2000,
                icon: 'none'
              })
              let playerArr = _this.data.players;
              for (let i = 0; i < playerArr.length; i++) {
                if (playerUserId == playerArr[i].userId) {
                  playerArr[i].voteNum++;
                }
              }
              _this.setData({
                availableNum: _this.data.availableNum - 1,
                players: playerArr
              });
            }
          });
        }
      });
    } else {
      let _this = this,
        playerUserId = e.currentTarget.dataset.index,
        shopId = e.currentTarget.id;
      let _parms = {
        actId: this.data.actId,
        // userId: app.globalData.userInfo.userId,
        beginTime: this.data.today,
        endTime: this.data.tomorrow,
      };
      if (this.data.type == "2") {
        _parms['playerUserId'] = playerUserId;
        _parms['shopId'] = shopId;
      } else {
        this.data.isayers == true ? _parms['shopId'] = shopId : _parms['playerUserId'] = playerUserId;
      }
      Api.judgment(_parms).then((res) => {
        if (res.data.code == 0) {
          Api.voteAdd(_parms).then((res) => {
            if (res.data.code == 0) {
              wx.showToast({
                title: '投票成功',
                mask: 'true',
                duration: 2000,
                icon: 'none'
              })
              if (_this.data.isayers == true) {
                let business = _this.data.business;
                for (let i = 0; i < business.length; i++) {
                  if (business[i].shopId == shopId) {
                    console.log('商家投票成功');
                    business[i].isVote = 1;
                    if (business[i].groupVoteNum) {
                      business[i].groupVoteNum++;
                    } else if (business[i].voteNum) {
                      business[i].voteNum++;
                    }
                  }
                }
                _this.setData({
                  business: business
                });
              } else {
                let players = _this.data.players
                for (let i = 0; i < players.length; i++) {
                  if (players[i].userId == playerUserId) {
                    console.log('用户投票成功');
                    players[i].isVote = 1;
                    if (players[i].groupVoteNum) {
                      players[i].groupVoteNum++;
                    } else if (players[i].voteNum) {
                      players[i].voteNum++;
                    }
                  }
                }
                _this.setData({
                  players: players
                });
              }
            }
          })
        } else {
          wx.showToast({
            title: res.data.message,
            mask: 'true',
            duration: 2000,
            icon: 'none'
          })
        }
      })
    }
  },
  isvoted: function () {    //已投票的提示
    wx.showToast({
      title: '您已投过票了',
      mask: 'true',
      duration: 2000,
      icon: 'none'
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
      let _parms = {
        refId: app.globalData.userInfo.shopId,
        actId: this.data.actId,
        type: 2
      }
      Api.actisSign(_parms).then((res) => {
        let data = res.data;
        if (data.code == 0) {
          wx.navigateTo({
            url: 'apply-shop/apply-shop?id=' + this.data.actId + '&_actName=' + this.data.actName
          })
        } else {
          wx.showToast({
            title: data.message,
            mask: 'true',
            duration: 2000,
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
            url: 'apply-player/apply-player?id=' + this.data.actId + '&_actName=' + this.data.actName
          })
        } else {
          wx.showToast({
            title: data.message,
            mask: 'true',
            duration: 2000,
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
      page: 1,
      flag: true,
      searchBool: false,
      switchId: id
    })
    if(this.data.actId == 36) {
      this.setData({
        arrangeType: 1
      });
    }
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
  clickligr: function (e) {  //选手页面
    let _id = e.currentTarget.id;
    let _players = this.data.players;
    for (let i = 0; i < _players.length; i++) {
      if (_id == _players[i].userId) {
        let groupCode = _players[i].groupCode
        let _shopName = _players[i].shopName
        let _shopid = _players[i].shopId
        let _actName = this.data.actName
        let _actId = _players[i].actId
        if (groupCode == undefined || groupCode == null || groupCode == '') {
          wx.navigateTo({
            url: '../details_page/details_page?actId=' + _actId + '&id=' + _id
          })
        } else {
          wx.navigateTo({
            url: '../details_page/details_page?actId=' + _actId + '&id=' + _id + '&_shopName=' + _shopName + '&groupCode=' + groupCode + '&shopid=' + _shopid
          })
        }
      }
    }
  },
  clickli: function (e) {//跳转到店铺
    let _id = e.currentTarget.id
    let _business = this.data.business;
    for (let i = 0; i < _business.length; i++) {
      if (_id == _business[i].shopId) {
        let groupCode = _business[i].groupCode
        let _shopCode = _business[i].shopCode
        let _shopName = _business[i].shopName
        let _actName = this.data.actName
        if (groupCode == undefined || groupCode == null || groupCode == '') {
          wx.navigateTo({
            url: '../../index/merchant-particulars/merchant-particulars?shopid=' + _id + '&shopCode=' + _shopCode + '&shopName=' + _shopName + '&actName=' + _actName + '&actId=' + this.data.actId
          })
        } else {
          wx.navigateTo({
            url: '../../index/merchant-particulars/merchant-particulars?shopid=' + _id + '&groupCode=' + groupCode + '&shopCode=' + _shopCode + '&shopName=' + _shopName + '&actName=' + _actName + '&actId=' + this.data.actId
          })
        }
      }
    }
  },
  arrange(e) {
    this.setData({
      searchValue: "",
      page: 1,
      flag: true,
      searchBool: false,
      arrangeType: e.target.id
    })
    if (this.data.isayers) {
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
        this.searchFlipover();
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
      searchPage: 1,
      flag: true,
      searchValue: "",
      searchBool: false
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
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
  }
})