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
    navbar: ['送货到家', '品质好店'],
    currentTab: 0,
    page: 1,
    articleid:'',
    list:[{
      img:'http://pic36.photophoto.cn/20150824/0042040237789702_b.jpg',
      name:'三十三简堂',
      distance:'230',
    }, {
        img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1536061402384&di=71e2b64bff905846f2d4261757894d3e&imgtype=0&src=http%3A%2F%2Fpic7.photophoto.cn%2F20080517%2F0042040259640925_b.jpg',
        name: '猪婆包猪婆猪婆包猪婆猪婆包猪婆猪婆包猪婆',
        distance: '230',
      }]
  },
  navbarTap: function (e) {
    console.log(e.currentTarget.dataset.idx)
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  onLoad:function(option){
    this.setData({
      currentTab: option.currentTab //获取店铺详情页传过来的currentTab值
    })
  },
  onShow: function () {
    this.commodityCrabList();
    this.listForSkuAllocation();
  },

  commodityCrabList: function () {   //送货到家列表
    let that = this;
    let _parms = {
      spuType:10,
      page: this.data.page,
      rows: 8
    };
    Api.crabList(_parms).then((res) => {
      if(res.data.code == 0){
        this.setData({
          listData:res.data.data.list,
        })
      }
    })
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

  listForSkuAllocation:function(){ //品质好店列表
    let that = this;
    if (!app.globalData.userInfo.lat && !app.globalData.userInfo.lng){
      this.getlocation();
    }else{
      let _parms = {
        Type: 1,
        page: this.data.page,
        rows: 8,
        locationX: app.globalData.userInfo.lng,
        locationY: app.globalData.userInfo.lat
      };
      Api.listForSkuAllocation(_parms).then((res) => {
        if (res.data.code == 0) {
          let _list = res.data.data.list;
          for(let i=0;i<_list.length;i++){
              _list[i].distance = utils.transformLength(_list[i].distance);
          }
          this.setData({
            storeData: _list,
          })
        }
      })
    }
  },

  // 进入菜品详情
  crabPrticulars:function(e){
    console.log("daying:",e)
    let id = e.currentTarget.id;
    let spuId = e.currentTarget.dataset.spuid;
    wx.navigateTo({
      url: 'crabDetails/crabDetails?id=' + id + '&spuId=' + spuId,
    })
  },

  //进入品质好店发起砍价
  crabBargainirg:function(e){ 
    let shopId = e.currentTarget.id;
    let greensID = e.currentTarget.dataset.id;
    console.log("greenID:", greensID)
    wx.navigateTo({
      url: 'crabDetails/crabDetails?shopId=' + shopId + '&greensID=' + greensID,
    })
  }
})