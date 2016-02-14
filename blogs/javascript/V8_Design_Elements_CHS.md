Design Elements (V8 设计元素)
=============

> Chunlin Li 翻译    
> 原文连接: [https://developers.google.com/v8/design](https://developers.google.com/v8/design)

JavaScript's integration with Netscape Navigator in the mid 1990s made it much easier for web developers to access HTML page elements such as forms, frames, and images. JavaScript quickly became popular for customizing controls and adding animation and by the late 1990s the vast majority of scripts simply swapped one image for another in response to user-generated mouse events.

More recently, following the arrival of AJAX, JavaScript has become a central technology for implementing web-based applications such as our very own GMail. JavaScript programs have grown from a few lines to several hundred kilobytes of source code. While JavaScript is very efficient in doing the things it was designed to do, performance has become a limiting factor to further development of web-based JavaScript applications.

V8 is a new JavaScript engine specifically designed for fast execution of large JavaScript applications. In several benchmark tests, V8 is many times faster than JScript (in Internet Explorer), SpiderMonkey (in Firefox), and JavaScriptCore (in Safari). If your web application is bound by JavaScript execution speed, using V8 instead of your current JavaScript engine is likely to improve your application's performance. How big the improvement is depends on how much JavaScript is executed and the nature of that JavaScript. For example, if the functions in your application tend to be run again and again, the performance improvement will be greater than if many different functions tend to run only once. The reason for this will become clearer as you read the rest of this document.

> 以上皆废话和吹牛逼, 就不翻译了....

There are three key areas to V8's performance:

* Fast Property Access
* Dynamic Machine Code Generation
* Efficient Garbage Collection

> V8 的性能主要得益于以下三个方面: 
> * 快速属性访问
> * 动态机器码生成
> * 高效垃圾回收

## Fast Property Access (快速属性访问)

JavaScript is a dynamic programming language: properties can be added to, and deleted from, objects on the fly. This means an object's properties are likely to change. Most JavaScript engines use a dictionary-like data structure as storage for object properties - each property access requires a dynamic lookup to resolve the property's location in memory. This approach makes accessing properties in JavaScript typically much slower than accessing instance variables in programming languages like Java and Smalltalk. In these languages, instance variables are located at fixed offsets determined by the compiler due to the fixed object layout defined by the object's class. Access is simply a matter of a memory load or store, often requiring only a single instruction.

> JS 是个动态编程语言, 支持动态的添加删除对象的属性. 这意味着对象的属性很可能会发生改变. 多数 JS 引擎使用类似字典的数据结构来存储对象的属性, 每次访问属性的时候都会动态查找并解析属性在内存中的地址. 这使得 JS 访问属性的速度比 Java 或 Smalltalk 这类语言要慢很多. 在这些静态语言中, 实例的变量都有一个在编译时就确定下来的固定偏移量, 因为其对象的结构是固定的, 所以一次访问操作无非是一次内存的 load 或 store 操作, 仅对应一条机器指令(不考虑复杂继承关系的情况下).

To reduce the time required to access JavaScript properties, V8 does not use dynamic lookup to access properties. Instead, V8 dynamically creates hidden classes behind the scenes. This basic idea is not new - the prototype-based programming language Self used maps to do something similar. (See for example, An Efficient Implementation of Self, a Dynamically-Typed Object-Oriented Language Based on Prototypes). In V8, an object changes its hidden class when a new property is added.

To clarify this, imagine a simple JavaScript function as follows:

> 为了优化 JS 访问属性的速度, V8 没有使用动态查找的方式, 而是通过创建隐藏类来优化这种场景的性能. 其基本思想并不新奇, 基于原型的编程语言 Self 早就用类似的方式实现过 map. 在 V8 中给对象实例添加一个新的属性, 其实只是改变了一个它内部的隐藏类.      
> 我们用下面这个 JS 函数来说明该原理: 

```javascript
function Point(x, y) {
  this.x = x;
  this.y = y;
}
```

When new Point(x, y) is executed a new Point object is created. When V8 does this for the first time, V8 creates an initial hidden class of Point, called C0 in this example. As the object does not yet have any properties defined the initial class is empty. At this stage the Point object's hidden class is C0.

> 当 `new Point(x, y)` 执行时将创建一个新的 Point 实例对象. 当 V8 首次这样做时会创建一个隐藏的初始化 Point 类(对应例子中的 C0), 当实例对象还没有任何属性被定义的时候,  初始化类是空的. 此时 Point 实例对象的隐藏类是 C0.

![01](https://developers.google.com/v8/images/map_trans_a.png)

Executing the first statement in `Point (this.x = x;)` creates a new property, x, in the Point object. In this case, V8:

* creates another hidden class C1, based on C0, then adds information to C1 that describes the object as having one property, x, the value of which is stored at offset 0 (zero) in the Point object.
* updates C0 with a class transition indicating that if a property x is added to an object described by C0 then the hidden class C1 should be used instead of C0. At this stage the Point object's hidden class is C1.

> 执行 Point 中的第一条语句 `this.x = x;` 将在 Point 实例对象上创建一个新属性 x, 但对于 V8 引擎来说是这样的: 
> * 基于 C0 创建另一个隐藏类 C1, 在 C1 上添加对应的属性信息 x, 而其值在 Point 对象内部的偏移量为 0.
> * 给 C0 添加类转换说明: 如果给一个由 C0 描述的实例添加属性 x, 则其对应的隐藏类将由 C0 改为 C1. 至此, Point 实例对象的隐藏类已经是 C1 了.

![02](https://developers.google.com/v8/images/map_trans_b.png)

Executing the second statement in `Point (this.y = y;)` creates a new property, y, in the Point object. In this case, V8:

* creates another hidden class C2, based on C1, then adds information to C2 that describes the object as also having property y stored at offset 1 (one) in the Point object.
* updates C1 with a class transition indicating that if a property y is added to an object described by C1 then the hidden class C2 should be used instead of C1. At this stage the Point object's hidden class is C2.

> 执行第二条语句 `this.y = y;` 在 Point 实例对象上创建一个新属性 y, V8 引擎的行为: 
> * 基于 C1, 创建另一个隐藏类 C2,  添加关于属性 y 的信息, 其值存储在 Point 对象内偏移量为 1 的位置.
> * 给 C1 添加类转换说明: 如果给一个由 C1 描述的实例对象添加属性 y, 则使用隐藏类 C2 替换他的隐藏类 C1, 至此, Point 对象的隐藏类改为 C2.

![03](https://developers.google.com/v8/images/map_trans_c.png)

It might seem inefficient to create a new hidden class whenever a property is added. However, because of the class transitions the hidden classes can be reused. The next time a new Point is created no new hidden classes are created, instead the new Point object shares the classes with the first Point object. For example, if another Point object is created:

* initially the Point object has no properties so the newly created object refers to the intial class C0.
* when property x is added, V8 follows the hidden class transition from C0 to C1 and writes the value of x at the offset specified by C1.
* when property y is added, V8 follows the hidden class transition from C1 to C2 and writes the value of y at the offset specified by C2.

Even though JavaScript is more dynamic than most object oriented languages, the runtime behavior of most JavaScript programs results in a high degree of structure-sharing using the above approach. There are two advantages to using hidden classes: property access does not require a dictionary lookup, and they enable V8 to use the classic class-based optimization, inline caching. For more on inline caching see Efficient Implementation of the Smalltalk-80 System.

> 似乎每次添加属性的时候都创建一个新的隐藏类没什么效率, 但由于类的装换, 隐藏类可以被复用, 下次创建新的 Point 实例时将不需要创建任何隐藏类, 因为他们可以共享这些隐藏类. 比如, 另外一个 Point 实例的创建: 
> * 初始的 Point 实例没有任何属性, 因此对应 C0.
> * 当添加属性 x 后, 其对应隐藏类从 C0 转为 C1 并将 x 的值写入对应的偏移位置.
> * 当添加属性 y 后, 其对应从 C1 转为 C2. 并将 y 写入相应位置.
> 尽管 JS 比其他面向对象语言更具有动态性, 但大多数 JS 程序的运行时行为决定了可以使用上述的方式实现高度的结构共享. 使用隐藏类有两个优势: 其一是属性的访问不再需要字典查找, 这使得 V8 可以使用一些经典的基于类的优化; 其二是内联缓存(更多信息需要[买论文](http://dl.acm.org/citation.cfm?id=800017.800542&preflayout=flat)).

## Dynamic Machine Code Generation (动态生成机器码)

V8 compiles JavaScript source code directly into machine code when it is first executed. There are no intermediate byte codes, no interpreter. Property access is handled by inline cache code that may be patched with other machine instructions as V8 executes.

During initial execution of the code for accessing a property of a given object, V8 determines the object's current hidden class. V8 optimizes property access by predicting that this class will also be used for all future objects accessed in the same section of code and uses the information in the class to patch the inline cache code to use the hidden class. If V8 has predicted correctly the property's value is assigned (or fetched) in a single operation. If the prediction is incorrect, V8 patches the code to remove the optimisation.

For example, the JavaScript code to access property x from a Point object is:

> V8 首次执行的时候会将 JS 源码直接编译成机器码, 没有中间代码, 没有解释器. 属性访问将以给机器码内联缓存打补丁的形式在执行过程中做优化处理.     
> 当首次访问一个对象的某个属性的时候, V8 判定其当前的隐藏类, 然后 V8 预测接下来当前这块代码中, 这类实例的访问都会使用该隐藏类, 因此会将此信息以补丁的方式插入到内联缓存中. 如果 V8 预测正确则对应属性的存取操作将在一条指令内完成. 如果预测失败, V8 将再次以补丁的方式将此内联优化删除. 
> 例如, 一下 JS 代码中访问 Point 实例的属性 x.

```javascript
point.x
```

In V8, the machine code generated for accessing x is:

```asm
# ebx = the point object
cmp [ebx,<hidden class offset>],<cached hidden class>
jne <inline cache miss>
mov eax,[ebx, <cached x offset>]
```

If the object's hidden class does not match the cached hidden class, execution jumps to the V8 runtime system that handles inline cache misses and patches the inline cache code. If there is a match, which is the common case, the value of the x property is simply retrieved.

When there are many objects with the same hidden class the same benefits are obtained as for most static languages. The combination of using hidden classes to access properties with inline caching and machine code generation optimises for cases where the same type of object is frequently created and accessed in a similar way. This greatly improves the speed at which most JavaScript code can be executed.

> 如果实例对象的隐藏类和缓存中不一致, 则转至 V8 处理内联缓存预测失败的运行时系统并修补内联缓存的代码. 如果匹配(通常情况), 将直接获得对应的 x 属性的值.   
> 当很多实例对象都具有同样的隐藏类时, 该优化所产生的效果使得 V8 的几乎达到多数静态语言的性能. 将上述隐藏类优化和机器码生成优化组合使用, 将极大改善绝大多数 JS 代码的执行速度.

## Efficient Garbage Collection (高效垃圾回收)

V8 reclaims memory used by objects that are no longer required in a process known as garbage collection. To ensure fast object allocation, short garbage collection pauses, and no memory fragmentation V8 employs a stop-the-world, generational, accurate, garbage collector. This means that V8:

* stops program execution when performing a garbage collection cycle.
* processes only part of the object heap in most garbage collection cycles. This minimizes the impact of stopping the application.
* always knows exactly where all objects and pointers are in memory. This avoids falsely identifying objects as pointers which can result in memory leaks.

In V8, the object heap is segmented into two parts: new space where objects are created, and old space to which objects surviving a garbage collection cycle are promoted. If an object is moved in a garbage collection cycle, V8 updates all pointers to the object.

> V8 垃圾回收会将已不再使用的对象所占用的内存释放出来. 为了保证更快的对象分配和更短的垃圾回收时造成的暂停以及避免产生内存碎片, V8 使用了一种分代的精确的垃圾回收器(会产生 stop-the-world). 这意味着: 
> * 当执行垃圾回收的时候, 程序的执行将会被暂停.
> * 多数情况下, 每次垃圾回收仅处理部分堆内存中的对象, 以将程序暂停的影响尽可能减小.
> * 无论何时都知道每个对象在内存中的准确位置, 这避免了错误的将对象视为指针, 这种错误会导致内存泄漏.
> 在 V8 中, 堆内存分为两个部分: 新生代和老年代. 新创建的对象被分配到新生代, 能在一次 GC 中存活下来的对象可以晋升到老年代. 如果 GC 过程中对象在堆内存中的位置发生了变化, 那么 V8 会更新所有指向该对象的指针.

Google 原文更新日期：九月 17, 2012

[V8 嵌入指南(中文)](https://github.com/Chunlin-Li/Chunlin-Li.github.io/blob/master/blogs/javascript/V8_Embedder's_Guide_CHS.md)
