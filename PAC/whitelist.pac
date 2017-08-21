var proxy = "SOCKS5 127.0.0.1:1080;SOCKS 127.0.0.1:1080";

var domains = new Set([ // 不走代理的顶级域名或域名列表
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
    if (/^(\d+\.){3}\d+$/.test(host)) // ip地址直接direct
        return direct;
    var list = host.split('.').slice(-2); // 从 host 中取出顶级域名或域名
    for (var term of list){ // 检查白名单中是否有匹配
        if (domains.has(term))
            return direct;
    }
    return proxy;
}
