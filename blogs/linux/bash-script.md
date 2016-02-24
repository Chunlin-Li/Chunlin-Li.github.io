Bash

------------------------
#### 简单的整数运算:  

\$符加双括号 : 
* 括号内的变量 $ 符可以省略
* 如果表达式不需要将结果赋值给其他变量, 则可以省略前面的 \$
* 支持类 C 的数学运算表达式
* 支持三元运算符

```bash
a=10
b=$((a+1))   # b=11
b=((a+2))   # error
((a=a/2))   # a = 5
```

let :
* 相当于是一个简版的 expr
* 如果不加双引号, 则表达式中不能有空格
* let 可能会返回意外的 1. ( echo $? )

```
let a=1
let b=a+4
let "c = a + b"
```
-----------------------------------

#### 字符串切割成数组(split)

```
myString=abc=123
IFS="=" read -a splitArray <<< "$myString"
# 关于 <<< 的使用可以参考 ABS 中的 here string
echo ${splitArray[@]}   # abc 123
echo ${splitArray[0]}   # abc
echo ${aplitArray[1]}   # 123
```

--------------------------------

#### 条件判断 用于 if 或 while 等....

双中括号方式
* 需要在值和操作符间插入空格
* 中括号首尾需要空格, 除非用小括号将表达式括起来
* 

```
[[ 3 == 2 ]]  # false
[[ "abc" == "abc" ]]  # true
x=12
[[ $x == 12 ]]  # true
[[ $x == 12 && 3 > 2 ]]  # true
```

单中括号方式
* 略

其他
* 使用 test 等方式.


--------------------------------

#### switch case 语句

支持字符串, 支持整数

```
case VARIABLE in
	xxx1 )
		statemnet ;;
	xxx2 )
		statemnet ;;
	xxx3 )
		statemnet ;;
	   * )
		statement ;;
esac
```


-----------------------------------

#### 脚本退出返回

`exit N`  退出脚本执行,  `echo $?` 显示对应的退出码. 默认是 0

function 的返回也是同样的道理, return 一个整数, 接下来调用者使用 $? 可以取到该返回值.

---------------------------------- 

#### 执行字符串拼接的命令行

```
cmdStr="echo abc |cut -c 1-2"
${cmdStr}   # output is abc|cut -c 1-2
eval ${cmdStr}  # output is ab
```

-----------------------------------

#### 使用正则匹配字符串变量

在 [[ ]] 中进行条件判断

```
str="2016-02-12"
if [[ ${str} =~ ([0-9]+-[0-9]+-[0-9]+) ]]; then echo true; else echo false; fi
# output is true
```

使用正则扩展:

```
if echo ${str}|grep -P '^\d{4}-\d{2}-d{2}$'; then echo true; else echo false; fi
# output is true

if ! echo ${str}|grep -P '^\d{4}-\d{2}-d{2}$'; then echo true; else echo false; fi
# output is false
```

使用 expr 判断:      
expr 是 bash 程序, 可执行. 执行后有 exit code. 可以直接用于 if 判断.

```
str="2016-02-12:hello world!"
# 不匹配返回 0, 匹配则返回最大匹配子串的结束位置
expr match "${str}" .*hello		#output is 16 

# expr 的其他用法
# 截取字符串, 指定起始位置(包含且从1开始)和截取长度. 起点超出范围 exit code 为 1 
expr substr "${str}" 5 10  # output is -02-12:hel
# 获取指定字符的索引下标. 只能识别字符, 不能识别字符串
expr index "${str}" h   # output is 12
```

----------------------------------