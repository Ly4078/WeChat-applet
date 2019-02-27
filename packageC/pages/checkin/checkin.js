
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js');
import getToken from '../../../utils/getToken.js'
var app = getApp();
var requestTask = true;
var checkinFlag = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    rows:10,
    page:1,
    actId:41,
    ischeckin:false,
    showModal:false//规则说明
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options:",options)
    
    if (options.shareId){
      this.setData({ shareId: options.shareId })
    }
    if(app.globalData.token){
        this.getrecommenddata('reset');
      this.getData();
    }else{
      getToken(app).then( ()=>{
        this.getrecommenddata('reset');
        this.getData();
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  
  showmodal: function() {
    wx.navigateTo({
      url: '/pages/index/crabShopping/getFailure/getFailure?onekey=checkin',
    })
    // this.setData({ showModal: true })
  },
  understand:function(){
    this.setData({ showModal:false})
  },
  checkin:function(){//签到
    let that = this;
    if (that.data.ischeckin){
      wx.showToast({
        title: '已签到',
        icon:'none'
      });
      return false
    }
    if (!that.data.isready){
      return false;
    }
    if (!checkinFlag){
        return false;
    }
    console.log('签到')
    checkinFlag = false;
    wx.request({
      url: that.data._build_url + 'actRegister/add?actId=46',
      method: 'post',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        if(res.data.code=='0' && res.data.data){
          that.getData();
          wx.showModal({
            title: '提示',
            content: '签到成功，可抽奖一次。前往抽奖？',
            success(res) {
              if (res.confirm) {
                  wx.navigateTo({
                    url: '../xiangqiLottery/xiangqiLottery',
                  })
              } else if (res.cancel) {
                
              }
            }
          })
        }else{
          wx.showToast({
            title: '签到失败,即将刷新页面',
            icon:'none'
          })
          that.getData();
        }
      },
      fail:function(){

      },
      complete:function(){
        setTimeout( ()=>{
          checkinFlag = true;
        },300)
      }
    })
  },
  getData:function(){
    let that = this;
    wx.request({
      url: that.data._build_url + 'actRegister/findDetail?actId=46',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        let _str ="1.用户每天签到可增加抽现金红包1次，一个用户每天只能签到1次;[]2.参与抽奖现金红包活动所得现金红包，自动转入账户钱包余额，账户钱包余额达10元以上即可提现兑换（3月1日开放提现功能）;[]3.活动期间，若发现用户参与活动过程中存在可疑异常行为或通过非正常方式参与活动（包括但不限于恶意套现，机器作弊等），享7平台将有权取消该用户资格。"
        if(res.data.data){
          that.setData({
            isready:true,
            registerTotal: res.data.data.registerTotal,
            ischeckin: res.data.data.isRegister>0?true:false,
            // desc: res.data.data.actInfo.actDesc.split('[]')
            desc: _str.split('[]')
          })
        }
          console.log('签到信息',res)
      }
    })

  },
  getrecommenddata:function(types){
    if (!requestTask){
      return false;
    }
    let that  = this;
    requestTask  = false;
    wx.request({
      url: that.data._build_url + 'goodsSku/listForAct?shopId=0&status=1&actId=' + that.data.actId+'&rows='+that.data.rows+'&page='+that.data.page,
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
          if(res.data.code=='0' && res.data.data && res.data.data.list.length) {
            let data = res.data.data.list; 
            let arr = [];
            if (types == 'reset') {
              arr = data
            } else {
              let dataList = that.data.recommenddata ? that.data.recommenddata : [];
              arr = dataList.concat(data)
            }
            let istruenodata = that.data.page == Math.ceil(res.data.data.total/that.data.rows)?true:false
            that.setData({ 
              istruenodata,
              recommenddata: arr,
              total: Math.ceil(res.data.data.total / that.data.rows)
              })
          }
      },
      fail:function(){

      },complete:function(){
        wx.hideLoading();
        requestTask = true;
        that.setData({ loading:false})
        wx.stopPullDownRefresh()
      }
    })
  },
  //点击某个商品
  bindItem: function (e) {
    let _id = e.currentTarget.id,
      _shopid = e.currentTarget.dataset.shopid,
      _categoryid = e.currentTarget.dataset.categoryid,
      _categ = e.currentTarget.dataset.cate;
    wx.navigateTo({
      url: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + _id + '&actId=' + this.data.actId + '&categoryId=' + _categoryid + '&shopId=' + _shopid,
    })
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
    let that = this;
    that.setData({page:1})
    that.getrecommenddata('reset')
    that.getData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if (!requestTask) {
        return false;
      }
    if (that.data.total <= that.data.page){
      return false
    }
      that.setData({
        page:that.data.page+1,
        loading:true
      },()=>{
        that.getrecommenddata();
      })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
      return {
        title:'每日签到，抽现金红包',
        path:'/packageC/pages/checkin/checkin?shareId='+app.globalData.userInfo.userId ||'1'
      }
  },
  toIndex() { //跳转至首页
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
})