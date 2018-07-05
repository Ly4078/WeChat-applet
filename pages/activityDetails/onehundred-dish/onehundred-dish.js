import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 37,     //活动id
    voteUserId: 0,
    // city: [{ name: '十堰', id: 1 }, { name: '武汉', id: 2 }],
    selected: '十堰',
    issnap: false,
    switchTab: true,
    isball:true,
    flag: true,
    searchValue: '',
    page: 1,
    stage: 1,
    sku:0,
    dishLish: [],
    playerList: [],
    sortType: 2,
    isflag:0,
    isnew:false,
    issgin:false,
    isOption: false
  },
  onLoad: function (options) {
    // console.log("options:", options)
   

    let dateStr = new Date(),that = this;
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });

     //在此函数中获取扫描普通链接二维码参数
    let q = decodeURIComponent(options.q);
    console.log('q:',q)
    if (q) {
      if (utils.getQueryString(q, 'flag') == 4) {
        console.log(utils.getQueryString(q, 'actId'))
        this.setData({
          actId: utils.getQueryString(q, 'actId')
        });
      }
    }else{
      this.setData({
        actId: options.actid
      });
    }
    
    
    if (options.sortType == 1) {
      this.setData({
        sortType: 1
      });
    }
    if (options.switchTab == false) {
      this.setData({
        switchTab: false
      });
    }
    if (app.globalData.userInfo.userId && app.globalData.userInfo.mobile){
      this.setData({
        voteUserId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.mobile
      });
    } else if (options.voteUserId) {
      this.setData({
        voteUserId: options.voteUserId,
        userName: options.userName
      });
    }
  },
  onShow: function () {
    let that = this;
    if (!app.globalData.userInfo.mobile) {
      this.getuserinfo();
    }
    wx.request({
      url: this.data._build_url + 'act/flag',
      success: function (res) {
        that.setData({
          isflag: res.data.data
        });
      }
    })
    this.setData({
      flag: true,
      page: 1,
      isOption: false,
      dishLish: [],
      playerList: []
    });
    this.actInfo();
    this.availableVote();
    if (this.data.switchTab) {
      this.getDishList();
    } else {
      this.getPlayerList();
    }
  },
  //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 1500,
      duration: 300
    })
    this.setData({
      _page: 1
    })
  },
  actInfo: function () {   //活动简介
    let _parms = {
      id: this.data.actId,
      userId: this.data.voteUserId,
      userName: this.data.userName,
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
    let that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (app.globalData.userInfo.userType == '2' && app.globalData.userInfo.shopId != '') {
      wx.navigateTo({
        url: '../../index/download-app/download??isshop=yes',
      })
    } else {
      wx.showModal({
        title: '',
        content: '立即报名',
        cancelText:'商家报名',
        cancelColor:'#3CC51F',
        confirmText:'选手报名',
        success: function (res) {
          if (res.cancel) { //商家用户
            wx.navigateTo({
              url: '../../index/download-app/download',
            })
          } else if (res.confirm) { //普通用户
            let _parms = {
              refId: that.data.voteUserId,
              actId: that.data.actId,
              type: 1
            }
            Api.actisSign(_parms).then((res) => {
              let data = res.data;
              if (data.code == 0) {
                wx.navigateTo({
                  url: '../hot-activity/apply-player/apply-player?id=' + that.data.actId + '&_actName=' + that.data.actName
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
        }
      })
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
      rows: 6
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
          })
        }
      } else {
        wx.showToast({
          title: '系统繁忙',
          mask: 'true',
          duration: 2000,
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
      rows: 6
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
            list[i].imgStr = list[i].picUrls[0].picUrl;
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
          icon: 'none',
          mask: 'true',
          duration: 2000,
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
  selectCity(e) {     //下拉菜单调取接口
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
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: '../dish-detail/dish-detail?actId=' + this.data.actId + '&skuId=' + e.target.id
    })
  },
  playerDetail(e) {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: '../player-detail/player-detail?actId=' + this.data.actId + '&id=' + e.currentTarget.id + '&actName=' + this.data.actName
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
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        sku: 0,
        user: 0
      });
    }
  },
  castvote: function (e) {  //選手投票
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
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
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    Api.voteAdd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '投票成功',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
        if (this.data.switchTab) {
          let dishLish = this.data.dishLish,_num='';
          for (let i = 0; i < dishLish.length; i++) {
            if (dishLish[i].skuId == id) {
              dishLish[i].voteNum++;
            }
          }
          _num = this.data.sku - 1;
          if(_num<0){
            _num =0;
          }
          this.setData({
            dishLish: dishLish,
            sku: _num
          });
        } else {
          let playerList = this.data.playerList,_num = '';;
          for (let i = 0; i < playerList.length; i++) {
            if (playerList[i].userId == id) {
              playerList[i].voteNum++;
            }
          }
          _num = this.data.user - 1;
          if (_num < 0) {
            _num = 0;
          }
          this.setData({
            playerList: playerList,
            user: _num
          });
        }
      }
    });
  },
  payDish(e) {    //购买推荐菜
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap:true
      })
      return false
    }
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
    if (id == 1) {
      wx.redirectTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },
  onShareAppMessage() {
    return {
      title: '十堰百菜评选暨《十堰食典》',
      desc: '享7美食',
      path: '/pages/activityDetails/onehundred-dish/onehundred-dish?actid=' + this.data.actId + '&voteUserId=' + this.data.voteUserId + '&userName=' + this.data.userName
    }
  },
  toactlist() {
    this.setData({
      isball: false
    })
    wx.switchTab({
      url: '../../index/index',
    })
  },
  getuserinfo(){
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          let that = this;
          Api.getOpenId(_parms).then((res) => {
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo();
            } else {
              that.findByCode();
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
  getmyuserinfo: function () {
    let _parms = {
      openId: app.globalData.userInfo.openId,
      unionId: app.globalData.userInfo.unionId
    }, that = this;
    Api.addUserUnionId(_parms).then((res) => {
      if (res.data.data) {
        app.globalData.userInfo.userId = res.data.data;
        wx.request({  //从自己的服务器获取用户信息
          url: this.data._build_url + 'user/get/' + res.data.data,
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 0) {
              let data = res.data.data;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              };
              if (!data.mobile) {
                that.setData({
                  isnew: true
                })
              }
            }
          }
        })
      }
    })
  },
  findByCode: function () {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
          wx.hideLoading();
          if (res.data.code == 0) {
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo()
            }
          }
        })
      }
    })
  }

})