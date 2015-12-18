
服务端性能监控和分析
----------------

> Author : 春霖  
> Date : 2015-08-12


## Tomcat

* 修改 `server.xml` 配置文档, 需要参考[官方的 HTTP connector 配置说明文档](http://tomcat.apache.org/tomcat-7.0-doc/config/http.html)  
* 在 `catalina.sh` 中需要合理配置 JVM 选项. JVM_OPTS.


## 使用 JDK 自带的 JVM 工具

* `jstack <PID>` 可以输出指定 Java 进程当前的所有线程的 栈帧 (stack frame)  
* `jmap -heap <PID>` 可以将指定 Java 进程当前的 JVM 内存状态打印出来  
* `jmap -histo <PID>` 可以将指定 Java 进程当前的堆内存对象统计信息打印出来
* `jmap -histo:live <PID>` **该命令将触发一次全 GC !**. 然后将指定 Java 进程当前的堆内存对象统计信息打印出来. 与不带 live 选项的相比, 该命令所显示的都是目前仍在声明周期中的对象.


## 使用 Linux 系统自带工具进行分析

* `top -p <PID>` 查看指定进程的内存分配状态. 需要关注 RES 列显示的内存, 这是该进程所占用的系统内存的总量.
* `ps aux --sort rss` 可以按照内存使用量对进程进行排序
* `free` 查看当前操作系统的内存使用状况. 需要关注 `-/+ buffers/cache: ` 那一行. `used` 表示已经被程序占用的内存; `free` 表示应用程序还可以向操作系统申请使用的内存总量.
 对于`Mem:` 那行来说, `cached` 的内存时操作系统用于提高性能而为缓存分配的空间. 这部分的内存可以随时被应用程序拿来使用, 因此对于应用程序来说, 相当于时 free 的内存.

	

> Written with [StackEdit](https://stackedit.io/).
