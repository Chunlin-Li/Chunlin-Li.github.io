AWK
========


awk '{ code for each line }'    

awk '{ code for each line } END { code for end }'

awk '/regex for each line/ { code for each line } END { code for end }'

awk 'BEGIN { code before start } /regex for each line/ { code for each line } END { code for end }'

awk '$1 ~ "hello"' 打印 $1 匹配正则表达式 "hello" 的行

设置列分隔符:     
awk -F ',' '{ .....  }'   // 分隔符可以用 '' 或 "" 包起, 分隔符可以是多个字符    
awk 'BEGIN {FS=","} {....}'  // 不能用 " 作为分隔符    
awk 'BEGIN {FS="[,: ]]} {....}'   // 可以指定多个不同的列分隔符. 遇到任意一个都进行分隔

设置 Row 分隔符:   
awk 'BEGIN {RS="\n"} {....}'  

设置输出时的列分隔符(用','分隔输出值时)  ORS 同理
awk 'BEGIN {OFS="-"} {....}'  


awk print 字符串字面量, 变量, 字符串连接 :     
print "this string is : "$0     
print "this string is : ",$0     
print "this string is : " $0    

awk 内建变量常量:   
FS, RS 分隔符    
$0 当前整行, $1 首列, $x 第x列   
NR : 行数 行号    
FILENAME : 当前文件名, 注意如果用了管道或者从标准输入得到文本, 文件名将显示为 '-'   

awk 变量和操作符:    
awk 变量不需要声明, 无类型, 使用变量时, 其类型取决于使用时的上下文.   
支持 `++ -- + - * / %` 运算符   
赋值支持  `=  +=  -=  *=  /= %=`    
比较测试  `>  <  >=  <=  == != && || `   
正则  `~ 匹配   !~ 不匹配`

