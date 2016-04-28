
[Buffer vs Array](https://gist.github.com/Chunlin-Li/38d07ad2453c82c6e2f3)

[String concat vs Template literal](https://gist.github.com/Chunlin-Li/788d0f64fdf46ccca40c)

[String concatenate operator vs Array join](https://gist.github.com/Chunlin-Li/c49d6be2e9179cc26c95)

[Set vs Obejct and Map vs Object](https://gist.github.com/Chunlin-Li/788d0f64fdf46ccca40c)



-----------------------

* Buffer的读写效率: `对齐 约等于 不对齐`, 几乎没有差别(1%). 测试 DoubleBE.   
* 对字符串的`迭代操作效率 < 使用正则表达式`, 相差1倍左右. 

------------------------

谨慎使用 moment package, moment(STRING) 的方式解析时间可能会有巨大的性能开销.    
保险起见, 如果可以使用 Date() 代替的就不使用 moment.   
另外不要在循环或其他要大量反复执行的地方使用 moment() 解析时间字符串.

---------------------------

node 中 object 的拷贝操作, 使用 `let copy = Object.assign({}, srcObj)` 的方式    
比 `JSON.parse(JSON.stringify(srcObj))` 的方式效率高出约 20 倍.    
并且可以支持 Date 对象, undefined 等无法通过 JSON 传递的属性. 

---------------------------

array 的 `.filter()` 和 `.map()` 的操作中, 存在性能陷阱.   
如果可以通过其他方式避免使用 filter 和 map, 则尽量避免, 改用 `.forEach()` 或者直接 for 循环迭代         

原因: `.filter()` 和 `.map()` 中需要初始化累加数组, 以及对应的数组修改操作.  而 `.forEach()` 的实现实际
上依然是 for 循环, 多出的开销可能来自于需要对每个元素进行一次额外的函数调用. 因此 for 循环依然是最快的方式.
   
for 的性能是 filter 的 10倍左右 (全部返回 True), forEach 的性能是 filter 的 2倍多.

----------------------------

将一个字符串解码成 Buffer 的效率:  (i7 PC ubuntu 64bit)     
6000 长度日志字符传, New Buffer(str) 10000 次:   66ms            
300 长度日志字符传, New Buffer(str) 10000 次:   22ms

-----------------------------

#### JSON 字符串和 Object 相关

有时会遇到频繁处理 JSON 对象和字符串的转换, 但事实上某些情况下可以优化:    

场景如下:     
输入参数1 是一个 6KB 左右的 JSON 字符串; 输入参数2 是一个可大可小的 JSON 字符串;     
输出是给 JSON1 添加一个 Key/Value, Value 是 JSON2, 并序列化为字符串.

传统做法:

```javascript
j1 = JSON.parse(json1)
j2 = JSON.parse(json2)
j1['xxx'] = j2;
JSON.stringify(j1);
```

优化:  不使用 JSON.parse 和 stringify. 而直接操作字符串, `json1.replace(/}$/, json2)`    

测试显示性能提升为100多倍!.  其他更复杂的 字符串方式的 JSON 编辑方式抽空再研究研究.


**补充**  
实际工作中有时需要从一个可能很大的 JSON 字符串(KB 以上)中, 读取一两个字段用于判断, 比如 returnCode, error, writeOK 等. 而多数情况下不需要
解析完整的 JSON. 此时可以使用正则捕获的方式, 可以将效率提高近 100 倍.    
但是注意, 如果 JSON 中有重复的字段名, 则不能使用该方法, 除非根据上下文额外的符号可以区分.   

例: 用 `/"return":"(\w+)"/.exec(jsonString)[1]` 代替 `JSON.parse(jsonString).return` 

对于核心业务中的高频代码片段进行这样的优化还是能收到不错的效果的.

-----------------------------

测试 [node-murmurhash3](https://github.com/hideo55/node-murmurhash3) 和 [mumuhash-js](https://github.com/garycourt/murmurhash-js)    

前者使用 C++ 实现, 后者使用纯 js 实现. 

前者支持异步和同步两种 API, 后者只支持同步方式.

理论上来说, 我们预期 C++ 实现的会更快, 而其中, 异步接口会比同步的更快(这里指更快发出而不考虑返回). 

然而实测的情况却是: js 实现 1000 ms, C++ 同步实现 400ms, C++ 异步实现 4000ms.  结果非常意外.

看了下 C++ 的源码, 每次异步调用的时候都需要 new 一个 AsyncWorker 对象(用来封装异步操作), 而同步方法则直接调用 C++ 函数返回 hash 值. 可能速度是满在了这里.
 
------------------------------

获取当前时间的 unix time 毫秒时间, `Date.now()` 要比 `new Date().getTime()` 快一些, 但快的不多, 约 2-3 倍.

-----------------------------

除法后取整, 可以使用 `Math.floor(x/100)`, 也可以使用 `x/100 >> 0`, 性能一样.

-----------------------------

尽管 js 不擅长位操作, 但在必要的时候依然可以使用. 性能也不会太差.

对于 16bit 的 Int 型 x `x % 256` 与 `x & 0x00FF` 的性能几乎一样. 千万次运算的代价也只有 7ms 左右 (包括循环体本身)

而位运算和 `x = 0` 这种直接赋值的操作相比, 直觉上认为可能赋值会快很多, 但是实测时发现他们的差别不到一倍. 

当然也可能是对于这种更低级而又轻量的操作, 直接用 for 循环的方式无法准确测量. 或者 v8 对其有某种特殊优化也不得而知.

--------------------------

因为可能需要用到 setter getter 方法来给对象的某个属性加上 access hook. 想到了 `Object.defineProperty()` 方法.

之前也一直每怎么用过, 写了几个例子觉得用起来还算比较方便, 但是直觉告诉我这种方式会有性能损失, 只是不知道会有多大, 测试一下.

定义了一个类, 在 constructor 里面给属性加了 setter getter 方法, 测试代码就3句: 创建实例, 赋值, 取值. 对照组是最传统的方式.

各执行一百万次, 结果显示, 传统方式需要约 20ms, setter/getter 方式需要约 3500ms. 逼近200倍的差距. 

然后将实例的创建从循环中移出去, 再次测试, 传统方式 7ms, setter/getter 方式 250ms, 大约 40 倍. 分别测试 setter 或 getter 大约也是 30倍左右.


换个思路, 如果不使用 Object.defineProperty 的方式, 而是直接自己定义一个 setter getter 方法, 用显式调用的方式来处理呢

这种情况下, 同样执行一百万次. 创建+赋值+取值, 耗时约10倍; 赋值+取值, 耗时约5倍; 单赋值或取值, 也是大约5倍.
