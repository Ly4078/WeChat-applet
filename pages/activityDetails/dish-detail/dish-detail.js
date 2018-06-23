import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    voteUserId: app.globalData.userInfo.userId,
    actId: 0,
    skuId: 0,
    picUrl: '',
    actSkuName: '',
    skuCode: '',
    voteNum: '',
    skuInfo: '',
    sellPrice: '',
    agioPrice: '',
    shopId: 0,
    shopName: '',
    address: '',
    phone: '',
    comment_list: [],
    commentTotal: 0,
    commentVal: '',
    availableNum: 0
  },
  onLoad: function (options) {
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      actId: options.actId,
      skuId: options.skuId,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond))
    });
  },
  onShow: function () {
    this.getDish();
    this.comment();
  },
  getDish() {
    let _parms = {
      actId: this.data.actId,
      skuId: this.data.skuId,
      voteUserId: this.data.voteUserId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow
    };
    Api.dishDetails(_parms).then((res) => {
      if (res.data.code == 0) {
        let data = res.data.data;
        this.setData({
          picUrl: data.picUrl,
          actSkuName: data.actSkuName,
          skuCode: data.skuCode,
          voteNum: data.voteNum,
          skuInfo: data.skuInfo,
          shopId: data.shopId,
          prSkuId: data.prSkuId,
          manAmount: data.manAmount,
          jianAmount: data.jianAmount
        });
        this.getShopInfo();
      } else {
        
      }
    })
  },
  getShopInfo() {
    let _this = this;
    wx.request({
      url: _this.data._build_url + 'shop/get/' + _this.data.shopId,
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          _this.setData({
            shopName: data.data.shopName,
            address: data.data.address,
            phone: data.data.phone
          });
        }
      }
    })
  },
  payDish() {    //购买推荐菜
    wx.navigateTo({
      url: '../../index/voucher-details/voucher-details?id=' + this.data.prSkuId + "&skuId=" + this.data.skuId + "&sell=" + this.data.jianAmount + "&inp=" + this.data.manAmount + "&actId=" + this.data.actId + "&shopId=" + this.data.shopId
    })
  },
  comment(){
    let _parms = {
      refId: this.data.skuId,
      cmtType: 6,
      zanUserId: this.data.voteUserId,
      page: 1,
      rows: 5
    };
    Api.cmtlist(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0) {
        this.setData({
          comment_list: data.data.list,
          commentTotal: data.data.total
        });
      } else {

      }
    })
  },
  showAreatext() {
    this.setData({
      isComment: !this.data.isComment
    });
  },
  getCommentVal(e) {
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function () {  //新增评论
    if (!this.data.commentVal) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 2000
      })
    } else {
      let _value = utils.utf16toEntities(this.data.commentVal)
      this.setData({
        commentVal: _value,
        isComment: false
      })
    }
    let _parms = {
      refId: this.data.skuId,
      cmtType: 6,
      content: this.data.commentVal,
      userId: this.data.voteUserId,
      userName: app.globalData.userInfo.userName,
      nickName: app.globalData.userInfo.nickName,
    }
    Api.cmtadd(_parms).then((res) => {
      console.log(res);
      if (res.data.code == 0) {
        this.comment();
      } else {
        wx.showToast({
          title: '系统繁忙,请稍后再试',
          icon: 'none'
        })
      }
    })
  },
  toMoreComment() {
    wx.navigateTo({
      url: '../../index/merchant-particulars/total-comment/total-comment?id=' + this.data.skuId + '&cmtType=6'
    })
  },
  castvote: function () {  //推荐菜投票
    let _this = this;
    let _parms = {
      actId: this.data.actId,
      userId: this.data.voteUserId,
      skuId: this.data.skuId
    }
    Api.availableVote(_parms).then((res) => {
      this.setData({
        availableNum: res.data.data.sku
      });
      if (this.data.availableNum <= 0) {
        console.log(this.data.availableNum)
        wx.showToast({
          title: '今天票数已用完,请明天再来',
          icon: 'none'
        })
        return false;
      }
      Api.voteAdd(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '投票成功',
            icon: 'none'
          })
          _this.setData({
            availableNum: _this.data.availableNum - 1,
            voteNum: _this.data.voteNum + 1
          });
        }
      });
    });
  },
  toLike: function (e) {//评论点赞
    let id = e.currentTarget.id;
    let ind = '';
    for (let i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: 4,
      userId: this.data.voteUserId,
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功'
        }, 1500)
        var comment_list = this.data.comment_list;
        comment_list[ind].isZan = 1;
        comment_list[ind].zan++;
        this.setData({
          comment_list: comment_list
        });
      }
    })
  },
  cancelLike() {
    wx.showToast({
      title: '您已经点过赞了',
      icon: 'none'
    })
  },
  dateConv: function (dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    
  },
  onShareAppMessage: function () {
    
  }
})