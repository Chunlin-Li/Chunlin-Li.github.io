
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




> Written with [StackEdit](https://stackedit.io/).
