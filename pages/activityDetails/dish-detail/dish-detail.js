import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    // voteUserId: app.globalData.userInfo.userId
    voteUserId: 32879,
    actId: 0,
    skuId: 0,
    comment_list: [
      {
        id: 1,
        isZan: 0,
        userPic: '/images/icon/xiangqisdfe.png',
        nickName: '享七',
        zan: 6,
        content: '哈哈哈哈哈哈',
        createTime: '2018-06-15'
      },
      {
        id: 2,
        isZan: 1,
        userPic: '/images/icon/xiangqisdfe.png',
        nickName: '花花',
        zan: 6,
        content: '觉得很福建省分行的就发火就发火',
        createTime: '2018-06-15'
      }
    ]
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
    this.getDish();
  },
  onShow: function () {
    
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
      console.log(res);
      if (res.data.code == 0) {
        
      } else {
        
      }
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