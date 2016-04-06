AWK
========

## awk 语句
awk '{ code for each line }'    

awk '{ code for each line } END { code for end }'

awk '/regex for each line/ { code for each line } END { code for end }'

awk '/regex1/ { code for regex1 } /regex2/ {code for regex2} END { code for end }'

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


# 常用 awk build-in 函数

## 字符串函数 

字符串处理, 主要有
 
* `asort()`: 对 array 中的 element 排序, index 转为自然数
* `asorti()`: 同上, 但是排序的是 index, 排序后成为结果中的 element.
* `gensub()`: 子串替换.比 gsub() 和 sub() 功能更强
* `index()`: 查找子串的 index 
* `length()`: 字符串长度
* **`match()`**: 查找匹配正则的字符串的 index. 如果指定 arr 参数, arr[0] 是所匹配到的完整字符串, arr[N] 是第N个分组捕获的字符串
通过arr[N, "start"] 和 [N, "length"] 分别可以取得分组的起始 index 和长度.
* `patsplit()`: 字符串 split , 支持正则. `split()` 不支持正则.
* `strtonum()`: 字符串转数字
* `substr()`: 通过 start 和 length 两个参数获取子串. start 从1开始
* `tolowr() / toupper()`: 转大小写

[文档](https://www.gnu.org/software/gawk/manual/html_node/String-Functions.html#String-Functions)



## 参考资料

[The GNU Awk User’s Guide](https://www.gnu.org/software/gawk/manual/html_node/index.html#SEC_Contents)   
[Sed and Awk 101 Hacks](http://www.thegeekstuff.com/sed-awk-101-hacks-ebook/)   


-------------------------------------

### 从文件 B 中找到所有含有文件 A 中提供的 pattern/id 的行


```
{
  if(FNR==NR) {       
    list[$1] = 1      # 载入文件A中的所有id
  } else {
    match($0, /"id":"([^"]+)/, arr);    # 对文件B的每一行提取目标字符串到 arr 中
    if (arr[1] != "" && arr[1] in list) {   # 如果提取成功, 且提取到的 id 存在于文件A中, 则输出当前行
        print $0      
    }
  }
}
```
