// pages/personal-center/wallet/BillingRecord/BillingRecord.js
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var app = getApp();
var requestTask = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    initialTypes:['','个人','企业'],
    sourceTypes: ['','增值税电子发票','增值税纸质发票'],
    status:['','审核中','审核通过','审核不通过'],
    statusColor: ['', '#E6A23C', '#67C23A','#F56C6C'],
    page:1,
    dataList:[],
    showSkeleton:true,
    loading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.getData();
  },
  getData:function(e){
  
    let that = this;
    requestTask = true;
    wx.request({
      url: that.data._build_url +'orderInvoice/list?page='+that.data.page+'&row=10',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        requestTask = false
        wx.hideLoading()
          console.log(res)
          if(res.data.code=='0' && res.data.data && res.data.data.list){
            that.setData({
              dataList: that.data.dataList.concat(res.data.data.list),
              total: Math.ceil(res.data.data.total / 10),
              loading:false,
              showSkeleton:false
            })
          }else{
            that.setData({ loading: false, showSkeleton: false })
          }
      },fail(){
        wx.hideLoading();
        that.setData({ loading: false, showSkeleton:false})
        requestTask = false
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if (requestTask){
      return false;
    }
    if (that.data.page >= that.data.total){
      that.setData({
        noMore:true
      })
      wx.showToast({
        title: '没有更多数据啦~~~',
        icon:'none'
      })
      return false
    }
    that.setData({
      page:that.data.page+1,
      loading:true
    },()=>{
      that.getData();
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})