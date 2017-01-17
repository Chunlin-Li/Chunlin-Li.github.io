我的 Ubuntu 安装配置笔记
================

## 安装 系统 Ubuntu 14.04.2 / 15.10 / 16.04 LTS 64bit

下载镜像后, 将镜像写入到 U 盘中, 用U盘安装.
> Windows 下可以下载使用 Win Disk Imager 工具来制作启动盘. 貌似 14.10 以上的版本不能使用UltraISO 制作启动盘了, 开机引导的时候会有问题的.
> Ubuntu 下直接使用 StartUp Disk Creator 工具完成镜像写入即可. 

安装时, 如果为了快一点, 可以跳过连接 WIFI 的那一步, 可以节省一些下载额外语言和包的时间. 这些可以安装完以后再手动安装. 

如果安装的时候没有链接网络进行更新,  安装完成后, 最好先更新一下系统.     

System Settings  --> Details --> Overview --> Install Updates

## 需要安装的工具:

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
sudo apt-get install vim axel python-pip git polipo fcitx-rime ttf-wqy-microhei unity-tweak-tool guake xsel
sudo pip install shadowsocks
 # 其他权利受限的第三方 lib
sudo apt-get install ubuntu-restricted-extras
sudo apt-get install libdvd-pkg
sudo dpkg-reconfigure libdvd-pkg

```
[参考 Multimedia support in Ubuntu 16.04: how to complete it](https://sites.google.com/site/easylinuxtipsproject/multimedia)

## 完成安装后, 需要安装显卡驱动

我自己的笔记本是 Nvidia GTX 850M, 如果不安装显卡驱动, 结果就是掌托部分可以煎蛋....

安装驱动不使用官网下载的 xxxxx.run 格式的驱动, 直接使用 apt-get 搞定即可, 非常方便. 

```bash
sudo apt-get install nvidia-331 nvidia-settings nvidia-prime
```
还有一种方式, 我自己没有尝试过. (15.10/16.04 LTS)           
打开 System Settings => Software&Updates => Aditional Drivers 中可以自动扫描到显卡的驱动, 选择进行安装即可. 

重启后安装完成, 在 Launcher 中可以找到 nvidia 配置程序, 左边有一项 PRIME xxxx  进去直接切到 Intel 集显. 重启后一切OK. (我自己的目的是要关掉集显)


## 创建新的显示器分辨率模式并应用

有时在 system settings 的 display 中并没有我们想要的分辨率. 此时需要在 显卡, 接口, 线缆, 显示器所共同支持的最大分辨率下, 手动添加新的显示模式.

添加方式如下: [gist 链接](https://gist.github.com/Chunlin-Li/ec3eba625f1115d7d8ac)


## 修改硬盘转速

右手掌托依然很烫, 是硬盘的位置. 我自己配了 WD 的 7500转黑盘, 目前来看是个失误, 实在太烫.
编辑 `/etc/hdparm.conf` 文件, 在最下面加入以下几行:   
```
# /dev/sda 这里要换成你自己的硬盘设备文件
/dev/sda {
	apm = 128
	apm_battery = 128
}
```
将硬盘转速降低. 128貌似是硬盘不停转情况下的最低值了.  不过要注意 Load/Unload Cycle count 快速增长的问题. 反正我的黑盘没有出现这个问题. 如果有问题, 建议设置为 192.

## 中文输入法.

默认 iBus 的拼音输入法. 拼音做的中规中矩, 词库有限, 词频不合适. 

但主要问题是 iBus 还有很多 Bug. 比如和火狐浏览器, 比如和 idea, 比如和 sublime 等等....

<s>改用基于 fcitx 的搜狗拼音输入法可以解决这多个问题. </s>

> 对于开发者, 不推荐使用搜狗拼音输入法, 可以尝试一下 Rime 输入法, 
> 开始的时候我也用搜狗, 后来被坑的不行, 换用 Rime 了, 然后感慨为什么当初不直接用 Rime ....
> 以下搜狗拼音输入法的安装方法仍保留,  [fcitx Rime 输入法的安装及简单的配置请走这边.](https://github.com/Chunlin-Li/Chunlin-Li.github.io/blob/master/blogs/linux/ubuntu-fcitx-rime.md)

* 直接搜狗官网下载最新的 deb 包. 
* 双击后会自动调出 ubuntu software center 进行安装. 如果提示 fcitx 版本低, 可以先执行 
`sudo apt-get update` 更新一下. 
* 安装完成后, 在终端输入 `im-config` , 一路回车进去, 选 fcitx 再一路回车出来. 
重启.
* 打开终端, 执行 `fcitx-config-gtk3` *
* 在首个tab的列表下点击添加, 去掉only xxx前面的对勾, 然后搜出 Sogou Pinyin, 完成添加.
* 完成安装.

装完 fcitx 后, 不知道什么原因, 会导致系统 settting 下对于 键盘和鼠标的一些选项无法生效. 其中我比较常用的就是设置键盘按键的重复率和重复延迟时间, 以及鼠标移动速度和灵敏度. 

* 键盘设置 : `xset r rate 250 70` . 250是延迟时间 250ms, 70 是重复速率
* 鼠标设置: `xset m 10 3`.  10是加速度, 3是加速阈值.

可以将以上两行加到开机启动脚本 ( 如 /etc/rc.local ) 中.   也可以用 StartUp Application: 

* 在系统的 Launcher 中能找到 StartUp Applications, 
* 可以在自己的 home 目录下, 添加一个 startup.sh 脚本, 并将其添加到上述程序的启动列表中, 其实和 windows 下开始菜单中的'启动'目录类似.

> 有一次遇到过安完输入法后, 使用 `Ctrl + Space` 切换不了输入法的问题, 检查了所有可能的快捷键设置项, 没有找到解决方案. 如果有知道的同学可以告诉我.  

## 字体
使用 atom 和 idea 的时候会发现, 已经将字符集设置为 UTF-8 , 但还是不能正常显示中文. 输入中文都显示成一个方块. 搜了一下发现, 问题出在中文字体上面.  

使用"文泉驿"的字体可以解决这个问题. 安装文泉驿微米黑字体:
`sudo apt-get install ttf-wqy-microhei`
 
安装完成后, 在对应的程序中将字体改成  WenQuanYi Micro Hei 即可. 
> Atom 可以将字体设置为 : `DejaVu Sans Mono,WenQuanYi Micro Hei`
> idea 可以在 settings --> apperance 中打开 Override 并将字体设置成文泉驿
> chrome 在 setting 的 advance 选项中可以自定义字体, 全部换成文泉驿


## 更改系统的按键映射. 

为了提高效率, 将 上下左右, End, Home, PageUp, PageDown, BackSpace, Delete这些非常常用的按键, 映射到键盘主键区, 否则来回移动右手效率会非常低. 如果再配备一个 60% 的机械键盘, 加以训练和适应, 将会大大提高操作效率, 而且非常有逼格.

曾经在 Windows 下可以使用 AutoHotKey 这个软件写一个按键映射脚本来轻松搞定全局映射的修改.
换用Ubuntu后, 一直没有找到合适的方案.  
系统下的键盘设置根本不支持这种需求; 使用 sublime Eclipse Idea 等工具时, 设置按键的映射, 这种方式只能影响一个软件自身环境下的按键, 而很多时候我所需要的是系统全局的. 因为这种便捷的操作很快会成为习惯. AutoKey 这个工具可以实现这个功能, 但是性能实在太差了, 有时候还会崩溃....

终极解决方案: 修改 xbk 配置!

使用命令查看当前的键盘方案 : `setxkbmap -print` 
我这里显示的是:
```js
xkb_keymap {
	xkb_keycodes  { include "evdev+aliases(qwerty)"	};
	xkb_types     { include "complete"	};
	xkb_compat    { include "complete"	};
	xkb_symbols   { include "pc+us+inet(evdev)"	};
	xkb_geometry  { include "pc(pc105)"	};
};
```
留意 xkb_symbols 这行, 其中显示是  pc + us. 说明我们需要修改的就是这两个 symbols 文件
配置文件的位置 :  `/usr/share/X11/xkb/symbols/`  

在 pc 中找到  `Key <CAPS>` 的设置项,  把 symbols 改为 ` [ Mode_switch ] `  把 大写锁定改为模式切换

找到 `Key <RCTL>`, 把 symbols 改为 `[Caps_Lock]` 
找到`modifier_map Control` 项, 将其中的 `Control_R` 删掉
右 Control 不怎么用, 因此用此方式改为大写锁定.

至此, 所有 `CAPS + Any` 会被映射到 Group1 符号组. (模式切换键也可以按照同样的思路改为其他按键, 只要自己觉得习惯, 并且和现有的其他组合键尽量避免冲突即可)

下来需要将我们需要的功能绑定到对应的按键上了,  需要编辑 us 文件.
在 `xkb_symbols "basic" ` 定义模块中, 找到 `i` , 对应的是 `Key <AD08>` .
默认的 symbols 是 : `{  [   i,    I    ]   };` 这个是 Group1 中的 Level1 和 Level2.
我们现在需要给他加上 Group2, 并且该 Group2 中只有一个 Level.
`{ [ i, I ] , [ Up ] }` 这样, 我们就将 "i" 键的 Group2 定义为 方向键 上.
同样的道理, 找到别的键, 并设置好自己想要的映射.
我自己使用的映射是:
```
// 默认都是按住 Mod_Switch 键的
i --> Up
j --> Left
k --> Down
l --> Right
u --> Home
o --> End
p --> Prior (PageUp)
; --> Next (PageDown)
d --> BackSpace
f --> Delete
```

全部配置完之后, 保存.

然后进入以下路径 : `/var/lib/xkb` , 将该路经下 所有的 .xkm 文件都删除. (对于 16.04 版本不需要这一步)
然后 logout, 再重新登录到系统. 此时按键修改完成.

参考资料 : 

* [http://madduck.net/docs/extending-xkb/](http://madduck.net/docs/extending-xkb/)
* [http://www.charvolant.org/~doug/xkb/](http://www.charvolant.org/~doug/xkb/)
* [http://pascal.tsu.ru/en/xkb/](http://pascal.tsu.ru/en/xkb/)



------------------------------------------------------

### 配置科学上网 :

我自己习惯使用 shadowsocks, 因为手里刚好有比较好用的  shadowsocks 账号.

首先需要有 python 环境, 安装 pip.  ubuntu 默认有 python 环境. 所以直接执行 :      
`sudo apt-get install python-pip`

然后直接安装 shadowsocks        
`sudo pip install shadowsocks`

安装后用 sslocal 启动客户端. 我这里图方便, 创建了一个脚本:      
```shell
nohup sslocal -s [你的服务端地址] -p [服务端口] -k [密码] &
```

然后运行脚本,  本机的  1080 端口就可以用于科学上网了. 

Ubuntu 中提供了全局代理的功能.  按 `Win` 键打开 Launcher, 输入 Network 打开网络配置工具,              
然后选择  Network  Proxy , 在右侧将 Method 改为 Manual , 在 Socks Host 一项中填写 "127.0.0.1" 和 1080 端口 , 然后  Apply System Wide , 就可以全局跨墙了.
 
全局的用起来其实不是很方便.  上网什么的, 也不是全都翻就一定好.    
安装 谷歌浏览器, 可以在 Ubuntu 软件中心安装 Chromium , 也可以去下载 Chrome.   

安装后启动浏览器, 打开 App stroe, 搜索 SwitchyOmega 插件, 下载次数最多的那个就是. 安装.  记得此时需要打开之前配置好的全局代理.      
安好插件后, 需要配置 proxy , 直接在 defualt 配置上修改就好, 协议为 SOCKS5, Server为 127.0.0.1, 端口为 1080 .

然后, 重点是配置 Auto Switch,    
rule list rules 那行设置为 proxy , 下面一行的  default 设置为 direct 表示不使用代理.      
rule list Configure 选择 auto proxy , 然后在 rule list url 栏中复制粘贴 下面的地址         
`http://autoproxy-gfwlist.googlecode.com/svn/trunk/gfwlist.txt`

然后点 download profile, 下载成功后能看到切换规则.  (注意此时也需要保持全局的 proxy ).       
这样就搞定了, 关闭系统的 全局 proxy, 然后将打开插件的 auto proxy , 就可以有选择的走代理了. 

**使用 polipo 将 shadowsocks 转为 http 代理**

修改 `/etc/polipo/config` 文件如下.

```
# This file only needs to list configuration variables that deviate
# from the default values.  See /usr/share/doc/polipo/examples/config.sample
# and "polipo -v" for variables you can tweak and further information.

logSyslog = true
logFile = /var/log/polipo/polipo.log

proxyAddress = "127.0.0.1"
proxyPort = 12345
socksParentProxy = 127.0.0.1:12345
socksProxyType = socks5

```



配置笔记环境:
喜欢快捷方便好用的 [stackedit](https://stackedit.io/) 在线 markdown 编辑器 + Google Driver 云同步.        

步入正题.  stackedit 虽然是网页版的编辑器, 但其实它是可以支持离线使用的. 编辑的文件也是实时保存在本地的.  可以去 chrome 的 app store 下载 stackedit. 其实还是个网页链接而已. 我都是直接收藏即可.
然后, 需要有一个谷歌账号. 并且开通  Google Drive 服务, 进入页面后创建一个给stackedit 同步用的文件夹. 然后, 在stackedit 页面点击左上角的 LOGO,  点 sychronize , 选择 save on Google Drive.  之后会有一个三方授权的过程, 正常授权后, 选择保存的文件名, 有折叠起来的选项, 还有一个自动同步的功能, 打开它, 然后将保存的文件夹指定为在 Google Drive 上给 stackedit 创建的文件夹. 文件名的位置什么都不填.  实际保存的文件名和 stackedit 右上角的文件名是一致的. 
全部设定成功后, 就可以在这个环境下写东西了, 每隔几分钟就会同步一次. 其实完全不用担心这个时间间隔, 因为 stackedit 本身就是实时保存本地的, 正在写东西的时候直接关掉浏览器也不要紧, 不会丢东西的. 
另外需要注意,  Google Drive 需要跨墙使用. 


### ssh 远程访问服务器

没配置什么 ssh 的客户端. 还是最习惯使用 ssh 命令来链接远端服务器. 

原始方式: `ssh usernameOnServer@your.server.host.ip` , 然后输入密码

将本机的 key 添加到服务器, 避免每次输入密码. 而且总的来说更加安全: 
```bash
ssh-keygen -t rsa  # 为了省事的可以一路回车全部选默认值. 
cd ~/.ssh  # 进入自己电脑 home 下的 .ssh 文件夹
ssh-copy-id -i ./id_rsa.pub usernameOnServer@your.server.host.ip
# 然后输入 server 对应用户的密码
# 成功后会有提示信息
ssh usernameOnServer@your.server.host.ip
# 不用输密码直接登录进去了? OK, 成功了!
```

什么?  IP地址记不住, 而且没有好记的域名?
```bash
sudo vim /etc/hosts   # 编辑 hosts  绑定自己喜欢的助记符
# 根据里面已有文件的格式 添加新的行即可, 比如
121.122.123.124		myServer
# 保存退出
ssh usernameOnServer@myServer
# 成功
```

使用频率太高了, 希望能更方便一点?   直接添加 alias 吧! 
```bash
vim ~/.bashrc
# 在其中添加一行 alias
alias goMySrv 'ssh usernameOnServer@myServer'
# 保存退出
source ~/.bashrc
# 使其生效
goMySrv
# OK, 链接上了! 不能更方便了!
```

---------------------------------------------------

### Google Chrome 下创建APP启动的快捷方式

有些东西希望能直接打开而不要先开 Chrome 再去找到要开的东西, 太麻烦.

对于 APP, 在 Chrome 的 APP 列表中, 右键点击图标可以直接选择 `create shortcuts` 创建

对于非 APP 类的, 比如网页微信, 比如 Bing词典, 可以在浏览器中打开该页面. 然后在 Chrome 的菜单栏中 => File => Create application Shortcuts 创建.

创建时有两个选项, Desktop 是在桌面创建启动图标, Application Menu 就是按 <kbd>Win<kbd> 键后出现的应用程序菜单

通常我都是用后者, 因为直接 <kbd>Win<kbd> + 名称前缀就能迅速在任何情况下打开 APP, 非常方便.    
如果由于 APP 名称中带中文可以用如下方法修改: 
```
# 路径
~/.local/share/applications
# 打开 chromexxxxx.desktop 文件, 查看 Name 属性可以判断是什么APP, 直接将 Name 修改成自己希望的名字即可. 尽量保证前缀唯一, 可以用最快的方式启动.
```

------------------------------------------------------

## MacBook Pro 12-1 上 安装 Ubuntu 15.10 / 16.04 LTS

网上有很多安装教程, 都是如何安装双系统, 但是我想要安装一个纯净的 Ubuntu.

其他有关 Mac 上安装 Ubuntu 的文章: 

https://help.ubuntu.com/community/MacBookPro12-1/Wily     


主要的问题集中在安装后的引导. 由于需要将磁盘全部格式化, 因此, 重点在与安装 Ubuntu 时的分区方式.

1. 首先保证磁盘的分区表是 gpt 而不是其他. 使用 gparted, parted, fdisk 等工具都可以查看.
2. 将所有分区删除, 重新创建分区. 
3. 首先需要一个 ESP(EFI System Partition) 分区. [创建ESP分区的参考](https://help.ubuntu.com/community/UEFI#Creating_an_EFI_System_Partition)
	这里简述一下: 推荐使用 gparted 创建ESP分区, 在 Live 系统下, 通过 Launcher 启动 gparted 图形化工具, 在目标磁盘上创建首个新分区, 类型 primary, 格式 FAT32, 大小200MB.
	创建后应用, 使修改生效. 然后选定刚才的分区, 在 partition 菜单下有一个 flag manage 选项, 打开后选定 ESP(EFI System Partition) 项, 然后应用修改. 这样就完成了 ESP 分区的创建.
4. 然后直接启动 Ubuntu 的安装, 在分区的地方选择进行手动分区, 不要对ESP分区进行改动或设定 mount point. 直接在 free space 上继续进行分区操作.
5. 按照自己的需要去分配即可, 比如我是 120GB 的 / 分区(ext4), 剩下的都是 swap 分区. 
6. 完成分区后开始安装系统, 注意系统完成后 **先不要点击重启按钮**.
7. 系统安装过程中, 我们可以安装 efibootmgr 工具, `sudo apt-get install efibootmgr`. 如果是 live 中, 直接开个终端, 如果不是, 可以使用 <kbd>ALT</kbd> + <kbd>CRTL</kbd> + <kbd>F1-6</kbd> 进入非图形终端. 默认的用户名是 ubuntu, 密码为空. 
8. 执行 `efibootmgr` 显示当前系统的 efiboot 信息, Mac 系统默认是 Boot0080, BootOrder 是 0080 即默认直接启动 Mac 系统. 
9. Ubuntu 安装过程完毕后重新再执行 `efibootmgr` 命令, 会出现一个新的 Boot 启动项, 可能会带有 Linux 的标签, BootOrder 自动变成 xxxx,0080, 其中 xxxx 对应 Linux 启动项的 hex 编号.
10. 如果 BootOrder 没有自动改变, 需要使用 `efibootmgr -o xxxx,0080` 来手动设定新的 BootOrder, xxxx是 Linux 启动项的 hex 编号, 比如我的是 0001.
11. 重启, Mac 将引导进入 Ubuntu 15.10 / 16.04

注: 15.10 版本之前的 Ubuntu 安装在 Mac 上后, 有可能出现 WIFI 无法正常驱动, 屏幕亮度不能调节, 触摸板没有滚动功能等问题. 

#### 在 Ubunutu 下制作 Ubuntu 系统安装 USB disk 的方式

<del>系统中有  StartUp Disk creator, 但是总觉得不太好用      

可以使用 Disk 工具, 直接选中 USB Disk, 在右侧的设置按钮中, 找到 Restore Disk Image 项打开, 选定 ISO 文件, 直接 Restore 即可.<del> 

注意上述这种方式制作的 USB Disk 不能再写入其他文件.
 
`StartUp Disk creator` 其实挺好用的. 之前我自己的 U 盘分区被搞坏了, 在 creator 中一直无法直接写入. 
我也忘记分区表是如何被一步一步玩坏的了. 这种情况下对其格式化可能是没有用的. 可以尝试用 `dd if=/dev/zero of=/dev/sdxx bs=4096 count=10240` 把靠前的位置重新擦一遍, 然后就可以正常格式化并使用了.

## 解决苹果键盘的布局带来的问题

ubuntu 15.10/16.04 has some config file about mac keyboard options, the path is `/sys/module/hid_apple/parameters`.    
There are three file in that fold :  fnmode  iso_layout  swap_opt_cmd

### fnmode : 

0 = disabled : Disable the fn key. Pressing <fn+F8> will behave like you only press F8

1 = f-keys last : Function keys are used as last key. Pressing F8 key will act as a special key. Pressing <fn+F8> will behave like a F8.

2 = f-keys first : Function keys are used as first key. Pressing F8 key will behave like a F8. Pressing <fn+F8> will act as special key (play/pause).

将该值设置为 2 将会使得 Fx 优先触发, 而对应的特殊功能则需要使用 fn + Fx 键触发.

### iso_layout :

1 is default. the `|~ key will not work correctly, it will produce <|> characters.

将该值设置为 0 可以使键盘映射恢复正常   

### swap_opt_cmd :

The Mac has command key, and the alt(option) key and command key is different from general position.

this value is 0 (default).  

将该值设置为 1, 可以交换键盘上的 alt 键和 command 键.

以上设定通过 `echo X > /sys/module/hid_apple/parameters` 方式 root 权限修改.    
如果需要永久修改该值. 建议将上述命令写在 `/etc/rc.local` 中.  这样,即使在尚未登录的时候, 也可以使修改生效.



## 对于 ubuntu 16.04 以后的版本, /etc/rc.local 弃用, 需要使用 systemd 来实现自启动的任务.

1. 在 /etc/systemd/system 路径下创建文件 rc-local.service
文件中输入以下信息: 

```
[Unit]
Description=/etc/rc.local Compatibility

[Service]
Type=oneshot
ExecStart=/etc/rc.local

[Install]
WantedBy=multi-user.target

```

然后执行 chmod a+x rc-local.service

2. 创建 /etc/rc.local 文件, 并 chmod a+x 设置执行权限.
文件中输入以下信息:
```
#!/bin/sh -

your command.....
do something.....
```

3. 执行 systemctl enable rc-local.service

4. 重启, 确认 rc.local 脚本已按预期执行.



> Written with [StackEdit](https://stackedit.io/).
