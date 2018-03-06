import MyHttp from './request.js';
import { myStore } from '../tools/store';

//所有的请求
const ALL_API = {
  userlist: { //openId登录
    method: 'POST',  //请求方式  POST OR GET OR 其他请方式
    url: 'user/list'  //请求地址   完整地址是：http://www.hbxq001.cn/user/list    其中http://www.hbxq001.cn/已经在utils/config/config.js中配置，如果更换了后台地址或服务器，可直接到到config.js中统一更换，此处url只与后面部分
  }, 
  shoptop: {   //分页查询热门商家列表
    method: 'GET',
    url: 'shop/top'
  },
  shoplist: {   //分页查询商家列表信息
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
  actget: {   //分页查询活动列表
    method: 'GET',
    url: 'act/get'
  }
}

const Api = new MyHttp({}, ALL_API);

export default Api;