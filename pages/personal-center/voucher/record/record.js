import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();
var requestTask = false;
let timer = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    listData: [],
    page: 1,
    showSkeleton: true,
    databack: false,
    loading: false,
    total: 1,
    currentTab:0,
    orderType:['已兑换','待发货','已发货','已完成'],
    navList: [{
        id: 0,
        title: '全部'
      },
      {
        id: 1,
        title: '待发货'
      },
      {
        id: 2,
        title: '已发货'
      },
      {
        id: 3,
        title: '已完成'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    let orderexpressid = app.globalData.orderexpressid;
    let _data = that.data.listData
    if (orderexpressid && app.globalData.orderexpressState && _data.length){
      for (let i = 0; i < _data.length;i++){
        if (_data[i].id == orderexpressid){
          _data[i].expressState = app.globalData.orderexpressState;
          app.globalData.orderexpressid = null;
          app.globalData.orderexpressState = null;
        }
        }
        that.setData({
          listData: _data
        })
    }
  },
  onLoad: function(options) {
    this.getorderCoupon('reset');
  },
  onPageScroll:function(e){
    let that = this;
    let navList = that.data.navList
    navList[that.data.currentTab].scrollTop = e.scrollTop;
    if (timer) {
      clearTimeout(timer)
      timer = null
    };
    timer = setTimeout( ()=>{
      that.setData({
        navList
      })
    },200)
    
  },
  swichTab:function(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    that.setData({
      currentTab:id,
      page:1
    })
    
    let navList = that.data.navList
    for (let i = 0; i < navList.length;i++){
      if (id == navList[i].id) {
        if (navList[i].data && navList[i].data.length) {
          that.setData({
            listData: navList[i].data,
            page: navList[i].page,
            total: navList[i].total
          })
          wx.pageScrollTo({
            scrollTop: navList[i].scrollTop ? navList[i].scrollTop:0,
            duration:0
          })
          
        }else{
          wx.pageScrollTo({
            scrollTop:0,
            duration: 0
          })
          that.getorderCoupon('reset', '', id);
           wx.showLoading({
            title: '加载中',
          })
        }
      }
    }
  
     
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    that.setData({
      page: 1
    })
    try{
      let navList = that.data.navList;
      for (let i = 0; navList.length; i++) {
        if (navList[i].data) {
          navList[i].data = []
          navList[i].scrollTop = 0;
        }
      }
      that.setData({ navList });
    }catch(err){

    }
    this.getorderCoupon('reset', '已刷新');
  },

  onReachBottom: function() {
    if (requestTask) {
      return false
    }
    if (this.data.page >= this.data.total) {
      wx.showToast({
        title: '没有更多数据了',
        icon: "none"
      })
      return false
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    })
    this.getorderCoupon();
  },


  //查询兑换记录列表
  getorderCoupon: function(types, msg,id) {
    let that = this;
    let _parms = {
      changerId: app.globalData.userInfo.userId,
      browSort: 1,
      page: that.data.page,
      rows: 10,
      token: app.globalData.token
    };
    if (that.data.currentTab>=1){
      _parms.expressState = that.data.currentTab;
    }

    requestTask = true
    Api.dhCoupon(_parms).then((res) => {
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if (res.data.code == 0) {
        let _data = [],
          _list = res.data.data.list
        if (_list && _list.length > 0) {
          for (let i = 0; i < _list.length; i++) {
            let _arr = _list[i].goodsSkuName.split(" ");
            _list[i].p2 = _arr[1];
            _data.push(_list[i]);
          }
          let navList = that.data.navList;
          for (let i = 0; i < navList.length;i++) {
            if (navList[i].id == that.data.currentTab) {
              navList[i].data = navList[i].data ? navList[i].data:[];
              navList[i].data =  navList[i].data.concat(_data);
              navList[i].page = that.data.page;
              navList[i].total = Math.ceil(res.data.data.total / 10);
              let istruenodata = that.data.page == Math.ceil(res.data.data.total / 10)?true:false;
              that.setData({
                istruenodata,
                navList: navList
              })
            }
          }
          let arr = [];
          if (types == 'reset') {
            arr = _data
          } else {
            let arrs = that.data.listData ? that.data.listData : [];
            arr = arrs.concat(_data)
          }
          that.setData({
            listData: arr,
            total: Math.ceil(res.data.data.total / 10),
            databack: false,
            showSkeleton: false,
            loading: false
          })
          wx.hideLoading();
          requestTask = false
        } else {
          if (types == 'reset'){
            that.setData({
              listData: _list ? _list:[]
            })
          }
          wx.hideLoading();
          requestTask = false
          that.setData({
            showSkeleton: false,
            loading: false
          })
        }
      } else {
        wx.hideLoading();
        requestTask = false
        that.setData({
          showSkeleton: false,
          loading: false
        })
      }
    })
  },
  //点击某个条目
  handItem: function(e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../../voucher/exchangeDetails/exchangeDetails?id=' + id
    })
  }
})