import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
let requesting = false;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    ticket_list: [],
    page: 1,
    isUpdate: true,
    isball: false,
    isUsed: 0
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...'
    })
    if (options.cfrom == 'reg') {
      this.setData({
        isball: true
      })
    }
  },
  onShow: function () {
    this.setData({
      page: 1
    });
    this.getTicketList();
  },
  onHide: function () {
    wx.hideLoading();
    this.setData({
      ticket_list: [],
      isUpdate: true,
      page: 1
    });
  },
  onUnload() {
    wx.hideLoading();
  },
  toactlist() {
    wx.switchTab({
      url: '../../index/index',
    })
  },

  findByCode: function () {//通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
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
  //获取我的票券
  getTicketList: function () {
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
        success: function (res) {
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
          this.setData({ loading: false})
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
  toDueList: function () {
    wx.navigateTo({
      url: 'expired-ticket/expired-ticket',
    })
  },
  //用户上拉触底
  onReachBottom: function () {
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
    if (this.data.isUpdate) {
      this.setData({
        page: this.data.page + 1,
        loading: true
      }, () => {
        this.getTicketList();
      });

    }
  },
  //用户下拉刷新
  onPullDownRefresh: function () {
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
  immediateUse: function (e) {
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
  isDueFunc: function (expiryDate) {
    //isDue=0 已过期 isDue=1未过期
    let currentT = new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate() + " 23:59:59",
      isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < new Date(currentT).getTime()) {
      isDue = 1;
    }
    return isDue;
  }
})