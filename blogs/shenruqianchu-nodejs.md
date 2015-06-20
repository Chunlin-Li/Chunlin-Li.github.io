[TOC]

# 1 Node 简介

Chrome 浏览器引擎:  V8 Javascript 引擎; WebKit 布局引擎.
Node 相当于是只保留了 V8 的 Javascript 引擎, 而抛掉了 HTML 布局的 WebKit 

> **node-webkit** 将 node 和 webkit 再次进行创新融合, 用 webkit 完成 UI 层面, node 完成数据和逻辑层面. 但是又不受浏览器的局限, 可以用于开发桌面应用程序. 

## 1.4 Node 的特点

### 1.4.1 异步调用中, I/O 不会阻塞主线程

按照同步 I/O 的思路来用异步 I/O, 最常见的问题就是, 我先发出的 I/O 请求, 然后在后面的代码使用返回的数据, 总是 undefined. 这是我在学习过程中经常出现的问题. 

异步 I/O 很大的一个优势就是: 天然支持多 I/O 并行.  I/O 并行和串行的差别在与消耗的时间. 并行: SUM( IO1, IO2, IO3, ... ) ;  串行 : MAX( IO1, IO2, IO3, ....) 

### 1.4.2 事件与回调

事件驱动编程方式:  

 * 优点:  轻量级, 送耦合, 只需关注事务点
 * 缺点:  对于多任务协调的要求较高

回调: 

* 天生适合与事件驱动的编程方式
* 对于熟悉了同步编程思维的人来说, 初期觉得很不习惯
* 一定程度上会降低代码的可读性

### 1.4.3 单线程
优点:

* 没有多线程并发时的一致性问题
* 没有资源竞争造成的死锁
* 没有线程上下文切换的开销

缺点:

* 不便于发挥多核 CPU 的优势
* 线程遇到错误后会导致整个应用退出
* 计算密集型代码长时间占用 CPU 会出现 "阻塞" 现象

页面 javascript 解决单线程问题 : HTML5 中的 Web Workers 模型

Node 解决单线程问题的突破口与其类似 : `child_process`. 即利用进程来解决线程问题.

使用 Master-Workers 的管理方式保持应用模型的低依赖性和简洁.


### 1.4.4 跨平台性

Node 的跨平台特性是基于 libuv, 以实现在 *nix 和 windows 平台的兼容.

## 1.5 Node 的应用场景

**I/O 密集型**:   天生优势

**CPU 密集型 (略显不足)** :   

不如 C/C++ 以及 Java, Go 等计算优势明显的语言, 但是总体来说也不差. 脚本型语言中很有优势.  只是需要注意较大的计算任务会使得 Node 无法处理 I/O 的启停.

**克服 CPU 密集型的短板**: 

1. 编写 C/C++ 扩展, 提高 CPU 密集计算的效率.
2. 使用专门的进程当作常驻的服务进程来处理密集型计算.

### 1.5.3 与现有系统的整合
直接用 Node 对现有系统做替换过于激进, 很难被广泛接受.  但是可以尝试和现有系统做部分整合.  既可以垂直地来使用 Node 完成新的业务模块,  或者, 让 Node 完成水平业务分发和路由, 再一点点向下渗透.

### 1.5.4 分布式应用
阿里的例子: NodeFox  ITier 中间件的实现. 
一个输入请求被分解成 N 个数据请求, 启动并行 I/O 向不同的数据集群或服务发起查询请求, 然后在中间层拼接结果后返回.  使用 并行 I/O 才能大幅提高该场景下的执行效率.


## 1.6 Node 的使用者

现有 Node 用户的实际使用方式和场景 : 

1. 前后端编程语言环境统一. 使得全栈开发更为容易, 提高整体效率
2. 使用  socket.io 提供如即时通讯一类多链接, 有实时要求的应用场景
3. 分布式环境中的并行 I/O
4. 利用 Node 并行 I/O 能力加速 Web 请求的响应速度
5. 云集算平台提供 Node 托管环境
6. 游戏开发领域
7. 工具类应用

---------------------------------------------

# 2 模块机制

**背景** : javascript 语言本身没有模块系统; 标准库很少; 没有标准接口; 没有包管理系统.

CommonJS 的出现就是为了解决以上问题. 而 Node 又采用了 CommonJS 规范来实现自己的模块系统.


### 2.1.2 CommonJS 的模块规范

CommonJS 模块的三个部分: 

1. 模块引用: `var math = require('math');` 这就是引入 math 模块, 并将其赋予变量 math. 
2. 模块定义:
	* 一个js文件就是一个模块
	* 模块中名为 exports 的变量用于引用该模块的对外出口, 可以是对象, 也可以是一个函数
	* 模块中名为 module 的对象代表该模块自身
	* exports 是 module 的一个属性.
3. 模块标识:
	* 可以使用 `.` 或者 `..` 开头的相对路径
	* 可以使用 `/` 开头的绝对路径
	* 可以省略 `.js` 后缀名

## 2.2 Node 的模块实现

........ 暂跳过    

// TODO 

// TODO 

// TODO 

// TODO 


## 2.3 核心模块

........ 暂跳过    

// TODO 

// TODO 

// TODO 

// TODO 


## 2.4 C/C++ 扩展模块

........ 暂跳过    

// TODO 

// TODO 

// TODO 

// TODO 

## 2.5 模块调用栈
模块调用优先级如下:

* Javascript 模块是调用栈的最底层 (发起调用者), 
	可以调用所有其他类型模块, 包括 C/C++ 扩展模块, JavaScript 核心模块, C/C++ 内建模块
* JavaScript 核心模块也可以调用 C/C++ 内建模块. 


## 2.6 包与 NPM

之前介绍的 `模块` 的概念, 事实上就是组成 `包` 的细胞. 

module 是一个个文件, 向外暴露 exports,  一个 package 中有若干个 module,  package 的出口模块作为 package 树状结构的 root , 向外提供的 exports 就是这个 package 的出口, 而其内部又 require 了 package 内部的其他 module.

这种结构统一了包结构和模块结构的形式, 确保了规范的简洁性.

### 2.6.1 包结构

* package.json : 包描述文件
* bin : 可执行文件的目录. ( 有时也包括 .js 文件 )
* lib : 存放 JavaScript 代码的目录
* doc : 文档
* test : 测试用例

### 2.6.2 包描述文件 `package.json`

**_package.json_ 中的主要字段**  :

* `name`  : 包名. 有唯一性限制. 包名构成的正则规则: `[a-z0-9.\-_]+`. 建议不要包含 node 或 js 进行重复标记
* `author` : 包作者.
* `version` : major.minor.revision 格式的语义化版本号
* `repositories` : 代码的托管位置列表.
* `dependencies` : 该包所需依赖的包列表.
* `main` : 指定整个包的出口模块. 若未指定, 会依次查找包目录下的 index.js, index.node, index.json 作为默认的包入口.
* `scripts` : 脚本说明对象. 可以设定比如 "install", "uninstall", "test" 等成员, 并指定其对应的执行命令.
* `bin` : 指定该包作为命令行工具使用时的入口 js 文件.

以 express 的 package.json 作为示例 : 
```json
{
  "name": "express",
  "description": "Fast, unopinionated, minimalist web framework",
  "version": "4.12.4",
  "author": "TJ Holowaychuk <tj@vision-media.ca>",
  "contributors": [
    "Aaron Heckmann <aaron.heckmann+github@gmail.com>",
    "Ciaran Jessup <ciaranj@gmail.com>",
    "Douglas Christopher Wilson <doug@somethingdoug.com>",
    "Guillermo Rauch <rauchg@gmail.com>",
    "Jonathan Ong <me@jongleberry.com>",
    "Roman Shtylman <shtylman+expressjs@gmail.com>",
    "Young Jae Sim <hanul@hanul.me>"
  ],
  "license": "MIT",
  "repository": "strongloop/express",
  "homepage": "http://expressjs.com/",
  "keywords": [
    "express",
    "framework",
    "sinatra",
    "web",
    "rest",
    "restful",
    "router",
    "app",
    "api"
  ],
  "dependencies": {
    "accepts": "~1.2.7",
    "content-disposition": "0.5.0",
    "content-type": "~1.0.1",
    "cookie": "0.1.2",
    "cookie-signature": "1.0.6",
    "debug": "~2.2.0",
    "depd": "~1.0.1",
    "escape-html": "1.0.1",
    "etag": "~1.6.0",
    "finalhandler": "0.3.6",
    "fresh": "0.2.4",
    "merge-descriptors": "1.0.0",
    "methods": "~1.1.1",
    "on-finished": "~2.2.1",
    "parseurl": "~1.3.0",
    "path-to-regexp": "0.1.3",
    "proxy-addr": "~1.0.8",
    "qs": "2.4.2",
    "range-parser": "~1.0.2",
    "send": "0.12.3",
    "serve-static": "~1.9.3",
    "type-is": "~1.6.2",
    "vary": "~1.0.0",
    "utils-merge": "1.0.0"
  },
  "devDependencies": {
    "after": "0.8.1",
    "ejs": "2.3.1",
    "istanbul": "0.3.9",
    "marked": "0.3.3",
    "mocha": "2.2.5",
    "should": "6.0.1",
    "supertest": "1.0.1",
    "body-parser": "~1.12.4",
    "connect-redis": "~2.3.0",
    "cookie-parser": "~1.3.4",
    "cookie-session": "~1.1.0",
    "express-session": "~1.11.2",
    "jade": "~1.9.2",
    "method-override": "~2.3.3",
    "morgan": "~1.5.3",
    "multiparty": "~4.1.2",
    "vhost": "~3.0.0"
  },
  "engines": {
    "node": ">= 0.10.0"
  },
  "files": [
    "LICENSE",
    "History.md",
    "Readme.md",
    "index.js",
    "lib/"
  ],
  "scripts": {
    "test": "mocha --require test/support/env --reporter spec --bail --check-leaks test/ test/acceptance/",
    "test-ci": "istanbul cover node_modules/mocha/bin/_mocha --report lcovonly -- --require test/support/env --reporter spec --check-leaks test/ test/acceptance/",
    "test-cov": "istanbul cover node_modules/mocha/bin/_mocha -- --require test/support/env --reporter dot --check-leaks test/ test/acceptance/",
    "test-tap": "mocha --require test/support/env --reporter tap --check-leaks test/ test/acceptance/"
  }
}
```

### 2.6.3 NPM 常用功能

NPM的重要性: 它是 Node 的生态系统.  相当于 Ubuntu 的 apt-get. Python 的 pip.

npm 相关 --> [npm 简易教程](https://github.com/Chunlin-Li/Chunlin-Li.github.io/blob/master/blogs/how-to-npm-note.md)

### 2.6.4 组建企业私有 NPM

........ 暂跳过    

// TODO 

// TODO 


### 2.6.5 NPM 存在的问题

* 没有门槛, 包的质量良莠不齐
* Node 代码可以直接在服务端运行, 存在一定的安全风险. npm 不会对上传的包进行审核或检查

选择包时的评判标准:

* npm 网站上排名靠前的包
* GitHub 上 Watcher, Star 和 fork 多的包
* 有文档和测试用例的包


## 2.7 前后端共用模块

### 2.7.1 侧重点不一样

前端:

* 一份文件在多个不同的客户端上执行
* 网络加载, 速度慢, 带宽是瓶颈

后端: 

* 一份文件在同样的环境中持续执行
* 本地或内网加载, 速度快, CPU 和 内存 是瓶颈
 

### 2.7.2 AMD 规范

### 2.7.3 CMD 规范

### 2.7.4 编写兼容多种规范的模块

为保持前后端的一致性, 需要将类库代码包装载一个闭包内. 以兼容 Node, AMD, CMD 及常见浏览器环境.

示例 hello world 模块代码如下: 
```js
;(function() {
    // 检查上下文环境是否为 AMD或CMD
    var hasDefine = typeof define === 'function',
        // 检查上下文环境是否为 Node
        hasExports = typeof module !== 'undefined' && module.exports;

    if(hasDefine) {
        // AMD 环境或 CMD 环境
        define(definition);
    } else if (hasExports) {
        // 定义为普通 Node 模块
        module.exports = definition();
    } else {
        // 将模块的执行结果挂在 window 变量中, 浏览器中 this 指向 window 对象
        this[name] = definition();
    }

})('hello', function() {
    var hello = function() {};
    return hello;
});
```

--------------------------------------------

# 3 异步 I/O

在操作系统底层中, 异步通过信号量, 消息等方式广泛应用.

伴随着异步 I/O 的还有事件驱动和单线程.   与 Node 设计理念相近的另一个知名产品是 Nginx.

## 3.1 为什么需要异步

早期 web 页面需要使用异步方式, 消除 UI 阻塞问题. 因为 JS 执行和 UI 渲染共用同一个线程.

对于耗时的 I/O, 只在启动和结束的时候对其进行处理, 而不在其执行过程中阻塞等待将会大大提高执行效率, 改善用户体验. 

## 3.2 异步 I/O 的实现现状

从计算机内核的 I/O 方面来说,  异步/同步 概念 与 阻塞/非阻塞 的概念是不同的.

绝对的异步需要多核 CPU 用不同的物理核处理才行. 实际上, 异步 I/O 通常都是通过线程池和非阻塞 I/O 两种技术来模拟的, 比如 linux 原生的 AIO, glibc 的 AIO, 还有 libev, libeio 等库中的实现.

**我们所说的 Javascript, Node js 中的单线程是指其业务是执行在一个线程上的, 而 I/O 本身其实已经在使用其他的线程了**

> 非阻塞 I/O 技术的演进 : 
> 
> * 一个线程发起 I/O 后, I/O 操作压入调用栈, 线程等待 I/O 执行的返回, 属于阻塞I/O
> * 一个线程发起 I/O 后, I/O 开始执行, 但完成后不会返回调用处, 这属于非阻塞 I/O
> * 非阻塞 I/O 需要线程自己去检查 I/O 是否执行完成, 该技术有如下演进:
>   * 轮询 : 线程不断去读取 I/O 描述文件尝试获取结果
>   * select : 查询 I/O 事件状态, 最多同时检查 1024 个描述符
>   * poll : 改进为链表, 没有 1024 的长度限制
>   * epoll : 调用后线程休眠, I/O 结束后回唤醒线程. 该方案中, I/O 过程中线程处于闲置状态, CPU 底层可以通过优化, 将实际的处理器资源调度到其他线程, 以提高运行效率.

## 3.3 Node 的异步 I/O

### 3.3.1 事件循环 ------ Node 自身的执行模型

进程启动时就创建了事件循环, 每个循环对诸多事件源进行查询并消费 ( 包括执行与之绑定的回调函数 ), 然后再次循环, 不断重复. 

Node 的事件循环属于一个典型的 生产者/消费者 模型. 


### 3.3.2 观察者

Node 通过观察者捕捉事件的状态变化, 常见的事件都是由 I/O 产生的, 比如文件的 I/O, 以及网络 I/O  等.

### 3.3.3 请求对象

从 javascript 发起调用到内核执行完 I/O 操作的过度过程中, 存在一种非常重要的中间产物, 叫做_请求对象_.

Node 的经典调用过程 :  javascript 调用 Node 的核心模块, 核心模块调用 C++ 内建模块, 内建模块通过 libuv 进行系统调用. libuv 的调用过程中 创建了一个 FSReqWrap 的请求对象, 从 javascript 传入的参数和当前方法都封装在该请求对象中, 回调函数被设置在该对象的 oncomplete_sym 属性上. 接下来, 该请求对象被 push 到线程池中等待执行. 

至此, javascript 的异步I/O 的调用过程结束, javascript 继续执行后续代码.  但异步 I/O 过程还没结束, 还有第二部分: 回调.

### 3.3.4 执行回调

线程池中的 I/O 操作不管是阻塞还是轮询, 都不会影响 javascript 线程的执行. 

当线程池中的 I/O 执行完毕后,将执行结果保存在请求对象上, 然后通知系统的异步IO模块(AIO), 并将线程归还线程池, 而此时, 该请求对象是可以被查询到的, javascript 的事件循环 I/O 观察者在每次执行中, 都会通过观察者检查事件状态, 当观察到有处于完成状态的请求对象队列中非空时, 会将其取出, 准备当作事件进行处理.

I/O 观察者取出请求对象, 将 result 作为参数, 执行 oncomplete_sym 所引用的函数. 至此, 整个异步 I/O 的过程完全结束. 

**事件循环,  观察者,  请求对象,  I/O 线程  这四者共同构成  Node  异步 I/O 模型的基本要素**

### 3.3.5 小结

在 Node 中, javascript 的执行是单线程, 而 Node 本身并不是单线程的. 

用户编写的 javascript 业务代码只能串行执行, 但是所有的 I/O 都是并行执行的.

## 3.4 非 I/O 的异步 API

setTimeout(),  setInterval(),  setImmediate(),  process.nextTick()

他们虽然与 I/O 无关, 但也是异步的. 

### 3.4.1 定时器

单次延迟执行任务:  setTimeout() 

多次延迟执行任务:  setInterval() 

实现逻辑:  

setTimeout() --> 生成对应的定时任务对象 --> 将其扔到事件循环中 --> 完毕

事件循环中会检查定时器是否超过定时, 如果超过定时, 则执行对应的回调函数.

**缺陷** : 优于事件循环机制自身的特性,  定时会存在误差, 因为到达指定时间的时候, 可能 javascript 正好在处理另外一个任务, 需要等待该任务结束才能再次检查定时器. 

### 3.4.2 process.nextTick()

有时希望立即异步执行一个任务, 可以使用这样的方式: 
```
setTimeout(function() {
	// DO SOMETHING
}, 0);
```
然而, 这种方式并不好, 因为 
	1. 定时器的精度不好
	2. 定时器需要动用红黑树, 创建定时器对象, 迭代操作等 浪费性能, O(lg(n)) 复杂度.

使用 process.nextTick() 更为轻量, O(1) 复杂度. 其实现如下 :
```javascript
process.nextTick = function(callback) {
	// on the way out , don't bother.
	// it won't get fired anyway
	if (tickDepth >= process.maxTickDepth)
		maxTickWarn();
	
	var tock = { callback : callback };
	if (process.domain)
		tock.domain = process.domain;
	nextTickQueue.push(tock);
	if (nextTickQueue.length) {
		process._needTickCallback();
	}
};
```

调用 process.nextTick(callback), 将回调放入队列中, 下一轮 Tick 时会将其取出执行, 而不需要设置定时器.


### 3.4.3 setImmediate()

该方法在优先级上低于 process.nextTick() 方法.

事件循环对观察者的检查是有先后顺序的, 从高到低依次是:   

* idle 观察者 ( process.nextTick() )
* I/O 观察者 
* check 观察者 ( setImmediate() )

process.nextTick() 的回调保存在数组中, 每次检查回取出所有回调全部执行完;  
setImmediate() 的回调保存在链表上. 每次循环只取出链表上的一个回调执行. 

这相当于是有三种不同优先级的事件任务队列, 可以联想操作系统的不同优先级任务队列.   
这样的设计可以让用户根据不同的使用情景安排不同的任务优先级, 保证高优先级的任务可以被尽快执行.

## 3.5 事件驱动与高性能服务器

使用 Node 构建 Web 服务器的流程:

(系统内核) :    
监听端口 --> 接受网络请求 --> 创建事件, 发送给 I/O 观察者 -->   
(事件循环 libuv) :    
观察者循环检查 --> 观察者获取事件并执行事件回调函数 --> 检查业务 callback -->   
( javascript 执行回调 ) : 
发现有业务回调 --> 执行 --> 完成

> 其他事件驱动库的实现 : 
> Ruby --> Event Machine
> Perl --> AnyEvent
> Python --> Twisted
> Lua --> luavit


# 4 异步编程

## 4.1 函数式编程

在 javascript 中,  函数是一等公民,  于此有关的文章很多. 

### 4.1.1 高阶函数

高阶函数 : 简单说就是参数和返回值也都可以是函数.    
该方式将函数的业务重点从返回值转移到了回调函数中.

典型高阶函数 sort() 方法 : 
```
var points = [40, 100, 1, 5, 25, 10];
points.sort(function(a, b) {
	return a - b;
});
// [ 1, 5, 10, 25, 40, 100 ]
```
其排序行为由作为参数的排序函数决定.  但该函数只需要描述排序逻辑,  而无需关心其他和排序逻辑无关的通用排序操作. 

> Java 中的 Comparator 与其类似.

通过高阶函数,  可以给事件注册不同的回调函数,  以此可以对复杂业务进行逻辑解耦.

### 4.1.2 偏函数的用法

偏函数:  在一个函数中调用另外一个函数,  而这个被调用的函数, 其参数和变量是经过特定设置的.

用法之一是抽离多个函数中所需的相同的部分, 例: 
```javascript
// 原始写法 
// 用于定义类型判断的方法
var toString = Object.prototype.toString;
var isString = function(obj) {
	return toString.call(obj) == '[object String]';
};
var isFunction = function(obj) {
	return toString.call(obj) == '[object Function]';
};
```

两个方法几乎是重复的. 我们可以将其中重复部分抽离出来, 其中不同的部分可以用传入的参数来定义.
```javascript
var isType = function(type) {
	return function(obj) {
		return toString.call(obj) == '[object ' + type + ']';
	};
};
var isString = isType('String');
var isFunction = isTyep('Function');
// 还可以很方便的定义其他类似函数 ... ... 
```

## 4.2 异步编程的优势与难点

需要防止任意一个任务计算耗费过多的CPU时间片. 通常建议每次 CPU 的耗用不要超过 10ms, 或者将打计算量的任务分解为诸多小量计算, 通过 setImmediate() 进行调度. 

### 4.2.2 **难点**

#### 4.2.2.1 异常处理: 
传统方式的 `try { ... } catch( e ) { ... }` 的方式对于异步编程会有不适用的情况.    
原因: 异步任务启动过程只是将任务挂在对应的事件队列上, 该异步任务将在下一个 Tick 上执行, 而 try/catch 方法只能捕获本次事件循环内的异常, 对 callback 中的异常无能为力.

Node 编码在异常处理上形成了一种**_约定: 将异常作为回调函数的第一个实参传回, 如果是空值, 表明没有异常_**. 例:
```javascript
var callback = function (err, results) { ... };
```

编码原则:    
1. 必须执行调用这传入的回调函数;
2. 回调中正确处理并传递异常信息供调用者判断.
示例代码: 
```javascript
var async = function (callback) {
	process.nextTick(function() {
		var results = SOMETHING;
		if (error) {
			return callback(error);
		}
		callback(null, results)
	});
}
```

一个容易犯的错误: 对用户传递的回调函数进行异常捕获.
```javascript
try {
	req.body = JSON.parse(buf, options.reviver);
	callback(); // 此处的异常将导致 callback 执行两次.
} catch (err) {
	err.body = buf;
	err.status = 400;
	callback(err);
}
```
正确的方式应该是 **将用户传入的回调放在 try 之外, catch 只用来给回调传递异常信息, 不需要关心用户传入的回调在当前函数中的执行策略 **
```javascript
try {
	req.body = JSON.parse(buf, options.reviver);
} catch (err) {
	err.body = buf;
	err.status = 400;
	return callback(err);
}
callback(null);
```
编写异步函数式, 只需将异常正确的传递给用户的回调即可, 无需过多处理.

#### 4.2.2.2 函数嵌套过深

这个问题是 Node 被诟病最多的地方. 

#### 4.2.2.3 阻塞代码

Node 中没有其他语言中的  sleep() 函数用于延迟. 对于该问题的错误解决方式: 
```
var start = new Date();
while (new Date() - start < 1000) {
	// TODO
}
```
这样通过持续占有CPU线程的方式, 破坏了 Node 的事件循环调度.   
首选应该是尽量通过合理调度任务, 避免使线程空等.   
其次, 如果一定需要使用, 考虑用 setTimeout() 或 setInterval() 来实现.

#### 4.2.2.4 多线程编程

Node 借鉴浏览器的 Web Workder 新标准, 提供了基于 `child_process` 和 `cluster` 的基础 API.    

在此基础上, 开发人员需要去考虑更多的跨线程 (进程) 的编程.

#### 4.2.2.5 异步转同步

Node 中没有原生的同步 API, 如果需要异步转同步, 需要借助第三方的库, 或者是编译手段来实现.   
另, 通过良好的流程控制, 可以将同步逻辑用异步模拟实现. 


## 4.3 异步编程解决方案

### 4.3.1 事件发布/订阅模式

这是一种被广泛应用的异步编程模式, 是回调函数的事件化, 又被称为 (事件监听器模式)

Node 自身提供了 events 模块, 包含发布/订阅的简单实现.    
其中没有前端浏览器中的  preventDefault(), stopPropagation() 和 stopImmediatePropagation() 等控制事件传递的方法. 
```javascript
// sub
emitter.on("event1", function (message) {
	console.log(message);
});
// pub
emitter.emit('event1', "I am message!");
```
订阅者的回调函数被称为*事件监听器*.    
可以利用发布订阅模式, 对不变的部分封装在组件内, 易变部分通过事件向组件外暴露接口. 以此实现解耦

发布订阅模式的关键在与事件的设计, 此处的事件设计就相当于是接口的设计. 

从另一个角度看, 这也是一种钩子机制的运用.  模块只管自己执行就好, 仅在必要的节点上留出个事件钩子给外部捕获当前的执行状态和数据

```
var option = {
	host: 'www.google.com',
	port: 80,
	path: '/upload',
	method: 'POST'
};

var req = http.request(option, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function(chunk) {
		console.log('BODY: ' + chunk);
	});
	res.on('end', function() {
		// TODO
	});
});
req.on('error', function(e) {
	console.log('problem with request: ' + e.message);
});
// write date to request body
req.write('data\n');
req.write('data\n');
req.end();
```

Node 对事件的发布订阅机制做了一些额外处理, 大多基于健壮型考虑:   

* 一个事件如果添加了 10 个以上的监听器, 会收到一条警告   
	目的:  1. 防止可能存在的内存泄漏问题 ;   2. 一个事件的监听器过多, 则该事件可能会过多占用 CPU .
	调用 `emitter.setMaxListeners(0);` 可以将该限制去掉
* 为处理异常, EventEmitter 对象对 error 事件进行了特殊处理.    
	如果运行期间错误触发了 error 事件, EventEmitter 会检查是否给该事件添加了监听器. 如果添加了, 错误会直接交给监听器进行处理, 否则将会将该错误作为异常抛出.  此时如果外部没有捕获该异常, 将会导致线程退出.    
	一个健壮的 EventEmitter 应该对 error 事件做处理.

#### 4.3.1.1 继承 events 模块

Stream 对象继承 EventEmitter 的例子:
```
var events = require('events');

function Stream () {
	evnets.EventEmitter.call(this);
}
// Node 在 util 模块中封装了继承的方法, 方便调用
util.inherits(Stream, events.EventEmitter);
```
开发者可以利用这样的方式继承 EventsEmitter 类, 利用事件机制解决业务问题.   
Node 提供的核心模块中, 近半都继承自 EventEmitter.

#### 4.3.1.2 利用事件队列解决雪崩问题

订阅发布模式中有 `once()` 方法, 通过该方法添加的监听器只能被执行一次, 之后将从该事件上移除. 可以用于过滤重复性的事件响应, 以解决雪崩问题.

雪崩问题的一个典型场景 : 高访问量, 大并发下, 缓存失效的情景. 在 Node 中利用按事件排队的方式解决
```
var proxy = new events.EventEmitter();
// 状态锁
var status = "reday";
var select = function (callback) {
	proxy.once("selected", callback);
	if (status === "ready") {
		status = "pending";
		db.select("SQL", function(results) {
			proxy.emit("selected", results);
			status = "ready";
		});
	}
};
```
此处, 利用 `once()` 方法将所有请求的回调都压入事件队列中, 利用其只执行一次的特点, 保证每个任务仅被执行一次.  在一次查询结束之前新进来的查询请求, 都直接在该事件上监听, 当查询结束后, 结果将返回给所有在监听该查询事件的回调中. 相当于一次查询多次使用. 

`once()` 方法产生的效果也可以在著名的 Gearman 异步应用框架中实现. 但在 javascript 中, 实现该效果易如反掌.

#### 4.3.1.3 多异步之间的协作方案

一般情况下, 事件与监听器是一对多的关系, 但在异步编中, 也会出现多对一的情况:  


### 4.3.2 Promise / Deferred 模式

### 4.3.3 流程控制库





> Written with [StackEdit](https://stackedit.io/).