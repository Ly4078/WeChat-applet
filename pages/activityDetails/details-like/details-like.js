import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,   //域名
    actid: '',  //活动ID
    actdetail: [],  //根据ID查询某一条数据详情
    actlist: [],    //参加活动商家列表
    _value: '',  //搜索查询关键字
    endtime: '',  //距离活动结束时间

    userId: '1',  //虚拟ID 暂用
    userName: '测试名称'   //虚拟名称 暂用
  },

  onLoad: function (options) {
    this.setData({
      actid: options.actid
    });
    this.getactdetails();
    this.getactlist()
  },
  getactdetails() {  //获取单个活动详情
    let that = this;
    let _parms = {
      id: this.data.actid,
      userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId,
      userName: app.globalData.userInfo.userName ? app.globalData.userInfo.userName : this.data.userName,
      sourceType: '1'
    }
    Api.actlist(_parms).then((res) => {
      let _endtime = res.data.data.list[0].endTime;
      _endtime = Date.parse(_endtime);
      let today = new Date();
      today = Date.parse(today);
      let dateSpan = _endtime - today;
      let iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
      if (iDays < 1) {
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
      actId: this.data.actid,
      voteUserId: '1'
    }
    Api.actshoplist(_parms).then((res) => {
      that.setData({
        actlist: res.data.data.list
      })
    })
  },

  bindInput: function (e) {  //实时获取输入的值
    let value = e.detail.value
    this.setData({
      _value: e.detail.value
    })
  },

  selectnum() {  // 执行搜索  
    let that = this;
    this.setData({
      actlist: []
    })
    let va = this.data._value
    let _parms = {}
    if (va) {
      _parms = {
        actId: this.data.actid,
        searchKey: this.data._value,
        voteUserId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId,
      }
    }
    Api.actshoplist(_parms).then((res) => {
      that.setData({
        actlist: res.data.data.list
      })
    })
  },

  clickshop: function (e) {  //点击某个商家 跳转到该商家详情页
    let stopid = e.currentTarget.id
    console.log("stopid:",stopid)
    wx.navigateTo({
      url: '../../index/merchant-particulars/merchant-particulars?shopid=' + stopid
    })
  },

  clickVote: function (e) {  //投票
    let that = this;
    let stopid = e.currentTarget.id;
    let _parms = {
      actId: this.data.actid,
      shopId: stopid,
      userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId,
      voteUserId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId
    }
    let arr = this.data.actlist
    for (let i = 0; i < arr.length; i++) {
      let ind = i;
      if (stopid == arr[i].id) {
        if (arr[i].isVote != 0) {
          Api.votedelete(_parms).then((res) => {
            if (res.data.code == 0) {
              arr[ind].isVote = 0,
                arr[ind].voteNum = arr[i].voteNum - 1,
                that.setData({
                  actlist: arr
                })
            }
          })
        } else {
          Api.voteadd(_parms).then((res) => {
            if (res.data.code == 0) {
              arr[ind].isVote = 1,
                arr[ind].voteNum = arr[i].voteNum + 1,
                that.setData({
                  actlist: arr
                })
            }
          })
        }
      }
    }
  }

})