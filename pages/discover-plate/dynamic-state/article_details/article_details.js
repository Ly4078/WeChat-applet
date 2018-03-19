import Api from '../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var utils = require("../../../../utils/util.js")
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,  //服务器域名
    _id: '',    //文章ID
    zan: '',   //点赞数
    details: {},   //文章数据 
    cmtdata: [],   //文章评论数据 
    interval: '',  //时间差
    commentVal: '',  //评论内容
    userInfo: {},   //用户数据 
    isComment: false,
    preview: {},    //预览数据
    userId: '1',  //虚拟ID 暂用
    userName: '测试名称'   //虚拟名称 暂用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      const id = options.id
      this.setData({
        _id: id,
        zan: options.zan,
      })
      this.gettopiclist(id)
      this.getcmtlist()
    } else {
      options.content = JSON.parse(options.content)
      this.setData({
        details: options
      })
      this.setData({
        userInfo: app.globalData.userInfo
      })

    }

    // this.setcmtadd()
  },
  gettopiclist: function (id) {  //获取文章内容数据
    let _parms = {
      id: id,
      zanUserId: app.globalData.userInfo.userId,
      zanUserName: app.globalData.userInfo.usrName,
      zanSourceType: '1'
    }
    Api.getTopicByZan(_parms).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        _data.summary = utils.uncodeUtf16(_data.summary)
        _data.content = utils.uncodeUtf16(_data.content)
        _data.content = JSON.parse(_data.content)
        this.setData({
          details: _data
        })
        this.getuser(_data.userId)
      }
    })
  },
  getuser: function (id) {  //获取用户信息
    let that = this;
    wx.request({
      url: this.data._build_url + 'user/get/' + id,
      success: function (res) {
        console.log("res:",res)
        if (res.data.code == 0) {
          that.setData({
            userInfo: res.data.data
          })
        }
      }
    })
  },
  getcmtlist: function () {  //获取文章评论数据
    let _parms = {
      zanUserId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId,
      cmtType: '2',
      refId: this.data._id
    }
    Api.cmtlist(_parms).then((res) => {
      let _data = res.data.data;
      this.setData({
        cmtdata: _data
      })
    })
  },
  showAreatext: function () {  //显示发表输入框
    this.setData({
      isComment: true
    })
  },
  //获取评论输入框
  getCommentVal: function (e) {
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function () {  //新增文章评论
    if (!this.data.commentVal) {
      wx.showToast({
        title: '请输入评论内容',
        duration: 2000
      })
      this.setData({
        isComment: false
      })
      return false;
    }
    let _parms = {
      refId: this.data._id,
      cmtType: '2',
      content: this.data.commentVal,
      userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId,
      userName: app.globalData.userInfo.userName ? app.globalData.userInfo.userName : this.data.userName,
      nickName: app.globalData.userInfo.userName ? app.globalData.userInfo.userName : this.data.userName,
    }
    Api.cmtadd(_parms).then((res) => {
      this.setData({
        isComment: false
      })
      this.getcmtlist()
    })
  },

  //跳转至所有评论
  jumpTotalComment: function () {
    wx.navigateTo({
      url: '../../../index/merchant-particulars/total-comment/total-comment?id=' + this.data._id + '&cmtType=2&source=article'
    })
  },
  dianzanwz: function (e) {  //文章点赞
    let that = this
    let _details = this.data.details
    let _parms = {
      refId: _details.id,
      type: '2',
      userId: app.globalData.userInfo.userId
    }
    Api.zanadd(_parms).then((res) => {
<<<<<<< HEAD
      if (res.data.code == 0) {
        wx.showToast({
          title: '点赞成功'
        })
        _details.isZan = 1
        let _zan = this.data.zan
        _zan++
        that.setData({
          details: _details,
          zan: _zan
        })
=======
      var _details = that.data.details
      if (_details.isZan) {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: '已取消'
          })
          _details.isZan = 0;
          let Zan = this.data.zan;
          Zan--;
          that.setData({
            details: _details,
            zan: Zan
          });
        }
      } else {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: '点赞成功'
          })
          _details.isZan = 1;
          let Zan = this.data.zan;
          Zan++;
          that.setData({
            details: _details,
            zan: Zan
          });
        }
>>>>>>> 4721cad32b29197bbee460b55af06617d159c765
      }
    })
  },
  quxiaozanwz: function () {  //文章取消点赞
    let that = this
    let _details = this.data.details
    let _parms = {
      refId: _details.id,
      type: '2',
      userId: app.globalData.userInfo.userId
    }
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '取消成功',
        })
        _details.isZan = 0
        let _zan = this.data.zan
        _zan--
        this.setData({
          details: _details,
          zan: _zan
        })
      }
    })
  },
  toLike: function (event) {//评论点赞
    let that = this
    let id = event.currentTarget.id
    let ind = ''
    for (let i = 0; i < this.data.cmtdata.list.length; i++) {
      if (this.data.cmtdata.list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: '4',
      userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId,
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          icon: 'none',
          title: '点赞成功'
        })
        var _cmtdata = that.data.cmtdata
        _cmtdata.list[ind].isZan = 1;
        _cmtdata.list[ind].zan++;
        that.setData({
          cmtdata: _cmtdata
        });
      }
    })
  },
  //取消点赞
  cancelLike: function (event) {
    let that = this
    let id = event.currentTarget.id
    let ind = ''
    for (let i = 0; i < this.data.cmtdata.list.length; i++) {
      if (this.data.cmtdata.list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: '4',
      userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : this.data.userId,
    }
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          icon: 'none',
          title: '已取消'
        })
        let _cmtdata = that.data.cmtdata
        _cmtdata.list[ind].isZan = 0;
        _cmtdata.list[ind].zan == 0 ? _cmtdata.list[ind].zan : _cmtdata.list[ind].zan--;
        that.setData({
          cmtdata: _cmtdata
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */




  onShareAppMessage: function (res) {
    let that = this
    let shareObj = {
      title: "分享文章",        // 默认是小程序的名称(可以写slogan等)
      // path 暂时采用默认  以后优化
      // path: '/pages/discover-plate/dynamic-state/article_details/article_details',        // 默认是当前页面，必须是以‘/’开头的完整路径
      // imgUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '转发成功',
            icon: 'success',
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '转发失败',
          icon: 'none',
          duration: 2000
        })
      }
    }
    if (res.from === 'button') { // 来自页面内转发按钮
      var eData = res.target.dataset
      // 此处可以修改 shareObj 中的内容
      // shareObj.path = '/pages/discover-plate/dynamic-state/article_details/article_details?btn_name=' + eData.name;
    }
    return shareObj
  }

})