import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    issnap: false,
    isnew: false,
    isComment: false,
    istouqu: false,
    totalComment: 0,
    commentVal: '',
    playerUserId:'',
    videoUrl:'',
    comment_list: [],
    refId: 0,
    assNum:'',
    _actId:'',
    _userId:'',
    reviousUrl: '',//上一个视频
    currentUrl:'',//当前播放的视频
    nextUrl: '',//下一个视频 
    isball:false,
    isdtzan:false,
    isclick:true,
    isshare:false,
    frenum:0,
    videodata:[],
    food:[],
    page:1,
    voteNum:0,
    cotitle:'',
    _iconUrl:'',
    _nickName:''
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    console.log('options:', options)
    if (options.userId) {
      this.setData({
        _userId: options.userId
      })
    }
    if (options.actId) {
      this.setData({
        _actId: options.actId
      })
    }
    if (options.id) {
      this.setData({
        refId: options.id
      });
    } else if (options.url) {
      this.setData({
        videoUrl: options.url
      })
    }
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    let that = this;
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          if (this.data.refId) {
            this.gettopiclist(this.data.refId);
            this.getfood();
          }
        } else {
          this.authlogin();
        }
      } else {
        wx.navigateTo({
          url: '/pages/personal-center/registered/registered'
        })
      }
    } else {
      this.findByCode();
    }
    // console.log(app.globalData)
  },
  onHide: function () {
    this.setData({
      currentUrl: ''
    });
  },

  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            wx.hideLoading();
            let data = res.data.data;
            app.globalData.userInfo.userId = data.id;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }
            if (!data.mobile) {
              wx.navigateTo({
                url: '/pages/personal-center/registered/registered'
              })
            }
            that.authlogin();//获取token
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          if (app.globalData.userInfo.mobile) {
            if (that.data.refId) {
              that.gettopiclist(that.data.refId);
              that.getfood();
            }
          }
        }
      }
    })
  },



  getuserif: function (val) {  //从自己的服务器获取用户信息
    let that = this;
    this.setData({
      _userId:val
    })
    wx.request({  //从自己的服务器获取用户信息
      url: this.data._build_url + 'user/get/' + val,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let data = res.data.data, reg = /^1[34578][0-9]{9}$/, _nickName='';
          if (data.nickName && reg.test(data.nickName)) {
            data.nickName = data.nickName.substr(0, 3) + "****" + data.nickName.substr(7)
          }
          if (data.userName && reg.test(data.userName)) {
            data.userName = data.userName.substr(0, 3) + "****" + data.userName.substr(7)
          }
          if (data.nickName == 'null' || !data.nickName){
            _nickName = data.userName;
          }else{
            _nickName = data.nickName;
          }
          that.setData({
            _iconUrl: data.iconUrl,
            _nickName: _nickName
          })
        }
      }
    })
  },
  toindex() {
    wx.switchTab({
      url: '../../index/index',
    })
  },
  getfood: function (_type, data) {
    
    let that = this, _parms={};
    _parms = {
      page: this.data.page,
      row: 8,
      topicType: 2,
      token: app.globalData.token
    }
    Api.topiclist(_parms).then((res) => {

      // console.log('res:', res)
      // return
      let _data = this.data.food,newData=[];
     
      if (res.data.code == 0) {
        wx.hideLoading()
        if (res.data.data.list != null && res.data.data.list != "" && res.data.data.list != []) {
          let footList = res.data.data.list;
          for (let i = 0; i < footList.length; i++) {
            if (footList[i].topicType == 1) { // topicType  1文章  2视频
            } else if (footList[i].topicType == 2) {
              footList[i].content = JSON.parse(footList[i].content);
              if (footList[i].content[0].type == 'video'){
                newData.push(footList[i]);
              }
            }
          }
          if (newData.length){
            for (let i in newData){
              _data.push(newData[i])
            }
            this.setData({
              food: _data
            })
          }else{
            this.setData({
              page:this.data.page+1
            })
            this.getfood();
          }
        } 
      }
    })
  },
  gettopiclist: function (id) {  //获取文章内容数据
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _parms = {
      id: id,
      zanUserId: app.globalData.userInfo.userId,
      zanUserName: app.globalData.userInfo.userName,
      zanSourceType: '1',
      token: app.globalData.token
    },that=this;
    Api.getTopicByZan(_parms).then((res) => {
      if (res.data.code == 0) {
        that.getcmtlist(id);

        let _data = res.data.data;
        that.getuserif(_data.userId)
       
        _data.summary = utils.uncodeUtf16(_data.summary);
        _data.content = utils.uncodeUtf16(_data.content);
        _data.timeDiffrence = utils.timeDiffrence(res.data.currentTime, _data.updateTime, _data.createTime)
        _data.content = JSON.parse(_data.content);
        _data.hitNum = utils.million(_data.hitNum);
        _data.zan = utils.million(_data.zan);
        let _arr = _data.updateTime.split(' ');
        let arr = _arr[0].split('-');
        _data.updateTime = arr[1] + '-' + arr[2]+' '+ _arr[1];
        let reg = /^1[34578][0-9]{9}$/;
        if (reg.test(_data.userName)) {
          _data.userName = _data.userName.substr(0, 3) + "****" + _data.userName.substr(7);
        }
        if (_data.isZan==0){  //
          that.setData({
            isdtzan:true
          })
        }else{
          that.setData({
            isdtzan: false
          })
        }
        that.setData({
          currentUrl: _data.content[0].value ? _data.content[0].value : videoUrl,
          cotitle: utils.uncodeUtf16(_data.title),
          videodata: _data,
          playerUserId: _data.userId,
          voteNum:_data.zan,
        })
      }
    })
  },
  toplayer:function(){  //to个人主页
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      wx.navigateTo({
        url: '../../activityDetails/homePage/homePage?actId=' + this.data._actId + '&userId=' + this.data._userId,
      })
    }
  },
  showArea() {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      this.setData({
        isComment: !this.data.isComment
      });
    }
  },
  onPageScroll: function () {  //监听页面滑动
    this.setData({
      isComment: false
    })
  },
  toMoreComment() {
    wx.navigateTo({
      url: '../../index/merchant-particulars/total-comment/total-comment?id=' + this.data.refId + '&cmtType=2'
    })
  },
  getCommentVal(e) { //实时获取输入的评论
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function () {  //新增评论
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      if (!this.data.commentVal) {
        wx.showToast({
          title: '请输入评论内容',
          icon: 'none',
          duration: 2000
        })
        this.setData({
          isComment: false
        })
        return false;
      }
      let _value = utils.utf16toEntities(this.data.commentVal)
      this.setData({
        commentVal: _value,
        isComment: false
      })

      let _parms = {
        refId: this.data.refId,
        cmtType: "2",
        content: this.data.commentVal,
        // userId: app.globalData.userInfo.userId,
        // userName: app.globalData.userInfo.userName,
        // nickName: app.globalData.userInfo.nickName,
        token: app.globalData.token
      };
      console.log('_parms:', _parms)
      Api.cmtadd(_parms).then((res) => {
        if (res.data.code == 0) {
          this.setData({
            commentVal: '',
          })
          this.getcmtlist();
        } else {
          wx.showToast({
            title: '系统繁忙,请稍后再试',
            icon: 'none'
          })
        }
      })
    }
  },
  getcmtlist: function (id) {  //获取评论数据
    let _parms = {
      // zanUserId: app.globalData.userInfo.userId,
      token: app.globalData.token,
      cmtType: '2',
      refId: this.data.refId,
      token: app.globalData.token
    }
    Api.cmtlist(_parms).then((res) => {
      let _data = res.data.data;
      _data.total = utils.million(_data.total)
      if (_data.list) {
        let reg = /^1[34578][0-9]{9}$/;
        for (let i = 0; i < _data.list.length; i++) {
          _data.list[i].content = utils.uncodeUtf16(_data.list[i].content)
          _data.list[i].zan = utils.million(_data.list[i].zan)
          if (reg.test(_data.list[i].nickName)) {
            _data.list[i].nickName = _data.list[i].nickName.substr(0, 3) + "****" + _data.list[i].nickName.substr(7)
          }
          if (reg.test(_data.list[i].userName)) {
            _data.list[i].userName = _data.list[i].userName.substr(0, 3) + "****" + _data.list[i].userName.substr(7)
          }
        }
        this.setData({
          comment_list: _data.list,
          totalComment:_data.list.length,
          assNum: _data.list.length,
        })
      }
    })
  },
  castvote: function () {  //選手投票
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _this = this;
    let _parms = {
      actId: this.data.actId,
      // userId: this.data.voteUserIdcastvote,
      playerUserId: this.data.playerUserId,
      token: app.globalData.token
    }
    Api.availableVote(_parms).then((res) => {
      this.setData({
        availableNum: res.data.data.user
      });
      if (this.data.availableNum <= 0) {
        wx.showToast({
          title: '今天票数已用完,请明天再来',
          icon: 'none'
        })
        return false;
      }
      Api.voteAdd(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '投票成功',
            icon: 'none'
          })
          _this.setData({
            availableNum: _this.data.availableNum - 1,
            voteNum: _this.data.voteNum + 1
          });
        }
      });
    });
  },

  toLike: function (e) {//评论点赞
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.showToast({
      mask: true,
      icon: 'none',
      title: '',
      duration: 2000
    })
    let id = e.currentTarget.id, ind = '';
    for (let i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: 4,
      // userId: app.globalData.userInfo.userId,
      token: app.globalData.token
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功',
          duration:2000
        })
        var comment_list = this.data.comment_list;
        comment_list[ind].isZan = 1;
        comment_list[ind].zan++;
        this.setData({
          comment_list: comment_list
        });
      }
    })
  },
  cancelLike(e) {  //取消点赞
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let id = e.currentTarget.id,ind = '';
    for (let i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: 4,
      // userId: app.globalData.userInfo.userId,
      token: app.globalData.token
    }
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: 'true',
          duration: 2000,
          icon: 'none',
          title: '点赞取消'
        })
        var comment_list = this.data.comment_list;
        comment_list[ind].isZan = 0;
        comment_list[ind].zan--;
        if (comment_list[ind].zan <= 0) {
          comment_list[ind].zan = 0;
        }
        this.setData({
          comment_list: comment_list
        });
      }
    })
  },
  handzan:function(){
    if(this.data.isclick){
      this.setData({
        isclick: false
      });
      if (!app.globalData.userInfo.mobile) {
        this.setData({
          issnap: true
        })
      } else {
        if (this.data.isdtzan) {
          this.dianzanwz();
        } else {
          this.quxiaozanwz();
        }
      }
    }
  },
  dianzanwz: function () {  //文章点赞
    let that = this,_details = this.data.videodata;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true,
        clickvideo: false
      })
    }else{
      wx.request({
        url: this.data._build_url + 'zan/add?refId=' + that.data.refId+'&type=2',
        method:'POST',
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
          console.log('res:',res)
          setTimeout(function () {
            that.setData({
              isclick: true
            })
          }, 2000);
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '点赞成功'
            }, 1500)
            _details.isZan = 1
            _details.zan = _details.zan + 1
            let _zan = that.data.zan
            _zan++
            that.setData({
              videodata: _details,
              isdtzan: false,
              voteNum: that.data.voteNum + 1,
            })
          }
        }
      })
    }
  },
  quxiaozanwz: function () {  //文章取消点赞
    let that = this, _details = this.data.videodata;
    if (!app.globalData.userInfo.mobile){
      this.setData({
        issnap: true,
        clickvideo: false
      })
    }else{
      wx.request({ 
        url: this.data._build_url + 'zan/delete?refId=' + that.data.refId + '&type=2',
        method: 'POST',
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
          setTimeout(function () {
            that.setData({
              isclick: true
            })
          }, 2000);
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '取消成功',
            }, 1500)
            _details.isZan = 0
            _details.zan = _details.zan - 1
            if (_details.zan < 0) {
              _details.zan = 0
            }
            let _zan = that.data.zan;
            _zan--;
            that.data.voteNum--;
            if (that.data.voteNum < 0) {
              that.setData({
                voteNum: 0
              })
            }
            that.setData({
              videodata: _details,
              isdtzan: true,
              voteNum: that.data.voteNum,
            })
          }
        }
      })
    }
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },
 
  handshare(){  //关闭打开模态框
    this.setData({
      isshare: !this.data.isshare
    })
  },


  againgetinfo: function () { //点击获取用户unionId
    console.log("againgetinfo")
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        let _pars = {
          sessionKey: app.globalData.userInfo.sessionKey,
          ivData: res.iv,
          encrypData: res.encryptedData
        }
        Api.phoneAES(_pars).then((resv) => {
          if (resv.data.code == 0) {
            that.setData({
              istouqu: false
            })
            let _data = JSON.parse(resv.data.data);
            app.globalData.userInfo.unionId = _data.unionId;
            
          }
        })
      }
    })
  },
//滑动结束事件
  handletouchend: function (event) {
    // console.log("handletouchend:", event)
    if (this.data.videoUrl){
      return false
    }
    var currentX = event.changedTouches[0].pageX
    var currentY = event.changedTouches[0].pageY
    var tx = currentX - this.data.lastX
    var ty = currentY - this.data.lastY
    var text = ""
    //左右方向滑动
    
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {
        console.log("向左滑动");
       
      }
      else if (tx > 0) {
        console.log("向右滑动")
        
      }

    }
    //上下方向滑动
    else {
      if (ty < 0) {
        console.log("向上滑动")
        this.setData({  //上一个视频
          reviousUrl: this.data.currentUrl,
        })

        let _Num = this.data.frenum*1+1;
        if (_Num == this.data.food.length - 1) {
          _Num= 0
        }
        let _curr = this.data.nextUrl ? this.data.nextUrl : this.data.food[_Num].content[0].value, _title = utils.uncodeUtf16(this.data.food[_Num].title), _userId = this.data.food[_Num].userId, _id = this.data.food[_Num].id;
        this.getuserif(_userId);
        this.gettopiclist(_id);
        this.setData({  //当前播放的视频
          currentUrl: _curr,
          refId: this.data.food[_Num].id,
          cotitle: _title,
          frenum: _Num
        })

        _Num = _Num * 1 + 1;

        this.setData({  //下一个视频 
          nextUrl: this.data.food[_Num].content[0].value
        })

        if (_Num >= this.data.food.length-3){
          this.setData({
            page:this.data.page+1
          })
          this.getfood();
        }
      }

      else if (ty > 0) {
        console.log("向下滑动")
        let _Num = this.data.frenum * 1 - 1;
        if (_Num == 0) {
          _Num=this.data.food.length - 1
        }
        this.setData({
          frenum: _Num
        })
        this.setData({  //下一个视频
          nextUrl: this.data.currentUrl,
        })
        let _curr = this.data.reviousUrl ? this.data.reviousUrl : this.data.food[_Num], _title = this.data.food[_Num].title, _userId = this.data.food[_Num].userId, _id = this.data.food[_Num].id;
        this.getuserif(_userId);
        this.gettopiclist(_id);
        this.setData({  //当前播放的视频
          currentUrl: _curr,
          refId: this.data.food[_Num].id,
          cotitle: _title,
          frenum: _Num
        })
        _Num = _Num * 1 - 1;

        this.setData({  //下一个视频 
          reviousUrl: this.data.food[_Num].content[0].value,
        })
      }
    }

    //将当前坐标进行保存以进行下一次计算
    this.data.lastX = currentX
    this.data.lastY = currentY
    this.setData({
      text: text,
    });
  },

  //滑动开始事件
  handletouchtart: function (event) {
    // console.log("handletouchtart:",event)
    this.data.lastX = event.touches[0].pageX;
    this.data.lastY = event.touches[0].pageY;
    this.setData({
      isComment: false
    })
  },
    //滑动移动事件
  handletouchmove: function (event) {
    // console.log("handletouchmove:",event)
    // this.data.currentGesture = 0;
    // console.log("没有滑动");

  },

  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      title: '享7--视频动态',
      path: 'pages/activityDetails/video-details/video-details?id=' + this.data.refId,
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }

})


