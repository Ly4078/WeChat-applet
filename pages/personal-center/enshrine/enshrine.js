import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    showSkeleton: true,
    _build_url: GLOBAL_API_DOMAIN,
    newshopid:'',
    posts_key: [],
    dish:[],
    page: 1,
    reFresh: true
  },
  onLoad() {
    let that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000)
  },
  onShow: function() {
    this.getShareList();
  },
  onHide: function() {
    this.setData({
      posts_key: [],
      page: 1,
      reFresh: true
    })
  },
  getShareList: function() {
    let that = this;
    // return
    wx.request({
      url: that.data._build_url + 'fvs/getSCForList?page=' + that.data.page + '&rows=5',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let data = res.data;
        if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
          let posts_key = that.data.posts_key;
          for (let i = 0; i < data.data.list.length; i++) {
            let ruleDescs = data.data.list[i].ruleDescs;
            if (ruleDescs && ruleDescs != [null] && ruleDescs != 'null') {
              data.data.list[i].ruleDescs = ruleDescs.slice(0,2);
            } else {
              data.data.list[i].ruleDescs = [];
            }
            posts_key.push(data.data.list[i]);
          }
          // for (let i = 0; i < data.data.list.length; i++) {
          //   wx.request({ //推荐菜
          //     url: that.data._build_url + 'sku/tsc',
          //     data: {
          //       shopId: data.data.list[i].id
          //     },
          //     header: {
          //       "Authorization": app.globalData.token
          //     },
          //     success: function (res) {
          //       if(res.data.code == 0){
          //         if(res.data.data.list && res.data.data.list.length>0){
          //           let list = res.data.data.list;
          //           list = list.slice(0, 2);
          //           data.data.list[i].dish = list;
          //         }
          //       }
          //     }
          //   })
          //   wx.request({ //满减规则
          //     url: that.data._build_url + 'pnr/selectByShopId',
          //     data: {
          //       shopId: data.data.list[i].id
          //     },
          //     header: {
          //       "Authorization": app.globalData.token
          //     },
          //     success: function (res) {
          //       let list = res.data.data;
          //       data.data.list[i].reduction = list;
          //     }
          //   })
          //   posts_key.push(data.data.list[i]);
          // }
          setTimeout(function () {
            that.setData({
              posts_key: posts_key,
              reFresh: true,
              loading: false
            });
          }, 500)
          setTimeout(() => {
            that.setData({
              showSkeleton: false
            })
          }, 400)
        } else {
          that.setData({
            reFresh: false,
            loading: false
          });
        }
        if (that.data.page == 1) {
          wx.stopPullDownRefresh();
        } else {
          wx.hideLoading();
        }
      },
      fail () {
        this.setData({
          loading: false
        })
      }
    });
  },
  enshrineXim:function(event){
    this.setData({
      newshopid: event.currentTarget.id
    })
    wx.navigateTo({
      url: '../../index/merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id,
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (this.data.reFresh) {
      this.setData({
        page: this.data.page + 1,
        loading: true
      },()=>{
        this.getShareList();
      });
      
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      posts_key: [],
      page: 1,
      reFresh: true
    });
    this.getShareList();
  },
})