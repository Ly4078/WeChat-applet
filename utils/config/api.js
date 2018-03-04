import MyHttp from './request.js';
import { myStore } from '../tools/store';

//所有的请求
const ALL_API = {
  userlist: { //openId登录
    method: 'POST',  //请求方式  POST OR GET OR 其他请方式
    url: 'user/list'  //请求地址   完整地址是：http://www.hbxq001.cn/user/list    其中http://www.hbxq001.cn/已经在utils/config/config.js中配置，如果更换了后台地址或服务器，可直接到到config.js中统一更换，此处url只与后面部分
  }
}

const Api = new MyHttp({}, ALL_API);

export default Api;