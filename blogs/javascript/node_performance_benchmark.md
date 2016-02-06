
[Buffer vs Array](https://gist.github.com/Chunlin-Li/38d07ad2453c82c6e2f3)

[String concat vs Template literal](https://gist.github.com/Chunlin-Li/788d0f64fdf46ccca40c)

[String concatenate operator vs Array join](https://gist.github.com/Chunlin-Li/c49d6be2e9179cc26c95)

[Set vs Obejct and Map vs Object](https://gist.github.com/Chunlin-Li/788d0f64fdf46ccca40c)



-----------------------

* Buffer的读写效率: `对齐 约等于 不对齐`, 几乎没有差别(1%). 测试 DoubleBE.   
* 对字符串的`迭代操作效率 < 使用正则表达式`, 相差1倍左右. 
