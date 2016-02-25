

#### Ubuntu Linux 命令提示符 格式修改

编辑当前用户的 home 路径下的 .bashrc 文件

```bash
if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
#    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '    this is default settings
     PS1='${debian_chroot:+($debian_chroot)}\u : \W\$ '     this is set the prompt to  user : currentDir$ ls
fi
```

格式设置参考[这里](http://www.faqs.org/docs/Linux-HOWTO/Bash-Prompt-HOWTO.html)


----------------------------------------------

#### 使用 sed 将一行中的特定部分切出来. 

extract substring by pattern. regex

```
cat xxxxx |grep xxxx | sed -n 's/REGEX_FULLLINE/\1/p'
```

例: 

```
echo "regular expression - extract part of string using sed" |sed -n 's/.*- extract \(.*\) using.*/\1/p'
```
在 `regular expression - extract part of string using sed` 中截取 - extract 和 using 中间的部分    
`-n` 表示关闭 sed 的自动打印 pattern space 的功能     
最后的 `p` 表示对于执行了替换的行进行打印.    

注意 sed 中正则表达式需完全匹配整行内容, 因此首尾的 `.*` 用来使 sed 能够正确匹配到目标行, 不能省略!

------------------------------------------

#### 文本排序

sort 命令

----------------------------------

#### 文件分割

使用 split 工具.

```
# 将 MyFile.txt 拆成每 100 行一个文件的小块. 文件命名前缀: MyFile.part- , 后缀自动生成, 使用字母排序.
split -l 100 MyFile.txt MyFile.part-
```
-l : 按行拆分  
-b : 按字节拆分  
-C : 按字节拆分, 但不会将一行拆开(非精确).   可以使用 K M 等表示单位   
-n : 将文件平均拆成 n 份


-------------------------

#### 管道连接命令

xargs 工具 默认是单线程执行,如果要使用多线程并行执行, 需要 `-P N` 参数, 其中N是期望使用的线程数.   

xargs -n 指定有标准输入传递进来的最大参数数量.  通常使用 `-n 1`

xargs -I {} 输入的参数的替代字符串, 可以用于指定输入参数在目标执行命令中的位置. 如 `cat words.txt | xargs -n1 -I{} grep {} file.txt`

-------------------------------

#### nginx 使用 htpasswd 添加用户验证功能

[参考文档](https://www.digitalocean.com/community/tutorials/how-to-set-up-http-authentication-with-nginx-on-ubuntu-12-10)

1. 安装 htpasswd:  `sudo apt-get install apache2-utils`
2. 创建用户和密码并创建验证信息文件 : `sudo htpasswd -c /etc/nginx/.htpasswd John`  /etc/nginx/.htpasswd 是保存用户验证信息的文件路径.
3. 继续添加用户 : `sudo htpasswd -n Tom`  在 STDOUT 会输出user:password 格式的信息, 将其追加到上一步生成的配置文件中即可. 注意不要反复使用 -c 参数反复创建文件.
4. 编辑 ngixn 配置文件, 在需要的 Block 范围中(比如 location 或 server 等)添加验证配置:
```
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
```
5. 保存配置并重启 nginx. 
6. 以后再向用户配置文件中添加新的用户时, 不需要重启 Nginx 也可生效.

-------------------------------

#### 抓包工具 tcpdump

```
tcpdump -q src port 8080    
获取已本机 8080 端口作为源的数据传输包简要信息.
-q 是 quiet, 显示简要信息.
src 指定源, 可以换成 dst 指定目的地.
port 指定端口, 如果是指定特定主机, 可以换成 host

```

----------------------------------

####  压缩解压

```shell
# 7z
# compress
7za a -t7z compressed.txt.7z origin.txt
#decompress
7za x compressed.txt.7z

# gzip  (replace origin file)
# compress
gzip origin.txt
# decompress
gzip -d origin.txt.gz

# bzip2  (replace origin file)
# compress
bzip2 origin.txt
# decompress
bzip2 -d origin.txt.bz2

-1...9  fast to best, the block size 100K to 900K
-k keep the input file

```

-------------------------

#### Linux soft RAID

使用 mdadm 工具.  apt-get install mdadm

用于做 RAID 的磁盘, 可以是分区并格式化之后的, 比如 sda1 sdb1 等.

所用的磁盘需要 umount 掉. 

```
# RAID0
mdadm --create --verbose /dev/md0 --level=stripe --raid-devices=2 /dev/sda1 /dev/sdb1

# RAID5
mdadm --create --verbose /dev/md0 --level=5 --raid-devices=3 /dev/sda1 /dev/sdb1 /dev/sdc1

# RAID10
mdadm --create /dev/md0 --level=10 --raid-devices=4 --layout=f2 /dev/sda1 /dev/sdb1 /dev/sdc1 /dev/sdd1

```
RAID10 有不同的 layout 选项需要注意, 默认n (near), o(offset), f(far)  默认值 n2.    
有关详细资料参考[这里](https://en.wikipedia.org/wiki/Non-standard_RAID_levels#cite_note-suse-raid-9)    
性能对比参考[这里](http://blog.jamponi.net/2007/12/some-raid10-performance-numbers.html)和 [这里](http://www.ilsistemista.net/index.php/linux-a-unix/35-linux-software-raid-10-layouts-performance-near-far-and-offset-benchmark-analysis.html?start=1)


通过 `cat /proc/mdstat` 可以查看 RAID 的状态, 包括 raid5 的 build 进度.

创建完成后, 对 /dev/md0 设备进行格式化,  `mkfs.ext4 /dev/md0`

挂载后即可使用了. 

## 删除

首先, 将对应的RAID umount 掉. 

然后停掉 RAID `mdadm --stop /dev/md0`

然后将 RAID 删除 `mdadm --remove /dev/md0`

然后将物理磁盘的 super-block 信息清除
```
mdadm --zero-superblock /dev/sda1
mdadm --zero-superblock /dev/sdb1
...
```

删除完成,  此时可以使用清掉的盘重新再做其他的 RAID.

参考链接:

[RAID setup wiki](https://raid.wiki.kernel.org/index.php/RAID_setup)    
[mdadm-cheat-sheet](http://www.ducea.com/2009/03/08/mdadm-cheat-sheet/)    

--------------

#### 时间工具

[date man page](http://man7.org/linux/man-pages/man1/date.1.html)   
[coreutil detail docs](http://www.gnu.org/software/coreutils/manual/html_node/date-invocation.html#date-invocation)    
--date 参数使用的 [Date Input String Docs](http://www.gnu.org/software/coreutils/manual/html_node/Date-input-formats.html#Date-input-formats)   
[15 examples](http://www.thegeekstuff.com/2009/03/15-practical-linux-find-command-examples/)  

获取N天前的日期
```
date --date="-N days" +"%Y-%m-%d"
```

