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
    navList: [{
        id: '',
        name: '全部'
      },
      {
        id: '2',
        name: '转入'
      },
      {
        id: '1',
        name: '转出'
      },
    ],
    walletList: [],
    currentId: '',
    page: 1,
    flag: true
  },
  onLoad: function(options) {
    let _this = this;
    this.walletPage();
    setTimeout(() => {
      _this.setData({
        showSkeleton: false
      });
    }, 5000);
  },
  onShow: function() {

  },
  onHide: function() {

  },
  onUnload: function() {

  },
  walletPage() {
    let _this = this;
    //type   ----  记录类型 3, 钱包明细 4，已获得，5，在路上，6，已失败
    //operateType  --- 操作类型 1支出 2收入（查询钱包明细时使用）
    requestTask = true;
    wx.request({
      url: this.data._build_url + 'account/listUserTrading?type=3&operateType=' + this.data.currentId + '&rows=10&page=' + this.data.page,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list != 'null') {
            let list = res.data.data.list,
              walletList = _this.data.walletList;
            for (let i = 0; i < list.length; i++) {
              walletList.push(list[i]);
            }
            if (list.length < 10) {
              _this.setData({
                flag: false
              });
            }
            _this.setData({
              walletList: walletList,
              flag: true
            }, () => {
              requestTask = false;
            });
          } else {
            _this.setData({
              flag: false
            });
            requestTask = false;
          }
        } else {
          _this.setData({
            flag: false,
            loading: false
          }, () => {
            requestTask = false;
          });
        }
        _this.setData({
          showSkeleton: false,
          loading: false
        });
        wx.hideLoading();
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
      currentId: e.target.id,
      flag: true,
      walletList: [],
      page: 1
    });
    this.walletPage();
  },
  onPullDownRefresh: function () { //置顶
    if (requestTask) {
      return false
    }
    this.setData({
      flag: true,
      walletList: [],
      page: 1
    });
    this.walletPage();
    wx.stopPullDownRefresh();
  },
  onReachBottom: function () { //翻页
    if (requestTask) {
      return false
    }
    if (this.data.flag) {
      this.setData({
        page: this.data.page + 1,
        loading: true
      }, () => {
        this.walletPage();
      });
    }
  }
})