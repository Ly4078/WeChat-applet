import Api from '../../../utils/config/api.js';
var app = getApp();
var requestTask = [false,false,false];
Page({
  data: {
    showSkeleton: true,
    order_list: [],
    page: 1,
    orpage:1,
    toView:'',
    reFresh: true,
    completed: true,
    isfirst: false,
    currentTab: '', // 1待支付 2 已支付 3已核销 10取消, 订单状态 1待支付 2 已支付 3已核销 10取消
    shoporderlist: [],
    logisticsList:[],//物流订单列表
    navbar: ['实物订单','票劵订单',],
    shopping: 0,
    lostr:0,
    commoditys:[
      {
        title:'全部订单',
        id:''
      },
      {
        title: '待付款',
        id: '1'
      // }, {
      //   title: '待收货',
      //   id: '2'
      }, {
        title: '已完成',
        id: '2'
      }, {
        title: '已取消',
        id: '10'
      }, {
        title: '退款',
        id: '4',
        toview:'tuikuan'
      }
    ],
    logId:'',
    elephant: 0
  },
  onLoad: function (options) {
    let that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000)
    // console.log("options:", options)
    this.setData({
      elephant: options.elephant,
      toView: options.toview ? options.toview:''
    })
    // if (options.toview){
    //   wx.setNavigationBarTitle({
    //     title: '退款/售后',
    //   })
    // }
  },
  onShow: function () {
    // this.getOrderList();
    // this.getshopOrderList();
    // this.getlogisticsList(this.data.lostr);
    // this.setData({
    //   elephant:0
    // })
    if (this.data.shopping == 0) {
      this.getlogisticsList();
    } else if (this.data.shopping == 1) {
      this.getOrderList();
      this.getshopOrderList();
    }
  },
  onHide: function () {
    requestTask = [false,false,false]
    wx.hideLoading();
    this.setData({
      order_list: [],
      shoporderlist: [],
      page: 1,
      reFresh: true,
      completed: true,
      currentTab: ''
    })
  },
  onUnload() {
    wx.hideLoading();
  },
  //切换票券订单tab
  clickTab: function (event) {
    if (requestTask[1] && requestTask[2]){
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      order_list: [],
      shoporderlist: [],
      page: 1,
      reFresh: true,
      completed: true,
      currentTab: event.currentTarget.dataset.current
    })
    this.getOrderList(2);
    if (this.data.currentTab == 2 || this.data.currentTab == '') {
      this.getshopOrderList(2);
    }
  },
  navbarTap: function (e) { //顶部第一级tab栏
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      page: 1,
      orpage: 1,
      shopping: e.currentTarget.dataset.idx
    })
    if (this.data.shopping == 0) {
      if (requestTask[0]){
        return
      }
      this.setData({
        logisticsList:[]
      },()=>{
        this.getlogisticsList();
      })
      
    } else if (this.data.shopping == 1) {
      if (requestTask[1] && requestTask[2]) {
        return
      }
      this.setData({
        order_list: [],
        shoporderlist: []
      })
      this.getOrderList();
      this.getshopOrderList();
    }
  },
  distributionmag: function (e) { //物流订单tab
    if (requestTask[0]){
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    let id = e.currentTarget.dataset.subid;
    this.setData({
      elephant: e.currentTarget.dataset.idx,
      orpage: 1,
      logId: id,
      lostr: id,
      logisticsList: []
    })
    this.getlogisticsList(id);
  },
  // 查询物流订单列表
  getlogisticsList:function(val){
    let that = this;
    let _parms = {
      // userId: app.globalData.userInfo.userId,
      row:10,
      page: this.data.orpage,
      token: app.globalData.token
    };
    if (val) {
      if (this.data.elephant ==4){
        _parms.otherStatus = val 
      }else{
        _parms.status = val 
      }
     
    }
    if (!val && this.data.elephant !=0){
      if (this.data.elephant == 4) {
        _parms.otherStatus = this.data.commoditys[this.data.elephant].id
      }else{
        _parms.status = this.data.commoditys[this.data.elephant].id
      }
     
    }
    requestTask[0] = true;
    Api.orderInfoList(_parms).then((res)=>{
      
      if(res.data.code == 0 ){
        // 1待付款  2待收货  3已完成 10取消，
        let _list = res.data.data.list, logistics = this.data.orpage==1?[]:this.data.logisticsList;
        if (_list && _list.length>0){
          for (let i = 0; i < _list.length; i++) {
            if (_list[i].status == 1) {
              _list[i].status2 = '待付款';
            } else if (_list[i].status == 2) {
              _list[i].status2 = '待收货';
            } else if (_list[i].status == 3) {
              _list[i].status2 = '已完成';
            } else if (_list[i].status == 10) {
              _list[i].status2 = '已取消';
            } else if (_list[i].status == 4) {
              _list[i].status2 = '退款申请中';
            } else if (_list[i].status == 5) {
              _list[i].status2 = '已退款';
            }
            _list[i].realAmount = _list[i].realAmount.toFixed(2);
            if (_list[i].orderItemOuts[0].unit == '只' || _list[i].orderItemOuts[0].unit == '斤'){
              _list[i].units="散装";
            } else if (_list[i].orderItemOuts[0].unit == '盒'){
              _list[i].units = "礼盒装";
            }
            logistics.push(_list[i]);
          }
          this.setData({
            logisticsList: logistics,
            loading: false
          },()=>{
            requestTask[0] = false;
            wx.hideLoading();
          });
        }else{
          this.setData({loading: false})
          requestTask[0] = false;
          wx.hideLoading();
        }
        setTimeout(() => {
          that.setData({
            showSkeleton: false
          })
        }, 400)
      }else{
        this.setData({ loading: false })
        requestTask[0] = false;
        wx.hideLoading();
      }
    },()=>{
      this.setData({ loading: false })
      requestTask[0] = false;
      wx.hideLoading();
    })
  },
  getOrderList: function (types) { //获取平台订单列表
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      page: this.data.page,
      rows: 8,
      soType: 1,
      token: app.globalData.token
    };
    if (this.data.currentTab) {
      if (this.data.currentTab ==4){
        _parms.otherStatus = this.data.currentTab,
          _parms.rows = 20
      }else{
        _parms.soStatus = this.data.currentTab,
          _parms.rows = 20
      }
      
    }
    if (this.data.currentTab == 1 || !this.data.currentTab) {
      _parms.rows = 20
    }
    requestTask[1] = true;
    Api.somyorder(_parms).then((res) => {
      
      let data = res.data;
      if (data.code == 0 && data.data != null && data.data != "" && data.data != []) {
        let order_list = types==2?[]:that.data.order_list;
        if (data.data.length && data.data.length > 0) {
          for (let i = 0; i < data.data.length; i++) {
            data.data[i].soAmount = data.data[i].soAmount.toFixed(2);
            data.data[i].unitPrice = data.data[i].unitPrice.toFixed(2);
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
            reFresh: true,
            loading: false
          },()=>{
            requestTask[1] = false;
            wx.hideLoading();
          });
        } else {
          this.setData({
            loading: false
          })
          requestTask[1] = false;
          wx.hideLoading();
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
        setTimeout(() => {
          that.setData({
            showSkeleton: false
          })
        }, 400)
      } else {
        that.setData({
          reFresh: false,
          loading: false
        });
        requestTask[1] = false;
        wx.hideLoading();
      }
    },()=>{
      requestTask[1] = false;
      wx.hideLoading();
      this.setData({
        loading: false
      })
    });
    if (this.data.currentTab == 2) {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        page: this.data.page,
        rows: 5,
        soStatus: 3,
        token: app.globalData.token
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
            completed: true,
            loading: false
          });
          setTimeout(() => {
            that.setData({
              showSkeleton: false
            })
          }, 400)
        } else {
          that.setData({
            completed: false,
            loading: false
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
  getshopOrderList: function (types) { //获取商家订单列表
    let that = this;


    if (this.data.currentTab == 2 || this.data.currentTab == '') {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        page: this.data.page,
        rows: 5,
        soStatus: 2,
        token: app.globalData.token
      };
      requestTask[2] = true;
      Api.myorderForShop(_parms).then((res) => {
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let shoplist = that.data.shoporderlist, _list = res.data.data.list;
            for (let i = 0; i < _list.length; i++) {
              shoplist.push(_list[i]);
            }
            that.setData({
              shoporderlist: shoplist,
              completed: true
            });
            console.log("shoporderlist:", that.data.shoporderlist)
          }
          setTimeout(() => {
            that.setData({
              showSkeleton: false
            })
          }, 400)
        } else {
          that.setData({
            completed: false
          });
        }
      },()=>{
        requestTask[2] = false;
        wx.hideLoading();
        this.setData({
          loading: false
        })
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
      tickType = e.currentTarget.dataset.type,
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
        // "?pay=pay' + '&soid=' + soid + '&myCount=1'"
        wx.navigateTo({
          url: '../lelectronic-coupons/lectronic-coupons?pay=pay' + '&soid=' + id + '&myCount=1'
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
          url: '../lelectronic-coupons/lectronic-coupons?id=' + skuId + '&soid=' + soId + '&cfrom=ticket' + '&tickType=' + tickType
        })
      }
    }
  },
  //用户上拉触底
  onReachBottom: function () {
    if(this.data.shopping==0){
      if (requestTask[0]){
        return
      }
    }
    if (this.data.shopping == 1) {
      if (requestTask[1] && requestTask[2]) {
        return
      }
    }
    this.setData({
      page: this.data.page + 1,
      orpage:this.data.orpage +1,
      loading: true
    });
    if(this.data.shopping == 1){
      if (this.data.currentTab != 2 && this.data.reFresh) {
        wx.showLoading({
          title: '加载中..'
        })

        this.getOrderList();
        this.getshopOrderList();
      }
      if (this.data.currentTab == 2 && (this.data.reFresh || this.data.completed)) {
        wx.showLoading({
          title: '加载中..'
        })

        this.getOrderList();
        this.getshopOrderList();
      }
    }else if(this.data.shopping == 0){
      this.getlogisticsList(this.data.logId);
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function () {
    if (this.data.shopping == 1) {
        if (requestTask[1] && requestTask[2]) {
          return
        }
      this.setData({
        order_list: [],
        page: 1,
        reFresh: true,
      },()=>{
        this.getOrderList();
        this.getshopOrderList();
      });
      
    } else if (this.data.shopping == 0) {
      if (requestTask[0]) {
        return
      }
      this.setData({
        logisticsList: [],
        orpage: 1,
      },()=>{
        this.getlogisticsList(this.data.logId);
      });
      
    }
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
  },

  // 物流订单-->订单详情
  clickLogistics:function(e){
    let id = e.currentTarget.id, sendType = e.currentTarget.dataset.sendtype;
    if (sendType == 2) {
      wx.navigateTo({
        url: '../../index/crabShopping/superMarket/orderDetail/orderDetail?soId=' + id
      })
    } else {
      wx.navigateTo({
        url: 'logisticsDetails/logisticsDetails?soId=' + id
      })
    }
  }
})