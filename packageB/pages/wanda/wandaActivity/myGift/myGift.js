
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    page:1,
    loading:false,
  },
  onLoad: function (options) {
    this.getwinningList('reset');
    wx.showLoading({
      title: '加载中',
    })
  },
  onShow: function () {
    
  },
  onUnload: function () {
    
  },
  getwinningList(types) {
    let that = this
    wx.request({
      url: that.data._build_url + 'orderInfo/listFree?&rows=20&actId=42&payType=0&userId=' + wx.getStorageSync('userInfo').id + '&page=' + that.data.page,
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.hideLoading();
        wx.stopPullDownRefresh()
        console.log(res)
        if (res.data.code == '0' && res.data.data) {
          let data = res.data.data
          if (!data.list) {
            return
          }
          let arr = [];
          if(types == 'reset') {
            arr = res.data.data.list;
          }else{
            let arrs = that.data.dataList?that.data.dataList:[];
            arr = arrs.concat(res.data.data.list);
          }
          that.setData({ dataList: arr, total: Math.ceil(res.data.data.total / 20), loading:false})
         
        }
      }, fail() {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        this.setData({ loading:false})
      }
    })
  },
  onPullDownRefresh: function () {
    this.setData({
      page:1
    })
    this.getwinningList('reset');
  },
  onReachBottom: function () {
    let that = this;
    if(that.data.page >= that.data.total) {
      return false;
    }
    that.setData({
      loading:true,
      page:that.data.page+1
    },()=>{
      that.getwinningList();
    })
  },
  //立即兑换
  handexchange: function (e) {  //点击某张票券
    wx.switchTab({
      url: '/pages/personal-center/my-discount/my-discount',
      success:function(){},
      fail:function(){
        wx.navigateTo({
          url: "/pages/personal-center/my-discount/my-discount",
        })
      }
    })
    
  }
})