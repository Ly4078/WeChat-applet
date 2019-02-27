
var app = getApp();
import getToken from "../../../utils/getToken.js";
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    list:[],
    currentIndex:0,
    currentNum:1,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({ windowHeight: res.windowHeight})
      },
    })
 
  },
  onShow: function () {
    let that = this;
    if (!app.globalData.token) {
      getToken(app).then(() => {
        that.getData();
      })
    } else {
      that.getData();
    }
  },
  getData:function(e){
      let that = this;
    wx.request({
      url: this.data._build_url + 'goodsSku/listNew?page=1&rows=50&spuType=10&categoryId=71&shopId=0',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
         if(res.data.code=='0') {
           if(res.data.data.list && res.data.data.list.length) {
             that.setData({ list: res.data.data.list});
             if(that.data.currentIndex == '0') {
               that.setData({ currentRedBagData:res.data.data.list[0]})
             }
           }
         }
      },fail:function(){},
      complete:function(){

      }
    })
  },
  selectRedbag:function(e){
    let that = this,index=e.currentTarget.dataset.index;
    let data = e.currentTarget.dataset.data
    if (that.data.currentIndex == index) {
      
    } else {
      that.setData({ currentNum: 1 })
    }
    that.setData({currentIndex:index,currentRedBagData:data})
    
  },
  toPay:function(){
      let that = this;
    wx.request({
      url: this.data._build_url + 'goodsSku/selectDetailBySkuIdNew?id=' + that.data.currentRedBagData.id,
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        if(res.data.code=='0') {
          app.globalData.singleData = res.data.data;
          wx.navigateTo({
            url: '/packageA/pages/tourismAndHotel/touristHotelDils/order-for-goods/order-for-goods?number=' + that.data.currentNum,
          })
        }else{
          that.data.currentRedBagData.singleType = '1';
          app.globalData.singleData = that.data.currentRedBagData;
          wx.navigateTo({
            url: '/packageA/pages/tourismAndHotel/touristHotelDils/order-for-goods/order-for-goods?number=' + that.data.currentNum,
          })
        }
      },fail:function(){
        that.data.currentRedBagData.singleType = '1';
        app.globalData.singleData = that.data.currentRedBagData;
        wx.navigateTo({
          url: '/packageA/pages/tourismAndHotel/touristHotelDils/order-for-goods/order-for-goods?number=' + that.data.currentNum,
        })
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

  numCut:function(){
    if (this.data.currentNum == 1){
      return false
    }
    this.setData({ currentNum: this.data.currentNum-1})
  },
  numAdd: function () {
    this.setData({ currentNum: this.data.currentNum + 1 })
  },
  todetailMsg:function(){
    wx.navigateTo({
      url: '/pages/index/crabShopping/getFailure/getFailure?onekey=redbagdesc',
    })
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
      return {
        title:'发红包贺卡，送祝福',
        imageUrl:'https://xqmp4-1256079679.file.myqcloud.com/15927505686_4bc2d2fafd249a029150a4b3c0821cf.jpg'
      }
  }
})