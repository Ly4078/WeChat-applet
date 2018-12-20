import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Countdown from '../../../utils/Countdown.js'
import Api from '../../../utils/config/api.js';
var app = getApp();
var requestTask = false
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    selected: true,
    shadowFlag: true, //活动详情,
    page:1,
    skeletonData:['','','','',''],
    showSkeleton:true,
    total:1
  },
  onLoad: function(options) {
    this.setData({
      actid: options.id
    })
    
  },
  onShow: function() {
    this.getSingleList(this.data.actid,'reset');
  },
  getSingleList: function(actid,types) {
    let that = this;
    requestTask = true;
    wx.request({
      url: that.data._build_url + 'goodsSku/listForAct?actId=' + actid+'&row=10&page='+that.data.page,
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
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
            let arr = [];
            if (types == 'reset'){
              arr = _data
            }else{
              let dataList = that.data.dataList ? that.data.dataList:[];
              arr = dataList.concat(_data)
            }
            that.setData({
              dataList: arr,
              total: Math.ceil(res.data.data.total / 10),
              showSkeleton:false
            })
            requestTask = false
          }else{
            requestTask = false
            that.setData({ showSkeleton: false})
          }
        }else{
          requestTask = false
          that.setData({ showSkeleton: false })
        }

      },
      fail: function(res) {
        requestTask = false
        that.setData({ showSkeleton: false })
      }
    })
  },
  onReachBottom:function(){
    let that = this;
    if (requestTask){
      return false
    }
    if (this.data.total <= this.data.page) {
      return
    }
    that.setData({
      page:that.data.page+1
    },()=>{
      that.getSingleList(that.data.actid);
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
    wx.navigateTo({
      url: 'touristHotelDils/touristHotelDils?id=' + id + '&actid=' + that.data.actid + '&groupid=' + groupid,
    })
  },
  onShareAppMessage: function() {

  }
})