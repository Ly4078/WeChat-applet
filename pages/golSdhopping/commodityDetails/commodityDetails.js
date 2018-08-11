Page({
  data: {
    imgUrls: [
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532674461059&di=71c1d60fbfd09ea8a5db9860d4867ff5&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2Fd50735fae6cd7b8946680eaa042442a7d9330e96.jpg',
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532674461059&di=71c1d60fbfd09ea8a5db9860d4867ff5&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2Fd50735fae6cd7b8946680eaa042442a7d9330e96.jpg',
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532674461059&di=71c1d60fbfd09ea8a5db9860d4867ff5&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2Fd50735fae6cd7b8946680eaa042442a7d9330e96.jpg'
    ],
    num: 1, //初始数量
    indicatorDots: true, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔
    duration: 1000, //滑动动画时长
    inputShowed: false,
    inputVal: "",
    twoList: [{
        "adc": 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532670487912&di=298054c82c12d3d72c89ebfd1d593ba9&imgtype=0&src=http%3A%2F%2Fimg01.taopic.com%2F160809%2F240390-160P91133119.jpg',
      },
      {
        "adc": 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532670487912&di=298054c82c12d3d72c89ebfd1d593ba9&imgtype=0&src=http%3A%2F%2Fimg01.taopic.com%2F160809%2F240390-160P91133119.jpg'
      },
      {
        "adc": 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532670487912&di=298054c82c12d3d72c89ebfd1d593ba9&imgtype=0&src=http%3A%2F%2Fimg01.taopic.com%2F160809%2F240390-160P91133119.jpg'
      },
    ],
    spec: [{
      "id": 1,
      "name": "尺码",
      "child": [{
        "id": 11,
        "name": "M",
        "isSelect": true
      }, {
        "id": 111,
        "name": "L",
        "isSelect": false
      }, {
        "id": 11,
        "name": "XL",
        "isSelect": true
      }, {
        "id": 11,
        "name": "XXL",
        "isSelect": true
      }]
    }],
    speces: [{
      "id": 1,
      "name": "颜色",
      "child": [{
        "id": 11,
        "name": "黑白色",
        "isSelect": true
      }, {
        "id": 111,
        "name": "黑色",
        "isSelect": false
      }, {
        "id": 11,
        "name": "白色",
        "isSelect": true
      }]
    }],
  },
  onLoad: function(options) {
    // this.setData({
    //   twoList: twoList
    // })
  },

  onReady: function() {

  },
  onShow: function() {

  },
  // /* 点击减号 */
  bindMinus: function() {
    var num = this.data.num; // 如果大于1时，才可以减
    if (num > 1) {
      num--;
    }
    var minusStatus = num <= // 只有大于一件的时候，才能normal状态，否则disable状态
      1 ? 'disabled' :
      'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
    this.change_spec();
    this.change_price();
  },
  bindPlus: function() {
    var num = this.data.num;
    num++;
    var minusStatus = num < // 只有大于一件的时候，才能normal状态，否则disable状态
      1 ? 'disabled' :
      'normal';
    this.setData({ // 将数值与状态写回
      num: num,
      minusStatus: minusStatus
    });
    this.change_spec();
    this.change_price();
  },
  /* 输入框事件 */
  bindManual: function(e) {
    var num = e.detail.value;
    if (isNaN(num)) {
      num = 1;
    }
    this.setData({ // 将数值与状态写回
      num: parseInt(num)
    });
    this.change_spec();
    this.change_price();
  },
  //弹出
  modal_show: function(e) {
    var flag = e.currentTarget.dataset.flag;
    this.setData({
      flag: flag,
      choose_modal: "block",
    });
  },
  //消失
  modal_none: function() {
    this.setData({
      choose_modal: "none",
    });
  },
  //  配送地址
  dispatching: function() {
    wx.navigateTo({
      url: '../../personal-center/shipping/shipping',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 选好商品后立即兑换
  ImmediatelyChange: function() {
    wx.showModal({
      title: '兑换成功',
      content: '兑换成功后的商品状态可以在【兑换记录】中查看',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})