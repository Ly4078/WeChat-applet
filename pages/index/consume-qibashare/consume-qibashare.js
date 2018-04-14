import Api from '/../../../utils/config/api.js'
var app = getApp();
Page({
  data: {
    information: [],
    obj: {}
  },
  onLoad: function (options) {
    let that = this;
    //享7劵
    let _parms = {
      userId: app.globalData.userInfo.userId,
      rows: '20'
    }
    Api.terraceRoll(_parms).then((res) => {
      if(res.data.code ==0){
        let lists = res.data.data.list
        for(let i=0;i<lists.length;i++){
          lists[i].sellPrice = lists[i].sellPrice.toFixed(2)
          // lists[i].inPrice = lists[i].inPrice.toFixed(2)
        }
        this.setData({
          information: lists
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