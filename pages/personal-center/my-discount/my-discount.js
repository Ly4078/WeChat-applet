import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp();
let requesting = false;
let swichrequestflag = [false, false, false];
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    ticket_list: [],
    listData:[],
    sendData:[],
    recData:[],
    page: 1,
    pxpage:1,
    recpage:1,
    sendpage:1,
    isUpdate: true,
    isball: false,
    isUsed: 0,
    ind: 0,
    currentIndex: 0,
    navbar: ['提蟹券', '优惠券', ],
    tabs: ["我的票券", "赠送记录", "领取记录"]
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...'
    })
    this.getorderCoupon(0);
    if (options.cfrom == 'reg') {
      this.setData({
        isball: true
      })
    }
  },
  navbarTap: function(e) {
    let index = e.currentTarget.dataset.idx;
    let that = this;
    this.setData({
      page: 1,
      ticket_list: [],
      currentIndex: index
    },()=>{
        if(index ==0){
          let subIndex = that.data.ind
          if (subIndex == 0) {
            if (swichrequestflag[subIndex]){
              return false
            }
            if (!that.data.listData.length>=1){
              that.getorderCoupon(0)
            }
            
          } else if (subIndex == 1) {
            if (swichrequestflag[subIndex]) {
              return false
            }
             if(!that.data.sendData.length>=1){
               that.getlistCoupon(1)
            }
            
          } else if (subIndex == 2) {
            if (swichrequestflag[subIndex]) {
              return false
            }
            if (!that.data.recData.length >= 1) {
              that.getlistCouponReceive(2)
            }
          }
        }else if(index ==1){
          if (!that.data.ticket_list.length>=1){
            if (requesting){
              return
            }
            that.getTicketList();
          }
        }
    })

  },
  handtab: function(e) {
    let index = e.currentTarget.dataset.index;
    let that = this;
    this.setData({
      ind: index
    },()=>{
        if(index == 0) {
          if (swichrequestflag[index]) {
            return false
          }
          if (!that.data.listData.length >= 1) {
            that.getorderCoupon(0)
          }
        } else if (index == 1) {
          if (swichrequestflag[index]) {
            return false
          }
          if (!that.data.sendData.length >= 1) {
            that.getlistCoupon(1)
          }
         }else if(index == 2){
          if (swichrequestflag[index]) {
            return false
          }
          if (!that.data.recData.length >= 1) {
            that.getlistCouponReceive(2)
          }
         }
    })


    this.getTicketList();

  },
  onShow: function() {

    // this.getorderCoupon(0);
  },
  onUnload() {
    wx.hideLoading();
  },
  toindex() { //去首页
    wx.switchTab({
      url: '../../index/index',
    })
  },
  findByCode: function() { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
            app.globalData.userInfo.userId = _data.id;
            for (let key in _data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = _data[key]
                }
              }
              that.getTicketList();
            };
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  //查询我的礼品券列表数据 
  getorderCoupon: function(types) {
    if (!app.globalData.userInfo.userId) {
      this.findByCode();
    } else {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        page: this.data.pxpage,
        // isUsed:0,
        rows: 10
      };
      if (this.data.pxpage == 1) {
        this.setData({
          listData: []
        })
      }
      swichrequestflag[types] = true
      Api.orderCoupon(_parms).then((res) => {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let _data = this.data.pxpage == 1 ? [] : this.data.listData,
            _list = res.data.data.list;
          if (_list && _list.length > 0) {
            for (let i = 0; i < _list.length; i++) {
              _list[i].sku = "公" + _list[i].maleWeight + " 母" + _list[i].femaleWeight + " 4对 " + _list[i].styleName + " | " + _list[i].otherMarkerPrice + "型";
              if (_list[i].ownId) {
                if (_list[i].ownId != app.globalData.userInfo.userId) {
                  _list[i].isUsed = 1;
                }
              }
              // _data.push(_list[i]);
            }
            this.setData({
              listData: _data.concat(_list),
              pageTotal: Math.ceil(res.data.data.total / 10),
              loading: false
            }, () => {
              wx.hideLoading();
            })
          } else {
            this.setData({
              loading: false
            })
            wx.hideLoading();
          }
          swichrequestflag[types] = false
        }
        this.setData({
          loading: false
        })
      }, () => {
        wx.hideLoading();
        this.setData({
          loading: false
        })
        swichrequestflag[types] = false
      })
    }
  },
  // 查询提蟹券赠送记录
  getlistCoupon: function(types) {
    if (!app.globalData.userInfo.userId) {
      this.findByCode();
      return
    }
    let _parms = {},
      that = this;
    _parms = {
      row: 10
    }, that = this;
    _parms.page = this.data.sendpage;
    _parms.sendUserId = app.globalData.userInfo.userId;
    swichrequestflag[types] = true
    Api.listCoupon(_parms).then((res) => {
      wx.stopPullDownRefresh();
      if (res.data.code == 0) {
        let _lists = res.data.data.list;
        if (_lists && _lists.length > 0) {
          for (let i = 0; i < _lists.length; i++) {
            if (_lists[i].receiveUserName) {
              _lists[i].receiveUserName = _lists[i].receiveUserName.substr(0, 3) + "****" + _lists[i].receiveUserName.substr(7);
            }
            if (_lists[i].sendUserName) {
              _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
            }
            // _sendData.push(_lists[i]);

          }
          let _sendData = this.data.sendpage == 1 ? [] : this.data.sendData;


          that.setData({
            sendData: _sendData.concat(_lists),
            sendTotal: Math.ceil(res.data.data.total / 10),
            loading: false

          }, () => {
            wx.hideLoading();
          })
        } else {
          wx.hideLoading();
          this.setData({
            loading: false
          })
        }
        swichrequestflag[types] = false
      }
      this.setData({
        loading: false
      })
    }, () => {
      wx.hideLoading();
      this.setData({
        loading: false
      })
      swichrequestflag[types] = false
    })
  },
  getlistCouponReceive: function(types) {
    if (!app.globalData.userInfo.userId) {
      this.findByCode();
      return
    }
    let _parms = {}, that = this;
    _parms = {
      row: 10,
      page: this.data.recpage,
      receiveUserId: app.globalData.userInfo.userId
    };

    swichrequestflag[types] = true
    Api.listCoupon(_parms).then((res) => {
      wx.stopPullDownRefresh();
      if (res.data.code == 0) {
        let _lists = res.data.data.list;
        if (_lists && _lists.length > 0) {
          for (let i = 0; i < _lists.length; i++) {
            if (_lists[i].receiveUserName) {
              _lists[i].receiveUserName = _lists[i].receiveUserName.substr(0, 3) + "****" + _lists[i].receiveUserName.substr(7);
            }
            if (_lists[i].sendUserName) {
              _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
            }
          }
          let _recData = this.data.recpage == 1 ? [] : this.data.recData;
          that.setData({
            recData: _recData.concat(_lists),
            recTotal: Math.ceil(res.data.data.total / 10),
            loading: false
          }, () => {
            wx.hideLoading();
          })
        } else {
          this.setData({
            loading: false
          })
          wx.hideLoading();
        }
        swichrequestflag[types] = false
      }
      this.setData({
        loading: false
      })

    }, () => {
      this.setData({
        loading: false
      })
      wx.hideLoading();
      swichrequestflag[types] = false
    })
  },
  //获取我的票券
  getTicketList: function() {
    let that = this;
    if (!app.globalData.userInfo.userId) {
      this.findByCode();
    } else {
      requesting = true
      wx.request({
        url: that.data._build_url + 'cp/list',
        header: {
          "Authorization": app.globalData.token
        },
        data: {
          userId: app.globalData.userInfo.userId,
          isUsed: that.data.isUsed,
          page: that.data.page,
          rows: 8
        },
        success: function(res) {
          if (res.data.code == 0) {
            if (res.data.data.list != null && res.data.data.list != [] && res.data.data.list != "") {
              let ticketList = res.data.data.list,
                ticketArr = that.data.ticket_list;
              for (let i = 0; i < ticketList.length; i++) {
                let Cts = "现金",
                  Dis = '折扣';
                if (ticketList[i].skuName.indexOf(Cts) > 0) {
                  ticketList[i].cash = true
                }
                if (ticketList[i].skuName.indexOf(Dis) > 0) {
                  ticketList[i].discount = true
                }
                ticketList[i]["isDue"] = that.isDueFunc(ticketList[0].expiryDate);
                if (that.data.isUsed == 0) {
                  ticketList[i].isgq = false;
                  that.setData({
                    yesPageTotal: Math.ceil(res.data.data.total / 8)
                  })
                } else if (that.data.isUsed == 1) {
                  ticketList[i].isgq = true;
                  that.setData({
                    notPageTotal: Math.ceil(res.data.data.total / 8)
                  })
                }
                ticketArr.push(ticketList[i]);
              }
              that.setData({
                ticket_list: ticketArr,
                loading: false
              }, () => {
                requesting = false
                wx.hideLoading();
              })
            } else {
              that.setData({
                isUpdate: false,
                loading: false
              })
              requesting = false
              wx.hideLoading();
            }
          } else {
            that.setData({
              isUpdate: false,
              loading: false
            })
            requesting = false
            wx.hideLoading();
          }
          if (that.data.page == 1) {
            wx.stopPullDownRefresh();
          }
        },
        fail() {
          this.setData({
            loading: false
          })
          requesting = false
          wx.hideLoading();
        }
      })
    }
  },
  ticketType(e) { //不同类型的票券列表
    if (requesting) {
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      ticket_list: [],
      page: 1,
      isUpdate: true
    });
    this.setData({
      isUsed: e.currentTarget.id
    }, () => {
      this.getTicketList();
    });

  },
  //跳转至已过期
  toDueList: function() {
    wx.navigateTo({
      url: 'expired-ticket/expired-ticket',
    })
  },
  //用户上拉触底
  onReachBottom: function() {
    let that = this;
    let bigIndex = that.data.currentIndex //顶部tab索引
    let leftIndex = that.data.ind//提蟹券索引
    let rightIndex = that.data.isUsed//优惠券索引
    if (bigIndex ==0){//tab指向提蟹券
      if (leftIndex==0){
        if (!swichrequestflag[0] && that.data.pxpage < that.data.pageTotal){
            that.setData({
              loading: true,
              pxpage: that.data.pxpage+1
            },()=>{
              that.getorderCoupon(0)
            })
        }
      }
      if (leftIndex == 1) {
        if (!swichrequestflag[1] && that.data.sendpage < that.data.sendTotal) {
          that.setData({
            loading: true,
            sendpage: that.data.sendpage + 1
          }, () => {
            that.getlistCoupon(1)
          })
        }
      }
      if (leftIndex == 2) {
        if (!swichrequestflag[2] && that.data.recpage < that.data.recTotal) {
          that.setData({
            loading: true,
            recpage: that.data.recpage + 1
          }, () => {
            that.getlistCouponReceive(2)
          })
        }
      }

    } else if (bigIndex ==1){//tab指向优惠券
      if (requesting) {
        return;
      }
      var tabId = this.data.isUsed
      if (tabId == 0) {
        if (this.data.page >= this.data.yesPageTotal) {
          return
        }
      }
      if (tabId == 1) {
        if (this.data.page >= this.data.notPageTotal) {
          return
        }
      }
      if (this.data.isUpdate) {
        this.setData({
          page: this.data.page + 1,
          loading: true
        }, () => {
          this.getTicketList();
        });

      }
    }








    
   
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    if (requesting) {
      return;
    }
    var tabId = this.data.isUsed
    if (tabId == 0) {
      if (this.data.page >= this.data.yesPageTotal) {
        return
      }
    } else if (tabId == 1) {
      if (this.data.page >= this.data.notPageTotal) {
        return
      }
    }
    this.setData({
      ticket_list: [],
      page: 1,
      isUpdate: true
    }, () => {
      this.getTicketList();
    });

  },
  immediateUse: function(e) {
    if (this.data.isUsed == 1) {
      return false;
    }
    let soid = e.currentTarget.id,
      skuType = e.currentTarget.dataset.type,
      id = '';
    for (let i = 0; i < this.data.ticket_list.length; i++) {
      if (soid == this.data.ticket_list[i].soId) {
        id = this.data.ticket_list[i].id;
      }
    }
    wx.navigateTo({
      url: '../lelectronic-coupons/lectronic-coupons?soid=' + e.currentTarget.id + '&id=' + id + '&myCount=1' + '&skuType=' + skuType
    })
  },
  //对比时间是否过期
  isDueFunc: function(expiryDate) {
    //isDue=0 已过期 isDue=1未过期
    let currentT = new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate() + " 23:59:59",
      isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < new Date(currentT).getTime()) {
      isDue = 1;
    }
    return isDue;
  },
   //立即兑换
  redeemNow: function (e) {  //点击某张票券
    let id = e.currentTarget.id,
      _skuName = e.currentTarget.dataset.index,
      _isUsed = e.currentTarget.dataset.used,
      _type = e.currentTarget.dataset.type,
      _orderId = e.target.dataset.order;
    if (_isUsed == 0) {
      wx.navigateTo({
        url: '../../index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&skuname=' + _skuName+'&type='+_type
      })
    }
  },
  //点击购买券
  buyVoucher: function () {
    wx.navigateTo({
      url: '../../index/crabShopping/crabShopping?currentTab=0&spuval=3',
    })
  },
  //点击兑换记录
  handexchange: function () {
    wx.navigateTo({
      url: '../voucher/record/record',
    })
  }
})