Page({
  data: {
    issueArray: [{
        id: 0,
        issueName: '1.无法打开小程序？'
      },
      {
        id: 1,
        issueName: '2.卡顿或界面加载慢？'
      },
      {
        id: 2,
        issueName: '3.新用免费兑换券如何领取？'
      },
      {
        id: 3,
        issueName: '4.定位不准确；或重新定位？'
      },
      {
        id: 4,
        issueName: '5.商家如何入驻？'
      },
      {
        id: 5,
        issueName: '6.券票到哪里使用；如何核销？'
      },
      {
        id: 6,
        issueName: '7.拼菜砍价活动规则？'
      },
      {
        id: 7,
        issueName: '8.限量秒杀活动规则？'
      },
      {
        id: 8,
        issueName: '9.订单在哪里查看？'
      },
      {
        id: 9,
        issueName: '10.如何查看物流？'
      },
      {
        id: 10,
        issueName: '11.是否支持退款？'
      },
      {
        id: 11,
        issueName: '12.在哪里查看我的优惠券？'
      },
      {
        id: 12,
        issueName: '13.金币如何获得；有何作用？'
      }
    ]
  },
  onLoad: function(options) {

  },

  particulars: function(e) { //进入详情
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: 'displayText/displayText?id=' + id
    })
  }
})