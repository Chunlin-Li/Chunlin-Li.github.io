
Node Express Server 开发笔记
------------------

[TOC]


### 在 WebStome 中使用 Mocha 进行测试

首先全局安装 mocha 
```
npm install -g mocha
```

在项目中创建 `test` 目录, 所有测试代码都放在其中. 

在 `run` --> `configuration` 中新建一个 `Mocha` 的配置,   `Mocha Package` 配置为 Mocha 的模块所在路径(全局, 或者是项目中的),  `Test Directory` 设置为项目的 test 目录. 然后就可以在 Run 或者 Debug 中执行或调试该配置了. 

#### Mocha 测试

可以配置不同的接口 ([User Interface](http://mochajs.org/#interfaces)), 默认是 BDD 接口, 其他常见的如 TDD, Exports 等   
不同的接口会有不同的代码关键字和组织风格.

beforeEach() 无论放在那个 js 文件中, 都将在全部测试开始执行前执行.





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

#### req

请求对象, IncommingMessage.   
`originalUrl` : 访问 URL 从 Host(包括Port) 之后开始, 包括'/'符号  
`query` : 由 bodyParser.urlencoded 中间件解析出的 queryString, object 形式  
`body` : 由 bodyParser.json 中间件解析出的请求体. json 转为 object 形式  
`headers` : object 形式, 所有的 Header  
`method` : 请求方法. post, get 等, 大写  


#### res

响应对象, ServerResponse.  
`send()` : [4.0 API send](http://expressjs.com/4x/api.html#res.send)  
`end()` : [4.0 API end](http://expressjs.com/4x/api.html#res.end)  
`status()` : [4.0 API status](http://expressjs.com/4x/api.html#res.status)  


#### Error

`message` : 错误消息   
`stack` : 调用栈  
`name` : 错误名称, Error 类型  

> Written with [StackEdit](https://stackedit.io/).