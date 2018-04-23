import Api from '/../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    shopid:'',
    carousel:[],
    qrCodeFlag:'4.9'
  },
  onLoad: function (options) {
    this.setData({
      shopid: options.id
    });
    this.recommendation();
  },
  onShow:function(){
    this.recommendation();
  },
  onclickMore: function () {
    this.setData({
      qrCodeFlag: !that.data.qrCodeFlag
    });
  },
  recommendation: function () {
    let that = this;
    let _data = {
      shopId: this.data.shopid
    }
    Api.skutsc(_data).then((res) => {
      this.setData({
        carousel: res.data.data
      })
    })
  },
  fooddetails:function(e){
    let ind = e.currentTarget.id
    let _data = this.data.carousel.list
    let shopId = this.data.shopid
    for (let i = 0; i < _data.length;i++){
      if(ind == _data[i].id){
        wx.navigateTo({
          url: '../food-details/food-details?id=' + ind + '&shopid=' + shopId
        })
      }
    }

  }
})