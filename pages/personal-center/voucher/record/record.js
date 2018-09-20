Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData:[
      {
        imgUrl:'https://xqmp4-1256079679.file.myqcloud.com/text_504941838655318092.png',
        skuName:'经典款 礼品卡',
        info:'阳澄湖大闸蟹 4.0两公3.0两母 4对8只',
        date:'2018-12-12 12:23',
        stast:'已发货',
        id:'1'
      }, {
        imgUrl: 'https://xqmp4-1256079679.file.myqcloud.com/text_504941838655318092.png',
        skuName: '经典款 礼品卡',
        info: '阳澄湖大闸蟹 4.0两公3.0两母 4对8只',
        date: '2018-12-12 12:23',
        stast: '已发货',
        id: '2'
      }, {
        imgUrl: 'https://xqmp4-1256079679.file.myqcloud.com/text_504941838655318092.png',
        skuName: '经典款 礼品卡',
        info: '阳澄湖大闸蟹 4.0两公3.0两母 4对8只',
        date: '2018-12-12 12:23',
        stast: '未发货',
        id: '3'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  //点击某个条目
  handItem:function(e){
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../../voucher/exchangeDetails/exchangeDetails?id='+id,
    })
  }
})