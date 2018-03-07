var postsData = require('/../../../data/posts-data.js');
import Api from '/../../../utils/config/api.js'; 
var app = getApp();
Page({
  data: {
    selectHide: false,
    inputValue: '',
    getSearch: [],
    busarr:[],
    historyarr:[],
    storename:'',
    _is:true,
    modalHidden: true
  },
  onReady: function(){  //页面渲染完成   每次进行都会执行一次
    let that = this;
    wx.getStorage({
      key: 'his',
      success: function (res) {
        let _his = res.data;
        let _arr = [];
        if (_his){
          _arr = _his.split(',');
          that.setData({
            historyarr:_arr
          })
        }
      }
    })
  },
  selectAddress(){  //点击搜索按钮
    let that = this;
    let _value = this.data.storename;
    that.data.historyarr.push(_value);
    let  _str = that.data.historyarr.join(',');
    wx.setStorage({
      key: "his",
      data: _str
    })
    if(_value){
      let _parms = {
        shopName: _value
      }
      Api.shoplist(_parms).then((res) => {
        that.backHomepage();
        that.setData({
          busarr: res.data.data.list
        })
      })
    }
  },
  searchbusiness(e){  //实时获取输入框的值
    this.setData({
      storename: e.detail.value
    })
  },
  backHomepage: function () {  //取消  清空输入框
    this.setData({
      storename: ''
    })
  },
  onTouchItem: function (event) {
    var shopid = event.currentTarget.id
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + shopid,
    })
  },
  diningRoomList(e){
    let shopid = currentTarget.id;
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + shopid,
    })
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
  sweepAway: function (event) {   //点击清除
    let that = this;
    let _len = this.data.busarr.length;
    let _font ='历史记录';
    if (_len == 0){
      _font = '历史记录'
    }else{
      _font = '商家列表'
    }
    wx.showModal({
      title: '温馨提示',
      content: '确定要清除'+_font+'?',
      success: function (res) {
        if (res.confirm) {
          if(_len ==0){
            let _arr = [];
            that.setData({
              historyarr: _arr
            })
            wx.setStorage({
              key: "his",
              data: ''
            })
          }else{
            that.setData({
              busarr: []
            })
          }
        } else {
          console.log('用户点击取消');
        }
      }
    })
  },
  onLoad: function () {
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