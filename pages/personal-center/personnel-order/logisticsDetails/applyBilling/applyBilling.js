// pages/personal-center/personnel-order/logisticsDetails/applyBilling/applyBilling.js
var app = getApp();
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    piao_type: 0,
    billing_type: 0,
    title: '', //发票抬头
    taxNumber: '', //抬头税号
    email: '', //邮箱
    cardNum:'',//身份证
    username:'',//个人姓名
    cansubmit: false,
    isSubmit:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if(options.price && options.orderNum && options.imageUrl){
      that.setData({
        price: options.price,
        orderNum:options.orderNum,
        imageUrl: options.imageUrl
      })
    }
    
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
    if (that.data.isSubmit){
      wx.showToast({
        title: '请勿重复提交',
        icon:'none'
      })
      return false
    }
    let data = {
      orderCode: that.data.orderNum,
      invoiceAmount: that.data.price,
      sourceType: that.data.piao_type-0+1,
      initialType: that.data.billing_type=='1'?'1':'2'
    };
    if (that.data.piao_type=='1'){
      data.orderAddressId = that.data.address.id
    }else{
      let mailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
      if (!mailReg.test(that.data.email)){
        wx.showToast({
          title: '请输入正确的邮箱',
          icon:'none'
        })
        return false
      }
      data.email = that.data.email
    }
    if (that.data.billing_type=='0'){
      data.dutyParagraph = that.data.taxNumber
      data.invoiceOpen = that.data.title
    }else{
      data.dutyParagraph = that.data.cardNum
      data.invoiceOpen = that.data.username
      
      
    }
    let value='',url='',values='';
    for(let k in data){
      value += k+'='+ data[k] + '&'
    }
    values = value.substring(0, value.length-1)
    url = that.data._build_url + 'orderInvoice/add?' + values

    wx.showLoading({
      title: '提交中...',
    })
    let urls = encodeURI(url)
    wx.request({
      url: urls,
      method:'POST',
      data:{},
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        wx.hideLoading()
        if (res.data.code == '0' && res.data.data){
            wx.showToast({
              title: '提交成功',
              icon:'none'
            })
            that.setData({
              isSubmit:true
            })
            wx.navigateTo({
              url: '/pages/personal-center/wallet/BillingRecord/BillingRecord',
            })
        }else{
          wx.showToast({
            title: '请勿重复提交',
            icon:'none'
          })
        }

      },fail(){
        wx.hideLoading()
      }
    })
  },
  primary:function(){
    let that = this;
    wx.chooseInvoiceTitle({
      success:function(res){
        console.log(res)
          that.setData({
            billing_type: res.type,
            title: res.type=='1'?'':res.title,
            username:res.type=='1'?res.title:'',
            taxNumber: res.taxNumber,
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
  setusername:function(e){
    this.setData({
      username: e.detail.value
    })
    this.detectionform();
  },
  setcardNum:function(e){
    this.setData({
      cardNum: e.detail.value
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
        if (that.data.username.length && that.data.email.length && that.data.cardNum.length) {
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
        if (that.data.username.length && that.data.haveaddress && that.data.cardNum.length) {
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