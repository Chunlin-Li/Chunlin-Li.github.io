AWK
========

## awk 语句
awk '{ code for each line }'    

awk '{ code for each line } END { code for end }'

awk '/regex for each line/ { code for each line } END { code for end }'

awk 'BEGIN { code before start } /regex for each line/ { code for each line } END { code for end }'

awk '$1 ~ "hello"' 打印 $1 匹配正则表达式 "hello" 的行

### 设置列分隔符:     
awk -F ',' '{ .....  }'   // 分隔符可以用 '' 或 "" 包起, 分隔符可以是多个字符    
awk 'BEGIN {FS=","} {....}'  // 不能用 " 作为分隔符    
awk 'BEGIN {FS="[,: ]]} {....}'   // 可以指定多个不同的列分隔符. 遇到任意一个都进行分隔

### 设置 Row 分隔符:   
awk 'BEGIN {RS="\n"} {....}'  

### 设置输出时的列分隔符(用','分隔输出值时)  ORS 同理
awk 'BEGIN {OFS="-"} {....}'  


### awk print 字符串字面量, 变量, 字符串连接 :     
print "this string is : "$0     
print "this string is : ",$0     
print "this string is : " $0    

### awk 内建变量常量:   
FS, RS 分隔符    
$0 当前整行, $1 首列, $x 第x列   
NR : 行数 行号    
FILENAME : 当前文件名, 注意如果用了管道或者从标准输入得到文本, 文件名将显示为 '-'   

### awk 变量和操作符:    
awk 变量不需要声明, 无类型, 使用变量时, 其类型取决于使用时的上下文.   
支持 `++ -- + - * / %` 运算符   
赋值支持  `=  +=  -=  *=  /= %=`    
比较测试  `>  <  >=  <=  == != && || `   
正则  `~ 匹配   !~ 不匹配`

### 条件语句:     
if (conditional) {action1; action2;}    
if (conditional) action1 else action2    
conditional-expression ? action1 : action2;    

### 循环语句:   
while (conditional)  actions    
do actions while (conditional)   
for (init; cond; inc/dec) actions    

**循环语句支持 break, continue,** 

### 退出当前 awk 程序:   
exit

## 数组元素
awk 中的数组类似与 js 中的 Object.    
index 可以不连续, 可以是字符串, array 不需要声明 不需要初始化.   
数组引用直接使用 array[index] 方式即可.   
判断数组中某个 index 是否有值 :  if (index in array) {print "exist"}      
遍历 Array :  for (eleIndex in array) actions   其中 eleIndex 是对应元素的下标. 访问元素需  array[eleIndex]    
删除数组元素 : delete array[index]   
可以使用 asort 函数对数组元素排序 :   



## 参考资料

[The GNU Awk User’s Guide](https://www.gnu.org/software/gawk/manual/html_node/index.html#SEC_Contents)   
[Sed and Awk 101 Hacks](http://www.thegeekstuff.com/sed-awk-101-hacks-ebook/)   


