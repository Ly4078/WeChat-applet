import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    listData:[],
    page:1,
    databack:false
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getorderCoupon();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 0
    })
    this.getorderCoupon();
  },

  onReachBottom: function () {
    this.setData({
      page: this.data.page+1
    })
    this.getorderCoupon();
  },


  //查询兑换记录列表
  getorderCoupon:function(){
    wx.showLoading({
      title: '加载中...'
    });
    let _parms = {
      changerId: app.globalData.userInfo.userId,
      browSort:1,
      page:this.data.page,
      rows:10,
      token: app.globalData.token
    };
    if (this.data.page == 1) {
      this.setData({
        listData: []
      })
    }
    Api.dhCoupon(_parms).then((res)=>{
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if(res.data.code == 0){
        let _data = this.data.listData,_list = res.data.data.list
        if (_list && _list.length>0){
          for (let i = 0; i < _list.length; i++) {
            let _arr = _list[i].goodsSkuName.split(" ");
            _list[i].p2 = _arr[1];
            _data.push(_list[i]);
          }
          this.setData({
            listData: _data,
            databack:false
          })
        }else{

        }
      }
    })
  },
  //点击某个条目
  handItem:function(e){
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../../voucher/exchangeDetails/exchangeDetails?id=' + id
    })
  }
})