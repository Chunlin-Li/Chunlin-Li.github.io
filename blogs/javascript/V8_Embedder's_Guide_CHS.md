Embedder's Guide (V8 嵌入指南)
==================

> Chunlin Li 译   
> 原文链接 : [https://developers.google.com/v8/embed](https://developers.google.com/v8/embed)


If you've read the Getting Started guide you will already be familiar with using V8 as a standalone virtual machine and with some key V8 concepts such as handles, scopes, and contexts. This document discusses these concepts further and introduces others that are key to embedding V8 within your own C++ application.

The V8 API provides functions for compiling and executing scripts, accessing C++ methods and data structures, handling errors, and enabling security checks. Your application can use V8 just like any other C++ library. Your C++ code accesses V8 through the V8 API by including the header include/v8.h.

The V8 Design Elements document provides background you may find useful when optimizing your application for V8.

> 如果你已经阅读了入门指南, 一定知道 V8 是一个独立运行的虚拟机, 其中有些关键性概念比如: handles, scopes 和 contexts. 本文将深入讨论这些概念, 并且引入一些其他对于将 c++ 程序嵌入到 V8 中非常重要的信息.   
> V8 API 为编译和执行JS脚本, 访问 C++ 方法和数据结构, 错误处理, 开启安全检查等提供了函数接口. 你的 C++ 应用可以像使用其他 C++ 库一样使用 V8, 只需要在你的代码中 include V8 头文件(include/v8.h).   
> 如果你需要优化你的V8应用, _"V8 设计元素"_一文将会为你提供一些有用的背景知识.


## Audience (读者)

This document is intended for C++ programmers who want to embed the V8 JavaScript engine within a C++ application. It will help you to make your own application's C++ objects and methods available to JavaScript, and to make JavaScript objects and functions available to your C++ application.

> 本文是为那些想要将 V8 Javascript 引擎嵌入到 C++ 程序中的工程师而撰写. 它将帮你搭建 C++ 程序的对象和方法与 JavaScript 对象和函数之间的桥梁.

## Handles and Garbage Collection (Handle 与 GC 垃圾回收)

A handle provides a reference to a JavaScript object's location in the heap. The V8 garbage collector reclaims memory used by objects that can no longer again be accessed. During the garbage collection process the garbage collector often moves objects to different locations in the heap. When the garbage collector moves an object the garbage collector also updates all handles that refer to the object with the object's new location.

> Handle 提供了一个JS 对象在堆内存中的地址的引用. V8 垃圾回收器将回收一个已无法被访问到的对象占用的堆内存空间. 垃圾回收过程中, 回收器通常会将对象在堆内存中进行移动. 当回收器移动对象的同时, 也会将所有相应的 Handle 更新为新的地址.

An object is considered garbage if it is inaccessible from JavaScript and there are no handles that refer to it. From time to time the garbage collector removes all objects considered to be garbage. V8's garbage collection mechanism is key to V8's performance. To learn more about it see V8 Design Elements.

> 当一个对象在 JavaScript 中无法被访问到, 并且也没有任何 Handle 引用它, 则这个对象将被当作 "垃圾" 对待. 回收器将不断将所有判定为 "垃圾" 的对象从堆内存中移除. V8 的垃圾回收机制是其性能的关键所在. 更多相关信息见 _"V8 设计元素"_ 一文.

There are several types of handles:

* Local handles are held on a stack and are deleted when the appropriate destructor is called. These handles' lifetime is determined by a handle scope, which is often created at the beginning of a function call. When the handle scope is deleted, the garbage collector is free to deallocate those objects previously referenced by handles in the handle scope, provided they are no longer accessible from JavaScript or other handles. This type of handle is used in the example in Getting Started. 

 Local handles have the class `Local<SomeType>`.

 _**Note**: The handle stack is not part of the C++ call stack, but the handle scopes are embedded in the C++ stack. Handle scopes can only be stack-allocated, not allocated with new._

 > Local Handles 保存在一个栈结构中, 当栈的析构函数(destructor)被调用时将同时被销毁. 这些 handle 的生命周期取决于 handle scope (当一个函数被调用的时候, 对应的 handle scope 将被创建). 当一个 handle scope 被销毁时, 如果在它当中的 handle 所引用的对象已无法再被 JavaScript 访问, 或者没有其他的 handle 指向它, 那么这些对象都将在 scope 的销毁过程中被垃圾回收器回收. 入门指南中的例子使用的就是这种 Handle.   
 >    
 > Local handle 对应的类是 `Local<SomeType>`    
 >      
 > _**注意** : Handle 栈并不是 C++ 调用栈的一部分, 不过 handle scope 是被嵌入到C++栈中的. Handle scope只支持栈分配, 而不能使用 `new` 进行堆分配._

* Persistent handles provide a reference to a heap-allocated JavaScript Object, just like a local handle. There are two flavors, which differ in the lifetime management of the reference they handle. Use a persistent handle when you need to keep a reference to an object for more than one function call, or when handle lifetimes do not correspond to C++ scopes. Google Chrome, for example, uses persistent handles to refer to Document Object Model (DOM) nodes. A persistent handle can be made weak, using `PersistentBase::SetWeak`, to trigger a callback from the garbage collector when the only references to an object are from weak persistent handles.
 * A `UniquePersistent<SomeType>` handle relies on C++ constructors and destructors to manage the lifetime of the underlying object.
 * A `Persistent<SomeType>` can be constructed with its constructor, but must be explicitly cleared with `Persistent::Reset`

 > Persistent handle 是一个堆内存上分配的 JavaScript 对象的引用, 这点和 local handle 一样. 但它有两个自己的特点, 是对于它们所关联的引用的生命周期管理方面. 当你 希望 持有一个对象的引用, 并且超出该函数调用的时期或范围时, 或者是该引用的生命周期与 C++ 的作用域不一致时, 就需要使用 persistent handle 了. 例如 Google Chrome 就是使用 persistent handle 引用 DOM 节点. Persistent handle 支持弱引用, 即 `PersistentBase::SetWeak`, 它可以在其引用的对象只剩下弱引用的时候, 由垃圾回收器出发一个回调.    
 > * 一个 `UniquePersistent<SomeType>` 依赖 C++ 的构造函数和析构函数来管理其引用的对象的生命周期.    
 > * 当使用构造函数创建一个 `Persistent<SomeType>` 后, 必须在使用完后显式调用 `Persistent::Reset`.    

* There are other types of handles which are rarely used, that we will only briefly mention here:
 * `Eternal` is a persistent handle for JavaScript objects that are expected to never be deleted. It is cheaper to use because it relieves the garbage collector from determining the liveness of that object.
 * Both Persistent and UniquePersistent cannot be copied, which makes them unsuitable as values with pre-C++11 standard library containers. PersistentValueMap and PersistentValueVector provide container classes for persistent values, with map and vector-like semantics. C++11 embedders do not require these, since C++11 move semantics solve the underlying problem.

 > 还有其他类型的 handle, 但是很少用到, 这里只简单提一下:    
 > * `Eternal` 是一个用于预期永远不会被释放的 JavaScript 对象的 persistent handle, 使用它的代价更小, 因为它减轻了垃圾回收器判定对象是否存活的负担.    
 > * Persistent 和 UniquePersistent 都无法被拷贝, 使得它无法成为 C++11 之前的标准库容器的值. PersistentValueMap 和 PersistentValueVector 为 persistent 值提供了容器类,  并且带有 Map 或类 Vector 的语义. C++11 的开发者不需要他们, 因 C++11 改变了语义, 解决了潜在的问题.

Of course, creating a local handle every time you create an object can result in a lot of handles! This is where handle scopes are very useful. You can think of a handle scope as a container that holds lots of handles. When the handle scope's destructor is called all handles created within that scope are removed from the stack. As you would expect, this results in the objects to which the handles point being eligible for deletion from the heap by the garbage collector.

Returning to our very simple example, described in Getting Started, in the following diagram you can see the handle-stack and heap-allocated objects. Note that `Context::New()` returns a Local handle, and we create a new Persistent handle based on it to demonstrate the usage of Persistent handles.

> 当然, 每次创建对象的时候, 都创建一个相应的 local handle 会产生大量的 handle. 此时, handle scope 就派上用处了. 你可以将 handle scope 看作是存有许多 handle 的容器. 当 handle scope 销毁时, 其中的所有 handle 也随即销毁, 这样, 这些 handle 所引用的对象就能够在下一次垃圾回收的时候被恰当的处理了.    
> 回到我们在入门指南中的简单示例上 , 在下面这张图表中你可以看到 handle-stack 和在堆内存上分配的对象. 注意, `Context::New()` 将返回一个 Local handle, 基于它, 我们创建了一个新的 Persistent handle 来演示 Persistent handle 的用法.    

![local_persist_handles_review](https://developers.google.com/v8/images/local_persist_handles_review.png)

When the destructor, `HandleScope::~HandleScope`, is called the handle scope is deleted. Objects referred to by handles within the deleted handle scope are eligible for removal in the next garbage collection if there are no other references to them. The garbage collector can also remove the source_obj, and script_obj objects from the heap as they are no longer referenced by any handles or otherwise reachable from JavaScript. Since the context handle is a persistent handle, it is not removed when the handle scope is exited.  The only way to remove the context handle is to explicitly call Reset on it.

_**Note**: Throughout this document the term handle refers to a local handle, when discussing a persistent handle that term is used in full._

> 当析构函数 `HandleScope::~HandleScope` 被调用时, handle scope 被删除, 其中的 handle 所引用的对象将在下次 GC 的时候被适当的处理. 垃圾回收器会移除 source\_obj 和 script\_obj 对象, 因为他们已经不再被任何 handle 引用, 并且在 JS 代码中也无法访问到他们. 而 context handle 即使在离开 handle scope 后也并不会被移除, 因为它是 persistent handle, 只能通过对它显式调用 Reset 才能将其移除.    
> _**注意** : 整篇文档中的名词 handle 都表示 local handle, 如果要表示 persistent handle 会使用全称._

It is important to be aware of one common pitfall with this model: you cannot return a local handle directly from a function that declares a handle scope. If you do the local handle you're trying to return will end up being deleted by the handle scope's destructor immediately before the function returns. The proper way to return a local handle is construct an EscapableHandleScope instead of a HandleScope and to call the Escape method on the handle scope, passing in the handle whose value you want to return. Here's an example of how that works in practice:

```
// This function returns a new array with three elements, x, y, and z.
// 该函数返回一个新数组, 其中包含 x, y, z 三个元素
Local<Array> NewPointArray(int x, int y, int z) {
  v8::Isolate* isolate = v8::Isolate::GetCurrent();

  // We will be creating temporary handles so we use a handle scope.
  // 我们稍后需要创建一个临时 handle, 因此我们需要使用 handle scope.
  EscapableHandleScope handle_scope(isolate);

  // Create a new empty array.
  // 创建一个新的空数组.
  Local<Array> array = Array::New(isolate, 3);

  // Return an empty result if there was an error creating the array.
  // 如果创建数组失败, 返回空.
  if (array.IsEmpty())
    return Local<Array>();

  // Fill out the values
  // 填充值
  array->Set(0, Integer::New(isolate, x));
  array->Set(1, Integer::New(isolate, y));
  array->Set(2, Integer::New(isolate, z));

  // Return the value through Escape.
  // 通过 Escape 返回数组
  return handle_scope.Escape(array);
}
```

The Escape method copies the value of its argument into the enclosing scope, deletes all its local handles, and then gives back the new handle copy which can safely be returned.

> 在这里要注意这个模型的一个陷阱: 你无法从一个在 handle scope 中声明的函数中返回一个 local hanle. 如果你这么做了, 那么这个 local handle 将在返回前, 首先在 handle scope 的析构函数被调用时被删除. 返回一个 local handle 的正确方法应该是构建一个 `EscapableHandleScope` 而不是 `HandleScope`, 并调用其 `Escape()` 方法, 将你想要返回的 handle 传递给它. 以下是一个实践中的例子:      
>       
>  Escape 方法将其参数的值拷贝到一个封闭作用域中, 然后照常删除所有 Local handle, 然后将一个含有指定值的新的 handle 送回给调用方.

## Contexts (上下文)

In V8, a context is an execution environment that allows separate, unrelated, JavaScript applications to run in a single instance of V8. You must explicitly specify the context in which you want any JavaScript code to be run.

Why is this necessary? Because JavaScript provides a set of built-in utility functions and objects that can be changed by JavaScript code. For example, if two entirely unrelated JavaScript functions both changed the global object in the same way then unexpected results are fairly likely to happen. 

> 在 V8 中, 一个 context 就是一个执行环境, 它使得可以在一个 V8 实例中运行相互隔离且无关的 JavaScript 代码. 你必须为你将要执行的 JavaScript 代码显式的指定一个 context.    
> 之所以这样是因为 JavaScript 提供了一些内建的工具函数和对象, 他们可以被 JS 代码所修改. 比如, 如果两个完全无关的 JS 函数都在用同样的方式修改一个 global 对象, 很可能就会出现一个意外的结果.

In terms of CPU time and memory, it might seem an expensive operation to create a new execution context given the number of built-in objects that must be built. However, V8's extensive caching ensures that, while the first context you create is somewhat expensive, subsequent contexts are much cheaper. This is because the first context needs to create the built-in objects and parse the built-in JavaScript code while subsequent contexts only have to create the built-in objects for their context. With the V8 snapshot feature (activated with build option snapshot=yes, which is the default) the time spent creating the first context will be highly optimized as a snapshot includes a serialized heap which contains already compiled code for the built-in JavaScript code. Along with garbage collection, V8's extensive caching is also key to V8's performance, for more information see V8 Design Elements.

> 如果要为所有必须的内建对象创建一个新的执行上下文(context), 在 CPU 时间和内存方面的开销可能会比较大. 然而, V8 的大量缓存可以对其优化, 你创建的第一个 context 可能相对比较耗时, 而接下来的 context 就快捷很多. 这是因为第一个 context 需要创建内建对象并解析内建的 JavaScript 代码. 而后续的 context 只需要为它自己创建内建对象即可, 而不用再解析 JS 代码了.  伴随 V8 的快照 (snapshot) 特性 (通过 build 选项 snapshot=yes 开启, 默认打开), 首次创建 context 的时间将会得到大量优化, 因为快照包含了一个序列化的堆, 其中包含了已解析编译过的内建 JavaScript 代码. 随着垃圾回收, V8 大量的缓存也是其高性能的关键因素, 更多信息请参阅 _"V8 设计元素"_一文.

When you have created a context you can enter and exit it any number of times. While you are in context A you can also enter a different context, B, which means that you replace A as the current context with B. When you exit B then A is restored as the current context. This is illustrated below:

![enter image description here](https://developers.google.com/v8/images/intro_contexts.png)

Note that the built-in utility functions and objects of each context are kept separate. You can optionally set a security token when you create a context. See the Security Model section for more information.

The motivation for using contexts in V8 was so that each window and iframe in a browser can have its own fresh JavaScript environment.

> 当你创建一个 context 后, 你可以进出此上下文任意多的次数. 当你在 context A 中时, 还可以再进入 context B. 此时你将进入 B 的上下文中. 当退出 B 时, A 又将成为你的当前 context. 正如下图所展示的那样.      
>       
>  注意, 每个 context 中的内建函数和对象是相互隔离的. 你也可以在创建一个 context 的时候设置一个安全令牌. 更多信息请参阅安全模型一节.     
>  在 V8 中使用 context 的动机是, 浏览器中的每个 window 和 iframe 可以拥有一个属于自己的干净的执行环境.   

## Templates (模板)

A template is a blueprint for JavaScript functions and objects in a context. You can use a template to wrap C++ functions and data structures within JavaScript objects so that they can be manipulated by JavaScript scripts. For example, Google Chrome uses templates to wrap C++ DOM nodes as JavaScript objects and to install functions in the global namespace. You can create a set of templates and then use the same ones for every new context you make. You can have as many templates as you require. However you can only have one instance of any template in any given context.

> 在一个 context 中, template 是 JavaScript 函数和对象的一个模型. 你可以使用 template 来将 C++ 函数和数据结构封装在一个 JavaScript 对象中, 这样它就可以被 JS 代码操作. 例如, Chrome 使用 template 将 C++ DOM 节点封装成 JS 对象, 并且将函数安装在 global 命名空间中. 你可以创建一个 template 集合, 在每个创建的 context 中你都可以重复使用它们. 你可以按照你的需求, 创建任意多的 template. 然而在任意一个 context 中, 任意 template 都只能拥有一个实例.

In JavaScript there is a strong duality between functions and objects. To create a new type of object in Java or C++ you would typically define a new class. In JavaScript you create a new function instead, and create instances using the function as a constructor. The layout and functionality of a JavaScript object is closely tied to the function that constructed it. This is reflected in the way V8 templates work. There are two types of templates:

> 在 JS 中, 函数和对象之间有很强的二元性. 在 C++ 或 Java 中创建一种新的对象类型通常要定义一个类. 而在 JS 中你却要创建一个函数, 并以函数为构造器生成对象实例. JS 对象的内部结构和功能很大程度上是由构造它的函数决定的. 这些也反映在 V8 的 template 的设计中, 因此 V8 有两种类型的 template: 

* Function templates
A function template is the blueprint for a single function. You create a JavaScript instance of the template by calling the template's `GetFunction` method from within the context in which you wish to instantiate the JavaScript function. You can also associate a C++ callback with a function template which is called when the JavaScript function instance is invoked.


* Object templates 
Each function template has an associated object template. This is used to configure objects created with this function as their constructor. You can associate two types of C++ callbacks with object templates:
 * accessor callbacks are invoked when a specific object property is accessed by a script
 * interceptor callbacks are invoked when any object property is accessed by a script 

 Accessors and interceptors are discussed later in this document.

> * `FunctionTemplate`     
> 一个 Function Template 就是一个 JS 函数的模型. 我们可以在我们指定的 context 下通过调用 template 的 `GetFunction` 方法来创建一个 JS 函数的实例. 你也可以将一个 C++ 回调与一个当 JS 函数实例执行时被调用的 function template 关联起来.    
>      
> * `ObjectTemplate`    
> 每一个 Function Template 都与一个 Object Template 相关联. 它用来配置以该函数作为构造器而创建的对象. 你也可以给这个 Object Template 关联两类 C++ 回调:     
>  * 存取器回调. 当指定的对象属性被 JS 访问时调用.    
>  * 拦截器回调. 当任意对象属性被访问时调用.    
>       
>  存取器和拦截器将在后面的部分讲到.     

The following code provides an example of creating a template for the global object and setting the built-in global functions.

```
// Create a template for the global object and set the
// built-in global functions.
// 为 global 对象创建一个 template 并设置内建全局函数
Local<ObjectTemplate> global = ObjectTemplate::New(isolate);
global->Set(String::NewFromUtf8(isolate, "log"), FunctionTemplate::New(isolate, LogCallback));

// Each processor gets its own context so different processors
// do not affect each other.
// 每个任务都有属于自己的 context, 所以不同的任务相互之间不影响.
Persistent<Context> context = Context::New(isolate, NULL, global);
```

This example code is taken from JsHttpProcessor::Initializer in the process.cc sample.

> 以下代码提供了一个 为 global 对象创建 tamplate 并设置内建全局函数的例子.   
>     
>  示例代码是 process.cc 中 `JsHttpProcessor::Initializer` 的片段.  


## Accessors (存取器)

An accessor is a C++ callback that calculates and returns a value when an object property is accessed by a JavaScript script. Accessors are configured through an object template, using the `SetAccessor` method. This method takes the name of the property with which it is associated and two callbacks to run when a script attempts to read or write the property.

The complexity of an accessor depends upon the type of data you are manipulating:

* Accessing Static Global Variables
* Accessing Dynamic Variables

> 存取器是一个当对象属性被 JS 代码访问的时候计算并返回一个值的 C++ 回调. 存取器是通过 Object Template 的 `SetAccessor` 方法进行配置的. 该方法接收属性的名称和与其相关联的回调函数, 分别在 JS 读取和写入该属性时触发.   
>     
> 存取器的复杂性源于你所操作的数据的访问方式:  
> * 访问静态全局变量
> * 访问动态变量

### Accessing Static Global Variables (访问静态全局变量)

Let's say there are two C++ integer variables, x and y that are to be made available to JavaScript as global variables within a context. To do this, you need to call C++ accessor functions whenever a script reads or writes those variables. These accessor functions convert a C++ integer to a JavaScript integer using Integer::New, and convert a JavaScript integer to a C++ integer using Int32Value. An example is provided below:

> 假设有两个 C++ 整数变量 x 和 y, 要让他它们可以在 JS 中通过 global 对象进行访问. 我们需要在 JS 代码读写这些变量的时候调用相应的 C++ 存取器函数. 这些存取函数将一个 C++ 整数通过 `Integer::New` 转换成 JS 整数, 并将 JS 整数转换成32位 C++ 整数. 来看下面的例子: 

```
  void XGetter(Local<String> property,
                const PropertyCallbackInfo<Value>& info) {
    info.GetReturnValue().Set(x);
  }

  void XSetter(Local<String> property, Local<Value> value,
               const PropertyCallbackInfo<Value>& info) {
    x = value->Int32Value();
  }

  // YGetter/YSetter are so similar they are omitted for brevity

  Local<ObjectTemplate> global_templ = ObjectTemplate::New(isolate);
  global_templ->SetAccessor(String::NewFromUtf8(isolate, "x"), XGetter, XSetter);
  global_templ->SetAccessor(String::NewFromUtf8(isolate, "y"), YGetter, YSetter);
  Persistent<Context> context = Context::New(isolate, NULL, global_templ);
```

Note that the object template in the code above is created at the same time as the context. The template could have been created in advance and then used for any number of contexts.

> 注意上述代码中的 Object Template 是和 context 同时创建的. 事实上 Template 可以提前创建好, 并可以在任意 context 中使用.

### Accessing Dynamic Variables (访问动态变量)

In the preceding example the variables were static and global. What if the data being manipulated is dynamic, as is true of the DOM tree in a browser? Let's imagine x and y are object fields on the C++ class Point:

> 在前一个例子中, 变量是静态全局的, 那么如果是一个动态操纵的呢? 比如用于标记一个 DOM 树是否在浏览器中的变量? 我们假设 x 和 y 是 C++ 类 Point 上的成员: 

```
  class Point {
   public:
    Point(int x, int y) : x_(x), y_(y) { }
    int x_, y_;
  }
```

To make any number of C++ point instances available to JavaScript we need to create one JavaScript object for each C++ point and make a connection between the JavaScript object and the C++ instance. This is done with external values and internal object fields.

First create an object template for the point wrapper object:

> 为了让任意多个 C++ Point 实例在 JS 中可用, 我们需要为每一个 C++ Point 创建一个 JS 对象, 并将它们联系起来. 这可以通过外部值和内部成员实现.      
> 首先为 point 创建一个 Object template 封装对象: 

`Local<ObjectTemplate> point_templ = ObjectTemplate::New(isolate);`

Each JavaScript point object keeps a reference to the C++ object for which it is a wrapper with an internal field. These fields are so named because they cannot be accessed from within JavaScript, they can only be accessed from C++ code. An object can have any number of internal fields, the number of internal fields is set on the object template as follows:

> 每个 JS point 对象持有一个 C++ 封装对象的引用, 封装对象中有一个 Internal Field, 之所以这么叫是因为它们无法在 JS 中访问, 而只能通过 C++ 代码访问. 一个对象可以有任意多个 Internal Field, 其数量可以按以下方式在 Object Template 上设置.

`point_templ->SetInternalFieldCount(1);`

Here the internal field count is set to 1 which means the object has one internal field, with an index of 0, that points to a C++ object.

Add the x and y accessors to the template:

> 此处的 internal field count 设置为了 1, 这表示该对象有一个 internal field, 其 index 是 0, 指向一个 C++ 对象.    
>      
> 将 x 和 y 存取器添加到 template 上:     

```
  point_templ.SetAccessor(String::NewFromUtf8(isolate, "x"), GetPointX, SetPointX);
  point_templ.SetAccessor(String::NewFromUtf8(isolate, "y"), GetPointY, SetPointY);
```

Next, wrap a C++ point by creating a new instance of the template and then setting the internal field 0 to an external wrapper around the point p.

> 接下来通过创建一个新的 template 实例来封装一个 C++ point, 将封装对象的 interanl field 设置为 0.

```
  Point* p = ...;
  Local<Object> obj = point_templ->NewInstance();
  obj->SetInternalField(0, External::New(isolate, p));
```

The external object is simply a wrapper around a void*. External objects can only be used to store reference values in internal fields. JavaScript objects can not have references to C++ objects directly so the external value is used as a "bridge" to go from JavaScript into C++.  In that sense external values are the opposite of handles since handles lets C++ make references to JavaScript objects.

Here's the definition of the get and set accessors for x, the y accessor definitions are identical except y replaces x:

> 以上代码中, 外部对象就是一个 void* 的封装体. 外部对象只能用来在 internal field 上存储引用值. JS 对象无法直接引用 C++ 对象, 因此可以将外部值当作是一个从 JS 到 C++ 的桥梁. 从这种意义上来说, 外部值是和 handle 相对的概念( handle 是 C++ 到 JS 对象的引用 ).    
> 以下是 x 的存取器的定义, y 的和 x 一样.

```
  void GetPointX(Local<String> property,
                 const PropertyCallbackInfo<Value>& info) {
    Local<Object> self = info.Holder();
    Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
    void* ptr = wrap->Value();
    int value = static_cast<Point*>(ptr)->x_;
    info.GetReturnValue().Set(value);
  }

  void SetPointX(Local<String> property, Local<Value> value,
                 const PropertyCallbackInfo<Value>& info) {
    Local<Object> self = info.Holder();
    Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
    void* ptr = wrap->Value();
    static_cast<Point*>(ptr)->x_ = value->Int32Value();
  }
```

Accessors extract the reference to the point object that was wrapped by the JavaScript object and then read and writes the associated field. This way these generic accessors can be used on any number of wrapped point objects.

> 存取器抽取出了被 JS 对象封装起来的 point 对象的引用, 并读写相关联的成员. 这样, 这些通用的存取器就可以被所有封装后的 point 对象使用了. 

## Interceptors (拦截器)

You can also specify a callback for whenever a script accesses any object property. These are called interceptors. For efficiency, there are two types of interceptors:

* named property interceptors - called when accessing properties with string names.
An example of this, in a browser environment, is `document.theFormName.elementName`.
* indexed property interceptors - called when accessing indexed properties. An example of this, in a browser environment, is `document.forms.elements[0]`.

The sample `process.cc`, provided with the V8 source code, includes an example of using interceptors. In the following code snippet `SetNamedPropertyHandler` specifies the `MapGet` and `MapSet` interceptors:

> 我们可以设置一个回调, 让它在对应对象的任意属性被访问时都会被调用. 这就是 Interceptor. 考虑到效率, 分为两种不同的 interceptor:      
> * 属性名拦截器: 当通过字符串形式的属性名访问时调用. 比如在浏览器中使用 `document.theFormName.elementName` 进行访问.    
> * 属性索引拦截器: 当通过属性的下标/索引访问时调用. 比如在浏览器中使用 `document.forms.elements[0]` 进行访问.    
>      
>  V8 源码 process.cc 的代码中, 包含了一个使用 interceptor 的例子. 在下面的代码片段中, `SetNamedPropertyHandler` 指定了 `MapGet` 和 `MapSet` 两个 interceptor:      

``` 
Local<ObjectTemplate> result = ObjectTemplate::New(isolate);
result->SetNamedPropertyHandler(MapGet, MapSet);
```

The MapGet interceptor is provided below:

```
void JsHttpRequestProcessor::MapGet(Local<String> name,
                                    const PropertyCallbackInfo<Value>& info) {
  // Fetch the map wrapped by this object.
  map<string, string> *obj = UnwrapMap(info.Holder());

  // Convert the JavaScript string to a std::string.
  string key = ObjectToString(name);

  // Look up the value if it exists using the standard STL idiom.
  map<string, string>::iterator iter = obj->find(key);

  // If the key is not present return an empty handle as signal.
  if (iter == obj->end()) return;

  // Otherwise fetch the value and wrap it in a JavaScript string.
  const string &value = (*iter).second;
  info.GetReturnValue().Set(String::NewFromUtf8(value.c_str(), String::kNormalString, value.length()));
}
```

As with accessors, the specified callbacks are invoked whenever a property is accessed. The difference between accessors and interceptors is that interceptors handle all properties, while accessors are associated with one specific property.

> 和存取器一样, 对应的回调将在每次属性被访问的时候调用, 只不过拦截器会处理所有的属性, 而存取器只针对相关联的属性.

## Security Model (安全模型)

The "same origin policy" (first introduced with Netscape Navigator 2.0) prevents a document or script loaded from one "origin" from getting or setting properties of a document from a different "origin". The term origin is defined here as a combination of domain name (www.example.com), protocol (http or https) and port (for example, www.example.com:81 is not the same as www.example.com). All three must match for two webpages to be considered to have the same origin. Without this protection, a malicious web page could compromise the integrity of another web page.

> 同源策略用来防止从一个源载入的文档或脚本存取另外一个源的文档. 这里所谓的 "同源" 是指相同的 protocal + domain + port, 这三个都相同的两个网页才被认为是同源. 如果没有它的保护, 恶意网页将危害到其他网页的完整性.    
>    
> _同源策略在 Netscape Navigator 2.0 中首次引入_   

In V8 an "origin" is defined as a context. Access to any context other than the one from which you are calling is not allowed by default. To access a context other than the one from which you are calling, you need to use security tokens or security callbacks. A security token can be any value but is typically a symbol, a canonical string that does not exist anywhere else. You can optionally specify a security token with SetSecurityToken when you set up a context. If you do not specify a security token V8 will automatically generate one for the context you are creating.

> 在 V8 中, 同源被定义为相同的 context. 默认情况下, 是无法访问别的 context 的. 如果一定要这样做, 需要使用安全令牌或安全回调. 安全令牌可以是任意值, 但通常来说是个唯一的规范字符串. 当建立一个 context 时, 我们可以通过 `SetSecurityToken` 来指定一个安全令牌, 否则 V8 将自动为该 context 生成一个.

When an attempt is made to access a global variable the V8 security system first checks the security token of the global object being accessed against the security token of the code attempting to access the global object. If the tokens match access is granted. If the tokens do not match V8 performs a callback to check if access should be allowed. You can specify whether access to an object should be allowed by setting the security callback on the object, using the `SetAccessCheckCallbacks` method on object templates. The V8 security system can then fetch the security callback of the object being accessed and call it to ask if another context is allowed to access it. This callback is given the object being accessed, the name of the property being accessed, the type of access (read, write, or delete for example) and returns whether or not to allow access.  

> 当试图访问一个全局变量时, V8 安全系统将先检查该全局对象的安全令牌, 并将其和试图访问该对象的代码的安全令牌比对. 如果匹配则放行, 否则 V8 将触发一个回调来判断是否应该放行. 我们可以通过 object template 上的 `SetAccessCheckCallbacks` 方法来定义该回调来并决定是否放行. V8 安全系统可以用被访问对象上的安全回调来判断访问者的 context 是否有权访问. 该回调需要传入被访问的对象, 被访问的属性以及访问的类型(例如读, 写, 或删除), 返回结果为是或否.

This mechanism is implemented in Google Chrome so that if security tokens do not match, a special callback is used to allow access only to the following: `window.focus()`, `window.blur()`, `window.close()`, `window.location`, `window.open()`, `history.forward()`, `history.back()`, and `history.go()`.

> Chrome 实现了这套机制, 对于安全令牌不匹配的情况, 只有以下这些才可以通过安全回调的方式来判断是否可以放行: `window.focus()`, `window.blur()`, `window.close()`, `window.location`, `window.open()`, `history.forward()`, `history.back()`, 和 `history.go()`.


## Exceptions (异常)

V8 will throw an exception if an error occurs - for example, when a script or function attempts to read a property that does not exist, or if a function is called that is not a function.

V8 returns an empty handle if an operation did not succeed. It is therefore important that your code checks a return value is not an empty handle before continuing execution. Check for an empty handle with the Local class's public member function IsEmpty().

You can catch exceptions with TryCatch, for example:

> 如果发生错误, V8 会抛出异常. 比如, 当一个脚本或函数试图读取一个不存在的属性时, 或者一个不是函数的值被当作函数进行调用执行时.     
>     
> 如果一个操作不成功, V8 将返回一个空的 handle. 因此我们应该在代码中检查返回值是否是一个空的 handle, 可以使用 `Local` 类的公共成员函数 `isEmpty()` 来检查 handle 是否为空.     
>      
> 我们也可以像以下示例一样 Try Catch 代码中发生的异常:     

```
  TryCatch trycatch(isolate);
  Local<Value> v = script->Run();
  if (v.IsEmpty()) {
    Local<Value> exception = trycatch.Exception();
    String::Utf8Value exception_str(exception);
    printf("Exception: %s\n", *exception_str);
    // ...
  }
```

If the value returned is an empty handle, and you do not have a TryCatch in place, your code must bail out. If you do have a TryCatch the exception is caught and your code is allowed to continue processing.

> 如果 value 以一个空 handle 返回, 而你没有 TryCatch 它, 你的程序挂掉, 反之则可以继续执行.

## Inheritance (继承)

JavaScript is a class-free, object-oriented language, and as such, it uses prototypal inheritance instead of classical inheritance. This can be puzzling to programmers trained in conventional object-oriented languages like C++ and Java.

> JS 是一个无类的面向对象编程语言, 因此, 它使用原型继承而不是类继承. 这会让那些接受传统面向对象语言(比如 C++ 和 Java)训练的程序员感到迷惑.

Class-based object-oriented languages, such as Java and C++, are founded on the concept of two distinct entities: classes and instances. JavaScript is a prototype-based language and so does not make this distinction: it simply has objects. JavaScript does not natively support the declaration of class hierarchies; however, JavaScript's prototype mechanism simplifies the process of adding custom properties and methods to all instances of an object. In JavaScript, you can add custom properties to objects. For example:

> 基于类的面向对象编程语言, 比如 C++ 和 Java, 是建立在两种完全不同实体的概念上的: 类和实例. 而 JS 是基于原型的语言, 因此没有这些区别, 它只有对象. JS 本身并不原生支持 类这个层级的声明; 然而, 它的原型机制简化了给对象实例添加自定义属性或方法的过程. 在 JS 中, 你可以像以下代码这样给对象添加属性: 

```
// Create an object "bicycle" 
function bicycle(){ 
} 
// Create an instance of bicycle called roadbike
var roadbike = new bicycle()
// Define a custom property, wheels, on roadbike 
roadbike.wheels = 2
```

A custom property added this way only exists for that instance of the object. If we create another instance of bicycle(), called mountainbike for example, mountainbike.wheels would return undefined unless the wheels property is explicitly added.

Sometimes this is exactly what is required, at other times it would be helpful to add the custom property to all instances of an object - all bicycles have wheels after all. This is where the prototype object of JavaScript is very useful. To use the prototype object, reference the keyword prototype on the object before adding the custom property to it as follows:

> 这种方式定义的属性只存在于该对象实例上. 如果创建另一个 bicycle() 实例则其并没有 wheels 属性, 进行访问将返回 undefined. 除非显式的将 wheels 属性添加上去.        
>        
> 有时这正是我们所需要的, 但有时我们希望将属性添加到所有这些实例上去, 这是 JS 的 prototype 对象就派上用处了. 为了使用原型对象, 可以通过 prototype 关键词访问对象原型, 然后在它上面添加自定义的属性: 

```
// First, create the "bicycle" object
function bicycle(){ 
}
// Assign the wheels property to the object's prototype
bicycle.prototype.wheels = 2
```

All instances of bicycle() will now have the wheels property prebuilt into them.

The same approach is used in V8 with templates. Each FunctionTemplate has a PrototypeTemplate method which gives a template for the function's prototype. You can set properties, and associate C++ functions with those properties, on a PrototypeTemplate which will then be present on all instances of the corresponding FunctionTemplate. For example:

> 此后, 所有 `bicycle()` 的实例都将预置该属性值了.    
>      
> V8 通过 template 可以使用同样的方法. 每个 `FunctionTemplate` 都有一个 `PrototypeTemplate` 方法可以返回该函数的原型. 我们可以给它设置属性, 也可以将 C++ 函数关联到这些属性, 然后所有该 FunctionTemplate 对应的实例上都将有这些属性和对应的值或函数: 

```
 Local<FunctionTemplate> biketemplate = FunctionTemplate::New(isolate);
 biketemplate->PrototypeTemplate().Set(
     String::NewFromUtf8(isolate, "wheels"),
     FunctionTemplate::New(isolate, MyWheelsMethodCallback)->GetFunction();
 )
```

This causes all instances of biketemplate to have a wheels method in their prototype chain which, when called, causes the C++ function MyWheelsMethodCallback to be called.

V8's FunctionTemplate class provides the public member function Inherit() which you can call when you want a function template to inherit from another function template, as follows:

> 以上代码将使所有 biketemplate 的原型链上都具有 wheels 方法, 当在对应实例上调用 wheels 方法时, MyWheelsMethodCallback 将被执行.     
>         
> V8 的 FunctionTemplate 类提供了公共的成员函数 `Inherit()`, 当我们希望当前 function template 继承另外一个 function template 的时候可以调用该方法: 

```
void Inherit(Local<FunctionTemplate> parent);
```

Google 原文更新日期: 六月 16, 2015

> [V8 设计元素](https://developers.google.com/v8/design)     
> [入门指南](https://developers.google.com/v8/get_started)    

