import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var app = getApp();
var requestTask = false;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    showSkeleton: true,
    loading: false,
    state: [
      {
        id: 4,
        amount: 0,
        name: '已获得'
      },
      {
        id: 5,
        amount: 0,
        name: '在路上'
      },
      {
        id: 6,
        amount: 0,
        name: '已失效'
      },
    ],
    awardList: [],
    currentId: 4,
    page: 1,
    flag: true
  },
  onLoad: function (options) {
    let _this = this;
    setTimeout(() => {
      _this.setData({
        showSkeleton: false
      });
    }, 5000);
    let state = this.data.state;
    state[0].amount = options.passedAmount;
    state[1].amount = options.reviewAmount;
    state[2].amount = options.failAmount;
    this.setData({
      state: state
    });
    this.awardPage();
  },
  onShow: function () {
    
  },
  onUnload: function () {
    
  },
  awardPage() {
    wx.showLoading({
      title: '加载中...'
    })
    let _this = this;
    //type   ----  记录类型 3, 钱包明细 4，已获得，5，在路上，6，已失败
    //operateType  --- 操作类型 1支出 2收入（查询钱包明细时使用）
    requestTask = true;
    wx.request({
      url: this.data._build_url + 'account/listUserTrading?type=' + this.data.currentId + '&rows=10&page=' + this.data.page,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list != 'null') {
            let list = res.data.data.list, awardList = _this.data.awardList;
            for(let i = 0; i < list.length; i++) {
              if (list[i].user && !list[i].user.nickName) {
                let userName = list[i].user.userName;
                list[i].user.nickName = userName.substr(0, 3) + '****' + userName.substr(8);
              }
              awardList.push(list[i]);
            }
            if (list.length < 10 ) {
              _this.setData({
                flag: false
              });
            }
            _this.setData({
              awardList: awardList
            }, () => {
              requestTask = false;
            });
          } else {
            _this.setData({
              flag: false
            }, () => {
              requestTask = false;
            });
          }
          setTimeout(() => {
            _this.setData({
              showSkeleton: false,
              loading: false
            });
          }, 500);
          wx.hideLoading();
        } else {
          _this.setData({
            loading: false
          }, () => {
            requestTask = false;
            wx.hideLoading();
          });
        }
      },
      fail() {
        _this.setData({
          loading: false
        }, () => {
          requestTask = false;
          wx.hideLoading();
        });
      }
    });
  },
  navFunc(e) {
    if (requestTask) {
      return;
    }
    this.setData({
      currentId: e.currentTarget.id,
      flag: true,
      awardList: [],
      page: 1
    });
    this.awardPage();
  },
  onPullDownRefresh: function () {  //置顶
    if (requestTask) {
      return;
    }
    this.setData({
      flag: true,
      awardList: [],
      page: 1
    });
    this.awardPage();
    wx.stopPullDownRefresh();
  },
  onReachBottom: function () {  //翻页
    if (requestTask) {
      return;
    }
    if (!this.data.flag) {
      return false;
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    this.awardPage();
  }
})