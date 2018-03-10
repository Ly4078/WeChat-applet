import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
Page({
  data: {
    userId: 1,
    _build_url: GLOBAL_API_DOMAIN
  },
  onLoad: function (options) {
    this.getShareList();
  },
  getShareList: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'fvs/list?userId=' + that.data.userId,
      success: function(res) {
        let data = res.data;
        if(data.code == 0) {
          that.setData({
            posts_key: data.data.list
          });
        }
      }
    });
  },
  enshrineXim:function(event){
    wx.navigateTo({
      url: '../../index/merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id,
    })
  }
})