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
    let userid = '',username='';
    let that = this;
    wx.getStorage({
      key: 'userid',
      success: function (res) {
        userid =res.data;
      }
    })
    wx.getStorage({
      key: 'username',
      success: function (res) {
        username = res.data;
      }
    })
   
    let _parms = {
      id:this.data.actid,
      userId: userid,
      userName: username,
      sourceType:'1'
    }
    Api.actlist(_parms).then((res) => {
      this.setData({
        actdetail: res.data
      })
    })
  },
  getactlist(){  //获取活动列表
    let that = this;
    wx.request({
      url: this.data._build_url + 'act/list/',
      header: {
        'content-type': 'application/json;Authorization' 
      },
      success: function (res) {
        that.setData({
          actlist: res.data.data.list
        })
      }
    })
  }
    
   
    
  
})