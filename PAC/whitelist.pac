var domains = new Set([
  '103.249.254.119',
  '103.249.254.199',
  '12306.cn',
  '127.0.0.1',
  '163.com',
  '360buyimg.com',
  'alibaba.com',
  'alicdn.com',
  'alipay.com',
  'alipayobjects.com',
  'aliyun.com',
  'amazon.cn',
  'amazon.cn',
  'anquanbao.com',
  'appgame.com',
  'baidu.com',
  'baidupcs.com',
  'baidustatic.com',
  'bdimg.com',
  'bdstatic.com',
  'bing.com',
  'chinaz.com',
  'cn',
  'cnodejs.org',
  'cnzz.com',
  'csdn.net',
  'douban.com',
  'ele.me',
  'emuch.net',
  'gewara.com',
  'googleadservices.com',
  'goyoo.com',
  'guokr.com',
  'huazhu.com',
  'infoq.com',
  'infoqstatic.com',
  'iteye.com',
  'jd.com',
  'lagou.com',
  'leetcode.com',
  'localhost',
  'mmstat.com',
  'netease.com',
  'optimix.asia',
  'qiniucdn.com',
  'qq.com',
  'qqmail.com',
  'ruanyifeng.com',
  'runbt.me',
  'saraba1st.com',
  'speedtest.net',
  'taobao.com',
  'teambition.com',
  'tmall.com',
  'tongbupan.com',
  'tuicool.com',
  'upaiyun.com',
  'useso.com',
  'wangyin.com',
  'xiami.com',
  'xiami.net',
  'ydstatic.com',
  'yixun.com',
  'youdao.com',
  'zdmimg.com',
  'zhihu.com',
  'ziroom.com',
  'zoopda.com' ]);

var direct = 'DIRECT';
var discard = 'Discard';
// var proxy = "SOCKS5 1.1.1.1:1;SOCKS 1.1.1.1:1";
// var proxy = "PROXY 1.1.1.1:1";
// var proxy = "HTTPS 1.1.1.1:1";sss
function FindProxyForURL(url, host) {
    var domain = host;
    do {
        if (domains.has(domain))
            return direct;
    } while(domain.indexOf('.') > -1 && (domain = domain.slice(domain.indexOf('.') + 1)));
    return proxy;
}
