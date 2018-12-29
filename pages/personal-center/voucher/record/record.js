import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();
var requestTask = false;

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    listData: [],
    page: 1,
    showSkeleton: true,
    databack: false,
    loading: false,
    total: 1,
    currentTab:0,
    navList: [{
        id: 0,
        title: '全部'
      },
      {
        id: 1,
        title: '待发货'
      },
      {
        id: 2,
        title: '已发货'
      },
      {
        id: 3,
        title: '已完成'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
   
  },
  onLoad: function(options) {
    this.getorderCoupon('reset');
  },
  swichTab:function(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    that.setData({
      currentTab:id
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      page: 1
    })
    this.getorderCoupon('reset', '已刷新');
  },

  onReachBottom: function() {
    if (requestTask) {
      return false
    }
    if (this.data.page >= this.data.total) {
      wx.showToast({
        title: '没有更多数据了',
        icon: "none"
      })
      return false
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    })
    this.getorderCoupon();
  },


  //查询兑换记录列表
  getorderCoupon: function(types, msg) {
    let that = this;
    let _parms = {
      changerId: app.globalData.userInfo.userId,
      browSort: 1,
      page: that.data.page,
      rows: 10,
      token: app.globalData.token
    };
    requestTask = true
    Api.dhCoupon(_parms).then((res) => {
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if (res.data.code == 0) {
        let _data = [],
          _list = res.data.data.list
        if (_list && _list.length > 0) {
          for (let i = 0; i < _list.length; i++) {
            let _arr = _list[i].goodsSkuName.split(" ");
            _list[i].p2 = _arr[1];
            _data.push(_list[i]);
          }
          let arr = [];
          if (types == 'reset') {
            arr = _data
          } else {
            let arrs = that.data.listData ? that.data.listData : [];
            arr = arrs.concat(_data)
          }
          that.setData({
            listData: arr,
            total: Math.ceil(res.data.data.total / 10),
            databack: false,
            showSkeleton: false,
            loading: false
          })
          if (msg) {
            wx.showToast({
              title: msg,
              icon: "none"
            })
          }
          requestTask = false
        } else {
          requestTask = false
          that.setData({
            showSkeleton: false,
            loading: false
          })
        }
      } else {
        requestTask = false
        that.setData({
          showSkeleton: false,
          loading: false
        })
      }
    })
  },
  //点击某个条目
  handItem: function(e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../../voucher/exchangeDetails/exchangeDetails?id=' + id
    })
  }
})