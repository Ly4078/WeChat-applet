import Api from '../../../utils/config/api.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  getData: function () {
    let _parms = {}
    Api.shoplist(_parms).then((res) => {
      this.setData({
        posts_key: res.data.data.list
      });
    })
  },
  //获取搜索框内的值
  onInputText: function(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  onSearchInp: function () {
    let _parms = {
      searchKey: this.data.searchValue
    }
    Api.shoplist(_parms).then((res) => {
      this.setData({
        posts_key: res.data.data.list
      });
    })
  },
  //点击列表跳转详情
  onTouchItem: function(event) {
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id,
    })
  }
})