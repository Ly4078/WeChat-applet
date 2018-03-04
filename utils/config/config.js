
var BASEURL = "http://www.hbxq001.cn/";   //服务器（后台）域名地址，如果后台更换了地址直接在此统一更换
// var BASEURL_FILE = "https://file.huaaotech.com/"  //另一个地址
var config = {
  GLOBAL_BASE: BASEURL,  //暂时没有，可以不管，保持现状
  // BASEURL_FILE: BASEURL_FILE,   //暂时没有，可以不管，保持现状
  // GLOBAL_API_DOMAIN: BASEURL + "api",  //如果地址更换了或者原地址增加了中间值，通过这种方法统一更换
  GLOBAL_API_DOMAIN: BASEURL,  //暂时没有，可以不管，保持现状
  imgbaseurl: BASEURL + "upload/",  //暂时没有，可以不管，保持现状
  db_prefix: "ha_wx_gbl_"  //暂时没有，可以不管，保持现状
};

module.exports = config;