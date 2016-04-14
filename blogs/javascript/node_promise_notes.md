


#### then 

在 then 中的代码, 如果最后 return 了一个普通的 value. 则其后的下一个 then 将会接收到这个值. 因此如果 return 了 null, 或者 undefined, 则下一个 then 将没有有效参数传递进去.

如果 return 一个 Promise 对象, 则这个

* return Promise : 将该 promise 的 resolve 值传递到下一个 then 中, 或者将该 promise 的 reject 值传递到 catch 中.
* return value : 将 value 传递到下一个 then 中. (包括各种假值)
* return Error : 将 Error 对象传递给下一个 then. 无法进入 catch.
* throw value/Error : 跳过后面的 then, 直接将值传递到 catch 
* return thenable : 效果和 return 一个 promise 一样. 

在纯同步代码中, 可以认为 resolve 就是 return 的等价物, 而 reject 就是 throw 的等价物. 对于其后跟的是什么值没有关系.
但异步代码中就只能使用 resolve 和 reject 来处理了.

##### thenable 

一个普通对象, 其中具有一个 then 方法, 该 then 方法其实就相当于构造 Promise 的时候传入的 executor 函数.
`then(resolve, reject) { ... ... }`. 

在 promise 的链式 .then() 中, return 一个 `Promise.resolve(thenable)` 就相当于是创建了一个新的 promise, 其 resolve 与否取决于其中的 thenable 是否能够 resolve. 创建的该 promise 与原有 promise 关联, 最后将这个新的 Promise 链的尾端 resolve 或 reject 的结果传递到原有 Promise 链中的下一个 then 中里.

thenable 中可以使用 throw 代替 reject, 但是不能使用 return 代替 resolve.


#### Exception: 

Promise 的 Executor 中如果发生没有 try catch 的异常, 不会从 Promise 中直接 throw 出来. 而是会自动触发 reject. 但是注意如果executor 里面有异步代码, 比如 setTimeout 或者 readFile 等, 在其异步的回调中出现了异常, 则依然会被直接 throw 出来, 不会被 Promise 捕获到.
then 的回调函数也是一样.

因此, 对于 Promise 中的同步代码, 不需要再用 try catch 捕获异常, 而异步代码中, 通常会通过 callback 或者 promise 的方式将其内部的错误传递出来, 然后直接将其再传入 reject 即可. 最终达到简化异常处理的目的. 

.catch 中的错误处理 

* .catch 之前的 then 中的同步代码如果有异常抛出(不包括 return Error 的情况), 或者有 Promise.reject(), 则会将 reject 值或者 throw 出来的异常(其实普通值也可以 throw) 传递到最近的 catch 中
* .catch 中如果 return, 无论是 value 还是 error, 都会继续向下一个 then 中传递.
* .catch 中如果 throw, 无论是 value 还是 error, 都将直接向下一个 catch 传递.
* .catch 后面如果再没有 catch 了, 那么在当前 catch 中出现的异常, 或 throw 异常或值, 都不会从 Promise 中抛出来, 而该 Promise 的状态将转为 rejected, 只有通过再次给该 Promise 添加 .catch 才能取得异常.


#### 实现

blurbird 公认性能最好. 
v8 native 的 promise 实现性能比较差(处理效率和内存占用都不好, 实测为 bluebird 的 2-3倍), 而且可能会有一些Bug, 比如以下代码会导致内存泄漏, 但 bluebird 不会.
```
var i = 0;
(function next() {
    return new Promise(function (resolve) {
        i++;
        if (i % 100000 === 0) {
            console.log(process.memoryUsage());
        }
        setImmediate(resolve)
    }).then(next);
})();
```
