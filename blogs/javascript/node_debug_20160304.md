Debug 纪实
============

> 关于 node http 客户端 keep alive 的支持     
> 关于无法被 clientRequest 的 error 事件监听的错误导致的程序 crash


突然就有用户反映说我们发给他们的 http 请求不是 keep alive 的, 而且还给了 tcpdump 的信息.

之前一直听说 node 是默认 http/1.1 的, 1.1 是默认支持 keep alive 的, 但其实一直没有深入研究. 这下要来活了....

首先分析对方给的 tcpdump 的内容.  是一个 `.cap` 文件. 以前没有仔细用过 tcpdump, 有需要查资料了....

使用 `tcpdump -r xxx.cap` 文件将其中的信息读出来, 根据其中的 IP 和端口信息判断是谁给谁发, 然后通过 flags 中的信息判断是数据通信还是 TCP 连接的握手阶段. 可以参考 [tcpdump man 手册](http://www.tcpdump.org/tcpdump_man.html)中关于 TCP 的知识. 这里引用一小部分:

```
There are 8 bits in the control bits section of the TCP header:
CWR | ECE | URG | ACK | PSH | RST | SYN | FIN

Flags are some combination of S (SYN), F (FIN), P (PUSH), R (RST), U (URG), W (ECN CWR), E (ECN-Echo) or `.' (ACK), or `none' if no flags are set. 
```

通过 dump 信息中的 `Flags [S]` 和` Flags [S.]` 可以定位到我发给他们的 http 请求建立 tcp 连接的位置, 顺着 seq ack 号往下看, 发现只发了一个 http 请求后, 该 tcp 连接就被关闭了, 这也是通过 flags 判断, `Flags [F]` 或 `Flags [F.]`. 

觉得事有蹊跷, 自己用 chrome 请求我们的服务和 baidu.com 好像都是不会结束后立即发 FIN 的. 至少说明我们服务中的 server 是可以支持 keep alive 的. 然后自然而然怀疑到 client 本身了. node 到底是不是默认就可以 keep alive 的呢? 

最简单无脑又有效的方式就是试. 写一段 http 请求代码再请求之前测试的 url 呗. 最简单的 `http.get()` 搞定, 果然不行.

查资料看文档, 突然注意到有个 `agent` 选项可以在参数中设置, 不设置的时候默认使用 `http.globalAgent`. 而 agent 中又有个 keepAlive 选项. 文档来了这么一句:    
> The HTTP Agent also defaults client requests to using Connection:keep-alive. 
结果我没有看到后面的这么一句:     
> If you opt into using HTTP KeepAlive, you can create an Agent object with that flag set to true.
因此我以为 `http.globalAgent` 中的 keepAlive 选项已经是 true 了, 结果仔细看了文档发现该选项**默认是 false**!     
然后翻源码发现 globalAgent 就是最简单的 `new Agent()` 完事...   此为一坑.

准备该代码的时候发现, 之前留下的代码中有这么两句: `http.globalAgent.keepAlive=true; http.globalAgent.maxSockets=2048;`    
明明已经设置了没什么会没有效果呢? 通过翻源码发现, Agent 实际使用的参数是构造的时候传入的参数 options, 也就是说我得写成    
`http.globalAgent.options.keepAlive=true` 才能生效. 这又是一坑...  当然, 这个 Bug 已经在16年2月的时候修正了. 你得用新版!

既然这样, 还是老老实实 new 一个新的 keepAliveAgent 吧. `http.keepAliveAgent = new http.Agent({keepAlive: true})`    
然而, 后面还有更大的坑在等着呢....

改过的代码上线跑起来了, 感觉都挺不错, 但是观察了一段时间发现每过一段时间, 我们的一个 node 进程就报错挂掉了. 之前也有注意到过进程有时候会自己挂掉的问题, 但一直没仔细关注过, 上面解决了一个问题后心情大好, 不如趁此机会看看这个.     
既然报错就根据错误的 stack 信息找 Bug 呗. 然而仔细一看发现报错信息如下: 

```
{ [Error: read ECONNRESET] code: 'ECONNRESET', errno: 'ECONNRESET', syscall: 'read' }
events.js:72
        throw er; 
              ^
Error: read ECONNRESET     
    at exports._errnoException (util.js:870:11)
    at TCP.onread (net.js:544:26)
```

这报错信息中几乎没有有用的信息, 加 uncaughtExpection 的监听可以让程序不挂, 但找不出出错原因绝对心有不甘!    
虽然报错信息少的可怜, 而且全都是 node 内部代码的信息, 但是仔细分析可以判定分析这么几个事实: 

1. 错误可能是由网络 IO 造成, 应该是 TCP 的读取操作出现问题
2. 代码中所有与其相关的就是 http server 和 http client 了. 二者都可能会有读操作
3. 之所以会 crash 是因为 error 事件没有监听. 但正常需要监听的地方我应该都监听到了. 
4. 根据出错的量来看, 多数请求正常, 只有少数情况会触发异常.

google 了一下, 这个报错挺常见的, 但没有找到和我们类似的情况. 

阅读源码, 发现 TCP 是一个由 libuv 封装的对象, 无法看到里面实现. onread 的第一个参数是 nread, 正常情况应该是读到的数据的长度, 当小于 0 的时候代表错误码或 EOF, ECONNRESET 就是 libuv 的一个 err name, 代码是 -104 (这是用了 NODE_DEBUG=net,http 的环境变量, 打印出内部 debug 信息才找出来的). 此时 TCP 会返回一个 Error, 其中封装的信息就是`{ [Error: read ECONNRESET] code: 'ECONNRESET', errno: 'ECONNRESET', syscall: 'read' }`. TCP 是 net 库中 Socket 的一种 handle, 这个错误向上传递到 Socket, 应该会触发 error 事件, 然而上面没有 listener, 直接错误丢给 process, 然后 crash. 

研究了这么多, 可是, 我还是不知道这是哪来的, http server 已经监听了 error, 顺带连 clientError 事件都监听上了. http client 每一个也都有监听 error 事件. 不过既然已经确定是 http 这块的问题, 那不如来尝试复现现象. 简单写了两个 js 文件, 一个 client 一个 server, 刚跑起来的时候还遇到个小插曲, client 上监听的 response 事件, 但是没有在里面监听 data 和 end 事件, 导致 http 请求无法正常结束, 后来经过高人指点才找出原因, 修改后跑起来就一切顺畅. 然后得想办法搞点意外出来, 加个 `setTimeout()` 把 `.end()` 注释掉... 发现无论怎么做, 都无法准确复现我们遇到的问题(后来发现用这种方式是复现不了的).

网络中经常遇到的问题是连接断开, 毕竟整个网络的环境相当复杂, 而我们的测试代码跑在本地 127.0.0.1 上, 无论怎么跑都很顺畅, 不知道有没有什么可以模拟不好的网络状态的工具. google 了一下果然有, 名叫 `tcpkill`, 直接 `apt-get install dsniff` 即可. 语法和 tcpdump 有点类似, 装好后再把 server client 跑起来, 选择断掉 client 的端口, 发现 server 完全没事继续运行, client 也没有 crash, 所有的错误都被 error 上的事件监听器抓到. 重来一遍, 这次断 server 端的端口, client 上连续出现了几个 error 错误后, 突然就崩了, uncaughtException 的信息跟我们遇到的一模一样!

既然可以确定是 client 上出的问题, 并且这个异常没有被 on('error') 抓住, 则顺着往下推理, 这个 socket 应该不是在我的 client 发 request 的时候所用的. 那会不会是 keepAliveAgent 呢? 为了实现 keepAlive, 它应该需要有个连接池, 如果要发新的请求, 就从空闲连接中取出一个来分配给当前的 http 请求, 请求结束后需要将其释放到池中以便重用... 对了! 空闲连接池中的 socket 不就是即处于连接状态, 又没有对应的 request 的么! 思路突然清晰多了, 觉得这次不会有错了, 剩下的就是验证想法了.

通过阅读源码, 发现 agent 有个 free 事件, 当 Socket 释放时触发, 如果没有 request 需要处理, 就把这个 socket 丢到空闲连接池中. 据此改造了一下我的 client, 代码片段: 

```js
var keepAliveAgent = new http.Agent({keepAlive: true, maxSockets: 500});
keepAliveAgent.on('free', function(socket) {
	if (!socket._events['error']) // 避免重复添加 listener
		socket.on('error', function (err) {
			console.log('free socket error: ', err, err.stack);
		})
});
```

重新运行 server 和 client, 然后用 tcpkill 断开 socket 连接. 然后在 client 端的报错信息中果然发现了在 free 事件上绑定上去的那个 error 事件监听, 最重要的是, 这次程序没有 crash, 说明成功捕获到了之前的 uncaughtException. 测试过之后修改线上的代码, 部署跑起来, 观察了一段时间, 的确出现很多 free socket error 的错误信息, 并且现在程序不再被这种莫名其妙的 uncaugthException 搞挂了!

查了下 github, 有人对这个问题提了 PR, 预计将会在 LTS 4.4.0 版本上合并进去(目前最新版本 4.3.1). 

### 总结: 

* node 中默认的 http client 不开启 keep-alive, 如果需要, 得自己 new 个开启 keepAlive 的 Agent.
* 对于开启 keepAlive 的 Agent, 需要在 free 事件中手动处理空闲 socket 的错误, 否则会造成 uncaughtException.

### 其他相关信息:

* [node 源码: agent 的 free 事件](https://github.com/nodejs/node/blob/v4.x/lib/_http_agent.js#L43)
* [libuv 的错误码名称](http://docs.libuv.org/en/v1.x/errors.html?highlight=err%20name#c.uv_err_name)
* [源码: global agent](https://github.com/nodejs/node/blob/v4.x/lib/_http_agent.js#L252)
* [源码TCP onread](https://github.com/nodejs/node/blob/master/lib/net.js#L507)
* [tcpdump 手册](http://www.tcpdump.org/tcpdump_man.html)
* [http 1.1 (rfc 2616) 中关于 keep-alive 传播 - 13.5.1 节](https://www.ietf.org/rfc/rfc2616.txt)
* [node 相关 issue](https://github.com/nodejs/node/issues/3595)
* [node 相关 PR](https://github.com/nodejs/node/pull/4482)
* [node 4.4.0 Merge](https://github.com/nodejs/node/commit/2d4921af4a4724255e8c8f15bf8e6ece00f2250a)