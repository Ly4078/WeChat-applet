import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  getData: function () {
    let _parms = {}
    Api.shoplist(_parms).then((res) => {
      // this.setData({
      //   posts_key: res.data.data.list
      // });
      let _bus = res.data.data.list
      this.getDistance(_bus) //计算距离并赋值
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
  onInputText: function(e) {
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
  onTouchItem: function(event) {
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id,
    })
  }
})