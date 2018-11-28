import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Countdown from '../../../utils/Countdown.js'
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    selected: true,
    shadowFlag: true, //活动详情
    // showSkeleton:true
  },
  onLoad: function(options) {
    console.log(options)
    this.setData({
      actid: options.id
    })
    
  },
  onShow: function() {
    this.getSingleList(this.data.actid);
  },
  getSingleList: function(actid) {
    let that = this;
    wx.request({
      url: that.data._build_url + 'goodsSku/listForAct?actId=' + actid,
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        console.log(res)
        if (res.data.code == '0') {
          if (res.data.data && res.data.data.list && res.data.data.list.length) {
            let _data = res.data.data.list
            for (let i = 0; i < _data.length; i++) {
              for (let j = 0; j < _data[i].goodsPromotionRules.length; j++) {
                if (_data[i].goodsPromotionRules[j].ruleType == '7') {
                  _data[i].goodsPromotionRules[0] = _data[i].goodsPromotionRules[j]
                }
              }
              _data[i].actGoodsSkuOut.stopTime = Countdown(_data[i].actGoodsSkuOut.dueTime)
            }
            that.setData({
              dataList: _data
            })
          }
        }

      },
      fail: function(res) {

      }
    })
  },
  selected: function(e) {
    this.setData({
      selected: e.target.id == 1 ? true : false
    })
  },
  // 遮罩层显示
  showShade: function() {
    this.setData({
      shadowFlag: false
    })
  },
  // 遮罩层隐藏
  conceal: function() {
    this.setData({
      shadowFlag: true
    })
  },
  //进入详情
  hoteDils: function(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let groupid = e.currentTarget.dataset.groupid;
    console.log(id)
    wx.navigateTo({
      url: 'touristHotelDils/touristHotelDils?id=' + id + '&actid=' + that.data.actid + '&groupid=' + groupid,
    })
  },
  onShareAppMessage: function() {

  }
})