import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
Page({
  data: {
    isayers:false,
    players:[
      {
        id:'1',
        num:'01',
        name:'非凡',
        src:'/images/icon/touxiang.jpg',
        ticket:'123',
        related:'穿越重庆火锅(光谷店)',
        relsrc:'/images/icon/xiangqisdfe.png',
        isvote: '1'
      },
      {
        id: '2',
        num: '02',
        name: '若风',
        src: '/images/icon/touxiang.jpg',
        ticket: '93',
        related: '心湖民宿度假村',
        relsrc: '/images/icon/xiangqisdfe.png',
        isvote: '2'
      },
      {
        id: '3',
        num: '03',
        name: '德玛西亚',
        src: '/images/icon/touxiang.jpg',
        ticket: '78',
        related: '再叙老火锅',
        relsrc: '/images/icon/xiangqisdfe.png',
        isvote: '2'
      }
    ],
    business:[
      {
        id: '11',
        group: '12',
        shop: '穿越重庆火锅(光谷店)',
        dish:'农家小炒肉',
        src: '/images/imgs/timg(7).jpg',
        ticket: '123',
        relsrc: '/images/icon/xiangqisdfe.png',
        isvote: '1'
      },
      {
        id: '22',
        group: '13',
        shop: '心湖民宿度假村',
        dish: '野山药土鸡汤',
        src: '/images/imgs/timg(6).jpg',
        ticket: '93',
        relsrc: '/images/icon/xiangqisdfe.png',
        isvote: '2'
      },
      {
        id: '33',
        group: '14',
        shop: '再叙老火锅',
        dish: '剁椒鱼头',
        src: '/images/imgs//timg(8).jpg',
        ticket: '78',
        relsrc: '/images/icon/xiangqisdfe.png',
        isvote:'1'
      }
    ]
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
    
  },
  onShow: function () {
    
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    
  },

  toApply: function() {    //跳转至报名页面
    wx.navigateTo({
      url: 'apply-player/apply-player',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  switching:function(){ //切换商家/选手
    this.setData({
      isayers: !this.data.isayers
    })
  },
  clickli:function(e){//跳转到详情页面
    let id = e.currentTarget.id
    console.log(id)
    console.log("isayers:", this.data.isayers)
    if (this.data.isayers){ //选手
      wx.navigateTo({
        url: '../details_page/details_page'
      })
    }else{  //商家
      // wx.navigateTo({
        // url:'../../index/merchant-particulars/merchant-particulars?shopid='+id
      // })
    }
   

  }
})