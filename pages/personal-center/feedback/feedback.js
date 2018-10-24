Page({
  data: {
    issueArray: [{
      id: 0,
      issueName: '无法打开小程序'
    },
    {
      id: 1,
      issueName: '小程序闪退'
    },
    {
      id: 2,
      issueName: '卡顿'
    },
      {
        id: 2,
        issueName: '界面定位'
      },
      {
        id: 2,
        issueName: '界面加载慢'
      },
      {
        id: 2,
        issueName: '界面加载异常'
      },
      {
        id: 2,
        issueName: '卡顿'
      },
    ]
  },
  onLoad: function(options) {
    
  },

  particulars:function(){  //进入详情
    wx.navigateTo({
      url: 'displayText/displayText',
    })
  }
})