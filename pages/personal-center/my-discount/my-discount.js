import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
import Public from '../../../utils/public.js';
import getToken from '../../../utils/getToken.js';
import getCurrentLocation from '../../../utils/getCurrentLocation.js';
var app = getApp();
let requesting = false;
let timer = null;
let swichrequestflag = [false, false, false, false]; 
let dishrequestflag = false;
Page({
  data: {
    showSkeleton: true,
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation: false,
    ticket_list: [],
    listData: [],
    sendData: [],
    recData: [],
    dishList: [],
    tipisShow: false,
    page: 1,
    pxpage: 1,
    recpage: 1,
    sendpage: 1,
    dishPage: 1,
    dishTotal: 1,
    isUpdate: true,
    isball: false,
    isUsed: 0,
    ind: 0,
    currentIndex: 0,
    navbar: ['兑换券', '优惠券'],
    tabs: ["我的票券", "已赠送", "已领取", "已失效"],
    userId: app.globalData.userInfo.userId,
    actId: 41
  },
  onLoad: function(options) {
    let that = this;
    // let selectType = options.let
    // timer = setTimeout(() => {
    //   that.setData({
    //     showSkeleton: false
    //   })
    // }, 5000)
    // if (selectType) {
    //   this.getTicketList();
    //   this.setData({ 
    //     currentIndex: 1
    //   })
    // } else {
      this.getorderCoupon(0, 'reset');
    // }
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
    if (options.cfrom == 'reg') {
      this.setData({
        isball: true
      })
    }

  },
  submit: function(e) {
    let index = e.currentTarget.dataset.idx,
      that = this,
      _formId = e.detail.formId;

    that.setData({
      page: 1,
      ticket_list: [],
      currentIndex: index
    }, () => {
        if (index == 0) {
          let subIndex = that.data.ind
          if (subIndex == 0 && subIndex == 3) {
            if (swichrequestflag[subIndex]) {
              return false
            }
            if (!that.data.listData.length >= 1) {
              that.getorderCoupon(subIndex, 'reset')
            }
            
          } else if (subIndex == 1) {
            if (swichrequestflag[subIndex]) {
              return false
            }
             if (!that.data.sendData.length >= 1) {
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
        } else if (index == 1) {
          if (!that.data.ticket_list.length >= 1) {
            if (requesting) {
              return
            }
            that.getTicketList();
          }
        }
    })
    Public.addFormIdCache(_formId); 
  },
  handtab: function(e) {
    let that = this,
      oldIndex = this.data.ind,
      index = e.currentTarget.dataset.index;
    if (swichrequestflag[oldIndex] || swichrequestflag[index]) {
      return false;
    }
    if (dishrequestflag) {
      return false;
    }
    this.setData({
      tipisShow: false,
      ind: index,
      pxpage: 1
    }, () => {
      wx.pageScrollTo({
        scrollTop: 0,
      })
      if (index == 0 || index == 3) {
        // if (!that.data.listData.length >= 1) {
        that.getorderCoupon(index, 'reset')
        wx.showLoading({
          title: '加载中',
        })
        // }


      } else if (index == 1) {
        if (!that.data.sendData.length >= 1) {
          that.getlistCoupon(1)
          wx.showLoading({
            title: '加载中',
          })
        } else {
          if (this.data.sendpage >= this.data.sendTotal) {
            this.setData({
              tipisShow: true
            });
          }
        }
      } else if (index == 2) {
        if (!that.data.recData.length >= 1) {
          that.getlistCouponReceive(2)
          wx.showLoading({
            title: '加载中',
          })
        } else {
          if (this.data.recpage >= this.data.recTotal) {
            this.setData({
              tipisShow: true
            });
          }
        }
      }
    })

  },
  onShow: function() {
    var exchangeId = app.globalData.exchangeId;
    let that = this;
    let listData = that.data.listData

    if (exchangeId && that.data.ind == '0') {
      for (let i = 0; i < listData.length; i++) {
        if (exchangeId == listData[i].id) {
          listData.splice(i, 1)
          that.setData({
            listData: listData
          })
          app.globalData.exchangeId = null;
          break
        }
      }
    }
    if (this.data.notShow) {
      this.setData({
        notShow: false
      });
      return false
    }
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    this.setData({
      ind: 0
    })
    let index = this.data.ind;
    if (index == 0 || index == 3) {
      if (swichrequestflag[index]) {
        return false
      }
      that.setData({
        pxpage: 1
      })
      that.getorderCoupon(index, 'reset')

    } else if (index == 1) {
      if (swichrequestflag[index]) {
        return false
      }
      that.setData({
        sendpage: 1,
        sendData: []
      })
      that.getlistCoupon(1)
    } else if (index == 2) {
      if (swichrequestflag[index]) {
        return false
      }
      that.setData({
        recpage: 1,
        recData: []
      })
      that.getlistCouponReceive(2)

    }


  },
  getShare() {
    let that = this;

    let piaosharelist = wx.getStorageSync('piaosharelist') || []
    if (that.data.listData.length && piaosharelist.length) {
      let listData = that.data.listData;
      for (let i = 0; i < piaosharelist.length; i++) {
        for (let j = 0; j < listData.length; j++) {
          if (listData[j].couponCode == piaosharelist[i]) {
            listData[j].isShare = true
          }
        }
      }
      that.setData({
        listData: listData
      })
    }
  },
  onUnload() {
    clearTimeout(timer);
  },
  onHide() {
    clearTimeout(timer);
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
          
            };
            that.getTicketList();
            that.getorderCoupon(that.data.ind, 'reset');
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  //查询我的礼品券列表数据 
  getorderCoupon: function(types, loadtype) {
    let that = this;
    if (!app.globalData.token) {
      this.findByCode();
    } else {
      let _parms = {
        userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : app.globalData.userInfo.id,
        page: this.data.pxpage,
        token: app.globalData.token,
        // isUsed:0,
        rows: 20
      };
      if (this.data.ind == 0) {
        _parms.isUsed = 0;
      } else if (this.data.ind == 3) {
        _parms.isUsed = 1;
      }
      swichrequestflag[types] = true;
      Api.orderCoupon(_parms).then((res) => {
        // wx.stopPullDownRefresh();
        wx.hideLoading();
        that.setData({
          loading: false
        })
        if (res.data.code == 0) {
          let _list = res.data.data.list,
          total = res.data.data.total;
          that.getPage(_parms.page, total, _parms.rows);
          if (_list && _list.length > 0) {
            for (let i = 0; i < _list.length; i++) {
              if (_list[i].maleWeight) {
                _list[i].sku = "公" + _list[i].maleWeight + " 母" + _list[i].femaleWeight + " 4对 " + _list[i].styleName + " | " + _list[i].otherMarkerPrice + "型";
              }
              if (_list[i].ownId) {
                if (_list[i].ownId != app.globalData.userInfo.userId) {
                  _list[i].isUsed = 1;
                }
              }
              _list[i]["isDue"] = that.isDueFunc(_list[i].expiryDate);
              let str = _list[i].goodsSkuName.substring(_list[i].goodsSkuName.length - 2, _list[i].goodsSkuName.length)
              if (str == '红包'){
                _list[i].redbag = true; 
              }
            }
            let arr = [];
            if (loadtype == 'reset') {
              arr = _list;
            } else {
            let arrs = that.data.listData.length ? that.data.listData : [];
              arr = arrs.concat(_list)
            }
            that.setData({
              listData: arr,
              pageTotal: Math.ceil(res.data.data.total / 20),
              loading: false
            })
          } else {
            if (loadtype == 'reset') {
              that.setData({
                listData: []
              })
            }
            that.setData({
              loading: false
            })
          }
          swichrequestflag[types] = false
          // timer = setTimeout(() => {
          //   // that.getShare();
          //   that.setData({
          //     showSkeleton: false
          //   })
          // }, 400)
        }
      }, () => {
        that.setData({
          loading: false
        })
        swichrequestflag[types] = false
      })
    }
  },
  // 查询提蟹券赠送记录
  getlistCoupon: function(types) {
    let _parms = {},
      that = this;
    if (!app.globalData.token) {
      this.findByCode();
    } else {
      _parms = {
        rows: 20
      };
      _parms.page = this.data.sendpage;
      _parms.sendUserId = app.globalData.userInfo.userId;
      swichrequestflag[types] = true
      Api.listCoupon(_parms).then((res) => {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let _lists = res.data.data.list,
            total = res.data.data.total;
          that.getPage(_parms.page, total, _parms.rows);
          if (_lists && _lists.length > 0) {
            for (let i = 0; i < _lists.length; i++) {
              if (_lists[i].receiveUserName) {
                _lists[i].receiveUserName = _lists[i].receiveUserName.substr(0, 3) + "****" + _lists[i].receiveUserName.substr(7);
              }
              if (_lists[i].sendUserName) {
                _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
              }
              let str = _lists[i].goodsSkuName.substring(_lists[i].goodsSkuName.length - 2, _lists[i].goodsSkuName.length)
              if (str == '红包') {
                _lists[i].redbag = true;
              }

            }
            let _sendData = this.data.sendpage == 1 ? [] : this.data.sendData;


            that.setData({
              sendData: _sendData.concat(_lists),
              sendTotal: Math.ceil(res.data.data.total / 20),
              loading: false

            })
          } else {
            this.setData({
              loading: false
            })
          }
          swichrequestflag[types] = false
          // timer = setTimeout(() => {
          //   that.setData({
          //     showSkeleton: false
          //   })
          // }, 400)
        }
        this.setData({
          loading: false
        })
      }, () => {
        this.setData({
          loading: false
        })
        swichrequestflag[types] = false
      })
    }
  },
  getlistCouponReceive: function(types) {
    let _parms = {},
      that = this;
    if (!app.globalData.userInfo.userId) {
      this.findByCode();
    } else {
      _parms = {
        row: 10,
        page: this.data.recpage,
        receiveUserId: app.globalData.userInfo.userId
      };
      swichrequestflag[types] = true
      Api.listCoupon(_parms).then((res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        that.setData({
          loading: false
        })
        if (res.data.code == 0) {
          let _lists = res.data.data.list,
          total = res.data.data.total;
        that.getPage(_parms.page, total, _parms.row);
          if (_lists && _lists.length > 0) {
            for (let i = 0; i < _lists.length; i++) {
              if (_lists[i].receiveUserName) {
                _lists[i].receiveUserName = _lists[i].receiveUserName.substr(0, 3) + "****" + _lists[i].receiveUserName.substr(7);
              }
              if (_lists[i].sendUserName) {
                _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
              }
              let str = _lists[i].goodsSkuName.substring(_lists[i].goodsSkuName.length - 2, _lists[i].goodsSkuName.length)
              if (str == '红包') {
                _lists[i].redbag = true;
              }
            }
            let _recData = this.data.recpage == 1 ? [] : this.data.recData;
            that.setData({
              recData: _recData.concat(_lists),
              recTotal: Math.ceil(res.data.data.total / 10),
              loading: false
            })
          } else {
            this.setData({
              loading: false
            })
          }
          swichrequestflag[types] = false
          // timer = setTimeout(() => {
          //   that.setData({
          //     showSkeleton: false
          //   })
          // }, 400)
        }
      }, () => {
        this.setData({
          loading: false
        })
        swichrequestflag[types] = false
      })
    }
  },
  //获取我的票券
  getTicketList: function() {
    let that = this;
    if (!app.globalData.token) {
      this.findByCode();
    } else {
      requesting = true;
      wx.request({
        url: that.data._build_url + 'cp/list',
        header: {
          "Authorization": app.globalData.token
        },
        data: {
          // userId: app.globalData.userInfo.userId,
          isUsed: that.data.isUsed,
          page: that.data.page,
          rows: 8
        },
        success: function(res) {
          that.setData({
            isUpdate: false,
            loading: false
          })
          if (res.data.code == 0) {
            if (res.data.data.list && res.data.data.list.length > 0) {
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
                ticketList[i]["isDue"] = that.isDueFunc(ticketList[i].expiryDate);
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
               
              })
            } else {
              that.setData({
                isUpdate: false,
                loading: false
              })
              requesting = false
            }
            // timer = setTimeout(() => {
            //   that.setData({
            //     showSkeleton: false
            //   })
            // }, 400)
          } else {
            requesting = false
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
        }
      })
    }
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
          let list = res.data.data.list, total = res.data.data.total;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
            }
            let dishList = that.data.dishPage == 1 ? [] : that.data.dishList;
            let istruenodata = that.data.dishPage == '15'?true:false;
            if (that.data.dishPage == '15'){}else{
              istruenodata = that.data.dishPage == Math.ceil(total/10)?true:false;
            }
            that.setData({
              loading: false,
              istruenodata,
              dishList: dishList.concat(list),
              dishTotal: Math.ceil(total / 10)
            });
          } else {
            that.setData({
              loading: false
            });
          }
          dishrequestflag = false;
          timer = setTimeout(() => {
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
  ticketType(e) { //不同类型的票券列表
    if (requesting) {
      return;
    }
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
    let leftIndex = that.data.ind //提蟹券索引
    let rightIndex = that.data.isUsed //优惠券索引
    if (bigIndex == 0) { //tab指向提蟹券
      if (leftIndex == 0) {
        if (!swichrequestflag[0] && that.data.pxpage < that.data.pageTotal) {
            that.setData({
              loading: true,
              pxpage: that.data.pxpage + 1
            }, () => {
              that.getorderCoupon(0)
            })
        } else {
          this.getDishPage();
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
        } else {
          this.getDishPage();
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
        } else {
          this.getDishPage();
        }
      }
      if (leftIndex == 3) {
        if (!swichrequestflag[3] && that.data.pxpage < that.data.pageTotal) {
          that.setData({
            loading: true,
            pxpage: that.data.pxpage + 1
          }, () => {
            that.getorderCoupon(3)
            // that.getTicketList();
          })
        } else {
          this.getDishPage();
        }
      }

    } else if (bigIndex == 1) { //tab指向优惠券
      if (requesting) {
        return;
      }
      var tabId = this.data.isUsed;
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
      // if (this.data.isUpdate) {
        this.setData({
          page: this.data.page + 1,
          loading: true
        }, () => {
          this.getTicketList();
        });

      // }else{
      // }
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    let that = this,
      index = this.data.ind;
    if (index == 0 || index == 3) {
      if (swichrequestflag[index]) {
        return false
      }
      that.setData({
        pxpage: 1
      })
      that.getorderCoupon(index, 'reset')
      wx.showLoading({
        title: '加载中',
      })

    } else if (index == 1) {
      if (swichrequestflag[index]) {
        return false
      }
      that.setData({
        sendpage: 1,
        sendData: []
      })
        that.getlistCoupon(1)
        wx.showLoading({
          title: '加载中',
        })
    } else if (index == 2) {
      if (swichrequestflag[index]) {
        return false
      }
      that.setData({
        recpage: 1,
        recData: []
      })
        that.getlistCouponReceive(2)
        wx.showLoading({
          title: '加载中',
        })
   
    }
  },
  getDishPage() {   //精选推荐翻页
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
  //菜品砍价详情
  candyDetails: function (e) {
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
  //对比时间是否过期
  isDueFunc: function(expiryDate) {
    //isDue=1 已过期 isDue=0未过期
    let getMonth = parseInt(new Date().getMonth()) + 1;
    let currentT = new Date().getFullYear() + '-' + getMonth + '-' + new Date().getDate() + " 23:59:59",
      isDue = 0;
    if (new Date(currentT).getTime() > new Date(expiryDate + " 23:59:59").getTime()) {
      isDue = 1;
    }
    return isDue;
  },
   //立即兑换
  redeemNow: function(e) { //点击某张票券
    let id = e.currentTarget.id,
      isDue = e.currentTarget.dataset.isdue;
      this.setData({
        notShow: true
      })
    wx.navigateTo({
      url: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&isDue=' + isDue
    })
  },
  //点击购买券
  buyVoucher: function() {
    wx.navigateTo({
      url: '../../index/crabShopping/crabShopping?currentTab=0&spuval=3',
    })
  },
  //点击兑换记录
  handexchange: function() {
    wx.navigateTo({
      url: '/pages/personal-center/voucher/record/record',
    })
  },
  openSetting() { //打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) { //打开位置授权          
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  }
})