/**
 * Created by Administrator on 2015/3/18.
 */
var B = {};
(function(){
    function Step() {
        var steps = Array.prototype.slice.call(arguments);
        var pending;
        var counter;
        var results;
        var lock;

        function next() {
            counter = pending = 0;
            if (steps.length === 0) return;
            var fn = steps.shift();
            results = [];
            try {
                lock = true;
                var result = fn.apply(next, arguments)
            } catch (e) {
                next(e)
            }
            if (counter > 0 && pending == 0) next.apply(null, results);
            else if (result !== undefined) next(result);
            lock = false
        }
        next.parallel = function() {
            var index = counter++;
            pending++;
            return function() {
                pending--;
                results[index] = arguments[0];
                if (!lock && pending === 0) next.apply(null, results)
            }
        };
        next.group = function() {
            var localCallback = next.parallel();
            var counter = 0;
            var pending = 0;
            var result = [];
            var error = undefined;

            function check() {
                if (pending === 0) localCallback(error, result)
            }
            process.nextTick(check);
            return function() {
                var index = counter++;
                pending++;
                return function() {
                    pending--;
                    result[index] = arguments[0];
                    if (!lock) check()
                }
            }
        };
        next()
    }
    Step.fn = function StepFn() {
        var steps = Array.prototype.slice.call(arguments);
        return function() {
            var args = Array.prototype.slice.call(arguments);
            var toRun = [function() {
                this.apply(null, args)
            }].concat(steps);
            if (typeof args[args.length - 1] === "function") toRun.push(args.pop());
            Step.apply(null, toRun)
        }
    };

    B.step = Step;
})();

B.url = {};
B.url.getParam = function(name,url){
    var reg=new RegExp("(^|&|\\?|#)"+name+"=([^&]*?)(&|#|$)"),
        url=url||location.href,
        tempHash=url.match(/#.*/)?url.match(/#.*/)[0]:"";

    url=url.replace(/#.*/,"");
    if(reg.test(tempHash)){
        return decodeURIComponent(tempHash.match(reg)[2]);
    }else if(reg.test(url)){
        return decodeURIComponent(url.match(reg)[2])
    }else return"";
}
B.url.setParam = function(name,value,url,isHashMode){
    if(typeof name == 'undefined' || typeof value == 'undefined' || typeof url == 'undefined'){
        return url;
    }
    var reg = new RegExp("(^|&|\\?|#)"+name+"=([^&]*?)(&|#|$)"),
        tempHash=url.match(/#.*/)?url.match(/#.*/)[0]:"";

    url=url.replace(/#.*/,"");
    if(isHashMode===true){
        if(reg.test(tempHash)){
            tempHash=tempHash.replace(reg,function(m,r1,r2,r3){return r1+name+"="+encodeURIComponent(value)+r3});
        }else{
            var separator=tempHash.indexOf("#")===-1?"#":"&";
            tempHash=tempHash+separator+name+"="+encodeURIComponent(value)}
        tempHash=tempHash.replace(reg,function(m,r1,r2,r3){return r1+name+"="+encodeURIComponent(value)+r3})
        return tempHash + url;
    }else if(reg.test(url)){
        url=url.replace(reg,function(m,r1,r2,r3){return r1+name+"="+encodeURIComponent(value)+r3});
    }else{
        var separator=url.indexOf("?")===-1?"?":"&";
        url=url+separator+name+"="+encodeURIComponent(value)
    }
    return url+tempHash
}

B.pullDown = function(option){
    var page = 1,
        isWait = 0,
        xhr,
        url = location.href,
        cb  = function(){},
        nodataCb = function(){},
        dh  = 200;

    function initParams(){
        option = option || {};
        url = option.url || url;
        page= option.page|| page;
        cb  = option.cb || cb;
        nodataCb  = option.nodataCb || nodataCb;
    }

    function check(){
        if(isWait){
            return false;
        }
        if($(document.body).scrollTop() + document.documentElement.clientHeight + dh < $(document.documentElement).height()){
            return false;
        }

        return true;
    }

    function getData(){
        if(page > 1){
            if(!check()){
                return false;
            }
            //$('.wrapper').append('<img src="/Public/Static/image/loading.gif" class="loading" />');
        }
        isWait = 1;
        xhr = $.ajax({
            url : url,
            type: 'GET',
            dataType:'json',
            data:{
                page_index:page,
                page_size:10
            }
        }).done(function(o){
            if(o.ret == 0){
                cb(o);
                $('img.loading').remove();
                if(o.data.cur_page_index * o.data.cur_page_size < o.data.total_count){
                    page++;
                }else{
                    $(option.section_id || window).off('scroll',getData);
                    nodataCb(o);
                }
            }
            isWait = 0;
        }).fail(function(){
            isWait = 0;
        });
        ddb.xhrs.push(xhr);
    }

    initParams();
    getData();
    $(option.section_id || window).on('scroll',getData);
}

B.user = {};
B.user.isLogin = function(){
    return !!($.fn.cookie('wx_user_id') && $.fn.cookie('wx_mobile') && $.fn.cookie('wx_device_id'));
}
B.user.login = function(){
    var h = "http://" + location.host + "/Wx"+ddb.version+"/Index/login.html";
    location.href = B.url.setParam('referrer',location.href,h);
    //location.href = B.url.setParam('referrer',location.href,'login.html');
}

B.user.getAddress = function(){
    if(B.user.isLogin()){
        var address =JSON.parse(localStorage.getItem('__dadabus_common_address_'+$.fn.cookie('wx_user_id')+'__')),
            url = location.href;

        if(!address ) {
            return false;
        }

        if($.isPlainObject(address.company)){
            url = B.url.getParam('on_site') ? url : B.url.setParam('on_site',address.company.title,url,true);
            url = B.url.getParam('on_site_lng') ? url : B.url.setParam('on_site_lng',address.company.lng,url,true);
            url = B.url.getParam('on_site_lat') ? url : B.url.setParam('on_site_lat',address.company.lat,url,true);
        }
        if($.isPlainObject(address.home)){
            url = B.url.getParam('off_site') ? url : B.url.setParam('off_site',address.home.title,url,true);
            url = B.url.getParam('off_site_lng') ? url : B.url.setParam('off_site_lng',address.home.lng,url,true);
            url = B.url.getParam('off_site_lat') ? url : B.url.setParam('off_site_lat',address.home.lat,url,true);
        }
        //history.replaceState(null,'',url);
    }
}

var ddb = {};
ddb.version = '1.4';
ddb.xhrs = [];

;(function(){
     function JumpUrl(page,host){
         var  h = "http://" + location.host + "/Wx"+ddb.version+"/" + page;
        location.href = host?host:h;
    }
    // user_id, device_id    $.fn.cookie('user_id')
    var common = {
        version:ddb.version,
        login_type:1,    //乘客端
        device_type:3, //设备类型 web端
        /*user_id:"2",    //用户id, 测试用
        mobile:18078735525,  //todo 测试使用
        device_id:123456789,  */
        user_id:"6492",    //用户id, 测试用
        mobile:18938939236,  //todo 测试使用
        device_id:18938939236,  //使用手机号码代替?
        /*login_token:"98d7b2843bf25817cf4115c716b81cd7",*/
        login_token:"123456",
        lat: 1 ,
        lng: 1,
        page_size:6,
        page_index:1
    }

    var initCommon = function(){
        //return false;
        var mobile =  Cookie("mobile");
        if(mobile != common.mobile){
            common.mobile =  mobile;
            common.user_id = Cookie('user_id');
            common.device_id = Cookie('device_id');
            common.city_code = localStorage.getItem("ddbCity") ? localStorage.getItem("ddbCity").split('/')[1] : '0755';
        }
    };
    function DdbPost(url,postData,callback,err){
         initCommon();
         var dtd = $.Deferred();
         var pDt = $.extend({},common);
         var cachekey = postData.cachekey;
         var xhr;

         function process(d) {
             if(d.ret != 0){
                 //alert(d.msg+"d.ret="+d.ret);
                 if(d.ret == 8001 || d.ret == 8002 || d.ret == 8003){
                     //用户未登陆, 跳转到登陆页面
                     var h = "http://" + location.host + "/Wx"+ddb.version+"/Index/login.html";
                     location.href = B.url.setParam('referrer',location.href,h);
                     dtd.reject();
                     return false;
                 }
                 //dtd.reject();
                 //return false;
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
             url: "/Wx"+ddb.version+"/App/api?parames=" + url ,
             dataType:"json",
             type:"POST",
             data: $.extend(pDt,postData),
             success:function(d){
                process(d);
                console.log('post:', d);
                // 缓存数据
                if (cachekey) sessionStorage[cachekey] = JSON.stringify(d);
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
    function DdbGet(url,postData,callback,err){
        initCommon();
        var dtd = $.Deferred();
        // user_id, device_id    $.fn.cookie('user_id')
        var urls = "/Wx"+ddb.version+"/App/api?parames=" + url ;
        if(typeof postData.url != "undefined") {
            urls = postData.url;
        }
        var pDt = $.extend({},common);
        console.log(urls);
        var cachekey = postData.cachekey;
        var xhr;

        function process(d) {
            if(typeof postData.url != "undefined" ) {
                if(typeof  callback == "function"){
                    callback(d);
                }
                dtd.resolve(d);
                console.log(d);
                return true;
            }

            if(d.ret != 0){
                //alert(d.msg+"d.ret="+d.ret);
                if(  (  d.ret == 8001 || d.ret == 8002 || d.ret == 8003)){
                    if((!postData.notCheckLogin) ){
                        //用户未登陆, 跳转到登陆页面
                        var h = "http://" + location.host + "/Wx"+ddb.version+"/Index/login.html";
                        location.href = B.url.setParam('referrer',location.href,h);
                        dtd.reject(d);
                    }
                    $('.side_acc_phone').html('未登录');
                }
                //return false;
            }
            if(typeof  callback == "function"){
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
            url: urls,
            dataType:postData.dataType || "json",
            type:"GET",
            data: $.extend(pDt,postData),
            success:function(d, status, xhr){
                process(d);

                console.log('get:', d);
                // 缓存数据
                if (cachekey) sessionStorage[cachekey] = JSON.stringify(d);
            },
            error:function(msg){
                if(typeof  err == "function"){
                    err(msg);
                }
                //ddb.msg("网络异常!");
                console.log(msg);
                dtd.reject(msg);
            }
        });

        ddb.xhrs.push(xhr);
        console.log(ddb.xhrs);
        return dtd.promise();
    }

    function DdbGetJsonp(url,postData,callback,err){
        initCommon();
        var dtd = $.Deferred();
        var urls = "http://api.test.dadabus.com/";
        //正式环境
        if('wechat.dadabus.com' == location.hostname){
            urls = "http://api.dadabus.com/";
        }
        var pDt = $.extend({},common);
        var cachekey = postData.cachekey;
        var xhr;

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
            url: urls+url,
            dataType:"jsonp",
            type:"GET",
            jsonp:'cb',
            jsonpCallback:'success_jsonpCallback',
            data: $.extend(pDt,postData),
            success:function(d){
                process(d);
                console.log(d);

                // 缓存数据
                if (cachekey) sessionStorage[cachekey] = JSON.stringify(d);
            },
            error:function(msg){
                if(typeof  err == "function"){
                    err(msg);
                }
                console.log(msg);
                dtd.reject(msg);
            }
        });

        ddb.xhrs.push(xhr);
        return dtd.promise();
    }

    function Cookie(c_name,value){
        var setCookie = function(c_name,value,expiredays) {
            var exdate=new Date()
            exdate.setDate(exdate.getDate()+expiredays)
            document.cookie=c_name+ "=" +escape(value)+
            ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
            return true;
        }
        var getCookie = function (c_name)  {
            if (document.cookie.length>0)
            {
                c_start=document.cookie.indexOf(c_name + "=")
                if (c_start!=-1)
                {
                    c_start=c_start + c_name.length+1
                    c_end=document.cookie.indexOf(";",c_start)
                    if (c_end==-1) c_end=document.cookie.length
                    return unescape(document.cookie.substring(c_start,c_end))
                }
            }
            return ""
        }

        if(typeof (values) != "undefined"){
            return setCookie(c_name,value,365);
        } else {
            return getCookie(c_name);
        }
    }

    function CheckLogin(){
        if(!B.user.isLogin()){
            location.href = B.url.setParam('referrer',location.href,'Index/login.html');
            return false;
        }
        return true;
    }

    //本地数据存储
    function Store(name, values){
        if(window.localStorage) {
            //有value 时为写入, 没有时为读取
            if(typeof (values) != "undefined"){
                return localStorage.setItem(name, JSON.stringify(values));
            } else {
                return JSON.parse(localStorage.getItem(name));
            }
        }
    }

    //用户页面跳转时,参数传递
     function PageParams(pageId, values){
        if(window.sessionStorage) {
            //有value 时为写入, 没有时为读取
            if(typeof (values) != "undefined"){
                return sessionStorage.setItem(pageId, JSON.stringify(values));
            } else {
                return JSON.parse(sessionStorage.getItem(pageId));
            }
        }
    }

    function DebugAlertJson(d){
        return false;
        //微信上调试, 弹出信息 , 正式版时, return false;
        alert(JSON.stringify(d));
        console.log(d);
    }

    function RemovestoreDate(){
         var userId = $.fn.cookie('wx_user_id') || 'unlogin',
                key = '__dadabus_selected_date_' + userId + '__',
                code = B.url.getParam('line_code'),
                dateObj = JSON.parse(localStorage.getItem(key) || '{}');
                dateObj[code] = [];
                localStorage.setItem(key, JSON.stringify(dateObj));
    }

    function SubmitPay(order_number){
        if(!order_number){
            ddb.msg("订单号非法!");
            return false;
        }

        if($.browser.chrome || $.browser.firefox){
            ddb.jump(B.url.setParam("order_number",order_number,"Order/pay.html"));
            return false;
        }

        var requestData = {
            order_number:order_number,
            payType : 1,
            dataType:"json",
            url:"http://"+location.host+"/Wx"+ddb.version+"/App/weixinOerderPay/"
        }
        ddb.get("",requestData,function(d){
            if(d.ret == 0){
                var url = B.url.setParam("order_number",order_number,"#fail_section?",true);
                WeixinJSBridge.invoke('getBrandWCPayRequest', d.msg, function(res){
                    //ddb.debugJson(d);
                    if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                        //支付成功, 跳转到支付成功页面
                        var share = B.url.getParam("share");
                        if(1 == share){
                            url = B.url.setParam("share",1,url,true);
                        }
                        RemovestoreDate();
                        url = B.url.setParam("payState","successPay",url,true);
                    }else if(res.err_msg ==  "get_brand_wcpay_request:cancel"){
                        //取消
                        url = B.url.setParam("payState","cancel",url,true);
                    }else {
                        url = B.url.setParam("payState","failPay",url,true);
                    }
                    J.Router.goTo(url);
                });
            }else{
                ddb.msg(d.msg);
                ddb.debugJson(d);
            }
        },function(d){
            ddb.debugJson(d);
        });
    }
    function DoCommonWhenReady(){
        $(document).ready(function(){
            $('button.newBack').on('click',function(){
                history.go(-1);
            });

            $('#section_container').on('click','button.newBack',function(){
                var referrer = B.url.getParam('referrer');
                if(referrer){
                    J.Router.goTo(referrer,true);
                }else{
                    history.go(-1);
                }
            });

	//使用FastClick处理点透问题
	//FastClick.attach(document.body);
            var from = B.url.getParam("from");
            //当从微信推送消息等页面链接过来时, 不显示最上面的回退按钮等
            if(from == "tplMsg"){
                $("nav button").addClass("showNone");
            }
        });
    }
    DoCommonWhenReady();

    function Msg(s){
       //先用alert 代替,后面可以改为, 显示3秒后自动消失
			 return alert(s);
			//J.showToast('这是默认的Toast,默认3s后消失');
			//return J.showToast(s);

    }

    //此函数 弃用, 请用ddb.wx.gotoPublic 代替
    ddb.wxShareUrl = function(){
		location.href  = 'http://mp.weixin.qq.com/s?__biz=MzAxNDMzNjc2MQ==&mid=209057391&idx=1&sn=c3686736a269a755c2b3bbb69dcddf91&scene=1&key=1936e2bc22c2ceb5f0422d19def4dd7e2ead657bd6a2be972adadb5206e9105a41e4bcaeaabb99c6bb8a0a9c37a78489&ascene=1&uin=MTAzNDg1ODg4MQ%3D%3D&devicetype=Windows+8&version=61000721&pass_ticket=Koa33YxOOGuMY5d5XE%2BTNfpOefmOQ0oQUIO%2BVO0f9PbEwF0GPMj%2BeH1mkKvSd45M';
		return false;
	}

    ddb.jump = JumpUrl;
    ddb.get  = DdbGet;
    ddb.post = DdbPost;
    ddb.getJsonp = DdbGetJsonp;
    ddb.store = Store;
    ddb.cookie = Cookie;
    ddb.checkLogin = CheckLogin;
    ddb.submitPay = SubmitPay;
    ddb.debugJson = DebugAlertJson;
    ddb.msg = Msg;
    ddb.pgps = PageParams;
    ddb.removeStoreDate = RemovestoreDate;

    // 清除 XHR 对象
    ddb.abortXHRs = function() {
      var xhrs = ddb.xhrs.splice(0, ddb.xhrs.length);
      xhrs.forEach(function(xhr) {
          xhr.abort();
          console.log('Abort XHR: ', xhr);
      });
    };
})();

//微信相关接口
ddb.wx = {};
ddb.wx.share = function (cfg){
    var share = cfg.isShare || B.url.getParam("share");
    if(1 == share){
        //去掉按钮图标
        $("nav button").addClass("showNone");
        $("nav button.publicNum").removeClass("showNone");
    }
    var JSSDK_CFG = cfg.JSSDK_CFG;
    $(function(){
        if(JSSDK_CFG &&  JSSDK_CFG.ret == 0 ) {
            var JSSDK_Share = {};
            wx.config($.extend({
                debug: false,
                appId: JSSDK_CFG.msg.appId,timestamp: JSSDK_CFG.msg.timestamp,nonceStr: JSSDK_CFG.msg.nonceStr ,signature: JSSDK_CFG.msg.signature,
                jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','showMenuItems','openLocation','getLocation']
            },cfg.config));

            wx.ready(function () {
                JSSDK_Share =  $.extend({
                    title: '滴滴专属加班狗，准时下班求嗒嗒带走！',
                    desc: '我送新朋友50礼包，注册嗒嗒再送100，快来一起坐豪华大巴上下班！',
                    link: location.href
                },cfg.JSSDK_Share);
                shareFriends();
                shareTimeLine();
            });

            //2监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
            function  shareFriends()
            {
                wx.onMenuShareAppMessage({
                    title: JSSDK_Share.title,
                    desc: JSSDK_Share.desc,
                    link:JSSDK_Share.link,
                    imgUrl: 'http://wechat.dadabus.com/Public/Static/image/side_avatar_default.png',
                    success: function (res) {
                        $("#shareit").hide();
                    }
                });
            }
            //分享到朋友圈
            function shareTimeLine()
            {
                wx.onMenuShareTimeline({
                    title: JSSDK_Share.title,
                    link: JSSDK_Share.link,
                    imgUrl: 'http://wechat.dadabus.com/Public/Static/image/side_avatar_default.png',
                    success: function(){
                        $("#shareit").hide();
                    }
                });
            }
        }
    })
}

ddb.wx.gotoPublic = function(){
    location.href  = 'http://mp.weixin.qq.com/s?__biz=MzAxNDMzNjc2MQ==&mid=209057391&idx=1&sn=c3686736a269a755c2b3bbb69dcddf91&scene=1&key=1936e2bc22c2ceb5f0422d19def4dd7e2ead657bd6a2be972adadb5206e9105a41e4bcaeaabb99c6bb8a0a9c37a78489&ascene=1&uin=MTAzNDg1ODg4MQ%3D%3D&devicetype=Windows+8&version=61000721&pass_ticket=Koa33YxOOGuMY5d5XE%2BTNfpOefmOQ0oQUIO%2BVO0f9PbEwF0GPMj%2BeH1mkKvSd45M';
    return false;
}


//公用ui组件
ddb.ui = {};

ddb.tl = {};
ddb.tl.delZero = function (num){
    var oNum = num.toString();
    /*while( oNum.charAt(oNum.length-1) == 0 || oNum.charAt(oNum.length-1) == '.' ){
        oNum=oNum.slice(0,-1);
    }
    return oNum;*/
    for (var i = 0; i < 3; i++) {
        if (oNum.charAt(oNum.length - 1) == 0 || oNum.charAt(oNum.length - 1) == '.') {
            oNum = oNum.slice(0, -1);
        } else {
            return oNum;
        }
    }
    return oNum;
};


//公用弹出框
ddb.Popup = (function(){
    var _popup,_mask,transition,clickMask2close,
        POSITION = {
            'center':{
                top:'50%',
                left:'.5rem',
                right:'.5rem',
                'border-radius' : '.2rem'
            }
        },

        TEMPLATE = {
            alert : '<div class="popup-title {_class}">{title}</div><div class="popup-content {_class}">{content}</div><div id="ddb_popup_btn_container"><a data-target="closePopup" data-icon="checkmark">{ok}</a></div>',
            confirm : '<div class="popup-title {_class}">{title}</div><div class="popup-content {_class}">{content}</div><div id="ddb_popup_btn_container"><a class="cancel" data-icon="close">{cancel}</a><a data-icon="checkmark">{ok}</a></div>',
            loading: '<i class="icon spinner"></i><p>{title}</p>'
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
     loading.show = function(text){
        var markup = TEMPLATE.loading.replace('{title}',text||'加载中...');
        show({
            html : markup,
            pos : 'loading',
            opacity :.1,
            animation : true,
            clickMask2Close : false
        },15000);
    }
    loading.hide = function () {
        hide();
    }


    var show = function(options){
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
     * confirm 组件
     * @param title 标题
     * @param content 内容
     * @param okCall 确定按钮handler
     * @param cancelCall 取消按钮handler
     */
    var confirm = function(_class,title,content,cancel,ok,okCall,cancelCall){
        var cancel = cancel || '取消';
        var ok = ok || '确定';

        var markup = TEMPLATE.confirm.replace('{title}',title).replace('{content}',content).replace('{cancel}',cancel).replace('{ok}',ok).replace(/{_class}/g,_class);
        show({
            html : markup,
            pos : 'center',
            opacity : 0.6,//透明度
            showCloseBtn : false
        });
        $('#ddb_popup_btn_container [data-icon="checkmark"]').on('tap',function(){
            hide();
            okCall.call(this);
        });
        $('#ddb_popup_btn_container [data-icon="close"]').on('tap',function(){
            hide();
            cancelCall.call(this);
        });
    }

    _init();

    return {
        loading:loading,
        show : show,
        close : hide,
        alert : alert,
        confirm : confirm
    }
})();

//ddb.Popup.loading.show();

//ddb.Popup.confirm('popup-title-coupon','输入兑换码，即可获得嗒嗒代金券','<div class="input_wrap"><input type="text" class="tel" id="invite_code" /></div>',function(){alert('你选择了“确定”')},function(){alert('你选择了“取消”')});