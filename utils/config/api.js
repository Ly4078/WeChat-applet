import MyHttp from './request.js';
import { myStore } from '../tools/store';

//所有的请求
const ALL_API = {
  userlist: { //openId登录
    method: 'POST',
    url: 'user/list'
  },
  addUserUnionId:{ 
    method:'POST',
    url:'user/addUserUnionId'
  },
  addUserForVersion: { //新增用户
    method: 'POST',
    url: 'user/addUserForVersion'
  },
  findByCode: { //通过code查询用户信息
    method: 'GET',
    url: 'user/findByCode'
  },
  getOpenId: {  //获取openId
    method: 'POST',
    url: 'wxpay/getOpenId'
  },
  useradd: {
    method: 'POST',
    url: 'user/add'
  },
  usersignup: {
    method: 'POST',
    url: 'user/signup'
  },
  updateuser: {  //更新用户信息
    method: 'POST',
    url: 'user/update'
  },
  shoptop: {   //分页查询热门商家列表   推荐餐厅
    method: 'GET',
    url: 'shop/top'
  },
  shoplist: {   //根据条件查询商家列表信息， 分页查询商家列表信息
    method: 'GET',
    url: 'shop/list'
  },
  shopget: {   //根据id查询商家信息
    method: 'GET',
    url: 'shop/get'
  },
  actlist: {   //分页查询活动列表
    method: 'GET',
    url: 'act/list'
  },
  actdetail: {   //查询单个活动详情
    method: 'GET',
    url: 'act/detail'
  },
  acttop: {   //热门活动列表
    method: 'GET',
    url: 'act/top'
  },
  hcllist: {  //首页轮播图
    method: 'GET',
    url: 'hcl/list'
  },
  activityImg: {   //首页活动banner图
    method: 'GET',
    url: 'hcl/listForHomePage'
  },
  topictop: { //首页美食墙
    method: 'GET',
    url: 'topic/top'
  },
  topiclist: {   //主题列表  
    method: 'GET',
    url: 'topic/list'
  },
  actget: {   //根据id查询一条活动信息
    method: 'GET',
    url: 'act/get'
  },

  actshoplist: {  //查询参加某一活动的商家
    method: 'GET',
    url: 'actshop/list'
  },
  actshoptop: {  //根据编号或名称搜索查询参加某一活动的商家某个商家
    method: 'GET',
    url: 'actshop/top'
  },
  merchantEnter: {   //商家入驻信息
    method: 'POST',
    url: 'shopEnter/add'
  },
  terraceRoll: {   //享七劵列表
    method: 'GET',
    url: 'sku/list'
  },
  paymentPay: {   //享七劵列表
    method: 'POST',
    url: '/wxpay/pay'
  },
  voteadd: {  //投票
    method: 'POST',
    url: 'vote/add'
  },
  votedelete: {   //取消投票
    method: 'POST',
    url: 'vote/delete'
  },
  topicadd: {  //文章列表
    method: 'POST',
    url: 'topic/add'
  },
  getTopicByZan: { //获取某个文章详情
    method: 'GET',
    url: 'topic/getTopicByZan'
  },
  cmtlist: {  //查询文章评论
    method: 'GET',
    url: 'cmt/list'
  },
  cmtadd: {   //新增文章评论
    method: 'POST',
    url: 'cmt/add'
  },
  zanadd: {   //点赞
    method: 'POST',
    url: 'zan/add'
  },
  zandelete: {   //取消点赞
    method: 'POST',
    url: 'zan/delete'
  },
  doUnifiedOrder: { //支付接口
    method: 'POST',
    url: 'wxpay/doUnifiedOrder'
  },
  doUnifiedOrderAct: { //活动支付接口
    method: 'POST',
    url: 'wxpay/doUnifiedOrderForAct'
  },
  topicadd: {  //新增文章主题
    method: 'POST',
    url: 'topic/add'
  },
  somyorder: {  //我的订单列表
    method: "GET",
    url: 'so/myorder'
  },
  socreate: {  //创建支付订单
    method: 'POST',
    url: 'so/create'
  },
  skutsc: {  //推荐餐厅
    method: 'GET',
    url: 'sku/tsc'
  },
  photograph: {  //店铺详情图片
    method: 'GET',
    url: 'shop/get'
  },
  takepartin: {  //商家报名活动
    method: 'POST',
    url: 'actshop/add'
  },
  searchByUserId: {  //查询当前userId是否已入驻 
    method: 'GET',
    url: 'shopEnter/searchByUserId'
  },
  hxadd: {  //确认核销
    method: 'POST',
    url: 'hx/add'
  },
  share: {
    method: 'GET',
    url: 'topic/transpond'
  },
  listForHomePage: {
    method: 'GET',
    url: 'hcl/listForHomePage'
  },
  shoplistForHomePage: {
    method: 'GET',
    url: 'shop/listForHomePage'
  },
  listForChuangXiang: {
    method: 'GET',
    url: 'shop/listForChuangXiang'
  },
  myArticleList: {   //我的文章列表
    method: 'GET',
    url: 'topic/myList'
  },
  isNewUser: {     //是否新用户
    method: 'GET',
    url: 'sku/isNewUser'
  },
  getFreeTicket: {    //获取免费票券
    method: 'POST',
    url: 'so/freeOrder'
  },
  selectByShopId: {  //获取商家活动
    method: 'GET',
    url: 'pnr/selectByShopId'
  },
  phoneAES: {  //解密用户手机号
    method: 'POST',
    url: 'wxsign/phoneAES'
  },
  sendForRegister: {  //获取手机验证码
    method: 'POST',
    url: 'sms/sendForRegister'
  },
  isVerify: {  //验证手机验证码
    method: 'GET',
    url: 'sms/isVerify'
  },
  searchByShopName: {
    method: 'GET',
    url: 'shopEnter/searchByShopName'
  },
  getTscForZan: {  //查询特色菜详情
    method: 'GET',
    url: 'sku/getTscForZan'
  },
  apply: {    //报名接口
    method: 'POST',
    url: 'actSign/add'
  },
  actisSign: {  //查询是否已经报名
    method: 'GET',
    url: 'actSign/isSign'
  },
  dishDetails: {  //活动推荐菜详情页
    method: 'GET',
    url: 'actSku/findByInVo'
  },
  playerDetails: {  //活动选手详情页
    method: 'GET',
    url: 'actUser/findByInVo'
  },
  isGroung: {    //查询活动是否分组
    method: 'GET',
    url: 'actGroup/selectOutAll'
  },
  hotActShopList: {    //活动商家列表
    method: 'GET',
    url: 'actshop/listNewAct'
  },
  hotActPlayerList: {    //活动选手列表
    method: 'GET',
    url: 'actUser/listNewAct'
  },
  searchShop: {      //搜索活动中的商家
    method: 'GET',
    url: 'actshop/listNewAct'
  },
  searchUser: {      //搜索活动中的选手
    method: 'GET',
    url: 'actUser/listNewAct'
  },
  dishList: {      //十堰百菜活动中的招牌菜
    method: 'GET',
    url: 'actSku/listNewAct'
  },
  actTicket: {      //活动券
    method: 'GET',
    url: 'sku/listForAct'
  },
  isGetActCoupons: {    //是否可以领取活动券
    method: 'GET',
    url: 'vote/canGetSku'
  },
  getActCoupons: {     //领取活动券
    method: 'POST',
    url: 'so/freeOrderForAct'
  },
  voteAdd: {     //活动投票
    method: 'POST',
    url: 'vote/add'
  },
  agioList: { //查询商家套餐
    method: 'GET',
    url: 'sku/agioList'
  },
  listForAgio: {  //套餐详情
    method: 'GET',
    url: 'sku/listForAgio'
  },
  freeOrderForAgio: {
    method: 'POST',
    url: 'so/freeOrderForAgio'
  },
  getAgio: {
    method: 'GET',
    url: 'sku/getAgio'
  },
  judgment: {     //判斷是否投票
    method: 'GET',
    url: 'vote/canVote'
  },
  searchForShopId:{  //查询商家是否参加某一活动
    method:'GET',
    url:'actshop/searchForShopId'
  },
  searchForShopIdNew: {  //查询商家是否参加某一活动(后来的)
    method: 'GET',
    url: 'actshop/searchForShopIdNew'
  },
  accountBalance: { //查询账户余额
    method: 'GET',
    url: 'account/balance'
  },
  detailList: { //余额明细列表
    method: 'GET',
    url: 'account/listTrading'
  },
  redpacket: {  //获取可领取的随机红包金额
    method:'POST',
    url:'account/redPacket'
  },
  listShopUser:{  //在商家内获取当前商家票券
    method:'GET',
    url:'cp/listShopUser'
  },
  createForShop:{  //商家内购买生成订单
    method:'POST',
    url:'so/createForShop'
  },
  doUnifiedOrderForShop:{  //商家订单支付
    method:'POST',
    url:'wxpay/doUnifiedOrderForShop'
  },
  myorderForShop:{  //查询我的商家订单
    method:"GET",
    url:'so/myorderForShop'
  },
  selectForOne:{  //查询商家是否参加商家订单
    method:'GET',
    url:'shopAllocation/selectForOne'
  },
  getByCode:{ //通过shopcode查询商家信息
    method:'GET',
    url:'shop/getByCode'
  },
  availableVote:{//可投票数
    method: 'GET',
    url: 'act/actVoteNums'
  },
  sharePic: {//分享到朋友圈的截图
    method: 'GET',
    url: 'act/CreateCode'
  },
  pushSoByShop:{//消息推送
    method:'GET',
    url:'shop/pushSoByShop'
  },
  actzanTotal:{
    method:'GET',
    url:'act/zanTotal'
  }
}
const Api = new MyHttp({}, ALL_API);

export default Api;