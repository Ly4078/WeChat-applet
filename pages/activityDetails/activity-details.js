import Api from '/../../utils/config/api.js';  //每个有请求的JS文件都要写这个，注意路径
Page({
  data: {
    actdata:[],
    page:1,
    actid:''  //活动ID
  },

  onLoad: function (options) {
    
  },
  onShow:function(){
    this.data.page = 1
    this.getcatdata()
  },
  getcatdata:function(){  //获取列表数据
    let that = this;
    let _parms = {
      page:this.data.page,
      row:8
    }
    Api.acttop(_parms).then((res) => {
      let _data = this.data.actdata
      if (res.data.code == 0 && res.data.data != null && res.data.data != "" && res.data.data != []) {
        _data = _data.concat(res.data.data)
        this.setData({
          actdata: _data
        })
      }
    })
  },
  clickVote:function(event){
    const actid = event.currentTarget.id
    wx.navigateTo({
      url: 'details-like/details-like?actid='+actid,
    })
  },
  onReachBottom: function () {  //用户上拉触底
    this.setData({
      page: this.data.page + 1
    });
    this.getcatdata();
  }
})