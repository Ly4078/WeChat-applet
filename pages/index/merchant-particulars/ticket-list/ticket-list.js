Page({
  data: {
    ticketList: [
      {
        id: 1,
        tickName: '50元现金券',
        realPrice: 5,
        createTime: '2018-03-09',
        endTime: '2018-04-08'
      },
      {
        id: 2,
        tickName: '100元现金券',
        realPrice: 10,
        createTime: '2018-05-22',
        endTime: '2018-06-01'
      },
      {
        id: 3,
        tickName: '200元现金券',
        realPrice: 20,
        createTime: '2018-01-04',
        endTime: '2018-02-17'
      }
    ],
    checkedArr: [],
    isChecked: false
  },
  onLoad: function (options) {
    
  },
  radioOperate(e) {
    //现在为单选，以后可能改成多选
    let id = e.target.id;
    for (var i = 0; i < this.data.checkedArr.length; i++) {
      if (id == this.data.checkedAr[i]) {

      }
    }
    if (this.data.checkedArr) {

    }
    // this.setData({
    //   isChecked: true
    // });
  },
  onReady: function () {
    
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    
  }
})