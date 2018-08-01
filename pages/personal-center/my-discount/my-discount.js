
import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    ticket_list: [],
    page: 1,
    isUpdate: true,
    isball:false,
    isUsed: 0
  },
  onLoad: function (options) {
    if (options.cfrom == 'reg'){
      this.setData({
        isball:true
      })
    }
  },
  onShow: function () {
    this.getTicketList();
  },
  onHide: function () {
    this.setData({
      ticket_list: [],
      isUpdate: true,
      page: 1
    });
  },
  toactlist(){
    wx.switchTab({
      url: '../../index/index',
    })
  },
  //获取我的票券
  getTicketList: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'cp/list',
      data: {
        userId: app.globalData.userInfo.userId,
        isUsed: that.data.isUsed,
        page: that.data.page,
        rows: 8
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.hideLoading();
          if (res.data.data.list != null && res.data.data.list != [] && res.data.data.list != "") {
            let ticketList = res.data.data.list, ticketArr = that.data.ticket_list;
            for (let i = 0; i < ticketList.length; i++) {
              let Cts = "现金", Dis = '折扣';
              if (ticketList[i].skuName.indexOf(Cts) > 0) {
                ticketList[i].cash = true
              }
              if (ticketList[i].skuName.indexOf(Dis) > 0) {
                ticketList[i].discount = true
              }
              ticketList[i]["isDue"] = that.isDueFunc(ticketList[0].expiryDate);
              if (that.data.isUsed == 0){
                ticketList[i].isgq=false;
              } else if (that.data.isUsed ==1){
                ticketList[i].isgq = true;
              }
              ticketArr.push(ticketList[i]);
            }
            that.setData({
              ticket_list: ticketArr
            })
          } else {
            that.setData({
              isUpdate: false
            })
          }
        } else {
          wx.hideLoading();
          that.setData({
            isUpdate: false
          })
        }
        if (that.data.page == 1) {
          wx.stopPullDownRefresh();
        } else {
          wx.hideLoading();
        }
      }
    })
  },
  ticketType(e) {    //不同类型的票券列表
    this.setData({
      ticket_list: [],
      page: 1,
      isUpdate: true
    });
    this.setData({
      isUsed: e.currentTarget.id
    });
    this.getTicketList();
  },
  //跳转至已过期
  toDueList: function () {
    wx.navigateTo({
      url: 'expired-ticket/expired-ticket',
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (this.data.isUpdate) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.getTicketList();
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      ticket_list: [],
      page: 1,
      isUpdate: true
    });
    this.getTicketList();
  },
  immediateUse: function (e) {
    if (this.data.isUsed == 1) {
      return false;
    }
    let soid = e.currentTarget.id, id = '';
    for (let i = 0; i < this.data.ticket_list.length; i++) {
      if (soid == this.data.ticket_list[i].soId) {
        id = this.data.ticket_list[i].id;
      }
    }
    wx.navigateTo({
      url: '../lelectronic-coupons/lectronic-coupons?soid=' + e.currentTarget.id + '&id='+ id +'&myCount=1'
    })
  },
  //对比时间是否过期
  isDueFunc: function (expiryDate) {
    let currentT = new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate() + " 23:59:59",
      isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < new Date(currentT).getTime()) {
      isDue = 1;
    }
    return isDue;
  }
})