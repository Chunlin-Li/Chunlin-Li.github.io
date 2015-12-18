
Node Express Server 开发笔记
------------------

[TOC]



### Express 框架的微调

使用 WebStrome 创建新的 Express 工程, 使用 [express-generator](https://github.com/expressjs/generator) 自动生成 Express 模板.   

不需要输出页面等静态资源, 直接将 public 和 views 目录删除. 

默认的几个页面: Hello 页面, User 页面, 错误输出页面都使用了**默认静态资源**, 将他们去掉, 或者直接改成无需渲染的方式.  

app.js 中加入的**默认中间件**有一些没有必要. 比如 server-favicon, cookie-parser. 如果使用 [Winston](https://github.com/winstonjs/winston) 自己做 log, 就可以不要 morgan 了.  static 资源也没有, 不需要加中间件. 中间件尽可能不要有无用的挂在上面.

添加自己的中间件, 处理请求的解码, 以及响应的编码, 错误信息返回等全局通用的工作.

业务中需要进行**资源的初始化**, 比如建立数据库链接, 初始化缓存信息等, 将这些工作放在**建立端口监听之前**. 在所有初始化完成的回调中建立监听, 开始对外服务. 

对于初始化的链接, 比如 redis, 如果无法连通, 在建立初始建立链接的时候不会有报错, 需要在链接后进行一个操作**验证有效性**, 可以使用 setTimeout() 进行超时设置, 链接成功则将其 clear 掉, 如果失败则 process.exit()

启动时, 成功建立端口监听后, 需要同时注册**系统 Signal 的事件**, 比如 `SIGTERM` 和 `SIGINT`, 在其中进行资源安全的关闭, 等待已有请求处理结束等工作.

工程的启动可以通过 Shell 脚本进行, 包括工作目录的清理, npm install, 将之前旧进程 kill 掉, 设置启动时所需的环境变量. Node 的很多配置是通过 Linux 环境变量进行设置的. 

### 在 WebStome 中使用 [Mocha](http://mochajs.org/) 进行测试

首先全局安装 mocha 
```
npm install -g mocha
```

在项目中创建 `test` 目录, 所有测试代码都放在其中. 

在 `run` --> `configuration` 中新建一个 `Mocha` 的配置,   `Mocha Package` 配置为 Mocha 的模块所在路径(全局, 或者是项目中的),  `Test Directory` 设置为项目的 test 目录. 然后就可以在 Run 或者 Debug 中执行或调试该配置了. 

**_Mocha 测试_**

可以配置不同的接口 ([User Interface](http://mochajs.org/#interfaces)), 默认是 BDD 接口, 其他常见的如 TDD, Exports 等   
不同的接口会有不同的代码关键字和组织风格.

beforeEach() 无论放在那个 js 文件中, 都将在全部测试开始执行前执行.


### 使用 [async](https://github.com/caolan/async) 进行 flow control

有时 js 的回调和异步机制会让有些原本很简单的事情变的很抽象, 不易理解和处理. 

虽说有人测试 async 的性能没有 bludbird 等 Promise 好, 但是毕竟稳定好用.

[`async.series()`](https://github.com/caolan/async#seriestasks-callback) : 解决多个 function 顺序执行, 但相互之间没有数据依赖的情况. 

[`async.waterfall()`](https://github.com/caolan/async#waterfall) : 和上面类似, 不过各函数可以瀑布式从前到后传递数据. 解决依赖性的问题.

[`async.parallel()`](https://github.com/caolan/async#parallel) : 适用于多个没有相互依赖的 Function 并发执行, 并完成最终的数据汇聚.

[`async.each()`](https://github.com/caolan/async#each) : 适用于对 List/Array 中的各个数据进行并行处理.


### 使用 [es6-promise](https://github.com/jakearchibald/es6-promise)

开发中使用到 [MongoDB 的 Node Native Driver](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findOne), 其支持 Promise , 如果没有在初始化的配置中指定 promise libary, 则默认使用 `es6-promise` 库.   
node mongodb driver source code :
```
  // No promise library selected fall back
  if(!promiseLibrary) {
    promiseLibrary = typeof global.Promise == 'function' ?
      global.Promise : require('es6-promise').Promise;
  }
```

[es6-promise](https://github.com/jakearchibald/es6-promise) 是一种按照 ES6 标准实现的 Promise 库, 标准 Promise 的 API 可以查看 [参考链接](https://www.promisejs.org/api/).

常用的有以下用法:

```js
Promise.then(function (arg) {
	// do something
	throw Error('Error message');
}).catch(function (err) {
	console.log(err.message);
	// handle error
})
```

需要注意区分 [ES6 Promise 标准 API 中](https://www.promisejs.org/api/) 的Promise Method 和 Promise.prototype Method.    
使用中发现, 对于没有显式声明为 Promise 的情况下, 只有 prototype 的方法才生效. (有待确认...)


### 常用对象

**_req_**

请求对象, IncommingMessage.   
`originalUrl` : 访问 URL 从 Host(包括Port) 之后开始, 包括'/'符号  
`query` : 由 bodyParser.urlencoded 中间件解析出的 queryString, object 形式  
`body` : 由 bodyParser.json 中间件解析出的请求体. json 转为 object 形式  
`headers` : object 形式, 所有的 Header  
`method` : 请求方法. post, get 等, 大写  


**_res_**

响应对象, ServerResponse.  
`send()` : [4.0 API send](http://expressjs.com/4x/api.html#res.send)  
`end()` : [4.0 API end](http://expressjs.com/4x/api.html#res.end)  
`status()` : [4.0 API status](http://expressjs.com/4x/api.html#res.status)  


**_Error_**

`message` : 错误消息   
`stack` : 调用栈  
`name` : 错误名称, Error 类型  





> Written with [StackEdit](https://stackedit.io/).