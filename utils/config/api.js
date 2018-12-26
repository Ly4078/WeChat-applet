import MyHttp from './request.js';
import { myStore } from '../tools/store';

//所有的请求
const ALL_API = {
  userlist: { //openId登录
    method: 'POST',
    url: 'user/list'
  },
  addUserUnionId: {
    method: 'POST',
    url: 'auth/addUserUnionId'
  },
  addUserForVersion: { //新增用户
    method: 'POST',
    url: 'user/addUserForVersion'
  },
  findByCode: { //通过code查询用户信息
    method: 'GET',
    url: 'auth/findByCode'
  },
  getOpenId: {  //获取openId
    method: 'POST',
    url: 'auth/getOpenId'
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
  activityImg: {   //首页活动banner图 其它图片
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
  myorderForShop: {  //查询我的商家订单
    method: "GET",
    url: 'so/myorderForShop'
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
  isNewUser: {     //查询新用户是否已经领券
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
    url: 'auth/phoneAES'
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
  searchForShopId: {  //查询商家是否参加某一活动
    method: 'GET',
    url: 'actshop/searchForShopId'
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
    method: 'POST',
    url: 'account/redPacket'
  },
  listShopUser: {  //在商家内获取当前商家票券
    method: 'GET',
    url: 'cp/listShopUser'
  },
  createForShop: {  //商家内购买生成订单
    method: 'POST',
    url: 'so/createForShop'
  },
  doUnifiedOrderForShop: {  //商家订单支付
    method: 'POST',
    url: 'wxpay/doUnifiedOrderForShop'
  },
  authlogin:{ //获取token
    method:'GET',
    url:"auth/login"
  },
  selectForOne: {  //查询商家是否参加商家订单
    method: 'GET',
    url: 'shopAllocation/selectForOne'
  },
  getByCode: { //通过shopcode查询商家信息
    method: 'GET',
    url: 'shop/getByCode'
  },
  availableVote: {//可投票数
    method: 'GET',
    url: 'act/actVoteNums'
  },
  sharePic: {//分享到朋友圈的截图
    method: 'GET',
    url: 'act/CreateCode'
  },
  pushSoByShop: {//消息推送
    method: 'GET',
    url: 'shop/pushSoByShop'
  },
  actzanTotal: {
    method: 'GET',
    url: 'act/zanTotal'
  },
  addVideo: {
    method: 'POST',
    url: 'actTopic/add'
  },
  videoList: {
    method: 'GET',
    url: 'actTopic/listNewAct'
  },
  videoData: {
    method: 'GET',
    url: 'actTopic/zanAndHitTotal'
  },
  likeList: {       //关注列表
    method: 'GET',
    url: 'userConcern/list'
  },
  addLike: {         //添加关注
    method: 'POST',
    url: 'userConcern/add'
  },
  delLike: {          //取消关注
    method: 'POST',
    url: 'userConcern/delete'
  },
  getLikeNum: {        //获取关注数
    method: 'GET',
    url: 'userConcern/nums'
  },
  deleteArticle: {    //删除文章
    method: 'POST',
    url: 'topic/delete'
  },
  speciesList: {    //金币列表     
    method: 'get',
    url: 'account/listTrading'
  },
  getTicketaBlance: {    //金币余额
    method: 'get',
    url: 'account/findGold'
  },
  vegetables: {    //是否为某道菜砍过价
    method: 'GET',
    url: 'goodsBar/skuRedis'
    // url: 'bargain/skuRedis'
  },
  bargainList: {    //我的砍价列表
    method: 'get',
    url: 'bargain/userRedis'
  },
  partakerList: {     //砍菜列表
    method: 'GET',
    url: 'goodsSku/listForAct'
    // url: 'sku/kjcList'
  },
  listForActs: {     //砍菜列表
    method: 'GET',
    url: 'goodsSku/listForAct'
  },
  discountDetail: {    //砍价菜详情
    method: 'GET',
    url: 'sku/getKjc'
  },
  createBargain: {    //创建砍菜信息
    method: 'POST',
    url: 'gold/initiator'
  },
  bargainDetail: {   //获取砍菜详情
    method: 'GET',
    url: 'bargain/skuGroup'
  },
  getGold: {   //券核销完成后给金币
    method: 'POST',
    url: 'account/ingold'
  },
  setPullUser: {  //上传推荐人userId
    method: 'POST',
    url: 'pullUser/update'
  },
  isHelpfriend: {    //查询能否帮好友砍价
    method: 'GET',
    url: 'gold/getshior'
  },
  helpfriend: {    //帮好友砍价
    method: 'POST',
    url: 'gold/helpfriend'
  },
  createBargainTick: {     //新增砍菜券
    method: 'POST',
    url: 'sku/addSkuForKj'
  },
  addSecKill: {    //新增抢购券
    method: 'POST',
    url: 'sku/addSkuForQg'
  },
  addCrabTicket: {    //新增螃蟹券
    method: 'POST',
    url: 'sku/addSkuForDh'
  },
  buyBargainTick: {      //购买砍菜券
    method: 'POST',
    url: 'wxpay/doUnifiedOrderForKj'
  },
  buySecKill: {    //购买抢购券
    method: 'POST',
    url: 'wxpay/doUnifiedOrderForQg'
  },
  buyCrabTicket: {    //购买螃蟹券
    method: 'POST',
    url: 'wxpay/doUnifiedOrderForDh'
  },
  secKillList: {     //限时秒杀列表
    method: 'GET',
    url: 'sku/qgcList'
  },
  mySecKill: {   //我的秒杀列表
    method: 'GET',
    // url: 'user/myRedislist',
    url:'user/mySencondsKillList'
  },
  secKillDetail: {   //秒杀菜品详情
    method: 'GET',
    url: 'sku/getQgc'
  },
  createSecKill: {     //创建秒杀菜
    method: 'GET',
    // url: 'user/invite',
    url:'user/inviteNewPeople'
  },
  inviteNum: {    //查询邀请人数
    method: 'GET',
    // url: 'user/getNewUser'
    url:'user/getGoodsSkuAndUserList'
  },
  crabList: {      //享7生鲜--送货到家(螃蟹规格列表)
    method: 'GET',
    // url: 'goodsSku/list'
    url: 'goodsSku/listNew'
  },
  listForSkuAllocation: {      //享7生鲜--品质好店(螃蟹列表)
    method: 'GET',
    url: 'shop/listForSkuAllocation'
  },
  DetailBySkuId: {      //享7生鲜--商品详情(螃蟹列表)   
    method: 'GET',
    url: 'goodsSku/selectDetailBySkuId'
  },
  dhcList: {      //享7生鲜--品质好店详情-->列表
    method: 'GET',
    url: 'sku/dhcList'
  },
  detailsList: {      //享7生鲜--品质好店菜品详情
    method: 'GET',
    url: 'sku/getDhc'
  },
  inviteNewUser: {    //邀请新人注册后保存进秒杀信息
    method: 'POST',
    url: 'user/upPeopleNum'
  },
  AddressList: {  //根据userid查询用户收货地址信息
    method:'GET',
    url:'orderAddress/getAddressList'
  },
  singleAddress: {  //根据id查询单个收货地址信息
    method: 'GET',
    url: 'orderAddress/getAddress'
  },
  AddAddress:{ //新增用户收货地址
    method:'POST',
    url: 'orderAddress/inAddress'
  },
  outAddress:{ //删除某条收货地址
    method:'POST',
    url:'orderAddress/outAddress'
  },
  upAddress:{ //更新某条收货地址
    method:'POST',
    url:'orderAddress/upAddress'
  },
  findDictCity:{ //查询地市级数据
    method:'GET',
    url:'dict/findDictCity'
  },
  findDictCounty: { //查询县区级数据
    method: 'GET',
    url: 'dict/findDictCounty'
  },
  confirmCeceipt:{ // 确认收货
    method:'POST',
    url:'orderInfo/confirmCeceipt'
  },
  createorder:{  //创建平台订单
    method:'POST',
    url:'orderInfo/create'
  },
  shoppingMall:{//送货到家微信支付
    method:'POST',
    url:'wxpay/doUnifiedOrderForShoppingMall'
  },
  MallForCoupon: {//礼品券购买
    method: 'POST',
    url: 'wxpay/shoppingMallForCoupon'
  },
  orderInfoList:{  //查询送货到家订单列表
    method:'GET',
    url:'orderInfo/list'
  },
  orderInfoDetail: {//查询送货到家单个订单详情
    method:'GET',
    url:'orderInfo/getDetailNew'
  },
  createCrabDish: {    //创建砍蟹接口
    method: 'POST',
    url: 'gold/createQg'
  },
  crabDishDetail: {   //螃蟹兑换菜详情
    method: 'GET',
    url: 'sku/getDhc'
  },
  isBargainCrab: {    //查询是否能帮好友砍螃蟹
    method: 'GET',
    url: 'gold/getshiorQg'
  },
  bargainCrab: {    //帮好友砍螃蟹
    method: 'POST',
    url: 'gold/helpfriendQg'
  },
  confirmCeceipt:{ //确认收货
    method:'POST',
    url:'orderInfo/confirmCeceipt'
  },
  orderCoupon:{  //查询我的礼品券列表
    method:'GET',
    // url:'orderCoupon/listForSend'
    url:'orderCoupon/listForSendNew'
  },
  dhCoupon: {  //查询我的礼品券兑换记录列表
    method: 'GET',
    url:'orderCoupon/list'
  },
  calculateCost:{//查询邮费
    method:'POST',
    url:'deliveryCost/calculateCost'
  },
  findByGoodsSkuId:{  //查询收货地址是否在配送范围内
    method:'GET',
    url:'deliveryCost/findByGoodsSkuId'
  },
  CostforCoupon:{//查询提蟹券邮费
    method:'POST',
    url:'deliveryCost/calculateCostForCoupon'
  },
  useCoupon:{//礼品券兑换
    method:'POST',
    url:'orderCoupon/useCoupon'
  },
  orderCouponForSendAmount:{ //支付券运费 
    method:'POST',
    url:'wxpay/orderCouponForSendAmount'
  },
  createCrab: {    //发起邀请新人送螃蟹
    method: 'POST',
    url:'pullUser/inUserPull'
  },
  inquireInviteNum: {    //查询邀请螃蟹人数
    method: 'GET',
    url: 'pullUser/getInfo'
  },
  emptyInviteNum: {    //清空邀请螃蟹人数
    method: 'POST',
    url: 'pullUser/upNums'
  },
  addInviteCrab: {    //螃蟹兑换增加新用户
    method: 'POST',
    url: 'pullUser/upNumsUp'
  },
  sendCoupon:{//领取提蟹券
    method:'POST',
    url:'orderCoupon/sendCoupon'
  },
  sendVersionCoupon: {//领取提蟹券 -- 修正版本
    method: 'POST',
    url: 'orderCoupon/sendVersionCoupon'
  },
  listCoupon:{ //查询提蟹券赠送记录
    method:'GET',
    url:'orderCoupon/listCoupon'
  },
  superMarketUrl: {   //超市列表
    method: 'GET',
    url: 'salePoint/listNew'
  },
  storeSrabList: {   //到店提货螃蟹列表
    method: 'GET',
    url:'salePoint/getGoodsListBySalePointIdNew'
  },
  superMarketDetail: {   //超市详情
    method: 'GET',
    url: 'salePoint/getSalePointById'
  },
  superMarketPayment: {    //到店自提支付
    method: 'POST',
    url: 'wxpay/shoppingMallForMDZT'
  },
  getSalePointUserByUserId:{ //查询是否是自营店核销员
    method:'GET',
    url:'salePoint/getSalePointUserByUserId'
  },
  useOrderInfo:{ //核销自营订单券
    method:'POST',
    url:'orderInfo/useOrderInfo'
  },
  addFormIdCache:{  //缓存formId
    method:'GET',
    url:'msg/addFormIdCache'
  }
}
const Api = new MyHttp({}, ALL_API);

export default Api;