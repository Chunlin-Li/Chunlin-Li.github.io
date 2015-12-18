
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
security:
   authorization: disabled

```


#### 单节点 Replication 模式运行
使用 `mongod -f /path/to/conf` 启动 mongod
使用mongo shell连接上去, 执行 `rs.initiate()` 进行单机 replication 的初始化, 完成初始化后 mongod 将进入 PRIMARY 模式.
使用 `rs.conf()` 命令查看当前的运行模式.

如果无法自动完成 replication 的初始化, 需要手动操作, 参考[文档](http://docs.mongodb.org/manual/tutorial/deploy-replica-set/#procedure)    
例如 : 

```
> var rsconf = {"_id": "myRepl", "version": 1, "members": [{"_id": 1, "host": "127.0.0.1:27017"}]}
> rs.initiate(rsconf)
```


#### 用户验证
最初的时候, 配置文件中  auth 是  disabled,  不用验证就可以从本机登录到 mognod 上.
连接上后, 首先 `use admin` 创建全集的管理员用户.
```
db.createUser({
    user: 'zhangsan',
    pwd: '123456',
    roles: ['root']
  })
```
创建成功后, 切换到自己的数据db, `use myData`
创建该db的管理员.
```
db.createUser({
    user: 'lisi',
    pwd: '123456',
    roles: ['dbOwner']
  })
```
注意db的管理员与全局的管理员可以同名. dbOwner 的权限相对较高. 详细的角色列表参见[文档](http://docs.mongodb.org/manual/reference/built-in-roles/)

完成以上最初的用户创建工作后, 可以关闭 mongod 了, 然后修改配置文件, 将 `security.authorization` 选项改为 `enabled`, 然后重启 mongod.
此时, mongod 就只能由验证过的用户才可以操作了


> Written with [StackEdit](https://stackedit.io/).
