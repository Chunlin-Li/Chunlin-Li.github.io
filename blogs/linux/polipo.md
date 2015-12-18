
## 在 Ubuntu 下使用 polipo 转换代理类型

前提:

* 已经有一个可用的 shadowsocks 代理.
* 有一个 Ubuntu 系统用于部署 HTTP 代理服务

首先, 需要在 Ubuntu 下安装 polipo, [官方手册](http://www.pps.univ-paris-diderot.fr/~jch/software/polipo/polipo.html)  
```
sudo apt-get install polipo
```

安装成功后, 在 `/etc/polipo/` 路径下可以找到 `config` 文件, 打开编辑

其中的配置默认都是注掉的, 需要将我们要用到的配置打开注释.

* proxyAddress : 默认情况下, polipo 只监听本机回环接口 127.0.0.1, 这样无法向外提供服务. 我们需要将该配置设置为服务器自己的外网 IP. 注意此处 IP 地址需要用引号引起来.
* proxyPort : 默认端口是 8123, 我们可以通过该配置设置我们期望的端口.
* socksParentProxy : 将该配置设置为 Shadowsocks 主机地址和端口地址. 如 `127.0.0.1:1234`. 此处不需要用引号引起来.
* socksProxyType : shadowsocks 类型, 我这里使用 `socks5`


配置完保存, 然后使用重启 polipo 服务
```
service polipo restart
```

启动后就可以使用了.


#### 遇到的问题

* 如果使用 HTTP 代理访问的时候出 504 或者其他 50x 的错误代码, 检查 `socksParentProxy` 配置是否正确, 检查 ShadowSocks 服务是否运行正常.
* 如果访问出现 403 , 没有验证, 检查 poplipo 的 `config` 配置中是否打开了 allowedClient 配置项, 将其注释掉即可.


### 使用 HAProxy 做 Shadowsocks 的中继.

使用 HTTP 代理总觉的不安全, 而且, 遇到一个问题是, 公司的网络似乎无法连上米国的 VPS 了.
但是使用中发现, 国内的云主机是可以连上 VPS的, 所以现在只需要将 ShadowSocks 中继到国内云主机即可.
在 GitHub 上找到方法, 使用 `HAProxy` 可以做 TCP 的中继. 测试果然可用!

Ubuntu 12.04 下载 HAProxy 很方便: `apt-get install haproxy`

之后, 在 `/etc/haproxy/haproxy.conf` 路径拿到配置文件, 并修改 :
```
global
        ulimit-n  51200
        daemon

defaults
        log global
        mode    tcp
        option  dontlognull
        contimeout 1000
        clitimeout 150000
        srvtimeout 150000

frontend ss-in
        bind *:1234
        default_backend ss-out

backend ss-out
        server server1 xxx.xxx.xxxx.xxx:1234 maxconn 20480

```
frontend 对接最终用户, backend 对接米国 VPS. 设置好 IP 和端口即可.
客户端 Shadowsocks 相关配置参数都保持不变, 包括密码 加密方式等, 仅仅将 IP 和端口换一下即可.





> Written with [StackEdit](https://stackedit.io/).
