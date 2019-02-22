import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import getToken from '../../../../utils/getToken.js';
import getCurrentLocation from '../../../../utils/getCurrentLocation.js';
var app = getApp();
let gameFlag = true; //防止重复点击
var swichrequestflag = false;

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation: false,
    showSkeleton: true,
    loading: false,
    toTops: false,
    instruct: false,
    hidecai: false,
    shareId: 0,
    shareImg: '', //分享图片
    actId: '45',
    city: [],
    branch: [],
    SkeletonData: ['', '', '', ''],
    currCity: 0,
    currBranch: '',
    dishList: [],
    rows: 10,
    page: 1,
    pageTotal: 1,
    drawNum: 0, //抽奖次数
    actDesc: []
  },
  onLoad: function(options) {
    let that = this, _currCity = this.data.currCity;
    let q = decodeURIComponent(options.q);
    if (q && q != 'undefined') {
      if (utils.getQueryString(q, 'flag') == 12) {
        _currCity = utils.getQueryString(q, 'currCity');
      }
      that.setData({
        currCity: _currCity
      })
    }

    this.setData({
      isshowlocation: false
    })
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000);
    if (options.shareId) {
      this.setData({
        shareId: options.shareId
      });
    }
    if (!app.globalData.token) { //没有token 获取token
      getToken(app).then(() => {
        that.drawNum();
        that.getRule();
        that.getData();
      })
    } else {
      this.drawNum();
      this.getRule();
      this.getData();
    }
  },
  onShow: function() {

  },
  getData() { //获取数据
    let that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      that.cityQuery();
    } else {
      that.setData({ showSkeleton:false})
      getCurrentLocation(that).then( ()=>{
        that.cityQuery();
      })
    }
  },
  cityQuery() {
    let that = this;
    let _url = this.data._build_url + 'shopZone/listAllShopZone';
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data,
            city = [],
            branch = [];
          for (let i = 0; i < data.length; i++) {
            city.push(data[i].city);
            branch.push(data[i].shopZoneItem);
            if (data[i].city == app.globalData.userInfo.city) {
              if (that.data.currCity ==2 ){

              }else{
                that.setData({
                  currCity: i
                });
              }
            }
          }
          that.setData({
            city: city,
            branch: branch,
            currBranch: branch[that.data.currCity][0].name,
            dishList: []
          });
          that.dishL();
        }
      },
      fail() {

      }
    })
  },
  dishL() {
    let that = this,
      _param = {},
      str = "",
      shopZoneCity = "";
    shopZoneCity = this.data.city[this.data.currCity];
    _param = {
      actId: this.data.actId,
      shopZoneCity: shopZoneCity,
      shopZoneItem: this.data.currBranch,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      page: this.data.page,
      rows: this.data.rows
    };
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    swichrequestflag = true;
    let _url = this.data._build_url + 'goodsSku/listForAct?' + str;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = res.data.data.list;
          if (list && list.length > 0) {
            let dishList = that.data.dishList;
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
              dishList.push(list[i]);
            }
            that.setData({
              dishList: dishList,
              pageTotal: Math.ceil(res.data.data.total / 10)
            });
          }
          that.setData({
            showSkeleton: false,
            loading: false
          });
        } else {
          that.setData({
            showSkeleton: false,
            loading: false
          });
        }
        swichrequestflag = false;
      },
      fail() {
        that.setData({
          loading: false,
          showSkeleton: false
        })
        wx.stopPullDownRefresh();
        wx.hideLoading();
      }
    }, () => {
      swichrequestflag = false;
    })
  },
  getRule() { //获取规则
    let that = this, _url = '';
    _url = this.data._build_url + 'act/detail?id=' + this.data.actId;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let data = res.data.data;
        that.setData({
          mainPic: data.mainPic,
          actDesc: data.actDesc.split(',')
        });
        console.log("actDesc:", that.data.actDesc)
      },
      fail() {

      }
    })
  },
  isVote(e) { //是否可以投票
    let that = this,
      id = e.target.id,
      _url = this.data._build_url + 'vote/canVoteToday?actId=' + this.data.actId;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let code = res.data.code;
        if (code == 0) {
          that.vote(id);
        } else if (code == 200029) {
          that.showToast(res.data.message);
        }
      },
      fail() {

      }
    })
  },
  vote(id) { //投票
    let that = this;
    wx.showModal({
      title: '是否对该菜进行投票?',
      success(res) {
        if (res.confirm) {
          let _url = that.data._build_url + 'vote/addVoteFree?actGoodsSkuId=' + id + '&actId=' + that.data.actId;
          _url = encodeURI(_url);
          wx.request({
            url: _url,
            method: 'GET',
            header: {
              "Authorization": app.globalData.token
            },
            success: function(res) {
              if (res.data.code == 0) {
                that.showToast('投票成功,赶紧参与抽奖吧', 2000);
                let dishList = that.data.dishList;
                for (let i = 0; i < dishList.length; i++) {
                  if (dishList[i].actGoodsSkuOut.id == id) {
                    dishList[i].actGoodsSkuOut.voteNum++;
                  }
                }
                that.setData({
                  dishList: dishList,
                  drawNum: that.data.drawNum + 1
                });
              } else if (code == 200029) {
                that.showToast(res.data.message);
              }
            },
            fail() {

            }
          })
        }
      }
    })
  },
  toBuy(e) { //买菜
    let id = e.currentTarget.id,
      shopId = e.currentTarget.dataset.shopid,
      city = this.data.city[this.data.currCity],
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: '../../../../pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId='+ this.data.actId +'&categoryId=' + categoryId + '&city=' + city
    })
  },
  drawNum() { //可抽奖次数
    let that = this,
      _url = this.data._build_url + 'actLottery/get?actId=' + this.data.actId;
    _url = encodeURI(_url);
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            drawNum: res.data.data ? res.data.data.totalNumber : 0
          });
        }
      },
      fail() {

      }
    })
  },
  holdingActivity() {
    // if (this.data.drawNum <= 0) {
    //   this.showToast('抽奖次数已用完，参与活动获得更多抽奖次数');
    //   return;
    // }
    wx.navigateTo({
      url: '/pages/activityDetails/holdingActivity/holdingActivity'
    })
  },
  toBillboard() { //至排行榜
    wx.navigateTo({
      url: 'billboard/billboard?actId=' + this.data.actId
    })
  },
  switchTab(e) { //切换tab
    if (swichrequestflag) {
      return;
    }
    let id = e.currentTarget.id,
      branch = this.data.branch;
    if (id == this.data.currCity) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      currCity: id,
      currBranch: branch[id][0].name,
      dishList: [],
      page: 1
    });
    this.dishL();
  },
  switchWd(e) { //切换万达分店
    if (swichrequestflag) {
      return;
    }
    let name = e.currentTarget.dataset.name;
    if (this.data.currBranch == name) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      currBranch: name,
      dishList: [],
      page: 1
    });
    this.dishL();
  },
  onPullDownRefresh: function() { //刷新
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: 1,
      dishList: []
    });
    this.drawNum();
    this.dishL();
  },
  onReachBottom: function() { // 翻页
    if (this.data.page >= this.data.pageTotal) {
      return;
    }
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    this.dishL();
  },
  onShareAppMessage: function() {
    return {
      title: '湖北万达十大招牌菜',
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_wandashare.jpg',
      path: '/packageB/pages/wanda/wandaActivity/wandaActivity?shareId=1',
      success: function(res) {},
      fail: function(res) {}
    }
  },
  showToast(title, time) { //提示信息
    wx.showToast({
      title: title,
      icon: 'none',
      duration: time ? time : 1500
    })
  },
  openRule() { //打开规则
    this.setData({
      instruct: true
    });
  },
  closeRule() { //关闭规则
    this.setData({
      instruct: false
    });
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // //回到顶部
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  //滚动事件
  onPageScroll: function(e) {
    if (e.scrollTop > 400) {
      this.setData({
        toTops: true
      })
    } else {
      this.setData({
        toTops: false
      })
    }
  },
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权
          that.setData({ showSkeleton: true, isshowlocation: false})          
              setTimeout( ()=>{
                getCurrentLocation(that).then(() => {
                 
                  that.cityQuery();
                })
              },300)
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },


})