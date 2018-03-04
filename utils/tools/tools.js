// 本文件为配置文件，保持现状，

import { myStore } from '../tools/store';
import Api from '../config/api';
var config = require('../config/config.js');

class Tool {

  constructor() {

  }

  getImgPath(value) {
    if (typeof (value) != undefined && value && (value.indexOf("http") != 0 && value.indexOf("//") != 0)) {
      return config.imgbaseurl + value;
    } else if (value && 0 == value.indexOf("http") && value.indexOf("www.huaaotech.date") > 0) {
      value = value.replace("www.huaaotech.date", config.domain);
    } else if (value && 0 == value.indexOf("http") && value.indexOf("www.huaaotech.tech") > 0) {
      value = value.replace("www.huaaotech.tech", config.domain);
    }
  
    return value;
  }

  findUserByToken(isRefresh) {
    let _user = myStore.get(myStore.staticName.USER_INFO);


    let _token = myStore.get(myStore.staticName.USER_TOKEN);
    if (!_token) {
      return new Promise(function (resolve, reject) {
        resolve(false);
      });
    }

    return new Promise(function (resolve, reject) {
      if ((typeof (_user) != undefined && _user && "undefined" != _user) && !isRefresh) {
        resolve(_user);
      } else {

        Api.findUserByToken().then((Response) => {
          if (Response && Response.data && Response.data.code == 0) {
            let _data = Response.data.data;
            if (_data) {
              let _auth = _data.user.auth;
              myStore.set(myStore.staticName.USER_AUTH, _auth);
              myStore.set(myStore.staticName.USER_INFO, _data.user);
            }
            resolve(_data.user);

          } else {
            reject(false);
          }
        })
      }
    });
  }

}

export let tools = new Tool();