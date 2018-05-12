import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    detailList:'',
    // money:{},
    // _opAmount:'',
    // _aAmount:'',
  },
  onLoad: function (options) {
    let _account = {
      userId: app.globalData.userInfo.userId
    }
    Api.detailList(_account).then((res) => { //查询余额
      let _data = res.data.data.list;
      let _opAmount = res.data.data.list.operateAmount;
      let _aAmount = res.data.data.list.afterAmount;
      console.log("明细:", _opAmount)
      console.log("明细:", _aAmount)
      // this.setData({
      //   detailList: _data,
      //   money: __opAmount,
      // })
    })
  },

})