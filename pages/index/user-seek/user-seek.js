//index.js
var postsData = require('/../../../data/posts-data.js') 
var app = getApp()
Page({
  data: {
    selectHide: false,
    inputValue: '',
    getSearch: [],
    modalHidden: true
  },
  bindInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
    console.log('bindInput' + this.data.inputValue)
  },
  setSearchStorage: function () {
    let data;
    let localStorageValue = [];
    if (this.data.inputValue != '') {
      //调用API从本地缓存中获取数据
      var searchData = wx.getStorageSync('searchData') || []
      searchData.push(this.data.inputValue)
      wx.setStorageSync('searchData', searchData)
      wx.navigateTo({
        url: '../result/result'
      })
      // console.log('马上就要跳转了！')
    } else {
      console.log('空白的你搜个jb')
    }
    // this.onLoad();
  },
  modalChangeConfirm: function () {
    wx.setStorageSync('searchData', [])
    this.setData({
      modalHidden: true
    })
    wx.redirectTo({
      url: '../search/search'
    })
    // this.onLoad();

  },
  modalChangeCancel: function () {
    this.setData({
      modalHidden: true
    })
  },
  clearSearchStorage: function () {
    this.setData({
      modalHidden: false
    })
    // this.onLoad();
  },
  backHomepage:function(event){
    wx: wx.redirectTo({
      url: 'index/index',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  sweepAway: function (event) {
    wx.showModal({
      title: '温馨提示',
      content: '确定要删除历史记录?',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else {
          console.log('用户点击取消')
        }

      }
    })
  },
  onLoad: function () {
    console.log('search is onLoad');
    // 历史记录更新
    this.setData({
      Key_data: postsData.postList
    });
  },
  onShow: function () {
    var getSearch = wx.getStorageSync('searchData');
    this.setData({
      getSearch: getSearch,
      inputValue: ''
    })
    console.log('search is onshow')
  },
  onHide: function () {
    console.log('search is onHide')
    wx.redirectTo({
      url: '../search/search'
    })
  },
  bindchange: function (e) {
    console.log('bindchange')
  },
  clearInput: function () {
    this.setData({
      inputValue: ''
    })
  }
})