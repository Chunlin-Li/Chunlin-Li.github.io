
## HTTP

server 端 keepAlive 的控制:  

如果需要关闭 server 的 keepAlive, 可以直接在 res 上将 res.shouldKeepAlive 设置为 false. 则客户端发来的请求 server 将不支持 keepAlive.
这样客户端(浏览器)请求时带有 Connection: keep-alive 头, 但 server 响应的头中是 Connection: Close


典型的Chrome浏览器(C)与 node server (S) HTTP Keep alive 通信: 

1. C 向 S 发 SYN 包;
2. S 向 C 回 SYN + ACK 包;
3. C 向 S 回 ACK 包; 建立连接的三次握手完成;
4. C 向 S Push 数据, flag: PSH;
5. S 向 C 回 ACK 确认数据接收, 然后向 C Push 数据;
6. C 向 S 回 ACK, 然后 C 再向 S Push 数据, flag: PSH;  重复.....
7. 数据通信结束后不断开连接(HTTP的keep alive), 但是每隔 45s (Chrome) C 会向 S 发送用于 TCP 的 keep alive 空包.
8. S 向 C 回 keep alive 包的 ACK.
9. 当空闲 2 分钟(node 默认值)后, S 向 C 发出 FIN 信号并进入FIN_WAIT_1, C 收到后回发 ACK 并进入 CLOSE_WAIT.
10. S 收到 ACK 后进入 FIN_WAIT_2, 之后 C 向 S 发送 FIN 信号并进入 LAST_ACK, S 收到后回 ACK 并进入 TIME_WAIT.
11. S 端的 TIME_WAIT Socket 连接交给 OS, 由 OS 在 2分钟 (OS默认值) 后回收.

* Chrome keep alive 时间是 5 分钟. 只有在 server 的 setTimeout 大于 client 的 keep alive 时间, 才会由 client 主动关闭连接.

-----------------------
 
server 端 timeout 的控制: 如果请求进来后, 必须在限定时间内返回或断开链接, 而不能受内部逻辑的复杂性影响使得请求 hang 住, 可以设置 通过 server.setTimeout(xx) 来控制.

server.setTimeout 会对 client 和 server 之间简历的链接进行 timeout  计时.  如果连接在 timeout 时间内没有有效的数据包发送或接收, socket 会被 server 销毁.

对于 server 来说, 直接设置 setTimeout 是一种比较粗暴的方式.  实际业务中可以考虑在 req(IncomingMessage) 上面设置一个 timeout, 如果超时则提前返回.



res.finished 变量可以用于判断该 HTTP 请求是否已经 end() 过了.
req.connection._httpMessage.finished 用法同上.


----------------------

udp 可以和 tcp 使用(复用)同一个端口. 双方不会干扰.
 
--------------------
 
使用

```
var uv = process.binding('uv');

....

res.socket.write(new Buffer([uv.UV_EOF])); 

```

可以向 socket 的另一端直接写 tcp 的一些标志符.  livuv 支持的 TCP 标志可以参考[文档](http://docs.libuv.org/en/v1.x/errors.html)


---------------------------


