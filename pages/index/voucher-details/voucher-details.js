
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
import Public from '../../../utils/public.js';
let app = getApp()
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    obj:{},
    orig:'',
    cfrom:'',
    spshopId:'',
    shidian:false
  },
  onLoad: function (options) {
    console.log("options:", options)
    // if (options.actId) {
      this.setData({
        actId: options.actId,
        shopId: options.shopId,
        skuId: options.skuId
      });
    // }
    if(options.id){
      this.getspinfo(options.id)
    }
    if (options.shidian){
      this.setData({
        shidian:true
      })
    }
    if (options.cfrom){
      this.setData({
        cfrom: options.cfrom
      })
    }else{
      options.inp = Number(options.inp)
      let _inp = options.inp.toFixed(2)
      this.setData({
        obj: options,
        sell: options.sell,
        orig: _inp
      })
      if (options.num && options.num != 'undefined' && options.num != '') {
        this.setData({
          sell: (options.sell * options.num).toFixed(2)
        })
      }
      if (options.sostatus) {
        this.setData({
          sostatus: 1
        });
      }
    }
  },
  getspinfo(_id){
    let that=this;
    let url = that.data._build_url + 'goodsSku/selectDetailBySkuIdNew?id=' +_id;
    wx.request({
      url: url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'GET',
      success: function (res) {
        console.log("fdsafaf:",res)
        if(res.data.code ==0){
          that.setData({
            spshopId: res.data.data.shopId
          })
        }
      }
    })
  },
  formSubmit:function(e){
    let data = this.data.obj, parameter = '',_formId = e.detail.formId;
    Public.addFormIdCache(_formId); 
    parameter = '?id=' + data.id + "&sellPrice=" + data.sell + "&inp=" + data.inp + "&rule=" + data.rule + '&num=1&soid=' + data.soid;
    if (this.data.sostatus == 1) {
      parameter += '&sostatus=1'
    }
    if(this.data.actId == '37') {
      parameter += '&actId=37';
      parameter += '&shopId=' + this.data.shopId;
      parameter += '&skuId=' + this.data.skuId;
    }
    console.log(this.data.shopId)
    wx.navigateTo({
      // url: '/pages/index/crabShopping/crabDetails/submitOrder/submitOrder?' + parameter
      url: '/pages/index/crabShopping/crabDetails/submitOrder/submitOrder?num=1&issku=2&flag=1&&sellPrice=' + data.sell + '&id=' + data.id + '&skuName=' + data.inp + '元现金劵&shopId=' + this.data.spshopId + '&singleType=1&cfom=candy'
    })
  }
  // auto: function () {
  //   let data = this.data.obj, parameter = '';
  //   parameter = '?id=' + data.id + "&sell=" + data.sell + "&inp=" + data.inp + "&rule=" + data.rule + '&num=' + data.num + '&soid=' + data.soid;
  //   if (this.data.sostatus == 1) {
  //     parameter += '&sostatus=1'
  //   }
  //   wx.navigateTo({
  //     url: '/pages/index/crabShopping/crabDetails/submitOrder/submitOrder?' + parameter
  //   })
  // }
})