
## MongoDB 的 YAML 格式的配置文件模板

官方文档: [点这里](http://docs.mongodb.org/manual/reference/configuration-options/)

以下列出我自己使用中可能会用到的配置选项, 更多其他配置选项请参考官方文档.

```yaml
systemLog:
   destination: file
   # 配置日志输出路径
   path: "/mongodb/DB1/log/mongo.log"
   logAppend: true
storage:
   # 开启日志
   journal:
      enabled: true
processManagement:
   # 执行时 fork 出一个新进程
   fork: true
net:
   # 设定对外暴露的 IP 和 端口
   bindIp: 127.0.0.1
   port: 27017
storage:
   # 数据存储路径
   dbPath: "/mongodb/DB1/data"
operationProfiling:
   # 记录日志的慢查询阈值
   slowOpThresholdMs: 30
   # 模式 : on  off  slowOp
   mode: slowOp
replication:
   oplogSizeMB: 512
   replSetName: myRepl1
```


#### 单节点 Replication 模式运行 
使用 `mongod -f /path/to/conf` 启动 mongod    
使用mongo shell连接上去, 执行 `rs.initiate()` 进行单机 replication 的初始化, 完成初始化后 mongod 将进入 PRIMARY 模式.    
使用 `rs.conf()` 命令查看当前的运行模式.


> Written with [StackEdit](https://stackedit.io/).
