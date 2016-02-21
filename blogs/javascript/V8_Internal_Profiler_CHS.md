Profile your web application with V8’s internal profiler 
========================
## 使用 V8 的内部分析器优化 web 应用

> Chunlin Li 译        
> 原文 : [https://developers.google.com/v8/profiler_example](https://developers.google.com/v8/profiler_example)

Today's highly optimized virtual machines can run web apps at blazing speed. But one shouldn't rely only on them to achieve great performances: a carefully optimized algorithm or a less expensive function can often reach many-fold speed improvements on all browsers. Chrome Developer Tool’s CPU Profiler helps you analyze your code bottlenecks. But sometimes, you need to go deeper and more granular: this is where V8's internal profiler comes in handy.

> 如今高度优化的虚拟机可以让 Web 应用运行飞快, 但我们不应该依赖它来达到出众的性能. 仔细优化过的算法或开销更小的函数可以使得应用在任何浏览器下运行性能都成倍提高. 谷歌开发者工具中的 CPU 分析器可以帮我们分析代码中的瓶颈. 但有时我们可能需要更深入更细粒度的分析, 此时 V8 内部分析器就可以派上用场了.

Let’s use that profiler to examine the [Mandelbrot explorer demo](http://ie.microsoft.com/testdrive/performance/mandelbrotexplorer/) that Microsoft released together with IE10. After the demo release, V8 has fixed a bug that slowed down the computation unnecessarily (hence the poor performance of Chrome in the demo’s blog post) and further optimized the engine, implementing a faster exp() approximation than what the standard system libraries provide. Following these changes, the demo ran 8x faster than previously measured in Chrome.

But what if you want the code to run faster on all browsers? You should first understand what keeps your CPU busy. Run Chrome (Windows and Linux Canary) with the following command line switches, which will cause it to output profiler tick information (in the v8.log file) for the URL you specify, which in our case was a local version of the Mandelbrot demo without web workers:

> 我们来使用分析器来检验一下 [Mandelbrot expolorer demo](http://ie.microsoft.com/testdrive/performance/mandelbrotexplorer/), 它是同微软的 IE10 一共发布的. 这个 demo 发布后, V8 修正了一个 bug, 它使得运算变慢(其实是不必要的), 并且对 V8 引擎做了更进一步的优化, 实现了比标准系统库更快的 `exp()` 近似计算. 随着这些优化, 该 demo 在新的 chrom 中的运行速度比以前快了 8 倍.     
>     
> 但如果你想让代码在所有浏览器上都运行的更快该怎么办呢?  你应该先找出是什么过度占用了 CPU. 添加以下参数并启动 chrome 将会输出打开的页面的分析器时间片信息. 我们在下面的例子中将打开一个 Mandelbrot demo 不带 web worker 的本地版本:

```
$ ./chrome --js-flags=”--prof” --no-sandbox http://localhost:8080/index.html
```

> 译注: 对于 node , 可以使用 `node --prof index.js` 来执行, 会在当前路径下生成 `isoloate-xxxxx-v8.log` 这样的文件

When preparing the test case, make sure it begins its work immediately upon load, and simply close Chrome when the computation is done (hit Alt+F4), so that you only have the ticks you care about in the log file. Also note that web workers aren’t yet profiled correctly with this technique.

Then, process the v8.log file with the [tick-processor](http://code.google.com/p/v8-wiki/wiki/V8Profiler#Process_the_Generated_Output) script that ships with V8 (or the new practical [web version](http://v8.googlecode.com/svn/trunk/tools/tick-processor.html)):

> 准备测试用例的时候需要注意, 要让程序在加载后立即开始执行, 计算结束后直接关闭 Chrome 即可, 这样可以使结果尽量准确. 另外需要注意, web work 目前还不能使用该方法得到正确的分析结果.    
> 然后需要使用 v8 中自带的 tick-processor 脚本来处理一下 `v8.log` 文件. 或者可以使用 [web 工具](http://v8.googlecode.com/svn/trunk/tools/tick-processor.html)

```
$ v8/tools/linux-tick-processor v8.log
```

> 译注: node 源码中就有该脚本, 不依赖 GUI, 适合在服务器上直接使用. 解压 node 源码后, 路径 `tools/v8-prof/tick-processor.js`

Here’s an interesting snippet of the processed output that should catch your attention:

> 以下是经过 tick-processor 处理后的文件中我们需要特别留意的片段:

```
Statistical profiling result from null, (14306 ticks, 0 unaccounted, 0 excluded).
 [Shared libraries]:
   ticks  total  nonlib   name
   6326   44.2%    0.0%  /lib/x86_64-linux-gnu/libm-2.15.so
   3258   22.8%    0.0%  /.../chrome/src/out/Release/lib/libv8.so
   1411    9.9%    0.0%  /lib/x86_64-linux-gnu/libpthread-2.15.so
     27    0.2%    0.0%  /.../chrome/src/out/Release/lib/libwebkit.so
```

The top section shows that V8 is spending more time inside an OS-specific system library than in its own code. Let’s look at what’s responsible for it by examining the “bottom up” output section, where you can read indented lines as "was called by" (and lines starting with a * mean that the function has been optimized by Crankshaft):

> 上面的部分显示 V8 花在 OS 的系统 lib 中的运行时间比花在它自己实际的代码的时间要多. 我们可以通过 "bottom up" 部分查一下其背后的原因. "bottom up" 部分的内容具有缩进结构, 其表示上一行指示的代码是被下一行指示的代码所调用 ( 代码位置前多出的 `*` 表示该函数是被 V8 编译优化器优化过的 ) :

```
[Bottom up (heavy) profile]:
  Note: percentage shows a share of a particular caller in the total
  amount of its parent calls.
  Callers occupying less than 2.0% are not shown.

   ticks parent  name
   6326   44.2%  /lib/x86_64-linux-gnu/libm-2.15.so
   6325  100.0%    LazyCompile: *exp native math.js:91
   6314   99.8%      LazyCompile: *calculateMandelbrot http://localhost:8080/Demo.js:215
```

More than 44% of the total time is spent executing the exp() function inside a system library! Adding some overhead for calling system libraries, that means about two thirds of the overall time are spent evaluating Math.exp().

> 可以看出超过 44% 时间都用于执行系统 Lib 中的 `exp()` 函数! 算上调用操作系统的库的产生的额外开销, 总共有大约三分之二的运行时间都消耗在计算 `Math.exp()` 上面了.

If you look at the JavaScript code, you’ll see that exp() is used solely to produce a smooth grayscale palette. There are countless ways to produce a smooth grayscale palette, but let’s suppose you really really like exponential gradients. Here is where algorithmic optimization comes into play.

> 如果观察 Javascript 代码, 你会发现 `exp()` 被用来产生一个平滑的灰度渐变调色盘. 我们有很多产生它的方式, 但如果你确实一定要用它, 我们可以考虑用下面的算法来优化它.

You’ll notice that exp() is called with an argument in the range -4 < x < 0, so we can safely replace it with its Taylor approximation for that range, which will deliver the same smooth gradient with only a multiplication and a couple of divisions:

> 你也许注意到 `exp()` 的调用实参范围是 -4 < x < 0, 我们大可直接使用泰勒逼近这个范围, 这样我们只需要一个乘法和两个除法计算即可产生同样平滑的梯度: 

```
exp(x) ≈ 1 / ( 1 - x + x*x / 2) for -4 < x < 0 
```

Tweaking the algorithm this way boosts the performance by an extra 30% compared to latest Canary and 5x to the system library based Math.exp() on Chrome Canary.

> 用这种算法进行优化后, 其性能比最新的 Canary 版本浏览器快 30% 左右, 比调用系统库快5倍

![01](https://developers.google.com/v8/images/mandelbrot_chrome_speed.png)

This example shows how V8’s internal profiler can help you go deeper into understanding your code bottlenecks, and that a smarter algorithm can push performance even further.

To compare VM performances that represents today’s complex and demanding web applications, one might also want to consider a more comprehensive set of benchmarks such as the [Octane Javascript Benchmark Suite](http://octane-benchmark.googlecode.com/svn/latest/index.html).

> 这个例子为我们揭示了 V8 内部分析器如何帮我们从更深的层次去理解我们代码中的瓶颈, 也为我们展示了更好的算法是如何提高性能的.       
> 对比两个代表当今 Web 应用的复杂性和需求的程序在 VM 中执行的性能, 我们可能还需要参考更加全面的基准测试系统, 比如[Octane Javascript 基准测试套件](http://octane-benchmark.googlecode.com/svn/latest/index.html).

Google 原文更新于 二月 26, 2015
