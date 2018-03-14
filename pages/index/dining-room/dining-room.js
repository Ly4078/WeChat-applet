import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    posts_key: [],
    page: 1,
    reFresh: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  getData: function () {
    let _parms = {
      page: this.data.page,
      rows: 8
    }
    Api.shoplist(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let posts_key = this.data.posts_key;
        for (let i = 0; i < data.data.list.length; i++) {
          posts_key.push(data.data.list[i]);
        }
        this.getDistance(posts_key) //计算距离并赋值
        this.setData({
          reFresh: true
        });
      } else {
        this.setData({
          reFresh: false
        });
      }
    })
  },
  getDistance: function (data) { //计算距离
    let that = this;
    //获取当前位置
    wx && wx.getLocation({
      type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
      success: function (res) {
        //计算距离
        for (let i = 0; i < data.length; i++) {
          if (!data[i].locationX || !data[i].locationY) {
            return;
          }
          let _dis = utils.calcDistance(data[i].locationY, data[i].locationX, res.latitude, res.longitude);
          //转换显示
          let mydis = '<' + utils.transformLength(_dis);
          data[i].dis = mydis;
        }
        that.setData({
          posts_key: data
        })
      },
      fail: function (res) {
        utils.toast("error", '定位失败，请刷新页面重试');
      }
    });
  },
  //获取搜索框内的值
  onInputText: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  onSearchInp: function () {
    let _parms = {
      searchKey: this.data.searchValue
    }
    Api.shoplist(_parms).then((res) => {
      this.setData({
        posts_key: res.data.data.list
      });
    })
  },
  //点击列表跳转详情
  onTouchItem: function (event) {
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id,
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (this.data.reFresh) {
      this.setData({
        page: this.data.page + 1
      });
      this.getData();
    }
  }
})