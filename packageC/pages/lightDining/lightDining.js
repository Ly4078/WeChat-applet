import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
import Public from '../../../utils/public.js';
import getToken from '../../../utils/getToken.js';
import getCurrentLocation from '../../../utils/getCurrentLocation.js';
var app = getApp();
var swichrequestflag = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:false,
    page:1,
    browSort: 2,
    isshowlocation: false,
    navs: [{ name: '价格排序', id: 2 }, { name: '距离排序',id:0}],
    navIndex: 0,
    list: ['', '', '', '', '', '', '']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (!app.globalData.token) {
      getToken(app).then(() => {
        if (!app.globalData.userInfo.lat && !app.globalData.userInfo.lng) {
          getCurrentLocation(that).then((res) => {
            //获取数据
            that.getData('reset');
          })
        } else {
          //获取数据
          that.getData('reset');
        }
      })
    } else {
      if (!app.globalData.userInfo.lat && !app.globalData.userInfo.lng) {
        getCurrentLocation(that).then((res) => {
          //获取数据
          that.getData('reset');
        })
      } else {
        //获取数据
        that.getData('reset');
      }
    }
    that.setData({ showSkeleton:true})
    },
    getData(types){
      let lng = wx.getStorageInfoSync('userInfo').lng ? wx.getStorageInfoSync('userInfo').lng : "110.77877";
      let lat = wx.getStorageInfoSync('userInfo').lat ? wx.getStorageInfoSync('userInfo').lat : "32.6226";
      let _parms = {
        actId: 41,
        zanUserId: app.globalData.userInfo.userId,
        browSort: this.data.browSort,
        locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
        locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
        city: app.globalData.userInfo.city ? app.globalData.userInfo.city : '十堰市',
        isDeleted: 0,
        categoryId:'87',
        page: this.data.page,
        rows: 10,
        token: app.globalData.token
      };
      swichrequestflag = true;
      Api.partakerList(_parms).then((res) => {
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let list = res.data.data.list;
            for (let i = 0; i < list.length; i++) {
              list[i].discount = (list[i].actGoodsSkuOut.goodsPromotionRules.actAmount / list[i].sellPrice).toFixed(1) * 10;
              list[i].distance = utils.transformLength(list[i].distance);
              if (list[i].shopId == 0) {
                list[i].shopName = '享七自营'
              }
              if (list[i].goodsPromotionRules && list[i].goodsPromotionRules.length > 0) {
                let _goods = list[i].goodsPromotionRules;
                for (let j in _goods) {
                  if (_goods[j].ruleType == 4) {
                    list[i].agioPrice2 = _goods[j].actAmount;
                  }
                }
              }
            }
            let arr = [];
            if (types == 'reset') {
              arr = list
            } else {
              let cuisineArray = this.data.cuisineArray ? this.data.cuisineArray : [];
              arr = cuisineArray.concat(list)
            }
            let istruenodata = this.data.page == Math.ceil(res.data.data.total / 10)?true:false;
            this.setData({
              istruenodata,
              cuisineArray: arr,
              pageTotal: Math.ceil(res.data.data.total /10),
              loading: false,
              showSkeleton: false
            }, () => {
              wx.hideLoading();
            });
          } else {
            this.setData({
              loading: false,
              showSkeleton: false
            })
            wx.hideLoading();
          }
          swichrequestflag = false;
        } else {
          wx.hideLoading();
          this.setData({
            loading: false,
            showSkeleton: false
          })
        }
      }, () => {
        wx.hideLoading();
        this.setData({
          loading: false,
          showSkeleton: false
        })
        swichrequestflag = false;
      });
    },
    selectTap(e){
      let that = this;
      let index = e.currentTarget.dataset.index;
      if (swichrequestflag) {
        return;
      }
      let oldBrowSort = that.data.browSort;
      if (oldBrowSort != e.currentTarget.id) {
        that.setData({
          browSort: e.currentTarget.id,
          page: 1,
          navIndex: index
        }, () => {
          wx.pageScrollTo({
            scrollTop: 0,
          })
          that.getData('reset');
        })
      
      }
     
    },
    openSetting() { //打开授权设置界面
      let that = this;
      that.setData({
        isshowlocation: false
      })
      wx.openSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            setTimeout(() => {
              that.onShow();
            }, 300)
          } else {
            that.setData({
              isshowlocation: true
            })
          }
        }
      })
    },
  //菜品砍价详情
  candyDetails: function (e) {
    let id = e.currentTarget.id,
      distance = e.currentTarget.dataset.distance,
      shopId = e.currentTarget.dataset.index,
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=41&categoryId=' + categoryId
    })
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
      let that = this;
      if (that.data.pageTotal <= that.data.page) {
        return
      }
      if (swichrequestflag) {
        return;
      }
      that.setData({
        page: that.data.page + 1,
        loading: true
      });
      that.getData();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
  })