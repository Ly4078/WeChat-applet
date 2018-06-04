import Api from '/../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    selectHide: false,
    inputValue: '',
    getSearch: [],
    busarr: [],
    historyarr: [],
    storename: '',
    _is: true,
    modalHidden: true,
    timer:null
  },
  onReady: function () {  
    let that = this;
    wx.getStorage({
      key: 'his',
      success: function (res) {
        let _his = res.data;
        let _arr = [];
        if (_his) {
          _arr = _his.split(',');
          let newarr = Array.from(new Set(_arr))
          that.setData({
            historyarr: newarr
          })
        }
      }
    })
  },
  selectAddress() {  //点击搜索按钮
    let that = this;
    let _value = this.data.storename
    if (_value) {
      let _parms = {
        searchKey: _value,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
      }
      Api.shoplist(_parms).then((res) => {
        if (res.data.code == 0) {
          if (res.data.data.list != [] && res.data.data.list != '') {
            that.data.historyarr.unshift(_value);
            let _str = that.data.historyarr.join(',');
            wx.setStorage({
              key: "his",
              data: _str
            })
            // that.backHomepage();
            let busarr = this.data.busarr;
            let _data = res.data.data.list
            for (let i = 0; i < _data.length; i++) {
              _data[i].distance = utils.transformLength(_data[i].distance)
              _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
              busarr.push(_data[i])
            }
            that.setData({
              busarr: _data
            })
          } else {
            wx.showToast({
              title: '未搜索到相关信息',
              icon: 'none',
              mask: true,
              duration: 2000
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            mask: true,
            duration: 2000
          })
        }
      })
    }
  },
  searchbusiness(e) {  //实时获取输入框的值
    let _value = e.detail.value, _this = this, ms = 0, _timer = null;
    _timer = setInterval(function () {
      ms += 50;
      if (ms == 100) {
        _this.setData({
          storename: e.detail.value
        })
        _this.selectAddress();
        clearInterval(_timer);
      }
    }, 500)
    _this.setData({
      timer: _timer
    });
  },
  backHomepage: function () {  //取消  清空输入框
    this.setData({
      storename: ''
    })
    wx.switchTab({  //跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
      url: '../../index/index'
    })
  },
  clickannal: function (ev) {  //点击某个历史记录
    let _ind = ev.currentTarget.id
    let _data = this.data.historyarr
    for (let i = 0; i < _data.length; i++) {
      if (_ind == i) {
        this.setData({
          storename: _data[i]
        })
        this.selectAddress()
      }
    }
  },
  onTouchItem: function (event) {
    var shopid = event.currentTarget.id
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + shopid,
    })
  },
  diningRoomList(e) {
    let shopid = currentTarget.id;
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + shopid,
    })
  },
  bindInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
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
    let _font = '历史记录';
    if (_len == 0) {
      _font = '历史记录'
    } else {
      _font = '商家列表'
    }
    wx.showModal({
      title: '温馨提示',
      content: '确定要清除' + _font + '?',
      success: function (res) {
        if (res.confirm) {
          if (_len == 0) {
            let _arr = [];
            that.setData({
              historyarr: _arr
            })
            wx.setStorage({
              key: "his",
              data: ''
            })
          } else {
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
  onShow: function () {
    var getSearch = wx.getStorageSync('searchData');
    this.setData({
      getSearch: getSearch,
      inputValue: ''
    })
  },
  onHide: function () {

  },
  clearInput: function () {
    this.setData({
      inputValue: ''
    })
  }
})