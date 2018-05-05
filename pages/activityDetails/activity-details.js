import Api from '/../../utils/config/api.js';
var utils = require('/../../utils/util.js');
Page({
  data: {
    actdata: [],
    page: 1,
    actid: '',  //活动ID
    flag: true,
    placeholderFlag: true
  },

  onLoad: function (options) {

  },
  onShow: function () {
    this.setData({
      actdata: [],
      page: 1,
      flag: true
    })
    this.getcatdata()
  },
  getcatdata: function () {  //获取列表数据
    let that = this;
    let _parms = {
      page: this.data.page,
      row: 8
    }
    wx.showLoading({
      title: '更多数据加载中。。。',
      mask: true
    })
    Api.actlist(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading()
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {

        let actList = [];
        actList = that.data.actdata;
        for (let i = 0; i < data.data.list.length; i++) {
          data.data.list[i].viewNum = utils.million(data.data.list[i].viewNum)
          actList.push(data.data.list[i]);
          actList[i].endTime = actList[i].endTime.substring(0, actList[i].endTime.indexOf(' '));
        }
        that.setData({
          actdata: actList
        })
      } else {
        that.setData({
          flag: false
        });
      }
      this.placeholderFlag = this.data.actdata.length < 1 ? false : true;
      if (that.data.page == 1) {
        wx.stopPullDownRefresh()
      } else {
        wx.hideLoading();
      }
    })
  },
  clickVote: function (event) {
    const actid = event.currentTarget.id
    if (actid == 34) {
      wx.navigateTo({
        url: './hot-activity/hot-activity',
      })
    } else if (actid == 35) {
      wx.navigateTo({
        url: './hot-activity/hot-activity',
      })
    } else {
      wx.navigateTo({
        url: 'details-like/details-like?actid=' + actid,
      })
    }
  },
  onReachBottom: function () {  //用户上拉触底
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.getcatdata();
    }
  },
  onPullDownRefresh: function () {    //用户下拉刷新
    this.setData({
      actdata: [],
      page: 1,
      flag: true
    });
    this.getcatdata();
  }
})