var proxy = "SOCKS5 127.0.0.1:1080;SOCKS 127.0.0.1:1080";

var domains = new Set([ // ??????????????
'cn',
'teambition',
'baidu',
'baidupcs',
'zhihu',
'aliyun-inc',
'tmall',
'taobao',
'infoqstatic',
'dingtalk',
'qq',
'qiniucdn',
'netease',
'jd',
'infoq',
'bdimg',
'aliyun',
'alipay',
'alicdn',
'360buyimg',
'cnblogs',
'alibaba',
'shimo',
'163',
'126',
'127.0.0.1',
'localhost'
]);

var direct = 'DIRECT';
var discard = 'Discard';
function FindProxyForURL(url, host) {
    if (/^(\d+\.){3}\d+$/.test(host)) // ip ???? direct
        return direct;
    var list = host.split('.').slice(-2); // ????????
    for (var term of list){ // ????????
        if (domains.has(term))
            return direct;
    }
    return proxy;
}
