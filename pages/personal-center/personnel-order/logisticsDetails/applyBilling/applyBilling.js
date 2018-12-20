// pages/personal-center/personnel-order/logisticsDetails/applyBilling/applyBilling.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    piao_type: 0,
    billing_type: 0,
    title: '', //发票抬头
    taxNumber: '', //抬头税号
    email: '', //邮箱
    cansubmit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  submit:function(){
    let that = this;
    if (!that.data.cansubmit){
      wx.showToast({
        title: '请填写完整再提交',
        duration:1500,
        icon:'none'
      })
      return false
    }
  },
  primary:function(){
    let that = this;
    wx.chooseInvoiceTitle({
      success:function(res){
        console.log(res)
          that.setData({
            billing_type: res.type,
            title: res.title,
            taxNumber: res.taxNumber
          })
        that.detectionform();
      },fail:function(){

      }
    })
  },
  settitle: function(e) {
    this.setData({
      title: e.detail.value
    })
    this.detectionform();
  },
  settaxnumber: function(e) {
    this.setData({
      taxNumber: e.detail.value
    })
    this.detectionform();
  },
  setemail: function(e) {
    this.setData({
      email: e.detail.value
    })
    this.detectionform();
  },
  onShow: function() {
    let that = this;
    let address = app.globalData.Express
    if (address.address && address.mobile) {
      that.setData({
        address: address,
        haveaddress: true
      })
    } else {
      that.setData({
        haveaddress: false
      })
    }
    this.detectionform();
  },
  toaddress: function() {
    wx.navigateTo({
      url: '/pages/personal-center/shipping/shipping',
    })
  },
  radioChange: function(e) { //选择发票抬头类型 0企业 1个人
    let types = e.detail.value
    this.setData({
      billing_type: types
    })
    this.detectionform();
  },
  selectbillingtpye: function(e) { //选择发票类型 0电子 1纸质
    let types = e.currentTarget.dataset.id;
    this.setData({
      piao_type: types
    })
    console.log(e)
    if (types == '1') {
      wx.showToast({
        title: '纸质发票，货到付款',
        icon: 'none',
        duration: 2500
      })
    }
    this.detectionform();

  },
  detectionform: function() {
    let that = this;
    if (that.data.piao_type == '0') {
      if (that.data.billing_type == '0') {
        if (that.data.title.length && that.data.taxNumber.length && that.data.email.length ) {
          that.setData({
            cansubmit: true
          })
        } else {
          that.setData({
            cansubmit: false
          })
        }
      }
      if (that.data.billing_type == '1') {
        if (that.data.title.length && that.data.email.length) {
          that.setData({
            cansubmit: true
          })
        } else {
          that.setData({
            cansubmit: false
          })
        }
      }
    }
    if (that.data.piao_type == '1') {

      if (that.data.billing_type == '0') {
        if (that.data.title.length && that.data.taxNumber.length && that.data.haveaddress) {
          that.setData({
            cansubmit: true
          })
        } else {
          that.setData({
            cansubmit: false
          })
        }
      }
      if (that.data.billing_type == '1') {
        if (that.data.title.length && that.data.email.length && that.data.haveaddress) {
          that.setData({
            cansubmit: true
          })
        } else {
          that.setData({
            cansubmit: false
          })
        }
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
})