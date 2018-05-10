import Api from '/../../../utils/config/api.js'
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    information: [],
    obj: {}
  },
  onLoad: function (options) { //享7劵
    let that = this
    let _parms = {
      userId: app.globalData.userInfo.userId,
      rows: '20'
    }
    Api.terraceRoll(_parms).then((res) => {
      if(res.data.code ==0){
        let lists = res.data.data.list;
        let obj = {
          sellPrice:0
        }
        lists.push(obj)
        let price = [],zero=[];
        for(let i=0;i<lists.length;i++){
          if (lists[i].sellPrice == 0){
            zero.push(lists[i])
          }else{
            lists[i].sellPrice = lists[i].sellPrice.toFixed(2);
            lists[i].sellNum = utils.million(lists[i].sellNum);
            price.push(lists[i])
          }
        }
        this.setData({
          information: price
        })
      }
    })
  },

  particulars: function (e) {
    let id = e.currentTarget.id
    let _arr = this.data.information
    let _sellPrice = '', _inPrice = '', _ruleDesc = ''
    for (let i = 0; i < _arr.length; i++) {
      if (id == _arr[i].id) {
        _sellPrice = _arr[i].sellPrice,
          _inPrice = _arr[i].inPrice,
          _ruleDesc = _arr[i].promotionRules[0].ruleDesc
      }
    }
    wx.navigateTo({
      url: '../voucher-details/voucher-details?id=' + id + "&sell=" + _sellPrice + "&inp=" + _inPrice + "&rule=" + _ruleDesc
    })
  },

  // directPurchase: function (e) {
  //   var   a =1;
  //   let data = this.data.obj
  //   let id = e.currentTarget.id
  //   let _arr = this.data.information
  //   let _sellPrice = '', _inPrice = '', _ruleDesc = ''
  //   for (let i = 0; i < _arr.length; i++) {
  //     if (id == _arr[i].id) {
  //       _sellPrice = _arr[i].sellPrice,
  //       _inPrice = _arr[i].inPrice,
  //       _ruleDesc = _arr[i].promotionRules[0].ruleDesc
  //     }
  //   }
  //   wx.navigateTo({
  //     url: '../order-for-goods/order-for-goods?id=' + id + "&sell=" + _sellPrice + "&inp=" + _inPrice + "&rule=" + _ruleDesc
  //   })
  // }

})