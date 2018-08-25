import Api from '../../../utils/config/api.js';
var app = getApp();
Page({
  data: {
    page: 1,
    currentTab: '', // 1待支付 2 已支付 3已核销 10取消, 
    order_list: []
  },
  onShow: function() {
    this.getplatformList();
  },
  onHide: function() {
    this.setData({
      order_list: [],
      page: 1,
      currentTab: ''
    })
  },
  clickTab: function(event) {  //点击tab,选择查询没有类别
    this.setData({
      order_list: [],
      shoporderlist: [],
      page: 1,
      currentTab: event.currentTarget.dataset.current
    })
    this.getplatformList();
  },
  getplatformList: function (){   // 获取订单列表
    let that = this, _parms = {}, _soStatus = this.data.currentTab;
    _parms = {
      userId: app.globalData.userInfo.userId,
      page: this.data.page,
      soStatus: _soStatus,
      rows: 10
      //soType: 1  //1平台列表   2商家列表
    }
    Api.somyorder(_parms).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0) {
        let order_list = that.data.order_list,_list = res.data.data;
        if (_list && _list.length>0){
          for (let i = 0; i < _list.length; i++) {
            order_list.push(_list[i]);
          }
          that.setData({
            order_list: order_list
          });
          console.log('order_list:', order_list)
        }
      }
    })
  },
  //点击某张券
  lowerLevel: function(e) {
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
  onReachBottom: function() {
    this.setData({
      page: this.data.page + 1
    });
    wx.showLoading({
      title: '加载中..'
    })
    this.getplatformList();
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      order_list: [],
      page: 1
    });
    this.getplatformList();
  },
  //对比时间是否过期
  isDueFunc: function(createTime) {
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