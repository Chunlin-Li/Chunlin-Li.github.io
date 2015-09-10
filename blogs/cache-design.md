Cache 系统设计
---------

在 Java Web 系统中遇到 Cache 设计的问题, 在网络上寻找相关资源, 发现相关文章非常少.

因此, 在此收录一些相关文章, 并整理一些比较好的经验.

这里我们讨论的是:

* 如何设计整个架构的缓存层
* 如何利用缓存加速和优化特定的业务
* 如何管理缓存的更新, 淘汰机制
* 如何选用合适的缓存媒介

而不是讨论:

* 如何使用 Memcache, Redis, 或其他各种形式的缓存工具


## 文章列表 :

* [MS .NET System.Web.Caching 文档](https://msdn.microsoft.com/en-us/library/System.Web.Caching.aspx)
* [Cache Design](http://cseweb.ucsd.edu/classes/fa10/cse240a/pdf/08/CSE240A-MBT-L15-Cache.ppt.pdf) 硬件 Cache 原理和理论 PPT
* [Cache-Aside Pattern](https://msdn.microsoft.com/en-us/library/Dn589799.aspx)




## 关于 Cache 的抽象理论:

Cache 是一种基于局部性理论 (Locality) 的发明. 两个方面 : 时间局部性,  空间局部性

Cache 要解决的问题是加速, 其中至少涉及两个层次, 一个快一个慢. 将访问较慢的数据复制到访问较快的一层, 可以起到加速作用.

为何会有快慢之分? 与 容量, 速度, 成本, 数据是否易失等有关.

从软件方面考虑, 数据库需要保存全部数据, 量大; 需要支持复杂的查询, 功能多; 数据非易失, 需落盘, 因此速度慢.    
而缓存相对数据量小, 支持的查询简单(如 key-value方式), 数据无需持久化, 可以存在内存中, 因此速度快.

性能加速的计算方法 :  需要加速的部分, 在整个系统中的耗时占比为 T, 整个系统的总耗时为 A. 通过 Cache 加速可以将该部分性能提高到原先的 X 倍. 那么加速后对整个系统时间提升为 A(1 - T(1 - 1/X)).

有时需要使用多层缓存来进行更进一步的性能提升. 但实现上将更加复杂.



## Web 系统中的 Cache 设计

分级:    DB (MySQL, Mongo 等), Cache (Redis, Memcache 等), Java 堆内存缓存









