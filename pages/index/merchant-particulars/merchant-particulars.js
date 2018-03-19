import Api from '/../../../utils/config/api.js';  //每个有请求的JS文件都要写这个，注意路径
import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    navbar: ['主页', '动态'],
    shopid: '',  //商家ID
    store_details: {},  //店铺详情
    currentTab: 0,
    isCollected: false,   //是否收藏，默认false
    isComment: false,
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 1,     //登录用户的id
    userName: app.globalData.userInfo.userName ? app.globalData.userInfo.userName : "test",        //登录者名称
    nickName: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : "test"        //登录者昵称
  },
  onLoad: function (options) {
    this.setData({
      shopid: options.shopid
    });
    this.getstoredata();
    this.recommendation();
    this.isCollected();
    // 分享功能
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) {
        // 分享成功
        // console.log('shareMenu share success')
        // console.log(res)
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    });
  },
  onShow: function () {
    this.commentList();
  },
  getstoredata() {  //获取店铺详情数据   带值传参示例
    let id = this.data.shopid;
    let that = this;
    wx.request({
      url: that.data._build_url + 'shop/get/' + id,
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function (res) {
        that.setData({
          store_details: res.data.data
        })
      }
    })
  },
  //推荐菜列表
  recommendation: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/tsc',
      data: {
        shopId: that.data.shopid
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          that.setData({
            recommend_list: data.data.list
          });
        }
      }
    })
  },
  liuynChange: function (e) {
    var that = this;
    that.setData({
      llbView: true,
      pid: e.currentTarget.dataset.id,
      to_user_id: e.currentTarget.dataset.user
    })
  },
  //分享APP
  onShareAppMessage: function () {
    return {
      title: this.data.store_details.shopName,
      path: '/pages/index/merchant-particulars/merchant-particulars?shopid=' + this.data.shopid,
      imageUrl: this.data.store_details.logoUrl,
      success: function (res) {
        console.log(res.shareTickets[0])
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function (res) { console.log(res) },
          fail: function (res) { console.log(res) },
          complete: function (res) { console.log(res) }
        })
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    }
  },
  // 电话号码功能
  calling: function () {
    let that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.store_details.mobile, //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  moreImages: function (event) {
    // wx.navigateTo({
    //   url: 'preview-picture/preview-picture',
    // })
  },
  //腾讯地图
  TencentMap: function (event) {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var storeDetails = that.data.store_details
        wx.openLocation({
          longitude: storeDetails.locationX,
          latitude: storeDetails.locationY,
          scale: 18,
          name: storeDetails.shopName,
          address: storeDetails.address,
          success: function (res) {
            console.log(res);
          }
        })
      }
    })
  },
  // tab栏
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  //评论列表
  commentList: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'cmt/list',
      data: {
        refId: that.data.shopid,
        cmtType: 5,
        zanUserId: that.data.userId,
        page: 1,
        rows: 5
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0 && data.data.list != null && data.data.list != "") {
          that.setData({
            comment_list: res.data.data.list,
            commentNum: res.data.data.total
          })
        } else {
          that.setData({
            totalComment: true
          })
        }
      }
    })
  },
  //跳转至所有评论
  jumpTotalComment: function () {
    let that = this;
    wx.navigateTo({
      url: 'total-comment/total-comment?id=' + that.data.shopid + '&cmtType=5'
    })
  },
  //评论点赞
  toLike: function (event) {
    let that = this,
      id = event.currentTarget.id,
      index = "";
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/add?refId=' + id + '&type=4&userId=' + that.data.userId,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: '点赞成功'
          })
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 1;
          comment_list[index].zan++;
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  //取消点赞
  cancelLike: function (event) {
    let that = this,
      id = event.currentTarget.id,
      cmtType = "",
      index = "";
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/delete?refId=' + id + '&type=4&userId=' + that.data.userId,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: '已取消'
          })
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 0;
          comment_list[index].zan == 0 ? comment_list[index].zan : comment_list[index].zan--;
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  //查询是否收藏
  isCollected: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'fvs/isCollected?userId=' + that.data.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function (res) {
        const data = res.data;
        if (data.code == 0) {
          that.setData({
            isCollected: data.data
          })

        }
      }
    })
  },
  //收藏
  onCollect: function (event) {
    let that = this;
    wx.request({
      url: that.data._build_url + 'fvs/add?userId=' + that.data.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            isCollected: !that.data.isCollected
          })
          wx.showToast({
            title: "收藏成功"
          })
        }
      }
    })
  },
  //取消收藏
  cancelCollect: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'fvs/delete?userId=' + that.data.userId + '&shopId=' + that.data.shopid,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            isCollected: !that.data.isCollected
          })
          wx.showToast({
            title: "取消成功"
          })
        }
      }
    })
  },
  //显示发表评论框
  showAreatext: function () {
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
  //发表评论
  sendComment: function (e) {
    if (this.data.commentVal == "" || this.data.commentVal == undefined) {
      wx.showToast({
        title: '请先输入评论',
        icon: 'none'
      })
    } else {
      let that = this;
      let _parms = {};
      let content = that.utf16toEntities(that.data.commentVal);
      console.log(that.data.commentVal)
      console.log(content);
      wx.request({
        url: that.data._build_url + 'cmt/add?refId=' + that.data.shopid + '&cmtType=5&content=' + content + '&userId=' + that.data.userId + '&userName=' + that.data.userName + '&nickName=' + that.data.nickName,
        // url: that.data._build_url + 'cmt/add',
        // data: {
        //   refId: that.data.shopid,
        //   cmtType: 5,
        //   content: content,
        //   userId: that.data.userId,
        //   userName: that.data.userName,
        //   nickName: that.data.nickName
        // },
        method: "POST",
        header: {
          'content-type': 'application/json;Authorization'
        },
        success: function (res) {
          console.log(res);
          that.setData({
            isComment: false,
            commentVal: ""
          });
          that.commentList();
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }
  },
  UnicodeToUtf8: function (unicode) {
    var uchar;
    var utf8str = "";
    var i;
    for (i = 0; i < unicode.length; i += 2) {
      uchar = (unicode[i] << 8) | unicode[i + 1];        //UNICODE为2字节编码，一次读入2个字节 
      utf8str = utf8str + String.fromCharCode(uchar);  //使用String.fromCharCode强制转换 
    }
    return utf8str;
  },
  //转换emoji表情为后台可以接收的字符
  utf16toEntities: function (str) {
    var patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则
    str = str.replace(patt, function (char) {
      var H, L, code;
      if (char.length === 2) {
        H = char.charCodeAt(0); // 取出高位
        L = char.charCodeAt(1); // 取出低位
        code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法
        return "&#" + code + ";";
      } else {
        return char;
      }
    });
    return str;
  }
})
// 标记
// 获取flag