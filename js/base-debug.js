////////////////////////////////////////////////////////////////////////////////
//  名称: 嗒嗒 JS 库
//  版本: 1.0.0
//  作者: 嗒嗒 H5 开发
//  说明: 包含常用工具函数、消息组件等
//  更新: 2015-9-10
////////////////////////////////////////////////////////////////////////////////

 // JS 浮点数四则运算精度丢失解决方案
 // 加法
Number.prototype.add = function(arg) {
  var m, m1, m2;

  try {
    m1 = this.toString().split('.')[1].length;
  } catch (e) {
    m1 = 0;
  }

  try {
    m2 = arg.toString().split('.')[1].length;
  } catch (e) {
    m2 = 0;
  }

  m = Math.pow(10, Math.max(m1, m2));
  return (this * m + arg * m) / m;
};

// 减法
Number.prototype.sub = function(arg) {
  return this.add(-arg);
};

// 乘法
Number.prototype.mul = function(arg) {
  var m = 0;
  var s1 = this.toString();
  var s2 = arg.toString();

  try {
    m += s1.split('.')[1].length;
  } catch (e) {}

  try {
    m += s2.split('.')[1].length;
  } catch (e) {}

  return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
};

// 除法
Number.prototype.div = function(arg) {
  var m1 = 0,
    m2 = 0,
    n1, n2;

  try {
    m1 = this.toString().split('.')[1].length;
  } catch (e) {}

  try {
    m2 = arg.toString().split('.')[1].length;
  } catch (e) {}

  n1 = Number(this.toString().replace('.', ''));
  n2 = Number(arg.toString().replace('.', ''));
  return (n1 / n2) * Math.pow(10, m2 - m1);
};

var B = {};
B.url = {};
B.url.getParam = function(name, url) {
  url = url || location.href;
  var reg = new RegExp("(^|&|\\?|#)" + name + "=([^&]*?)(&|#|$)");
  var tempHash = url.match(/#.*/) ? url.match(/#.*/)[0] : "";
  url = url.replace(/#.*/, "");

  if (reg.test(tempHash)) {
    return decodeURIComponent(tempHash.match(reg)[2]);
  } else if (reg.test(url)) {
    return decodeURIComponent(url.match(reg)[2]);
  } else {
    return '';
  }
};

B.url.setParam = function(name,value,url,isHashMode) {
    if(typeof name === 'undefined' || typeof value === 'undefined' || typeof url === 'undefined'){
        return url;
    }
    var separator,reg = new RegExp("(^|&|\\?|#)"+name+"=([^&]*?)(&|#|$)"),
        tempHash=url.match(/#.*/)?url.match(/#.*/)[0]:"";

    url=url.replace(/#.*/,"");
    if(isHashMode===true){
        if(reg.test(tempHash)){
            tempHash=tempHash.replace(reg,function(m,r1,r2,r3){return r1+name+"="+encodeURIComponent(value)+r3 ;});
        }else{
            separator=tempHash.indexOf("#")===-1?"#":"&";
            tempHash=tempHash+separator+name+"="+encodeURIComponent(value);
        }
        tempHash=tempHash.replace(reg,function(m,r1,r2,r3){return r1+name+"="+encodeURIComponent(value)+r3 ; });
        return tempHash + url;
    }else if(reg.test(url)){
        url=url.replace(reg,function(m,r1,r2,r3){return r1+name+"="+encodeURIComponent(value)+r3 ; });
    }else{
        separator = url.indexOf("?")===-1?"?":"&";
        url=url+separator+name+"="+encodeURIComponent(value);
    }
    return url+tempHash;
};

B.url.parseHash = function(hash) {
  var tag, query, param = {};
  var arr = hash.split('?');
  tag = arr[0];

  if (arr.length > 1) {
    var seg, s;
    query = arr[1];
    seg = query.split('&');

    for (var i = 0; i < seg.length; i++) {
      if (!seg[i]) continue;
      s = seg[i].split('=');
      param[s[0]] = s[1];
    }
  }

  return {
    hash: hash,
    tag: tag,
    query: query,
    param: param
  };
};

// 将 url 中的参数全部提取到一个对象中并返回
B.url.getObj = function(url) {
  var obj = B.url.parseHash(url);
  return obj.param;
};

B.url.setObj = function(url, obj) {
  $.each(obj, function(key, value) {
    url = B.url.setParam(key, value, url);
  });
  return url;
};

B.user = {};

B.user.isLogin = function(){
  return !!(ddb.cookie('wx_user_id') && ddb.cookie('wx_mobile') && ddb.cookie('wx_device_id'));
};

B.user.login = function(referrer) {
  referrer = referrer || location.href;
  location.href = B.url.setParam('referrer', referrer, '../tpl/login.html');
};

B.user.getAddress = function() {
  if (B.user.isLogin()) {
    var address = JSON.parse(localStorage.getItem('__dadabus_common_address_' + ddb.cookie('wx_user_id') + '__')),
      url = location.href;

    if (!address) {
      return false;
    }

    if ($.isPlainObject(address.company)) {
      url = B.url.getParam('on_site') ? url : B.url.setParam('on_site', address.company.title, url);
      url = B.url.getParam('on_site_lng') ? url : B.url.setParam('on_site_lng', address.company.lng, url);
      url = B.url.getParam('on_site_lat') ? url : B.url.setParam('on_site_lat', address.company.lat, url);
    }

    if ($.isPlainObject(address.home)) {
      url = B.url.getParam('off_site') ? url : B.url.setParam('off_site', address.home.title, url);
      url = B.url.getParam('off_site_lng') ? url : B.url.setParam('off_site_lng', address.home.lng, url);
      url = B.url.getParam('off_site_lat') ? url : B.url.setParam('off_site_lat', address.home.lat, url);
    }
    // history.replaceState(null,'',url);
  }
};

var ddb = {};
ddb.version = '1.7.0';
ddb.dev_status = 'release'; // 正式环境
//ddb.dev_status = 'pre'; // 预发布环境
// ddb.dev_status = 'test'; // 测试环境
// ddb.dev_status = 'dev'; // 本地调试
ddb.api = ddb.train_api = 'http://' + (ddb.dev_status === 'release' ? '' : ddb.dev_status + '.') + 'api.dadabus.com/';
// ddb.train_api = 'http://' + (ddb.dev_status === 'release' ? '' : ddb.dev_status + '.') + 'api.dadabus.com/';
// ddb.app_api = '/v2/app/api?parames=';
// ddb.debugMobile = '137xxx';
ddb.xhrs = [];
ddb.noop = function() {};

;(function() {
  var common = {
    version: ddb.version,
    login_type: 1, // 乘客端
    device_type: 3, // 设备类型 web 端
    user_id: '6716', // 用户 id，测试使用
    mobile: '13413775701', // 测试使用
    device_id: 13413775701, // 测试使用
    login_token: '123456', // 测试使用
    ddb_token: '',
    ddb_src_id: '',
    lat: 1,
    lng: 1,
    // page_size: 6,
    // page_index: 1,
    source: 3 // 请求来源：1-安卓，2-IOS，3-新版微信，4-快捷购票
  };

  var initCommon = function() {
    var mobile = Cookie('wx_mobile');
    var gps = ddb.pgps('ddb_user_gps');
    var ddbCity;

    if (mobile !== common.mobile) {
      common.mobile = mobile;
      common.user_id = Cookie('wx_user_id');
      common.device_id = Cookie('wx_device_id');
      common.login_token = Cookie('wx_login_token');
      common.ddb_token = Cookie('wx_ddb_token');
      common.ddb_src_id = Cookie('ddb_src_id');
      ddbCity = localStorage.getItem('ddbCity');
      common.city_code = ddbCity ? ddbCity.split('/')[1] : '0755';
    }

    if (gps) {
      common.lng = gps.lng;
      common.lat = gps.lat;
      common.gps_sampling_time = gps.gps_sampling_time;
    }

    common.cache_time = Math.random();
  };

    function DdbPost(url,postData,callback,err){
         initCommon();
         var dtd = $.Deferred();
         var pDt = $.extend({},common);
         var cachekey = postData.cachekey;
         var xhr;

         url = postData.urlType === 'app' ? url : ddb.api + url;

        function process(d) {
          if (+d.ret !== 0) {
            //alert(d.msg+"d.ret="+d.ret);
            if (+d.ret === 8001 || +d.ret === 8002 || +d.ret === 8003) {
              // 用户未登陆，跳转到登陆页面
              var url = 'http://' + location.host + '/v2/res/src/tpl/login.html';
              location.href = B.url.setParam('referrer', location.href, url);
              dtd.reject();
              return false;
            }
            // dtd.reject();
            // return false;
          }
          callback(d);
          dtd.resolve(d);
        }

         if (cachekey && sessionStorage[cachekey]) {
             console.log('Cached: ', !!sessionStorage[cachekey]);
             process(JSON.parse(sessionStorage[cachekey]));
             return dtd.promise();
         }

         xhr = $.ajax({
             url: url,
             dataType: 'json',
             type: 'POST',
             data: $.extend(pDt,postData),
             success:function(d){
                process(d);
                console.log('post:', d);
                // 缓存数据
                if (cachekey) {sessionStorage[cachekey] = JSON.stringify(d);}
             },
             error:function(msg){
                 if(typeof  err == "function"){
                     err(msg);
                 }
                 ddb.msg("网络异常!");
                 console.log(msg);
                 dtd.reject();
             }
         });

         ddb.xhrs.push(xhr);
         return dtd.promise();
     }

     // 目前是静态页面,登陆成功以后, 需要跳转到后台控制器去设置session等
    function getOpenId(retUrl, isWeixin) {
      var ciUrl = "http://" + location.host + "/v2/wechat_menu/getOpenId?";
      ciUrl = B.url.setParam('referrerSrc', retUrl ? retUrl : location.href, ciUrl);
      var url = '';

      if (isWeixin) {
        var wxUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?";
        var appid = "wx108854b0f729a8e5";

        if (ddb.dev_status === "release") {
          appid = "wx72a2b17c7ed41fe8";
        }

        url = B.url.setObj(wxUrl, {
          appid: appid,
          redirect_uri: ciUrl,
          response_type: "code",
          scope: "snsapi_base"
        });
        url += "#wechat_redirect";
      } else {
        url = ciUrl;
      }

      if (1 != B.url.getParam("hasOpenid")) {
        location.href = url;
      }
    }

    function DdbGet(url, postData, callback, err) {
        initCommon();
        var dtd = $.Deferred();
        var pDt = $.extend({}, common);
        var cachekey = postData.cachekey;
        var xhr;

        if (postData.urlType === 'app') {
          url = postData.url || url;
        } else if (postData.urlType === 'train.api') {
          url = ddb.train_api + url;
        } else {
          url = postData.url || ddb.api + url;
        }

        function process(d) {
          // 不检测登录状态
          // if (postData.urlType === 'app') {
          //   if (typeof callback === 'function') {
          //     callback(d);
          //   }
          //   dtd.resolve(d);
          //   return true;
          // }

          if (+d.ret !== 0) {
            if ((+d.ret === 8001 || +d.ret === 8002 || +d.ret === 8003)) {
              if (postData.notCheckLogin) {
                dtd.reject(d);
                return false;
              } else {
                // 用户未登陆，跳转到登陆页面
                var url = 'http://' + location.host + '/v2/res/src/tpl/login.html';
                location.href = B.url.setParam('referrer', location.href, url);
              }
            }

            if (+d.ret == 6001) {
              if (!postData.notCheckLogin) {
                ddb.openid(0, true);
              }
              dtd.reject(d);
              return false;
            }
          }
          if (typeof callback == "function") {
            callback(d);
          }
          dtd.resolve(d);
        }

        if (cachekey && sessionStorage[cachekey]) {
          console.log('Cached: ', !!sessionStorage[cachekey]);
          process(JSON.parse(sessionStorage[cachekey]));
          return dtd.promise();
        }

        xhr = $.ajax({
          url: url,
          dataType: postData.dataType || 'json',
          type: 'GET',
          data: $.extend(pDt, postData),
          success: function(d, status, xhr) {
            // ddb.Popup.loading.hide();
            process(d);
            console.log('get: ', d);
            // 缓存数据
            if (cachekey) {
              sessionStorage[cachekey] = JSON.stringify(d);
            }
          },
          error: function(msg) {
            // ddb.Popup.loading.hide();
            if (typeof err == "function") {
              err(msg);
            }
            // ddb.msg('网络异常!');
            console.log('网络异常：', msg);
            dtd.reject(msg);
          }
        });

        ddb.xhrs.push(xhr);
        // console.log(ddb.xhrs);
        if (postData.returnXhr) {
          return xhr;
        }
        return dtd.promise();
    }

    function DdbGetJsonp(url,postData,callback,err){
        initCommon();
        var dtd = $.Deferred();
        var pDt = $.extend({},common);
        var cachekey = postData.cachekey;
        var xhr;

        url = postData.urlType === 'app' ? url : ddb.api + url;

        function process(d) {
            callback(d);
            dtd.resolve(d);
        }

        if (cachekey && sessionStorage[cachekey]) {
            console.log('Cached: ', !!sessionStorage[cachekey]);
            process(JSON.parse(sessionStorage[cachekey]));
            return dtd.promise();
        }

        xhr = $.ajax({
          url: url,
          dataType: 'jsonp',
          type: 'GET',
          jsonp: 'cb',
          // jsonpCallback: 'success_jsonpCallback',
          data: $.extend(pDt, postData),
          success: function(d) {
            process(d);
            console.log(d);

            // 缓存数据
            if (cachekey) {
              sessionStorage[cachekey] = JSON.stringify(d);
            }
          },
          error: function(msg) {
            if (typeof err === 'function') {
              err(msg);
            }

            console.log(msg);
            dtd.reject(msg);
          }
        });

        ddb.xhrs.push(xhr);
        return dtd.promise();
    }

    function Cookie(name, value, options) {
      options = options || {};

      if (typeof value === 'undefined') {
        return getCookie(name);
      // } else if (value === null) {
      } else if (value === null || value === '') {
        return clearCookie(name, options);
      } else {
        return setCookie(name, value, options);
      }

      function setCookie(name, value, options) {
        var expires = options.expires;
        var path = options.path;
        var domain = options.domain;
        var secure = options.secure;

        // 缓存时间转为日期对象
        if (typeof expires === 'number') {
          // expires = new Date(new Date().getTime() + expires * 1000 * 60 * 60); // 缓存时间单位：小时
          // expires = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24); // 缓存时间单位：天
          expires = new Date(new Date().getTime() + expires * 864e+5); // 缓存时间单位：天
        }
        // if (typeof expires === 'number') {
        //   expires = new Date();
        //   expires.setDate(expires.getDate() + options.expires); // 缓存时间单位：天
        // }

        // document.cookie = name + '=' + escape(value) + ((expires) ? '; expires=' + expires.toGMTString() : '') + ((path) ? '; path=' + path : '; path=/') + ((domain) ? ';domain=' + domain : '');
        document.cookie =
          name + '=' + escape(value) +
          (expires ? '; expires=' + expires.toUTCString() : '') +
          (path ? '; path=' + path : '') +
          (domain ? '; domain=' + domain : '') +
          (secure ? '; secure' : '');

        return true;
      };

      function getCookie(name) {
        var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
        if (arr !== null) {
          return unescape(arr[2]);
        }

        // return null;
        return '';
      };

      function clearCookie(name, options) {
        // document.cookie =
        //   name + '=' +
        //   (options.path ? '; path=' + options.path : '') +
        //   (options.domain ? '; domain=' + options.domain : '') +
        //   '; expires=Fri, 02-Jan-1970 00:00:00 GMT';

        options.expires = new Date(0);
        return setCookie(name, '', options);
      }
    }

    function JumpUrl(page, host, noState) {
      var h = 'http://' + location.host + '/v2/res/src/tpl/' + page;
      var url = host ? host : h;

      if (noState) {
        window.history.replaceState(history.state, '', url);
      } else {
        // window.history.pushState(history.state, '' ,url);
        location.href = url;
      }
    }

    // 数据存储
    function storage(type, key, val) {
      if (window[type]) {
        if (typeof val === 'undefined') { // 没有 val 时为读取
          try {
            return JSON.parse(window[type].getItem(key));
          } catch(r) {
            return window[type].getItem(key);
          }
        } else if (val === null || val === '') { // 值为 null 时为删除
          return window[type].removeItem(key);
        } else { // 有 val 时为写入
          return window[type].setItem(key, JSON.stringify(val));
        }
      }
    }

    // 本地数据存储
    function Store(name, value) {
      return storage('localStorage', name, value);
    }

    // 用户页面跳转时，参数传递
    function PageParams(pageid, value) {
      return storage('sessionStorage', pageid, value);
    }

    // 微信上调试，弹出信息，正式版时，return false;
    function DebugAlertJson(d) {
      if (ddb.dev_status === 'release' && ddb.debugMobile !== ddb.cookie('wx_mobile')) {
        return false;
      }
      // oAlert('Debug:\n' + JSON.stringify(d));
      console.log('Debug: ', d);
    }

    function RemovestoreDate() {
      var userId = ddb.cookie('wx_user_id') || 'unlogin',
        key = '__dadabus_selected_date_' + userId + '__',
        code = B.url.getParam('line_code'),
        dateObj = JSON.parse(localStorage.getItem(key) || '{}');
      dateObj[code] = [];
      localStorage.setItem(key, JSON.stringify(dateObj));
    }

    // 支付成功显示提示信息
    function payResultShow(status, orderNumber, callback) {
      var isLineTrain = B.url.getParam('start_date');
      var url = B.url.setParam('order_number', orderNumber, isLineTrain ? 'ztc_order_details.html?line_type=train' : 'order_details.html');
      url = B.url.setParam('pay_status', status, url);

      switch (status) {
        case 'ok': // 支付成功
          callback = callback || ddb.noop;

          ddb.get('order/pay_confirm', {order_number: orderNumber, dada_flag: 1}, function(d) {
            if (+d.ret === 0) {
              if (!ddb.store('isAward')) {
                var award = $.extend(ddb.pgps('award') || {}, {
                  'show_award': d.data.show_award,
                  'award_title': d.data.award_title,
                  'award_msg': d.data.award_msg
                });
                ddb.pgps('award', award);
                ddb.store('isAward', 1);
              }

              // 订单支付确认
              switch (d.data.status) {
                case 'success':
                // console.log('清除推荐线路缓存before', ddb.pgps('recommend_lines'));
                  ddb.pgps('recommend_lines', null); // 清除推荐线路缓存
                // console.log('清除推荐线路缓存after', ddb.pgps('recommend_lines'));
                  callback();
                  ddb.jump(url + '#page-pay-success');
                  break;

                case 'error invalid_order_number':
                  alert('订单号错误');
                  break;

                case 'order_unpaid':
                  alert('订单未支付');
                  break;

                case 'order_has_been_canceled':
                  alert('订单已取消');
                  break;

                case 'failed':
                  alert('其他错误');
                  break;
              }
            }
          });
          return;

        case 'cancel': // 取消
          // url = B.url.setParam('pay_status', 'cancel', url);
          break;

        case 'fail':
          // url = B.url.setParam('pay_status', 'fail', url);
          break;
      }

      ddb.jump(url);
    }

    function SubmitPay(orderData, callback) {
      var orderNumber = orderData.order_number;
      if (!orderNumber) {
        ddb.msg('订单号无效 T_T');
        callback();
        return false;
      }

      callback = callback || ddb.noop;

      // 测试、开发环境使用模拟支付
      if ('release' !== ddb.dev_status && 'pre' !== ddb.dev_status) {
        ddb.Popup.confirm({
          title: '模拟支付',
          content: '【测试环境】使用模拟支付，请选择',
          cancelText: '失败测试',
          okText: '支付',
          clickMask2Close: false,

          cancelCall: function() {
            callback();
            payResultShow('fail', orderNumber);
          },

          okCall: function() {
            var postData = {
              urlType: 'app',
              payType: 1,
              order_number: orderNumber
            };

            ddb.get('/v2/app/payTest/', postData, function(d) {
              if (+d.ret === 0) {
                callback();
                payResultShow('ok', orderNumber);
              } else {
                ddb.debugJson(d);
              }
            }, function(d) {
              ddb.debugJson(d);
            });
          }
        });

        return false;
      }

      orderData = $.extend({
        urlType: 'app',
        payType: 1
      }, orderData);

      ddb.get('/v2/app/weixinOerderPay/', orderData, function(d) {
        if (+d.ret === 0) {
          callback();
          WeixinJSBridge.invoke('getBrandWCPayRequest', d.msg, function(res) {
            if (res.err_msg === 'get_brand_wcpay_request:ok') { // 支付成功
              payResultShow('ok', orderNumber);
            } else if (res.err_msg === 'get_brand_wcpay_request:cancel') { // 取消支付
              payResultShow('cancel', orderNumber);
            } else { // 支付失败
              payResultShow('fail', orderNumber);
            }
          });
        } else {
          ddb.msg(d.msg);
          ddb.debugJson(d);
        }
      }, function(d) {
        ddb.debugJson(d);
      });
    }

    (function DoCommonWhenReady() {
      $(document).ready(function() {
        $('button.newBack, .g-navbar .back').on('click', function() {
          history.go(-1);
        });

        $('#section_container').on('click', 'button.newBack', function() {
          var referrer = B.url.getParam('referrer');
          if (referrer) {
            J.Router.goTo(referrer, true);
          } else {
            history.go(-1);
          }
        });

        var from = B.url.getParam("from");
        // 当从微信推送消息等页面链接过来时, 不显示最上面的回退按钮等
        if (from == "tplMsg") {
          $("nav button").addClass("showNone");
        }

        var isInUrl = function(str) {
          var lc = location.href;
          if (lc.indexOf(str) >= 0) {
            return true;
          }
          return false;
        };

        var isCommonSharePage = function() {
          if (typeof wx == "undefined") {
            return false;
          }

          if (isInUrl("src/public") || isInUrl("wait_bus.html") || isInUrl("line_detail.html") || isInUrl("open_line.html") || isInUrl("share.html") || isInUrl("invite.html") || isInUrl("quick_pay.html") || isInUrl("bus_life.html")) {
            return false;
          }
          return true;
        };

        // 缓存渠道版本号
        if (!ddb.cookie('ddb_src_id')) {
          ddb.cookie('ddb_src_id', B.url.getParam('ddb_src_id'), {path: '/'});
          console.log('ddb_src_id: ', ddb.cookie('ddb_src_id'));
        }

        // 普通页面,设置分享链接为下载app页面
        if (isCommonSharePage()) {
          ddb.get("", {
            url: "/v2/wechat_api/jssdk",
            wxUrl: location.href
          }, function(d) {
            ddb.wx.share({
              isShare: 0,
              JSSDK_CFG: d.JSSDK_CFG,
              JSSDK_Share: {
                title: '一人一座舒适直达，嗒嗒巴士送你上下班。',
                link: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.newdadabus',
                desc: '上下班坐公交是玩命，坐专车是烧钱，坐嗒嗒巴士走心。'
              }
            });
          });
        }
      });
    })();

    function Msg(s) {
      // return ddb.Popup.msg(s);
      return alert(s);
    }

    ddb.jump = JumpUrl;
    ddb.get  = DdbGet;
    ddb.post = DdbPost;
    ddb.getJsonp = DdbGetJsonp;
    ddb.store = Store;
    ddb.cookie = Cookie;
    ddb.submitPay = SubmitPay;
    ddb.debugJson = DebugAlertJson;
    ddb.msg = Msg;
    ddb.pgps = PageParams;
    ddb.removeStoreDate = RemovestoreDate;
    ddb.payResultShow = payResultShow;
    ddb.openid = getOpenId;

    // 判断是否在微信中
    ddb.isWeixin = (/MicroMessenger/i).test(window.navigator.userAgent);
    // ddb.isWeixin = function() {
    //   return (/MicroMessenger/i).test(window.navigator.userAgent);
    //   // var ua = window.navigator.userAgent.toLowerCase();
    //   // if (ua.match(/MicroMessenger/i) === 'micromessenger') {
    //   //   return true;
    //   // } else {
    //   //   return false;
    //   // }
    // };

    // 清除 XHR 对象
    ddb.abortXHRs = function() {
      // var xhrs = ddb.xhrs.splice(0, ddb.xhrs.length);
      ddb.xhrs.forEach(function(xhr) {
        xhr.abort();
        console.log('Abort XHR: ', xhr);
      });

      ddb.xhrs = [];
    };

    // 添加微信分享提示弹层
    ddb.showShareit = function() {
      var shareit = document.getElementById('shareit');
      if (!shareit) {
        $('<div id="shareit"><p>点击右上角分享</p></div>').appendTo('body')
          .on('click', function(e) {
            this.style.display = 'none';
          });
      } else {
        shareit.style.display = 'block';
      }
    };
})();

// 微信相关接口
ddb.wx = {};
ddb.wx.share = function (cfg, isDebug){
  var share = cfg.isShare || B.url.getParam('share');
  // 如果调用时没指定从缓存中取
  cfg.JSSDK_CFG = cfg.JSSDK_CFG || ddb.pgps(location.pathname + 'JSSDK_CFG');

  // 去掉按钮图标
  if (1 == share) {
    $("nav button").addClass("showNone");
    $("nav button.publicNum").removeClass("showNone");
  }

  if (cfg.JSSDK_CFG) {
    wxShare(cfg.JSSDK_CFG);
  } else {
    ddb.get('/v2/wechat_api/jssdk', {urlType: 'app', wxUrl: location.href}, function(d) {
      if (+d.ret === 0) {
        wxShare(d.JSSDK_CFG);
        ddb.pgps(location.pathname + 'JSSDK_CFG');
      }
    });
  }

  // 微信分享
  function wxShare(JSSDK_CFG) {
    if (0 !== +JSSDK_CFG.ret) {
      return;
    }

    $(function() {
      wx.config($.extend({
        debug: isDebug || false,
        appId: JSSDK_CFG.msg.appId,
        timestamp: JSSDK_CFG.msg.timestamp,
        nonceStr: JSSDK_CFG.msg.nonceStr,
        signature: JSSDK_CFG.msg.signature,
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareQZone', 'showMenuItems', 'openLocation', 'getLocation']
      }, cfg.config || {}));

      wx.ready(function() {
        var JSSDK_Share = $.extend({
          title: '心疼你的累，嗒嗒巴士拼命开1000条线送你上下班！',
          desc: '我送新朋友50礼包，注册嗒嗒再送100，快来一起坐豪华大巴上下班！',
          link: location.href,
          imgUrl: 'http://wechat.dadabus.com/v2/res/src/image/side_avatar_default.png',
          timeLine_imgUrl: 'http://wechat.dadabus.com/v2/res/src/image/side_avatar_default_memory.png',
        }, cfg.JSSDK_Share);

        var shareCfg = {
          title: JSSDK_Share.title,
          desc: JSSDK_Share.desc,
          link: JSSDK_Share.link,
          imgUrl: JSSDK_Share.imgUrl,
          success: function(res) {
            $('#shareit').hide();
          }
        };

        // 分享到朋友圈
        wx.onMenuShareTimeline({
          title: JSSDK_Share.title,
          desc: JSSDK_Share.desc,
          link: JSSDK_Share.link,
          imgUrl: JSSDK_Share.timeLine_imgUrl,
          success: function(res) {
            $('#shareit').hide();
          }
        });

        // 分享给朋友
        wx.onMenuShareAppMessage(shareCfg);

        // 分享到qq
        wx.onMenuShareQQ(shareCfg);

        // 分享到qq空间
        wx.onMenuShareQZone(shareCfg);

        // 分享到腾讯微博
        wx.onMenuShareWeibo(shareCfg);
      });
    });
  }
}

ddb.wx.gotoPublic = function() {
  location.href = 'http://mp.weixin.qq.com/s?__biz=MzAxNDMzNjc2MQ==&mid=209057391&idx=1&sn=c3686736a269a755c2b3bbb69dcddf91&scene=1&key=1936e2bc22c2ceb5f0422d19def4dd7e2ead657bd6a2be972adadb5206e9105a41e4bcaeaabb99c6bb8a0a9c37a78489&ascene=1&uin=MTAzNDg1ODg4MQ%3D%3D&devicetype=Windows+8&version=61000721&pass_ticket=Koa33YxOOGuMY5d5XE%2BTNfpOefmOQ0oQUIO%2BVO0f9PbEwF0GPMj%2BeH1mkKvSd45M';
  return false;
}

// 获取跳转 URL
ddb.jumpCommonUrl = function(page) {
  var url = 'http://' + (ddb.dev_status === 'release' ? '' : ddb.dev_status + '.') + 'jump.dadabus.com/common/load?page=' + page;
  url = B.url.setObj(url, {
    version: ddb.version,
    device_type: 3,
    city_code: ddb.store('ddbCity') ? ddb.store('ddbCity').split('/')[1] : '0755'
  });

  window.location = url;
};


//公用ui组件
ddb.ui = {};

ddb.tl = {};

//ddb 价格统一显示函数, 整数显示整数, 小数显示一位小数
ddb.tl.fixPrice = function(price){
    if (typeof price === "undefined" || !price) {
        return price;
    }

    var oNum = price.toString();

    if (price == 0) {
        return '0';
    }

    if (oNum.indexOf('.') == -1) {
        return price;
    }

    var arr = oNum.split('.');
    var arr_t = arr[1];
    if (arr[0] == 0) {
        arr[0] = 0;
    }

    if (arr_t.length >= 2) {
        arr_t = arr_t.substr(0, 2);
    }

    for (var i = 0, len = arr_t.length; i < len; i++) {
        if (arr_t.length > 0 && arr_t.charAt(arr_t.length - 1) == 0) {
            arr_t = arr_t.slice(0, -1);
        }
    }
    return arr_t.length > 0 ? arr[0] + '.' + arr_t : arr[0];
}

ddb.tl.loadContent = function(url,data,callback){
    return $.ajax({
        url : url,
        dataType : 'html',
        timeout : 15000,
        cache:true,
        data : data,
        success : function(html){
            callback && callback(html);
        },error:function(e){
            alert("网络异常!");
            //console.log(e);
        }
    });
};

//深层对象拷贝,  返回拷贝后的对象, 剪断js对象引用链
ddb.tl.clone = function(obj){
    var copy = JSON.stringify(obj);
    var ret = JSON.parse(copy);
    return ret;
}

//公用弹出框
ddb.Popup = (function(){
    var __timer,_popup,_mask,transition,clickMask2close,
        POSITION = {
            'center':{
                top:'50%',
                left:'.5rem',
                right:'.5rem',
                'border-radius' : '.2rem'
            }
        },

        TEMPLATE = {
          msg: '<div class="popup-content popup-msg {_class}">{content}</div>',
          alert: '<div class="popup-title {_class}">{title}</div><div class="popup-content {_class}">{content}</div><div id="ddb_popup_btn_container"><a data-target="closePopup" data-icon="checkmark">{ok}</a></div>',
          tips: '<div class="popup-tips-title">{title}</div><div class="popup-tips-content">{content}</div>',
          confirm: '<div class="popup-title {_class}">{title}</div><div class="popup-content {_class}">{content}</div><div id="ddb_popup_btn_container"><a class="cancel" data-icon="close">{cancel}</a><a data-icon="checkmark">{ok}</a></div>',
          loading: '<i class="icon spinner"></i>',
          center: '<div class="popup_tips">{_img}<div class="popup_tips_title">{title}</div><div class="popup_tips_text1">{text1}</div><div class="popup_tips_text2">{text2}</div></div>'
        };

    /**
     * 全局只有一个popup实例
     * @private
     */
    var _init = function(){
        $('body').append('<div id="ddb_popup"></div><div id="ddb_popup_mask"></div>');
        _mask = $('#ddb_popup_mask');
        _popup = $('#ddb_popup');
        _subscribeEvents();
    }

    /**
     * loading组件
     * @param text 文本，默认为“加载中...”
     */
    var loading = {};
    loading.show = function(text) {
      var markup = TEMPLATE.loading;
      show({
        html: markup,
        pos: 'loading',
        opacity: .1,
        animation: true,
        clickMask2Close: false
      });
    };

    loading.hide = function() {
      hide();
    };

    var show = function(options,fn){
        var settings = {
            height : undefined,//高度
            width : undefined,//宽度
            opacity : 0.6,//透明度
            html : '',//popup内容
            pos : 'center',//位置 {@String top|top-second|center|bottom|bottom-second}   {@object  css样式}
            clickMask2Close : true,// 是否点击外层遮罩关闭popup
            showCloseBtn : true,// 是否显示关闭按钮
            onShow : undefined //@event 在popup内容加载完毕，动画开始前触发
        }
        $.extend(settings,options);
        clickMask2close = settings.clickMask2Close;
        _mask.css('opacity',settings.opacity);
        //rest position and class
        _popup.attr({'style':'','class':''});
        settings.width && _popup.width(settings.width);
        settings.height && _popup.height(settings.height);
        var pos_type = $.type(settings.pos);
        if(pos_type == 'object'){// style
            _popup.css(settings.pos);
        }else if(pos_type == 'string'){
            if(POSITION[settings.pos]){ //已经默认的样式
                _popup.css(POSITION[settings.pos])
                var trans_key = settings.pos.indexOf('top')>-1?'top':(settings.pos.indexOf('bottom')>-1?'bottom':'defaultAnim');

            }else{// pos 为 class
                _popup.addClass(settings.pos);

            }
        }else{
            console.error('错误的参数！');
            return;
        }
        _mask.show();
        var html;
        if(settings.html){
            html = settings.html;
        }else if(settings.url){//远程加载
            html = J.Page.loadContent(settings.url);
        }else if(settings.tplId){//加载模板
            html = template(settings.tplId,settings.tplData)
        }

        //是否显示关闭按钮
        if(settings.showCloseBtn){
            html += '<div id="tag_close_popup" data-target="closePopup" class="icon cancel-circle"></div>';
        }

        _popup.html(html).show();
        //执行onShow事件，可以动态添加内容
        settings.onShow && settings.onShow.call(_popup);

        //显示获取容器高度，调整至垂直居中
        if(settings.pos == 'center'){
            var height = _popup.height();
            _popup.css('margin-top','-'+height/2+'px')
        }
        fn&&fn();
    }

    /**
     * 关闭弹出框
     * @param noTransition 立即关闭，无动画
     */
    var hide = function(noTransition){
        _mask.hide();
        _popup.hide().empty();
    }
    var _subscribeEvents = function(){
        _mask.on('tap',function(){
            clickMask2close &&  hide();
        });
        _popup.on('tap','[data-target="closePopup"]',function(){hide();});
    }

    /**
     * alert组件
     * @param title 标题
     * @param content 内容
     */
    var alert = function(title,content,btnName){
        var markup = TEMPLATE.alert.replace('{title}',title).replace('{content}',content).replace('{ok}',btnName || '确定');
        show({
            html : markup,
            pos : 'center',
            opacity : 0.6,
            showCloseBtn : false
        });
    }

    /**
     * tip组件
     * @param title 标题
     * @param content 内容
     */
    var tips = function(title,content,btnName){
        var markup = TEMPLATE.tips.replace('{title}',title).replace('{content}',content);
        show({
            html : markup,
            pos : 'center',
            opacity : 0.6,
            showCloseBtn : false
        });
    }

    /**
     * confirm 组件
     * @param title 标题
     * @param content 内容
     * @param okCall 确定按钮handler
     * @param cancelCall 取消按钮handler
     */
    var confirm = function(className, title, content, cancelText, okText, okCall, cancelCall) {
      if ($.isPlainObject(className)) {
        var options = $.extend({
          className: '',
          title: '',
          content: '',
          okText: '',
          cancelText: '',
          clickMask2Close: true,
          okCall: function() {},
          cancelCall: function() {}
        }, className);

        className = options.className;
        var title = options.title;
        var content = options.content;
        var cancelText = options.cancelText;
        var okText = options.okText;
        var okCall = options.okCall;
        var cancelCall = options.cancelCall;
        var clickMask2Close = options.clickMask2Close;
      } else {
        cancelText = cancelText || '取消';
        okText = okText || '确定';
      }
      console.log(options);

      show({
        html: TEMPLATE.confirm.replace('{title}', title).replace('{content}', content).replace('{cancel}', cancelText).replace('{ok}', okText).replace(/{_class}/g, className),
        pos: 'center',
        opacity: 0.6,
        showCloseBtn: false,
        clickMask2Close: clickMask2Close
      });

      $('#ddb_popup_btn_container [data-icon="checkmark"]').on('click', function() {
        okCall.call(this);
        hide();
      });

      $('#ddb_popup_btn_container [data-icon="close"]').on('click', function() {
        cancelCall.call(this);
        hide();
      });
    }

    /**
     * msg 组件 消息弹框, 3s后自动消失
     * @param content 内容
     */
    var msg = function(content){
        if(__timer){clearTimeout(__timer)};
        var markup = TEMPLATE.msg.replace('{content}',content);
        show({
            html : markup,
            pos : 'center',
            opacity : 0.6,
            showCloseBtn : false
        });
        //__timer = setTimeout(hide,3000);
    }

    var center = function(img, opt, html) {
      var img = img || '';
      if (__timer) {
        clearTimeout(__timer)
      };

      var markup = TEMPLATE.center.replace('{_img}', img).replace('{title}', opt.title).replace('{text1}', opt.text1).replace('{text2}', opt.text2);
      show({
        html: html || markup,
        pos: 'center',
        opacity: 0, //透明度
        showCloseBtn: false
      }, function() {
        $('#ddb_popup').css('background', 'rgba(0, 0, 0, 0)');
      });
      __timer = setTimeout(function() {
        hide();
        opt.callback && opt.callback();
      }, opt.delay || 3000);
    };

    _init();

    return {
      loading: loading,
      show: show,
      close: hide,
      alert: alert,
      tips: tips,
      msg: msg,
      confirm: confirm,
      center: center
    }
})();

/**
 *  消息组件
 */
ddb.Toast = (function($){
    var toast_type = 'toast',_toast,timer,
        //定义模板
        TEMPLATE = {
            toast : '<a href="#">{value}</a>',
            success : '<a href="#"><i class="icon checkmark-circle"></i>{value}</a>',
            error : '<a href="#"><i class="icon cancel-circle"></i>{value}</a></div>',
            info : '<a href="#"><i class="icon info-2"></i>{value}</a>'
        }

    var _init = function(){
        //全局只有一个实例
        $('body').append('<div id="ddb_toast"></div>');
        _toast = $('#ddb_toast');
        _subscribeCloseTag();
    }

    /**
     * 关闭消息提示
     */
    var hide = function(){

        _toast.hide();
        _toast.empty();

    }
    /**
     * 显示消息提示
     * @param type 类型  toast|success|error|info  空格 ass name 可以实现自定义样式
     * @param text 文字内容
     * @param duration 持续时间 为0则不自动关闭,默认为3000ms
     */
    var show = function(text,type,duration){
        if(timer) clearTimeout(timer);
        type = type || 'toast';
        duration = duration || 3000;
        var classname = type.split(/\s/);
        toast_type = classname[0];
        _toast.attr('class',type).html(TEMPLATE[toast_type].replace('{value}',text)).show();
        if(duration !== 0){//为0 不自动关闭
            timer = setTimeout(hide,duration);
        }
    }
    var _subscribeCloseTag = function(){
        _toast.on('tap','[data-target="close"]',function(){
            hide();
        })
    }
    _init();
    return {
        show : show,
        hide : hide
    }
})($);

ddb.loading = ddb.Popup.loading;

// 黑色底3秒弹框
window.oAlert = window.alert;
window.alert = ddb.Toast.show;

// 屏蔽调试方法
if (ddb.dev_status === 'release' && !B.url.getParam('debug')) {
  window.onerror = console.log = console.error = console.debug = console.warn = console.info = ddb.noop;
}

// 百度统计


// 消息组件凋用方法：
// ddb.Toast.show('消息组件测试');
// ddb.Popup.loading.show();
// ddb.Popup.center('<img src="../image/icon_success.png" alt="" >',{title:1,text1:2,text2:3});
// ddb.Popup.tips("哒哒准点保障，一人一座快速直达","首站迟到5分钟以上，途经站迟到15分钟以上，没坐上车，可申请退款。一经核实，3倍车票代金券奉上。");
// ddb.Popup.confirm('popup-title-coupon','输入兑换码，即可获得嗒嗒代金券','<div class="input_wrap"><input type="text" class="tel" id="invite_code" /></div>',function(){alert('你选择了“确定”')},function(){alert('你选择了“取消”')});