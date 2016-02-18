
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
