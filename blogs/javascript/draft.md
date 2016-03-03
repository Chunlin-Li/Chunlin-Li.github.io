

## JavaScript 的继承

js 语言本身没有类的概念, 只能模拟出"类". 其继承基于原型(prototype)而不是其他面向对象语言中的类.

链式继承: 每个对象都有一个 prototype 属性, 该属性都指向该对象的"原型"或者说是"父类". 访问一个对象的属性,就是从该对象开始, 沿着该对象的继承链向上搜索的过程.

## JavaScript 正则表达式 

JavaScript 中的正则表达式借鉴自 Perl 语言.

JavaScript 中和正则相关的方法:

* regexp.exec
* regexp.test
* string.match
* string.replace
* string.search
* string.split

和直接使用 js 进行字符串操作相比, 正则表达式通常有更好的性能.

js 中构建正则表达式的方式有两种 : 

1. 直接使用正则表达式字面量. 不需要加单引号或双引号, 直接使用`/`符号包裹需要的正则, 并根据需要在之后加上 flag (i, g, m).
2. 以字符串的形式编写正则, 并将该字符串编译为 RegExp 对象. 这种方式中需要注意对用于转义的反斜杠再次进行转义. 其优点在于可以在运行时动态生成正则表达式.

-----------------------------

正则中的特殊符号 : `\ / [ ] ( ) { } ? + * | . ^ $`, 匹配对应的字符时需要在正则中对这些符号进行转义. 

标准转义符 : `\f \n \r \t \u0D3E` 

正则转义符 : `\b \B \d \D \s \S \w \W`

`\s` 代表 whitespace 字符, 包含 `\f \n \r \t \u000B \u0020 \u00A0 \u2028 \u2029`

`\w` 表示 Word, 包含数字字母和下划线

`\1` 表示引用当前正则匹配的第一个 group 的内容. 其他数字类似.


正则表达式的起止符号是 `/`  结束的 `/` 后还可以加 flag, 比如 `i` 表示忽略大小写.

`[abcd]` 表示字符类, 其中的几个特殊操作符:  `-` 表示范围 比如 a-z 表示从a到z的字符.  `^`表示不包含 ^abc 表示不包含 a, b, c

`(?:)`  对应括号中冒号后的内容, 只做分组而不进行捕获. 功能上可以起到类似于零宽断言的作用.       
在不需要进行捕获, 但需要用到分组的地方, 尽量使用非捕获分组, 因为性能上好于捕获分组

`?`  表示可选, 等价于 {0,1}.  正则因子的末尾的问号表示使用 **懒惰模式** 匹配

`()` 捕获分组, 执行后的捕获结果是 Array, 0元素是源字符串, 1元素是第一个分组, 依次类推

(?= 和 (?! 这类的断言表达式尽量不使用, 他们使得正则解析需要向前迂回, 性能较差.

--------------------------

正则表达式是一个非常容易出现安全问题的地方, 因此在关键代码中要尽可能编写严格的正则.   
比如显式的指定一个字符类可以包含哪些字符, 而不是仅指定不包含哪些字符.

实际工程中不要使用过长过复杂的正则表达式! 解析器之间对正则的实现可能有差异, 可能造成复杂的正则不兼容, 或者嵌套正则出现严重性能问题. 另外, 过于复杂的正则可读性和可维护性都非常低下.






## n 的安装

n 用于在不同的 node 版本之间切换. 

安装 n 之前, 首先已经有了一个版本的 node (origin). 在其之下安装 n, 

n 默认在 /usr/local/ 下会创建一个 n/version/node 文件夹, 其中是各个版本的 node.

使用 n 命令切换环境的时候, 会将 n/version/node 下对应版本目录下的 node 执行文件拷贝到 /usr/local/bin 目录下. 

需要给 n 合适的执行权限, 使其可以读写  /usr/local/n 目录. 

切换不同版本后, npm 依然以链接的方式链接到到 origin 版本的 npm. 


## JavaScript Nodejs  异常处理  错误处理


try catch 异常捕获:  特别需要注意的是,  try catch 只能捕获一个 tick 中的异常, 如果try 中调用的一个函数被异步执行, 则异步执行时抛出的异常, 无法被 Caller 的 try 所捕获. 这是一个非常重要的原则! 

使用 EventEmitter 时, event.emit(type) 将同步出发改事件上注册的所有 listener 回调函数, 因此, 此时回调中如果由异常, 将传递到调用 emit() 方法的位置.     
这种情况可以使用 setImmediat() 或 nexTick() 方法解决, 即将 event.emit(type) 语句放入到 setImmediat 或 nexTick 中执行. 

Promise 对于Promise 对象, 如果没有给定 reject 的函数, 则一旦执行中出现异常, 异常将被吞掉. 


----------------------

### 堆内存限制
Node js 中 Buffer 本身不占用堆内存, 但是每个Buffer对象都要消耗 100多B的堆内存, 因此, 单个进程中总 Buffer 的个数有个上限, 大概 1千万就块到头了.   其他的对象也是用样道理, 只是其他数据不会有太多的元数据.



### node 中无法捕获的异常

现象: 

```
 错误信息:  { [Error: read ECONNRESET] code: 'ECONNRESET', errno: 'ECONNRESET', syscall: 'read' }
 stack 信息: 
    at errnoException (....)
    at TCP.onread (....)
 代码的具体位置不同版本之间会有差异.
```

我们可能遇到的是这种出错的一种情况, 需要满足条件:
* 版本 4.0.0 - 4.3.1 以及对应的　5.x 的版本。　0.x 的版本没有测试.
* 使用内建 http 模块发送请求, 并且使用带 keep-alive 的 agent. `var agent = new http.Agent({keepAlive: true})`
* 在请求量较大的情况下, 不时出现上述的错误信息, 并且无法通过给 clientRequest, IncomingMessage 等 API 提供的结构捕获或监听到这些异常.

结论: 通过排查测试和参考 github 上的相关讨论最终找到问题: nodejs 对于 agent 中 keep alive 的 TCP 链接池管理上有 Bug,     
 在某些存在竞态的地方可能会造成 socket 上没有 error 的 listener, 当 socket 被远端断开的时候, 本地无法正常处理该异常音系, 导致进程 crash.    
 因此, 可以使用如下方式监听该 error 事件: 
```
var agent = new http.Agent({keepAlive: true});
agent.on('free', function(socket) {
    socket.on('error', function(err) {
        // do something .... 
    })
})
```
这样就可以保证所有的 socket 的错误事件都可以被正常捕获并处理了.


在对该问题的排查中, 涉及到一些之前不了解的知识和技能: 

1. 目前版本 (4.3.1) http.globalAgent 中的 keep Alive 是默认关闭的. 如果请求没有指定 agent ,则默认使用 globalAgent.
2. http 相应的 response 中, 如果不监听 'data' 和 'end' 事件, 该 http 请求无法正常完成并 free 连接, 会导致后续针对同一个 Socket 
    的 http 请求无法重用 agent 中的连接.  // TODO: 需要找出原因
3. 正常 http 通信的数据交换是接收方读 Socket 的数据, 而 TCP 连接上的异常状态则是通过触发 TCP.onread 来处理的. Exxxxx 的错误码是来自于
    libuv 中的 err_name 定义.
4. http 的 clientRequest 是继承了 net 中的 Socket. 但是 http 的 Server 并不继承或组合 Socket, 而是由 TCP handle 来处理三层的工作.
5. NODE_DEBUG 环境变量
6. tcpkill 工具