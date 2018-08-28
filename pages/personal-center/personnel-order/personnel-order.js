import Api from '../../../utils/config/api.js';
var app = getApp();
Page({
  data: {
    order_list: [],
    page: 1,
    reFresh: true,
    completed: true,
    isfirst: false,
    currentTab: '', // 1待支付 2 已支付 3已核销 10取消, 订单状态 1待支付 2 已支付 3已核销 10取消
    shoporderlist: []
  },
  onShow: function () {
    this.getOrderList();
    this.getshopOrderList();
  },
  onHide: function () {
    this.setData({
      order_list: [],
      shoporderlist: [],
      page: 1,
      reFresh: true,
      completed: true,
      currentTab: ''
    })
  },
  clickTab: function (event) {
    this.setData({
      order_list: [],
      shoporderlist: [],
      page: 1,
      reFresh: true,
      completed: true,
      currentTab: event.currentTarget.dataset.current
    })
    this.getOrderList();
    if (this.data.currentTab == 2 || this.data.currentTab == '') {
      this.getshopOrderList();
    }
  },
  getOrderList: function () { //获取平台订单列表
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      page: this.data.page,
      rows: 8,
      soType: 1
    };
    if (this.data.currentTab) {
      _parms.soStatus = this.data.currentTab,
        _parms.rows = 20
    }
    if (this.data.currentTab == 1 || !this.data.currentTab) {
      _parms.rows = 20
    }
    Api.somyorder(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data != null && data.data != "" && data.data != []) {
        let order_list = that.data.order_list;
        if (data.data.length && data.data.length > 0) {
          for (let i = 0; i < data.data.length; i++) {
            if (this.data.currentTab == 1 || !this.data.currentTab) {
              if (data.data[i].skuType != 3) {
                order_list.push(data.data[i]);
              }
            } else {
              order_list.push(data.data[i])
            }
          }
          that.setData({
            order_list: order_list,
            reFresh: true
          });
        } else {
          if (this.data.currentTab == 1) {
            if (this.data.isfirst) {
              return false
            }
            this.setData({
              page: this.data.page + 1,
              isfirst: true
            })
            this.getOrderList();
          }
        }

      } else {
        that.setData({
          reFresh: false
        });
      }
    });
    if (this.data.currentTab == 2) {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        page: this.data.page,
        rows: 5,
        soStatus: 3
      };
      Api.somyorder(_parms).then((res) => {

        let data = res.data;
        wx.hideLoading();
        if (data.code == 0 && data.data != null && data.data != "" && data.data != []) {
          let order_list = that.data.order_list;
          for (let i = 0; i < data.data.length; i++) {
            order_list.push(data.data[i]);
          }
          that.setData({
            order_list: order_list,
            completed: true
          });
        } else {
          that.setData({
            completed: false
          });
        }
      });
    }
    if (that.data.page == 1) {
      wx.stopPullDownRefresh();
    } else {
      wx.hideLoading();
    }
  },
  getshopOrderList: function () { //获取商家订单列表
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      page: this.data.page,
      rows: 8,
      soStatus: '2'
    };

    if (this.data.currentTab == 2 || this.data.currentTab == '') {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        page: this.data.page,
        rows: 5,
        soStatus: 3
      };
      Api.somyorder(_parms).then((res) => {
        let data = res.data;
        wx.hideLoading();
        if (data.code == 0 && data.data != null && data.data != "" && data.data != []) {
          let shoplist = that.data.shoporderlist;
          for (let i = 0; i < data.data.length; i++) {
            shoplist.push(data.data[i]);
          }
          that.setData({
            shoporderlist: shoplist,
            completed: true
          });
        } else {
          that.setData({
            completed: false
          });
        }
      });
    }
    if (that.data.page == 1) {
      wx.stopPullDownRefresh();
    } else {
      wx.hideLoading();
    }
  },
  //点击某张券
  lowerLevel: function (e) {
    let id = e.currentTarget.id,
      skuid = e.currentTarget.dataset.skuid,
      sostatus = e.currentTarget.dataset.sostatus,
      listArr = this.data.order_list,
      sell = "",
      inp = "",
      rule = "",
      num = "",
      soId = "",
      skuName = "",
      skutype = "",
      soid = "",
      skuId = "",
      shopId = "",
      _shopname = e.currentTarget.dataset.shopname;
    if (_shopname) { //商家订单
      if (sostatus == 2 || sostatus == 3) {
        wx.navigateTo({
          url: '../lelectronic-coupons/lectronic-coupons?pay=pay' + '&soid=' + id
        })
      } else if (sostatus == 1) {
        let shoplist = this.data.shoporderlist,
          actdata = {};
        for (let i = 0; i < shoplist.length; i++) {
          if (id = shoplist[i].id) {
            actdata = shoplist[i];
          }
        }
        wx.navigateTo({
          url: '/pages/index/merchant-particulars/paymentPay-page/paymentPay-page?shopid=' + actdata.shopId + '&soid=' + actdata.id + '&wei=wei'
        })
      }
    } else { //平台订单
      for (let i = 0; i < listArr.length; i++) {
        if (id == listArr[i].id) {
          sell = listArr[i].unitPrice,
            rule = listArr[i].ruleDesc,
            inp = parseInt(listArr[i].skuName),
            num = listArr[i].skuNum,
            soId = listArr[i].soId,
            skuName = listArr[i].skuName,
            shopId = listArr[i].shopId,
            skuId = listArr[i].skuId,
            skutype = listArr[i].skuType,
            soid = listArr[i].soId
        }
      }

      if (sostatus == 1) {
        wx.navigateTo({
          url: '/pages/index/order-for-goods/order-for-goods?id=' + skuId + '&sell=' + sell + '&inp=' + inp + '&rule=' + rule + '&num=' + num + '&sostatus=1' + '&skuName=' + skuName + "&skutype=" + skutype + '&skuId=' + skuId + '&shopId=' + shopId
        })
      } else if (sostatus == 2 || sostatus == 3) {
        wx.navigateTo({
          url: '../lelectronic-coupons/lectronic-coupons?id=' + skuId + '&soid=' + soId + '&cfrom=ticket'
        })
      }
    }
  },
  //用户上拉触底
  onReachBottom: function () {
    if (this.data.currentTab != 2 && this.data.reFresh) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.getOrderList();
      this.getshopOrderList();
    }
    if (this.data.currentTab == 2 && (this.data.reFresh || this.data.completed)) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.getOrderList();
      this.getshopOrderList();
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      order_list: [],
      page: 1,
      reFresh: true,
    });
    this.getOrderList();
    this.getshopOrderList();
  },
  //对比时间是否过期
  isDueFunc: function (createTime) {
    //isDue=0   已过期 isDue=1未过期
    createTime = createTime.replace(/\-/g, "/");
    let _createTime = new Date(createTime).getTime();
    let _endTime = _createTime + 60 * 60 * 24 * 30 * 1000,
      isDue = 0;
    if (_createTime < _endTime) {
      isDue = 1;
    }
    return isDue;
  }
})