import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp()
var village_LBS = function (that) {   //获取用户经纬度
  wx.getLocation({
    success: function (res) {
      console.log('vill_res:', res)
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.listForSkuAllocation();
    },
  })
}

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    listData:[],  //送货到家
    storeData:[], //品质好店
    navbar: ['送货到家', '到店消费'],
    oneTab: ["礼盒装", "邮购"],
    currentTab: 0,
    tabId:0,
    spuval:2,
    page: 1,
    _page:1,
    articleid:'',
    dshImg:''
  },
  onLoad: function (option) {
    this.setData({
      currentTab: option.currentTab //获取店铺详情页传过来的currentTab值
    })
  },
  onShow: function () {
    this.setData({
      dshImg: app.globalData.txtObj.dsh.imgUrl
    })
    if (this.data.currentTab == 0) {
      if (this.data.listData.length<1){
        this.commodityCrabList();
      }
    } else if (this.data.currentTab == 1) {
      this.listForSkuAllocation();
    }
  },
  //切换顶部tab
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    if (this.data.currentTab == 0){
      if (this.data.listData.length == 0){
        this.commodityCrabList();
      }
    } else if (this.data.currentTab == 1){
      if (this.data.storeData.length == 0){
        this.listForSkuAllocation();
      }
    }
  },
  //点击二级目录
  handonetab:function(e){
    let id = e.currentTarget.id,val=2;
    if (id == 0) {
      val == 2;
    } else if (id == 1) {
      val = 1;
    } else if (id == 2) {
      val = 3;
    }
    console.log("id:", id)
    this.setData({
      tabId:id,
      spuval:val,
      listData: [],
      page:1
    });
    
   
    this.commodityCrabList();
    console.log("tabId:",this.data.tabId)
  },
  
  //查询送货到家列表
  commodityCrabList: function () {
    let that = this;
    let _parms = {
      spuType:10,
      page: this.data.page,
      spuId: this.data.spuval,
      rows: 10
    };
    if(this.data.page == 1){
      this.setData({
        listData: [],
      })
    }
    Api.crabList(_parms).then((res) => {
      let _listData = this.data.listData;
      if(res.data.code == 0){
        let _list = res.data.data.list;
        if(_list && _list.length>0){
          for (let i = 0; i < _list.length; i++) {
            _listData.push(_list[i])
          }
          this.setData({
            listData: _listData,
          })
        }
      }
    })
  },

  //查询品质好店列表
  listForSkuAllocation: function () { 
    let that = this;
    if (!app.globalData.userInfo.lat && !app.globalData.userInfo.lng) {
      this.getlocation();
    } else {
      let _parms = {
        Type: 1,
        page: this.data._page,
        rows: 10,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat,
        city: app.globalData.userInfo.city
      };
      if (this.data._page == 1){
        this.setData({
          storeData:[]
        })
      };
      Api.listForSkuAllocation(_parms).then((res) => {
        if (res.data.code == 0) {
          let _list = res.data.data.list, _storeData = this.data.storeData;
          if(_list && _list.length>0){
            for (let i = 0; i < _list.length; i++) {
              _list[i].distance = utils.transformLength(_list[i].distance);
              _storeData.push(_list[i]);
            };
            this.setData({
              storeData: _storeData,
            })
            console.log("storeData:", this.data.storeData)
          }
        }
      })
    }
  },

  //下拉刷新
  onPullDownRefresh:function(){
    this.setData({
      page: 1,
      _page:1
    });
    if (this.data.currentTab == 0) {
      this.commodityCrabList();
    } else if (this.data.currentTab == 1) {
      this.listForSkuAllocation();
    }
  },
  //用户上拉触底加载更多
  onReachBottom:function(){
    if(this.data.currentTab == 0){
      this.setData({
        page:this.data.page+1
      });
      this.commodityCrabList();
    }else if(this.data.currentTab == 1){
      this.setData({
        _page: this.data._page+1
      });
      this.listForSkuAllocation();
    }
  },

  getlocation: function () { //获取用户位置
    let that = this,
      lat = '',
      lng = '';
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.listForSkuAllocation();
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                showCancel: false,
                confirmText: '确认授权',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({ //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) {
                          village_LBS(that);
                        } else{  //未授权

                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },

 

  // 进入菜品详情
  crabPrticulars:function(e){
    let id = e.currentTarget.id,spuId = e.currentTarget.dataset.spuid;
    wx.navigateTo({
      url: 'crabDetails/crabDetails?id=' + id + '&spuId=' + spuId,
    })
  },

  //进入品质好店发起砍价
  crabBargainirg:function(e){ 
    let shopId = e.currentTarget.id, greensID = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: 'crabDetails/crabDetails?shopId=' + shopId + '&greensID=' + greensID + '&isShop=true'
    })
  }
})