import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    items: [],
    otherMsg:'',
    msg:'',

    isCheck:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderNumber = options.orderNumber;

    if (!orderNumber){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '参数错误',
        success(res) {
          if (res.confirm) {
            wx.navigateBack({
              delta:1
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      this.setData({
        orderNumber
      })
    }
    this.getData();
  },
  submit:function(){
    let that = this;
    let token = wx.getStorageSync("token");
    let msg = that.data.msg;
    let orderNumber = that.data.orderNumber;
    let otherMsg = that.data.otherMsg;
    // let data = {
    //   applyReason: msg,
    //   otherReason: otherMsg,
    //   type: 1,//代表小程序提交申请
    //   orderType: 2,
    //   outTradeNo: 17227054153
    // };
    
    let url = "payRefund/addApplication?type=1&orderType=2&outTradeNo=" + orderNumber+"&otherReason=" + otherMsg +"&applyReason="+msg;
    wx.showLoading({
      title: '提交中...',
    })
    if (that.data.isCheck){
      wx.request({
        url: that.data._build_url + encodeURI(url),
        header: {
          "Authorization": token
        },
        method: 'POST',
        success: function (res) {
          console.log('res',res)
          if(res.data.code==0){
            wx.hideLoading()
              wx.showToast({
                title: '申请成功',
                icon:'success',
              })
              setTimeout(function(){
                wx.navigateBack({
                  delta:1
                })
              },1500)
          }else{
            wx.hideLoading()
            wx.showToast({
              title: res.data.message || '申请失败',
              icon: 'none',
            }) 
          }
        },
        fail: function () {
            wx.hideLoading();
            wx.showToast({
              title: '系统繁忙，提交失败',
              icon:'none'
            })
        }
      })




    }
  },
  getData:function(){
    let that = this;
    let token = wx.getStorageSync("token");
    let url = 'payRefund/listReason?page=1&row=10&type=1';
    wx.request({
      url: that.data._build_url + url,
      header: {
        "Authorization":token
      },
      method:'get',
      success:function(res){
          if(res.data.data){
            let data = res.data.data;
            if(data.list && data.list.length>=1){
              that.setData({
                items:data.list
              })
            }
          }
      },
      fail:function(){

      }
    })
  },
  setmsg:function(e){
    let text = e.detail.value.trim();
    let msg = this.data.msg
      this.setData({
        otherMsg: text,
        isCheck: text != '' || msg ?true:false
      })
  },
  radioChange:function(e){
    this.setData({
      msg:e.detail.value,
      isCheck:true
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})