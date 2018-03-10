var postsData = require('/../../../data/merchant-data.js')
import Api from '/../../../utils/config/api.js'
Page({
  data: {
    information: [],
    obj: {}
  },
  onLoad: function (options) {
    let that = this;
    //享7劵
    let _parms = {
      rows: '20'
    }
    Api.terraceRoll(_parms).then((res) => {
      console.log("res:", res)
      console.log("成功:", res.data.data)
      this.setData({
        information: res.data.data.list
      })
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
    console.log("ID", id)
    wx.navigateTo({
      url: '../voucher-details/voucher-details?id=' + id + "&sell=" + _sellPrice + "&inp=" + _inPrice + "&rule=" + _ruleDesc
    })
  },
  directPurchase: function () {
    let data = this.data.obj
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods?id=' + id + "&sell=" + sell + "&inp=" + _inPrice + "&rule=" + _ruleDesc
    })
  },

})