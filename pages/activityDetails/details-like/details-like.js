import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var postsData = require('/../../../data/activity-data.js')
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,   //域名
    actid:'',  //活动ID
    actdetail:[],  //根据ID查询某一条数据详情
    actlist:[]    //活动列表
  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList,
      actid:options.actid
    });
    this.getactdetails();
    this.getactlist();
    // var postsCollected = wx.getStorageSync(postsCollected)
  },
  getactdetails(){  //获取单个活动详情
    let id = this.data.actid;
    wx.request({
      url: this.data._build_url + 'act/get/' + id,
      success: function (res) {
        console.log("res:",res)
        // this.setData({
        //   store_details: res.data.data.list
        // })
      }
    })
  },
  getactlist(){  //获取活动列表
    let that = this;
    wx.request({
      url: this.data._build_url + 'act/list/',
      success: function (res) {
        console.log("resactlist:", res)
        that.setData({
          actlist: res.data.data.list
        })
      }
    })
    console.log(this.actlist)
  }
})