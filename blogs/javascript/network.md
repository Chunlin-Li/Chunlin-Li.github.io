
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

此外如果要 client 主动关闭连接, 也可以在 server 端直接关闭 keep alive.
 
server 端 timeout 的控制: 如果请求进来后, 必须在限定时间内返回或断开链接, 而不能受内部逻辑的复杂性影响使得请求 hang 住, 可以设置 通过 server.setTimeout(xx) 来控制.
