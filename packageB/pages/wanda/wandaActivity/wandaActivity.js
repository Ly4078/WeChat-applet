import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var app = getApp();
let gameFlag = true; //防止重复点击
var village_LBS = function (that) {
  wx.getLocation({
    success: function (res) {
      console.log('vill_res:', res)
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}
var swichrequestflag = false;

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: '45',
    city: [],
    branch: [],
    currCity: 0,
    currBranch: '',
    dishList: [],
    rows: 2,
    page: 1,
    pageTotal: 1,
    drawNum: 0   //抽奖次数
  },
  onLoad: function (options) {
    this.cityQuery();
    this.drawNum();
  },
  onShow: function () {
    
  },
  onUnload: function () {
    
  },
  cityQuery() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'shopZone/listAllShopZone',
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data, city = [], branch = [];
          for (let i = 0; i < data.length; i++) {
            city.push(data[i].city);
            branch.push(data[i].shopZoneItem);
          }
          that.setData({
            city: city,
            branch: branch,
            currBranch: branch[that.data.currCity][0].name
          });
          that.dishL();
        }
      },
      fail() {
        
      }
    })
  },
  dishL() {
    let that = this, _param = {}, str = "", shopZoneCity = "";
    shopZoneCity = this.data.city[this.data.currCity];
    _param = {
      searchKey: '',
      actId: this.data.actId,
      shopZoneCity: shopZoneCity,
      shopZoneItem: this.data.currBranch,
      locationX: app.globalData.userInfo.lat,
      locationY: app.globalData.userInfo.lng,
      page: this.data.page,
      rows: this.data.rows
    };
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    swichrequestflag = true;
    wx.request({
      url: that.data._build_url + 'goodsSku/listForAct?' + str,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 0) {
          let list = res.data.data.list;
          if (list && list.length > 0) {
            let dishList = that.data.dishList;
            for(let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
              dishList.push(list[i]);
            }
            that.setData({
              dishList: dishList,
              pageTotal: Math.ceil(res.data.data.total / 10)
            });
          }
          swichrequestflag = false;
        }
      },
      fail() {

      }
    }, () => {
      swichrequestflag = false;
    })
  },
  isVote(e) {   //是否可以投票
    let that = this, id = e.target.id;
    wx.request({
      url: that.data._build_url + 'vote/canVoteToday?actId=' + this.data.actId,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
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
  vote(id) {    //投票
    let that = this;
    wx.request({
      url: that.data._build_url + 'vote/addVoteFree?actGoodsSkuId='+ id +'&actId=' + this.data.actId,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.showToast('投票成功');
        }
      },
      fail() {

      }
    })
  },
  toBuy(e) { //买菜
    let id = e.target.id,
      shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: '../../../../pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=45&categoryId=8'
    })
  },
  drawNum() {     //可抽奖次数
    let that = this;
    wx.request({
      url: that.data._build_url + 'actLottery/get?actId=' + this.data.actId,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
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
    wx.navigateTo({
      url: '/pages/activityDetails/holdingActivity/holdingActivity'
    })
  },
  toBillboard() {      //至排行榜
    wx.navigateTo({
      url: 'billboard/billboard?actId=' + this.data.actId
    })
  },
  switchTab(e) {    //切换tab
    if (swichrequestflag) {
      return;
    }
    let id = e.target.id, branch = this.data.branch;
    this.setData({
      currCity: id,
      currBranch: branch[id][0].name,
      dishList: [],
      page: 1
    });
    this.dishL();
  },
  switchWd(e) {    //切换万达分店
    if (swichrequestflag) {
      return;
    }
    let name = e.target.dataset.name;
    this.setData({
      currBranch: name,
      dishList: [],
      page: 1
    });
    this.dishL();
  },
  onPullDownRefresh: function () {   //刷新
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: 1,
      dishList: []
    });
    this.dishL();
  },
  onReachBottom: function () { // 翻页
    if (this.data.page > this.data.pageTotal) {
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
  onShareAppMessage: function () {
    
  },
  showToast(title) {
    wx.showToast({
      title: title,
      icon: 'none'
    })
  }
})