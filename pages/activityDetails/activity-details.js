var postsData = require('/../../data/merchant-data.js')
import Api from '/../../utils/config/api.js';  //每个有请求的JS文件都要写这个，注意路径
Page({
  data: {
    actdata:[],
    actid:''  //活动ID
  },

  onLoad: function (options) {
    let that = this;
    this.setData({
      // posts_key: postsData.postList
    });
    let _parms = {}
    Api.acttop(_parms).then((res) => {
      that.setData({
        actdata: res.data.data
      })
    })
  },
  clickVote:function(event){
    const actid = event.currentTarget.id
    wx.navigateTo({
      url: 'details-like/details-like?actid='+actid,
    })
  }
})