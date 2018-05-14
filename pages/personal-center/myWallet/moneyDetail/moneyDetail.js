import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    detailList:'',
    data:[],
  },
  onLoad: function (options) {
    let _account = {
      userId: app.globalData.userInfo.userId
    }
    Api.detailList(_account).then((res) => { //查询余额
      let _data = res.data.data.list;
      console.log("明细:", _data)
      this.setData({
        data: _data,
      })
    })
  },

})