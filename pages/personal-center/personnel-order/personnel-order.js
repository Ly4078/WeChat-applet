import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
import getToken from '../../../utils/getToken.js';
import getCurrentLocation from '../../../utils/getCurrentLocation.js';
var app = getApp();
var requestTask = [false, false, false];
var dishrequestflag = false;
let timer = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    showSkeleton: true,
    order_list: [],
    dishList: [],
    page: 1,
    orpage: 1,
    dishPage: 1,
    total: 1,
    ortotal: [0, 0, 0, 0, 0],
    dishTotal: 1,
    tipisShow: false,
    toView: '',
    reFresh: true,
    completed: true,
    isfirst: false,
    currentTab: '', // 1待支付 2 已支付 3已核销 10取消, 订单状态 1待支付 2 已支付 3已核销 10取消
    shoporderlist: [],
    logisticsList: [], //物流订单列表
    navbar: ['实物订单', '票劵订单', ],
    shopping: 0,
    lostr: 0,
    commoditys: [{
        title: '全部订单',
        id: ''
      },
      {
        title: '待付款',
        id: '1'
        // }, {
        //   title: '待收货',
        //   id: '2'
      }, {
        title: '已完成',
        id: '3'
      }, {
        title: '已取消',
        id: '10'
      }, {
        title: '退款',
        id: '4',
        toview: 'tuikuan'
      }
    ],
    logId: '',
    elephant: 0,
    actId: 41
  },
  onLoad: function(options) {
    let that = this;
    // setTimeout(() => {
    //   that.setData({
    //     showSkeleton: false
    //   })
    // }, 5000)
    this.setData({
      elephant: options.elephant ? options.elephant : 0,
      toView: options.toview ? options.toview : ''
    })
    // if (options.toview){
    //   wx.setNavigationBarTitle({
    //     title: '退款/售后',
    //   })
    // }
    if (this.data.shopping == 0) {
      this.getlogisticsList(this.data.logId, 'reset');
    } else if (this.data.shopping == 1) {
      this.getOrderList();
      this.getshopOrderList();
    }
    if (!app.globalData.token) { //获取token
      getToken(app).then(() => {
        if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
          if (that.data.dishList.length <= 0) {
            that.hotDishList(); //砍价菜精选推荐列表
          }
        } else {
          getCurrentLocation(that).then((res) => {
            if (that.data.dishList.length <= 0) {
              that.hotDishList();
            }
          })
        }
      })
    } else {
      if (that.data.dishList.length <= 0) {
        that.hotDishList();
      }
    }
  },
  onShow: function() {
    // this.getOrderList();
    // this.getshopOrderList();
    // this.getlogisticsList(this.data.lostr);
    // this.setData({
    //   elephant:0
    // })

  },
  onHide: function() {
    requestTask = [false, false, false]
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
  clickTab: function(event) {
    if (requestTask[1] && requestTask[2]) {
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
  navbarTap: function(e) { //顶部第一级tab栏
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      page: 1,
      orpage: 1,
      shopping: e.currentTarget.dataset.idx
    })
    if (this.data.shopping == 0) {
      if (requestTask[0]) {
        return
      }
      this.setData({}, () => {
        this.getlogisticsList(this.data.logId, 'reset');
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
  onPageScroll: function(e) {
    let that = this;
    let commoditys = that.data.commoditys;
    let index = that.data.elephant ? that.data.elephant : 0
    commoditys[index].scrollTop = e.scrollTop;
    if (timer) {
      clearTimeout(timer)
      timer = null
    };
    timer = setTimeout(() => {
      that.setData({
        commoditys
      })
    }, 200)

  },
  distributionmag: function(e) { //物流订单tab
    let that = this;
    if (requestTask[0]) {
      return
    }
    if (dishrequestflag) {
      return false;
    }
    let id = e.currentTarget.dataset.subid;
    this.setData({
      elephant: e.currentTarget.dataset.idx,
      orpage: 1,
      logId: id,
      lostr: id,
    })
    let commoditys = that.data.commoditys
    for (let i = 0; i < commoditys.length; i++) {
      if (that.data.elephant == i) {
        if (commoditys[i].data && commoditys[i].data.length) {
          let listLength = this.data.commoditys[this.data.elephant].data.length,
            total = this.data.ortotal[this.data.elephant];
          if (listLength >= total) {
            this.setData({
              tipisShow: true
            });
          } else {
            this.setData({
              tipisShow: false
            });
          }
          that.setData({
            logisticsList: commoditys[i].data,
            orpage: commoditys[i].page
            // total: commoditys[i].total
          })
          wx.pageScrollTo({
            scrollTop: commoditys[i].scrollTop ? commoditys[i].scrollTop : 0,
            duration: 0
          })
        } else {
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
          })
          that.getlogisticsList(id, 'reset');
          wx.showLoading({
            title: '加载中',
          })
        }
      }
    }


  },
  // 查询物流订单列表
  getlogisticsList: function(val, types) {
    let that = this;
    let _parms = {
      // userId: app.globalData.userInfo.userId,
      row: 10,
      page: this.data.orpage,
      token: app.globalData.token
    };
    if (val) {
      if (this.data.elephant == 4) {
        _parms.otherStatus = val
      } else {
        _parms.status = val
      }

    }
    if (!val && this.data.elephant != 0) {
      if (this.data.elephant == 4) {
        _parms.otherStatus = this.data.commoditys[this.data.elephant].id
      } else {
        _parms.status = this.data.commoditys[this.data.elephant].id
      }

    }
    requestTask[0] = true;
    Api.orderInfoList(_parms).then((res) => {

      if (res.data.code == 0) {
        // 1待付款  2待收货  3已完成 10取消，
        let _list = res.data.data.list,
          total = res.data.data.total,
          logistics = [];
        that.getPage(_parms.page, total, _parms.row);
        if (_list && _list.length > 0) {
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
            if (_list[i].orderItemOuts[0].unit == '只' || _list[i].orderItemOuts[0].unit == '斤') {
              _list[i].units = "散装";
            } else if (_list[i].orderItemOuts[0].unit == '盒') {
              _list[i].units = "礼盒装";
            }
            logistics.push(_list[i]);
          }
          let commoditys = that.data.commoditys;
          for (let i = 0; i < commoditys.length; i++) {
            if (i == that.data.elephant) {
              commoditys[i].data = commoditys[i].data ? commoditys[i].data : [];
              commoditys[i].data = commoditys[i].data.concat(logistics);
              commoditys[i].page = that.data.page;
              // commoditys[i].total = Math.ceil(total / _parms.row)
              that.setData({
                commoditys: commoditys
              })
            }
          }
          let arr = [];
          if (types == 'reset') {
            arr = logistics;
          } else {
            let arrs = that.data.logisticsList.length ? that.data.logisticsList : [];
            arr = arrs.concat(logistics)
          }
          let ortotal = that.data.ortotal,
            elephant = parseInt(that.data.elephant);
          ortotal[elephant] = total;
          this.setData({
            logisticsList: arr,
            ortotal: ortotal,
            loading: false
          }, () => {
            requestTask[0] = false;
            wx.hideLoading();
          });
        } else {
          if (types == 'reset') {
            this.setData({
              logisticsList: []
            })
          }
          this.setData({
            loading: false
          })
          requestTask[0] = false;
          wx.hideLoading();
        }
        // setTimeout(() => {
        //   that.setData({
        //     showSkeleton: false
        //   })
        // }, 400)
      } else {
        this.setData({
          loading: false
        })
        requestTask[0] = false;
        wx.hideLoading();
      }
    }, () => {
      this.setData({
        loading: false
      })
      requestTask[0] = false;
      wx.hideLoading();
    })
  },
  getOrderList: function(types) { //获取平台订单列表
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      page: this.data.page,
      rows: 8,
      soType: 1,
      token: app.globalData.token
    };
    if (this.data.currentTab) {
      if (this.data.currentTab == 4) {
        _parms.otherStatus = this.data.currentTab,
          _parms.rows = 20
      } else {
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
        let order_list = types == 2 ? [] : that.data.order_list;
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
            // total: Math.ceil(res.data.data.total / _parms.rows),
            order_list: order_list,
            reFresh: true,
            loading: false
          }, () => {
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
        // setTimeout(() => {
        //   that.setData({
        //     showSkeleton: false
        //   })
        // }, 400)
      } else {
        that.setData({
          reFresh: false,
          loading: false
        });
        requestTask[1] = false;
        wx.hideLoading();
      }
    }, () => {
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
            // total: Math.ceil(res.data.data.total / _parms.rows),
            order_list: order_list,
            completed: true,
            loading: false
          });
          // setTimeout(() => {
          //   that.setData({
          //     showSkeleton: false
          //   })
          // }, 400)
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
  getshopOrderList: function(types) { //获取商家订单列表
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
            let shoplist = that.data.shoporderlist,
              _list = res.data.data.list;
            for (let i = 0; i < _list.length; i++) {
              shoplist.push(_list[i]);
            }
            that.setData({
              // total: Math.ceil(res.data.data.total / _parms.rows),
              shoporderlist: shoplist,
              completed: true
            });
          }
          // setTimeout(() => {
          //   that.setData({
          //     showSkeleton: false
          //   })
          // }, 400)
        } else {
          that.setData({
            completed: false
          });
        }
      }, () => {
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
  lowerLevel: function(e) {
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
  //菜品砍价详情
  candyDetails: function(e) {
    let id = e.currentTarget.id,
      distance = e.currentTarget.dataset.distance,
      shopId = e.currentTarget.dataset.index,
      categoryId = e.currentTarget.dataset.categoryid;
    this.setData({
      notShow: true
    })
    wx.navigateTo({
      url: '../../index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=41&categoryId=' + categoryId
    })
  },
  //计算页数
  getPage(page, total, rows) {
    let pageNum = parseInt(page),
      totalNum = parseInt(total),
      rowsNum = parseInt(rows),
      pages = 0,
      tipisShow = false;
    pages = Math.ceil(totalNum / rowsNum);
    tipisShow = pageNum >= pages ? true : false;
    this.setData({
      tipisShow: tipisShow
    });
  },
  getDishPage() { //精选推荐翻页
    if (this.data.tipisShow && !dishrequestflag && this.data.dishPage < this.data.dishTotal) {
      if (this.data.dishPage >= 15) {
        return false;
      } else {
        this.setData({
          loading: true,
          dishPage: this.data.dishPage + 1
        });
        this.hotDishList();
      }
    }
  },
  //用户上拉触底
  onReachBottom: function() {
    if (this.data.shopping == 0) {
      if (requestTask[0]) {
        return
      }
      if (this.data.logisticsList.length >= this.data.ortotal[this.data.elephant]) {
        this.setData({
          tipisShow: true
        });
        this.getDishPage();
      } else {
        this.setData({
          orpage: this.data.orpage + 1,
          loading: true
        })
        this.getlogisticsList(this.data.logId);
      }
    } else if (this.data.shopping == 1) {
      if (requestTask[1] && requestTask[2]) {
        return
      }
      this.setData({
        page: this.data.page + 1,
        loading: true
      })
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
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    let that = this;
    if (this.data.shopping == 1) {
      if (requestTask[1] && requestTask[2]) {
        wx.stopPullDownRefresh()
        return
      }
      this.setData({
        order_list: [],
        page: 1,
        reFresh: true,
      }, () => {
        this.getOrderList();
        this.getshopOrderList();
      });

    } else if (this.data.shopping == 0) {
      if (requestTask[0]) {
        wx.stopPullDownRefresh()
        return
      }
      try {
        let commoditys = that.data.commoditys;
        for (let i = 0; commoditys.length; i++) {
          if (commoditys[i].data) {
            commoditys[i].data = []
            commoditys[i].scrollTop = 0;
          }
        }
        that.setData({
          commoditys
        });
      } catch (err) {

      }
      this.setData({
        orpage: 1,
      }, () => {
        this.getlogisticsList(this.data.logId, 'reset');
      });

    }
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
  },

  // 物流订单-->订单详情
  clickLogistics: function(e) {
    let id = e.currentTarget.id,
      sendType = e.currentTarget.dataset.sendtype;
    // if (sendType == 2) {
    //   wx.navigateTo({
    //     url: '../../index/crabShopping/superMarket/orderDetail/orderDetail?soId=' + id
    //   })
    // } else {
    wx.navigateTo({
      url: 'logisticsDetails/logisticsDetails?soId=' + id
    })
    // }
  },
  //精选推荐列表
  hotDishList() {
    let that = this,
      _parms = {},
      str = "",
      _url = "";
    _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 1,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      isDeleted: 0,
      actId: this.data.actId,
      page: this.data.dishPage,
      rows: 10
    };
    for (var key in _parms) {
      str += key + "=" + _parms[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    _url = that.data._build_url + 'goodsSku/listForAct?' + str;
    _url = encodeURI(_url);
    dishrequestflag = true;
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          let list = res.data.data.list,
            total = res.data.data.total;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
            }
            let dishList = that.data.dishPage == 1 ? [] : that.data.dishList;
            that.setData({
              loading: false,
              dishList: dishList.concat(list),
              dishTotal: Math.ceil(total / 10)
            });
          } else {
            that.setData({
              loading: false
            });
          }
          dishrequestflag = false;
          setTimeout(() => {
            that.setData({
              showSkeleton: false
            })
          }, 400)
        }
      },
      fail() {
        that.setData({
          loading: false
        });
        dishrequestflag = false;
      }
    }, () => {
      that.setData({
        loading: false
      });
      dishrequestflag = false;
    })
  },
  toindex() { //去首页
    wx.switchTab({
      url: '../../index/index',
    })
  }
})