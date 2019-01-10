import Api from '../../../../../utils/config/api.js';
var utils = require('../../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
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
    actId: '',
    navOrder: 1,
    foodArr: [],
    voteArr: [],
    rows: 10,
    page: 1,
    foodPage: 1,
    votePage: 1
  },
  onLoad: function (options) {
    this.setData({
      actId: options.actId
    });
    this.foodsBillboard();
  },
  onShow: function () {
    
  },
  onUnload: function () {
    
  },
  foodsBillboard() {    //美食榜
    let that = this, _param = {}, str = "";
    _param = {
      actId: this.data.actId,
      rankingByVoteNum: 1,
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
        if (res.data.code == 0) {
          let list = res.data.data.list, foodArr = that.data.foodArr;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              foodArr.push(list[i]);
            }
            that.setData({
              foodArr: foodArr,
              foodPage: Math.ceil(res.data.data.total / 10)
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
  voteBillboard() {    //投票榜
    let that = this, _param = {}, str = "";
    _param = {
      actId: this.data.actId,
      page: this.data.page,
      rows: this.data.rows
    };
    for (let key in _param) {
      str += key + "=" + _param[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    swichrequestflag = true;
    wx.request({
      url: that.data._build_url + 'vote/getUserRanking?' + str,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let list = res.data.data.list, voteArr = that.data.voteArr;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              if (!list[i].user.nickName) {
                list[i].user.nickName = that.substr(list[i].user.userName);
              }
              voteArr.push(list[i]);
            }
            that.setData({
              voteArr: voteArr,
              votePage: Math.ceil(res.data.data.total / 10)
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
  switchTab(e) {
    let id = e.target.id;
    if (this.data.navOrder == id) {
      return;
    }
    this.setData({
      navOrder: id,
      foodArr: [],
      voteArr: [],
      page: 1
    });
    id == 1 ? this.foodsBillboard() : this.voteBillboard();
  },
  onPullDownRefresh: function () {   //刷新
    if (swichrequestflag) {
      return;
    }
    this.setData({
      foodArr: [],
      voteArr: [],
      page: 1
    });
    this.data.navOrder == 1 ? this.foodsBillboard() : this.voteBillboard();
  },
  onReachBottom: function () { // 翻页
    if (swichrequestflag) {
      return;
    }
    if (this.data.navOrder == 1) {
      if (this.data.page > this.data.foodPage) {
        return;
      }
      this.setData({
        page: this.data.page + 1,
        loading: true
      });
      this.foodsBillboard();
    } else if (this.data.navOrder == 2) {
      if (this.data.page > this.data.votePage) {
        return;
      }
      this.setData({
        page: this.data.page + 1,
        loading: true
      });
      this.voteBillboard();
    }
    
  },
  onShareAppMessage: function () {
    
  },
  substr(str) {
    return str.slice(0, 3) + '****' + str.slice(7);
  }
})