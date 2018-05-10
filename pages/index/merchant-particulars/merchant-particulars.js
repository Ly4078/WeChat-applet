import Api from '/../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    navbar: ['主页', '动态'],
    shopid: '',  //商家ID
    store_details: {},  //店铺详情
    currentTab: 0,
    commentNum: 0,    //评论数量
    isCollected: false,   //是否收藏，默认false
    isComment: false,
    store_images: '',
    merchantArt: [],   //商家动态列表
    activity: [],   //商家活动列表
    article_page: 1,
    reFresh: true,
    issnap: false,  
    ismore:false,
    isAgio:false,
    listagio:[],
    newpackage:[],
    oldpackage: []
  },
  onLoad: function (options) {
    if (options.shopName && options.shopCode) {
      let _Name = options.shopName;
      if (options.groupCode) {
        this.setData({
          _shopCode: options.groupCode
        })
      } else {
        this.setData({
          _shopCode: options.shopCode
        })
      }
      this.setData({
        _shopName: _Name,
        _actName: options.actName
      })
    }
    this.setData({
      shopid: options.shopid
    });
    this.getstoredata();
    this.selectByShopId();
    this.recommendation();
    this.isCollected();
    this.merchantArt();
    this.getpackage();
    
    // 分享功能
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) {
        // 分享成功
        // console.log('shareMenu share success')
        // console.log(res)
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    });
  },
  onShow: function () {
    this.commentList();
    if (this.data.currentTab == 1) {
      this.setData({
        merchantArt: [],   //商家动态列表
        article_page: 1,
        reFresh: true
      });
      this.merchantArt();
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function () {
    this.getstoredata();
    this.recommendation();
    this.isCollected();
    this.commentList();
  },
  getstoredata() {  //获取店铺详情数据   
    let id = this.data.shopid;
    let that = this;
    wx.request({
      url: that.data._build_url + 'shop/get/' + id,
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function (res) {
        let _data = res.data.data
        _data.popNum = utils.million(_data.popNum)
        that.setData({
          store_details: _data,
          store_images: _data.shopTopPics.length
        })
      }
    })
  },
  selectByShopId: function () {  //获取商家活动列表
    let id = this.data.shopid;
    let that = this;
    let _parms = {
      shopId: id
    }
    Api.selectByShopId(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          activity: res.data.data
        })
      }
    })
  },
  //商户动态上拉加载
  onReachBottom: function () {
    if (this.data.currentTab == 1 && this.data.reFresh) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        article_page: this.data.article_page + 1
      });
      this.merchantArt();
    }
  },
  buynow: function (ev) {  //点击立即购买
    let skuid = ev.currentTarget.id
    let _sell = '', _inp = '', _rule = ''
    for (let i = 0; i < this.data.activity.length; i++) {
      if (skuid == this.data.activity[i].skuId) {
        _sell = this.data.activity[i].sellPrice;
        _inp = this.data.activity[i].inPrice;
        _rule = this.data.activity[i].ruleDesc;
      }
    }
    wx.navigateTo({
      url: '../voucher-details/voucher-details?id=' + skuid + "&sell=" + _sell + "&inp=" + _inp + "&rule=" + _rule,
    })
  },
  //推荐菜列表
  recommendation: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/tsc',
      data: {
        shopId: that.data.shopid
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          that.setData({
            recommend_list: data.data.list
          });
        }
      }
    })
  },
  getpackage: function () {  //套餐数据
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/agioList',
      data: {
        shopId: this.data.shopid
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          that.setData({
            oldpackage: data.data.list
          });
          if (that.data.oldpackage){
            if (that.data.oldpackage.length > 2) {
              that.setData({
                ismore: true
              })
              let _arr = that.data.oldpackage.slice(0, 1);
              that.setData({
                newpackage: _arr
              })
            } else {
              that.setData({
                newpackage: that.data.oldpackage
              })
            }
          }
        }
      }
    })

    wx.request({
      url: that.data._build_url + 'sku/listForAgio',
      data: {
        userId: app.globalData.userInfo.userId
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          let _data = data.data.list[0]
          if (_data.isAgio){  //已领取
            that.setData({
              isAgio: false
            })
          }else{   //未领取
            that.setData({
              isAgio:true
            })
          }
          that.setData({
            listagio: _data
          });
        }
      }
    })
    // listForAgio
  },
  liuynChange: function (e) {
    var that = this;
    that.setData({
      llbView: true,
      pid: e.currentTarget.dataset.id,
      to_user_id: e.currentTarget.dataset.user
    })
  },
  //餐厅推荐菜
  recommendedRestaurant: function () {
    wx.navigateTo({
      url: 'recommendation/recommendation?id=' + this.data.store_details.id,
    })
  },
  //活动点赞
  storeActivity: function () {
    wx.navigateTo({
      url: '../../activityDetails/hot-activity/hot-activity'
    })
  },
  //商家动态
  merchantArt: function () {
    let that = this,
      _parms = {
        shopId: this.data.shopid,
        page: this.data.article_page,
        rows: 5
      }
    Api.myArticleList(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading();
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let _data = data.data.list, articleList = this.data.merchantArt;
        for (let i = 0; i < _data.length; i++) {
          _data[i].timeDiffrence = utils.timeDiffrence(data.currentTime, _data[i].updateTime, _data[i].createTime)
          articleList.push(_data[i]);
        }
        that.setData({
          merchantArt: articleList
        });

      } else {
        wx.hideLoading();
        that.setData({
          reFresh: false
        });
        if (that.data.article_page != 1) {
          wx.showToast({
            title: data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  //跳转至文章详情
  toArticleInfo: function (e) {
    const id = e.currentTarget.id
    let _data = this.data.merchantArt
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan
      }
    }
    wx.navigateTo({
      url: '/pages/discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
    })
  },
  //分享给好友
  onShareAppMessage: function () {
    return {
      title: this.data.store_details.shopName,
      path: '/pages/index/merchant-particulars/merchant-particulars?shopid=' + this.data.shopid,
      imageUrl: this.data.store_details.logoUrl,
      success: function (res) {
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function (res) { console.log(res) },
          fail: function (res) { console.log(res) },
          complete: function (res) { console.log(res) }
        })
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    }
  },
  // 电话号码功能
  calling: function () {
    let that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.store_details.phone ? that.data.store_details.phone : that.data.store_details.mobile,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  moreImages: function (event) {
    wx.navigateTo({
      url: 'preview-picture/preview-picture?id=' + this.data.store_details.id,
    })
  },
  //腾讯地图
  TencentMap: function (event) {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var storeDetails = that.data.store_details
        wx.openLocation({
          longitude: storeDetails.locationX,
          latitude: storeDetails.locationY,
          scale: 18,
          name: storeDetails.shopName,
          address: storeDetails.address,
          success: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  // tab栏
  navbarTap: function (e) {
    console.log(e.currentTarget.dataset.idx)
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  //评论列表
  commentList: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'cmt/list',
      data: {
        refId: that.data.shopid,
        cmtType: 5,
        zanUserId: app.globalData.userInfo.userId,
        page: 1,
        rows: 5
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0 && data.data.list != null && data.data.list != "") {
          if (res.data.code == 0) {
            let _data = res.data.data.list
            let reg = /^1[34578][0-9]{9}$/;
            for (let i = 0; i < _data.length; i++) {
              _data[i].zan = utils.million(_data[i].zan)
              _data[i].content = utils.uncodeUtf16(_data[i].content)
              if (reg.test(_data[i].nickName)) {
                _data[i].nickName = _data[i].nickName.substr(0, 3) + "****" + _data[i].nickName.substr(7);

              }
            }

            that.setData({
              comment_list: _data
            })
          }
          that.setData({
            commentNum: res.data.data.total
          })
          wx.stopPullDownRefresh();
        }
      }
    })
  },
  //跳转至所有评论
  jumpTotalComment: function () {
    let that = this;
    wx.navigateTo({
      url: 'total-comment/total-comment?id=' + that.data.shopid + '&cmtType=5'
    })
  },
  //评论点赞
  toLike: function (event) {
    let that = this
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let id = event.currentTarget.id, index = "";
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/add?refId=' + id + '&type=4&userId=' + app.globalData.userInfo.userId,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            mask: true,
            icon: 'none',
            title: '点赞成功'
          }, 1500)
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 1;
          comment_list[index].zan++;
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  //取消点赞
  cancelLike: function (event) {
    let that = this,
      id = event.currentTarget.id,
      cmtType = "",
      index = "";
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/delete?refId=' + id + '&type=4&userId=' + app.globalData.userInfo.userId,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            mask: true,
            icon: 'none',
            title: '已取消'
          }, 1500)
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 0;
          comment_list[index].zan == 0 ? comment_list[index].zan : comment_list[index].zan--;
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  //查询是否收藏
  isCollected: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'fvs/isCollected?userId=' + app.globalData.userInfo.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function (res) {
        const data = res.data;
        if (data.code == 0) {
          that.setData({
            isCollected: data.data
          })

        }
      }
    })
  },
  //收藏
  onCollect: function (event) {
    let that = this;
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.request({
      url: that.data._build_url + 'fvs/add?userId=' + app.globalData.userInfo.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            isCollected: !that.data.isCollected
          })
          wx.showToast({
            mask: true,
            icon: 'none',
            title: "收藏成功"
          }, 1500)
        }
      }
    })
  },
  //取消收藏
  cancelCollect: function () {
    let that = this;
    if (app.globalData.userInfo.mobile == 'a' || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.request({
      url: that.data._build_url + 'fvs/delete?userId=' + app.globalData.userInfo.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            isCollected: !that.data.isCollected
          })
          wx.showToast({
            mask: true,
            icon: 'none',
            title: "已取消"
          }, 1500)
        }
      }
    })
  },
  //显示发表评论框
  showAreatext: function () {
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    this.setData({
      isComment: true
    })
  },
  //获取评论输入框
  getCommentVal: function (e) {
    this.setData({
      commentVal: e.detail.value
    })
  },
  //发表评论
  sendComment: function (e) {
    let that = this;
    if (this.data.commentVal == "" || this.data.commentVal == undefined) {
      wx.showToast({
        mask: true,
        title: '请先输入评论',
        icon: 'none'
      }, 1500)
    } else {
      let content = utils.utf16toEntities(that.data.commentVal);
      let _parms = {
        refId: that.data.shopid,
        cmtType: '5',
        content: content,
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        nickName: app.globalData.userInfo.nickName
      }
      Api.cmtadd(_parms).then((res) => {
        if (res.data.code == 0) {
          that.setData({
            isComment: false,
            commentVal: ""
          })
          that.commentList()
        }
      })
    }
  },
  onShareAppMessage: function (res) {
    return {
      title: this.data.store_details.shopName,
      path: '',
      imageUrl: '',
      success: function (res) {
        // 转发成功
        // console.log("res:", res)
      },
      fail: function (res) {
        // 转发失败
        console.log("res:", res)
      }
    }
  },
  closetel: function () {
    this.setData({
      issnap: false
    })
  },
  receive: function () {
    let that = this;

    if (!this.data.isAgio){
      wx.navigateTo({
        url: '../../personal-center/my-discount/my-discount',
      })
    }else{
      let _parms = {
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        payType: '1',
        skuId: this.data.listagio.id,
        skuNum: '1'
      }
      Api.freeOrderForAgio(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功！',
            mask: 'true',
            icon: 'none',
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message,
            mask: 'true',
            icon: 'none',
          }, 1500)
        }
      })
    }
    
  },
  moreinfo: function (e) {
    let _id = e.currentTarget.id;
    wx.navigateTo({
      url: './coupon_details/coupon_details?id=' + _id + '&shopid=' + this.data.shopid,
    })
  },
  clickmore: function () {
    this.setData({
      ismore: !this.data.ismore,
      newpackage: []
    })
    let arr = this.data.oldpackage
    if (this.data.ismore) {
      arr = arr.slice(0, 1);
      this.setData({
        newpackage: arr
      })
    } else {
      this.setData({
        newpackage: arr
      })
    }
  },
  gotouse: function () {
    wx.navigateTo({
      url: '../voucher-details/voucher-details?cfrom=pack',
    })
  }
})
