import Api from '/../../../../utils/config/api.js';
Page({
  data: {
    _shopid:'',
    _carousel:''
  },
  onLoad: function (options) {
    this.setData({
      _shopid: options.id
    });
    this.recommendation();
  },
  recommendation: function () {
    let that = this;
    let _data = {
      shopId: this.data._shopid
    }
    Api.skutsc(_data).then((res) => {
      this.setData({
        carousel: res.data.data
      })
      console.log("返回值:", res)
    })
  }
})