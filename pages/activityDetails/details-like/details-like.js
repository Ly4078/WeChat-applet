import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var postsData = require('/../../../data/activity-data.js')
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,   //域名
    actid:'',  //活动ID
    actdetail:[],  //根据ID查询某一条数据详情
    actlist:[],    //参加活动商家列表
    _value:'',  //搜索查询关键字
    endtime:''  //距离活动结束时间
  },

  onLoad: function (options) {
    this.setData({
      posts_key: postsData.postList,
      actid:options.actid
    });
    this.getactdetails();
    this.getactlist()
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
      // console.log("actdetail:",res.data.data.list[0])
      let _endtime = res.data.data.list[0].endTime;
      _endtime = Date.parse(_endtime);
      let today = new Date();
      today = Date.parse(today);
      let dateSpan = _endtime - today;
      let iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
      if(iDays<1){
        iDays = 0
      }
      that.setData({
          endtime: iDays
      })
      that.setData({
        actdetail: res.data.data.list[0]
      })
    })
  },

  getactlist() {  //获取参加某一活动的商家列表
    let that = this;
    this.setData({
      actlist: []
    })
    let _parms = {
      actId: this.data.actid
    }
    Api.actshoplist(_parms).then((res) => {
      console.log("actlist:", res.data.data.list)
      that.setData({
          actlist:res.data.data.list
      })
    })
  },

  bindInput: function (e) {  //实时获取输入的值
    let value = e.detail.value
    this.setData({
      _value: e.detail.value
    })
  },

  selectnum(){  // 执行搜索  
    let that = this;
    this.setData({
      actlist:[]
    })
    let va = this.data._value
    let _parms = {}
    if(va){
      _parms = {
        actId: this.data.actid,
        searchKey: this.data._value
      }
    }
    Api.actshoplist(_parms).then((res) => {
      that.setData({
        actlist: res.data.data.list
      })
    })
  },

  clickshop:function(e){  //点击某个商家 跳转到该商家详情页
    let stopid = e.currentTarget.id
    // console.log("stopid:", stopid)
    wx.navigateTo({  
      url: '../../index/merchant-particulars/merchant-particulars?stopid=' + stopid
    })
  }

})