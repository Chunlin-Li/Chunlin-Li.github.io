Debug 纪实
============

> 关于 node 内存泄漏的问题     
> 关于使用 node-inspetor 工具进行 memory debug 的问题

线上运行的程序会自己挂掉, 然后由 cluster 进行自动重启, 本来以为是 没有加 uncaughtException 监听的问题, 后来就加上了发现也还是有这种问题.

进程挂掉了, 什么信息都不输出, 程序内部似乎没有什么异常, 会是什么情况呢?  为了找到这个问题的答案, 走了不少弯路. 通过平台上 docker 的监控来看, 似乎存在内存不断上涨的现象. 于是自然怀疑到可能有内存泄漏. 

如果内存泄露, 那么最终一定会出现 OOM 的情况, OOM 输出的信息应该都是当前进程的标准输出和错误输出中. 不自信, 验证:    
以下是 OOM 时的 stdout 的输出:

```
<--- Last few GCs --->

    7363 ms: Scavenge 1398.8 (1455.6) -> 1398.8 (1455.6) MB, 1.8 / 0 ms [allocation failure].
    7365 ms: Scavenge 1398.8 (1455.6) -> 1398.8 (1455.6) MB, 1.5 / 0 ms [allocation failure].
    7366 ms: Scavenge 1398.8 (1455.6) -> 1398.8 (1455.6) MB, 1.5 / 0 ms [allocation failure].
    8206 ms: Mark-sweep 1398.8 (1455.6) -> 1398.8 (1455.6) MB, 839.4 / 0 ms [last resort gc].
    9049 ms: Mark-sweep 1398.8 (1455.6) -> 1398.8 (1455.6) MB, 842.9 / 0 ms [last resort gc].


<--- JS stacktrace --->

==== JS stack trace =========================================

Security context: 0x29278b037399 <JS Object>
    1: Uint8ArrayConstructByLength(aka Uint8ArrayConstructByLength) [native typedarray.js:87] [pc=0x2e8addf80a16] (this=0x29278b004131 <undefined>,v=0x108cfe004101 <an Uint8Array with map 0xf66640b4d9>,y=0)
    2: new constructor(aka Uint8Array) [native typedarray.js:~122] [pc=0x2e8addfc55b3] (this=0x108cfe004101 <an Uint8Array with map 0xf66640b4d9>,O=0,P=0x29278b004131 <undefined>,Q=0x29278b0...
```

以下是 OOM 时, stderr 的输出:

```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - process out of memory
```

那应该是没有 OOM 啊. 在代码中加了 `process.memoryUsage()` 的调试信息, 跟踪线上环境中的内存使用情况. 发现内存使用远没有到极限. 堆内存还不到 500MB, RSS 内存不到 1GB. 怀疑是 docker 环境有什么限制把进程给干掉了, 由于负责这部分的同事不在. 只能自己想办法了... 

先验证想法, 给 cluster 的 exit 事件加上 signal 输出, 结果发现是 SIGKILL 信号...  好家伙, 怪不得完全没有信息输出呢...

但是, 我们的程序为什么内存会不断上涨呢? 怎么能对内存泄漏进行 debug 呢? 

首先想到 V8 会不会有相关的工具呢. 找了找, 除了一些 v8 参数外不得要领. 勉强找了几个比较有用的 v8 参数试试:    

* `--trace-gc` : 每次 GC 打印一行信息    
* `--trace_gc_ignore_scavenger` : scavenger 是新生代之间的复制小 GC, 这种 GC 会非常频繁, 可以使用该参数将其忽略掉.
* `--trace_gc_verbose` : 显示每次 GC 的详细信息. 

加了这些参数后每次的输出信息大致如下: 

```
[2579:0x3075210] Increasing marking speed to 3 due to high promotion rate
[2579:0x3075210] Heap growing factor 4.0 based on mu=0.970, speed_ratio=6 (gc=2042787, mutator=342631)
[2579:0x3075210] Grow: old size: 379945 KB, new limit: 906772 KB (4.0)
[2579:0x3075210]     1282 ms: Mark-sweep 396.6 (434.4) -> 372.4 (413.4) MB, 30.2 / 0 ms (+ 137.9 ms in 1090 steps since start of marking, biggest step 56.4 ms) [GC interrupt] [GC in old space requested].
[2579:0x3075210] Memory allocator,   used: 423272 KB, available: 1075864 KB
[2579:0x3075210] New space,          used:   1430 KB, available:   1592 KB, committed:   6046 KB
[2579:0x3075210] Old space,          used: 340916 KB, available:      0 KB, committed: 341627 KB
[2579:0x3075210] Code space,         used:    723 KB, available:    264 KB, committed:    996 KB
[2579:0x3075210] Map space,          used:     94 KB, available:    896 KB, committed:   1007 KB
[2579:0x3075210] Large object space, used:  38209 KB, available: 1074823 KB, committed:  38248 KB
[2579:0x3075210] All spaces,         used: 381375 KB, available: 1077577 KB, committed: 387925 KB
[2579:0x3075210] External memory reported:      8 KB
[2579:0x3075210] Total time spent in GC  : 556.9 ms
```

通过这些参数看到, 我们的程序随着运行时间的增长, Old space 的大小和 External memory ( 一般来说是 Buffer 占用的空间 ) 都在不断增长. 但是到底是什么东西在增长就不太清楚了. 我想是得利用其他工具的时候了.

搜了一下, 发现主流的内存相关的 debug 工具有 [memwatch](https://github.com/lloyd/node-memwatch), [heapdump](https://github.com/bnoordhuis/node-heapdump), [node-inspector](https://github.com/node-inspector/node-inspector) 这么几个工具. memwatch 已经多年不维护了, 估计连运行都成问题, heapdump 对于 docker 运行环境来说也不是很方便. node-inspector 同样部署不到 docker 里去, 但是我可以想办法在本地模拟线上的环境和负载. 

在本地做好假环境后, 把服务跑起来, 然后用 ab 给服务加负载. 在这个过程中使用 profiles 中的 record heap allocation 功能, 但是有点不得要领, 出来一堆看不懂的东西. 然后试了试 take heap snapshot 的功能, 发现这个比较好用. 

于是乎, 先清理掉环境, 然后把服务运行起来, 完全启动之后, 先来一个 snapshot, 然后开始用 ab 加负载, 打上几千的请求后, 再来一个 snapshot. 这两个 snapshot 之间的差别就是在加了负载后留在老年代中的 对象了, 这些就很有可能是造成 memory leakage 的元凶.

将显示类型切换成 comparion, 然后将对比的对象选为 snapshot 1, 这时 profile 的面板上会显示这两个 snapshot 之间的变化, 直接寻找 size delta 最大的部分. 

展开左侧值得怀疑的 constructor, 在里面寻找大量重复的可能造成泄漏的对象( @符后面那个应该是内存地址 ), 选中内存对象后, 下方的 Object 区域中将出现这个对象的引用链, 从下往上一直到头. 通过这个引用链我们就能知道到底是哪里出现了泄漏. 

使用过程中需要对 Google Chrome 中的 Blind 调试器有所了解, 这方面可以直接参考官方给出的文档, 感觉讲的都比较清晰. 文末给出了几个链接. 这里面需要注意几个东西: system / JSArrayBufferData 是 Buffer 的构造器, 这是在堆内存外部的. 它们的大小会体现在它们的引用者的 retaine size 上面. 从这类对象可以查出大多非堆内存的泄漏问题. 

通过上面这些方法发现在处理请求后, string 和 Buffer 都有不少的增加, 打开这些部分的信息, 发现都是每次请求产生的数据. Buffer 是请求体, String 是请求体 toString 后的内容. 检查这些对象的引用链, 发现是在 keepAliveAgent 中的 socket 上, 存在 connect 事件的监听, 这个事件上注册了几十上百的 Listener, 这不正常! 执行的时候也注意到 node 有给出警告: 

```
(node) warning: possible EventEmitter memory leak detected. 11 connect listeners added. Use emitter.setMaxListeners() to increase limit.
Trace
    at Console.WRAPPED_BY_NODE_INSPECTOR [as trace] (/home/user/develop/node/lib/node_modules/node-inspector/lib/Injections/ConsoleAgent.js:95:19)
    at Socket.addListener (events.js:239:17)
    at Socket.Readable.on (_stream_readable.js:665:33)
    at Socket.once (events.js:265:8)
    at ClientRequest.handleSocket (/home/user/develop/node/lib/node_modules/node-inspector/lib/Injections/NetworkAgent.js:267:12)
    at ClientRequest.g (events.js:260:16)
    at emitOne (events.js:82:20)
    at ClientRequest.emit (events.js:169:7)
    at tickOnSocket (_http_client.js:484:7)
    at onSocketNT (_http_client.js:496:5)
```

检查 stack 信息, 似乎是 node-inspector 的问题. 但还不敢确定. 于是在使用 node-inspector 和不使用它的情况下分别观察内存的使用情况, 并且尝试在没有 inspector 的时候输出之前看到注册在 connect 事件上的函数. 结果发现这两种情况的内存使用存在明显的不同, 而且在没有 inspector 的情况下, socket 的 connect 事件上根本没有任何 listener. 这样基本上就能确定这次发现的所谓内存泄漏不是我们代码的问题, 而是 node-inspector 的 Bug. 后来针对这个问题做了进一步测试并提了 [issue](https://github.com/node-inspector/node-inspector/issues/836) 给 node-inspector, 应该很快能修复. 

那么现在再次陷入困惑, 我本地无法复现内存泄漏的情况. 最后只好找了平台部门的同事了解情况, 结果得知如果我们 docker 的内存配额分配过小, 是有可能自动杀掉进程的. 检查了一下, 我们的内存设置好像确实偏小了, 8 个 work process 使用 4GB 的内存, 平均每个才 500M 的 rss 内存. 去线上检查运行中的实例, 发现确实当总 RSS 内存接近 4G 的时候就会有 process 被 kill 掉. 

于是, 先不管内存有没有泄漏, 把内存配额加上去至少可以缓解一下情况. 可是, 当我们将内存设置为 16G 后, 发现 node 的实际内存使用量反而比之前还少了很多... ...  观察了几天后发现再也没有进程被 kill 的情况的, 内存消耗量也非常稳定. 这事, 应该就算这样了结了.

### 结论: 

* node-inspector 确实是可以用来寻找内存泄漏的工具, 但还是可能会碰到 bug. 其实如果精心准备一下, 也许是可以直接挂在机房的服务器上测试, 只需要开个端口让本地的浏览器能连到 node-inspector 上即可.
* node 在运行环境和系统资源比较恶劣的情况下, 似乎会产生类似雪崩的情况, 目前还不太清楚这中间的原因.
* 使用 v8 引擎的相关参数将 gc 的信息打印出来, 也是一种非常好用容易上手的, 比较粗粒度的内存和性能调试方法.
* node 中一种典型的内存泄漏的情况就是在 event 上注册了过多的 function, 而每个 function 又以闭包的方式持有了许多事实上已经无用的变量, 导致这部分内存无法被 GC 回收. 以后需要在这方面特别留意一下.



### 参考信息: 

* [chrome dev tools heap profile doc](https://developer.chrome.com/devtools/docs/heap-profiling)
* [memory analysis 101](https://developer.chrome.com/devtools/docs/memory-analysis-101#dominators)
* [chrome dev tools memory profile doc](https://developer.chrome.com/devtools/docs/javascript-memory-profiling)