Page({

  /**
   * 页面的初始数据
   */
  data: {
    foodatas: [{ name: '日本菜', checked: false }, { name: '私房菜', checked: false }, { name: '家常菜', checked: false }, { name: '下午茶', checked: false }, { name: '创意菜', checked: false }, { name: '湖北菜', checked: false }, { name: '粉面馆', checked: false }, { name: '川菜', checked: false }, { name: '卤味', checked: false }, { name: '湘菜', checked: false }, { name: '粤菜', checked: false }, { name: '咖啡厅', checked: false }, { name: '小龙虾', checked: false }, { name: '火锅', checked: false }, { name: '海鲜', checked: false }, { name: '烧烤', checked: false }, { name: '小吃快餐', checked: false }, { name: '东南亚菜', checked: false }, { name: '江浙菜', checked: false }, { name: '韩国料理', checked: false }, { name: '西餐', checked: false }, { name: '自助餐', checked: false }, { name: '面包甜点', checked: false }, { name: '其他美食', checked: false }],
    foods:''
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
    let that = this
    wx.getStorage({
      key: 'cate',
      success: function (res) {
        let _data = that.data.foodatas

        for(let i=0;i<res.data.length;i++){
          for (let j = 0; j < _data.length;j++){
            if(res.data[i] == _data[j].name){
              _data[j].checked=true
            }
          }
        }
        that.setData({
          foodatas: _data
        })
      }
    })
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

  checkboxChange: function (e) {
    // console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    wx.setStorage({
      key: 'cate',
      data: e.detail.value,
    })
  }
})