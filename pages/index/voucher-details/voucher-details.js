
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
    shidian:false
  },
  onLoad: function (options) {
    console.log("options:", options)
    if (options.actId) {
      this.setData({
        actId: options.actId,
        shopId: options.shopId,
        skuId: options.skuId
      });
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
  formSubmit:function(e){
    let data = this.data.obj, parameter = '',_formId = e.detail.formId;
    Public.addFormIdCache(_formId); 
    parameter = '?id=' + data.id + "&sell=" + data.sell + "&inp=" + data.inp + "&rule=" + data.rule + '&num=' + data.num + '&soid=' + data.soid;
    if (this.data.sostatus == 1) {
      parameter += '&sostatus=1'
    }
    if(this.data.actId == '37') {
      parameter += '&actId=37';
      parameter += '&shopId=' + this.data.shopId;
      parameter += '&skuId=' + this.data.skuId;
    }
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods' + parameter
    })
  },
  auto: function () {
    let data = this.data.obj, parameter = '';
    parameter = '?id=' + data.id + "&sell=" + data.sell + "&inp=" + data.inp + "&rule=" + data.rule + '&num=' + data.num + '&soid=' + data.soid;
    if (this.data.sostatus == 1) {
      parameter += '&sostatus=1'
    }
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods' + parameter
    })
  }
})