
安装 Ubuntu 14.04.2 LTS 64bit

下载镜像后, 将镜像写入到 U 盘中, 用U盘安装.
Windows 下可以下载使用 Win Disk Imager 工具来制作启动盘. 不要再使用UltraISO 了, 会有问题的.
Ubuntu 下直接使用 StartUp Disk Creator 工具完成镜像写入即可. 

安装时, 如果为了快一点, 可以跳过连接 WIFI 的那一步, 可以节省一些下载额外语言和包的时间. 这些可以安装完以后再手动安装. 

完成安装后, 需要安装显卡驱动.  我自己的笔记本是 Nvidia 850M, 如果不安装显卡驱动, 结果就是掌托部分可以煎蛋....
安装驱动不使用官网下载的 xxxxx.run 格式的驱动, 直接使用 apt-get 搞定即可, 非常方便. 
```
sudo apt-get install nvidia-331 nvidia-settings nvidia-prime
```

重启后安装完成, 在 Launcher 中可以找到 nvidia 配置程序, 左边有一项 PRIME xxxx  进去直接切到 Intel 集显. 重启后一切OK.

右手掌托依然很烫, 是硬盘的位置. 我自己配了 WD 的 7500转黑盘, 目前来看是个失误, 实在太烫.
编辑 `/etc/hdparm.conf` 文件, 在最下面加入以下几行: 
```
/dev/sda {
	apm = 128
	apm_battery = 128
}
```
将硬盘转速降低. 128貌似是硬盘不停转情况下的最低值了.  不过要注意 Load/Unload Cycle count 快速增长的问题. 如果因为这个原因导致 Load/Unload Cycle count 增长过快的问题， 可以将设置的值调高到 192

接下来改输入法. 
默认 iBus 的拼音输入法. 拼音做的中规中矩, 词库有限, 词频不合适. 另外 iBus 还有很多 Bug. 比如和火狐浏览器, 比如和 idea, 比如和 sublime 等等....
<s>改用基于 fcitx 的 搜狗拼音输入发一次解决多个问题.</s>

> ps: 用了一段时间搜狗， 感觉非常失望， 拼音的联想功能只能说是脑洞大开。 最后只能祭出神器： 中州韵 RIME 输入法

ubuntu 下 fcitx rime 的安装与配置待续... ...


不建议高级用户使用搜狗输入法， 以下安装方法仍保留， 确有需要的朋友可以参考下。

> 直接搜狗官网下载最新的 deb 包. 
> 双击后会自动调出 ubuntu software center 进行安装. 如果提示 fcitx 版本低, 可以先执行 
> `sudo apt-get update` 更新一下. 
> 安装完成后, 在终端输入 `im-config` , 一路回车进去, 选 fcitx 再一路回车出来. 
> 重启.
> 打开终端, 执行 `fcitx-config-gtk3` , 添加, 去掉only xxx 前面的对勾, 然后搜出 Sogou , 完成添加.
> 完成安装.

> 装完输入法, 不知道什么原因, 会导致系统 settting 下对于 键盘和鼠标的一些选项无法生效. 其中我比较常用的就是设置键盘按键的重复率和重复延迟时间, 以及鼠标移动速度和灵敏度. 
> 键盘设置 : `xset r rate 250 70` . 250是延迟时间 250ms, 70 是重复速率
> 鼠标设置: `xset m 10 3`.  10是加速度, 3是加速阈值.
> 可以将以上两行加到开机启动脚本
> * 有一次遇到过按完输入法后, 使用 `Ctrl + Space` 切换不了输入法的问题, 没有找到解决方案. 如果有知道的同学可以告诉我. 

字体
使用 atom 和 idea 的时候会发现, 已经将字符集设置为 UTF-8 , 但还是不能正常显示中文. 输入中文都显示成一个方块. 
搜了一下发现, 问题在于中文字体.  使用"文泉驿"的字体可以解决这个问题. 
安装文泉驿微米黑字体:
`sudo apt-get install ttf-wqy-microhei`
安装完成后, 在对应的程序中将字体改成  WenQuanYi Micro Hei 即可. 
Atom 可以将字体设置为 : `DejaVu Sans Mono,WenQuanYi Micro Hei`
idea 可以在 settings --> apperance 中打开 Override 并将字体设置成文泉驿



更改系统的按键映射. 
背景  需求:  为了提高效率, 将 上下左右, End, Home, PageUp, PageDown, BackSpace, Delete这些非常常用的按键, 映射到键盘主键区, 否则来回移动右手效率会非常差, 而且容易 Fat Finger.... 

Windows 下可以使用 AutoHotKey 这个软件编译一个按键映射脚本来轻松搞定.

换用Ubuntu后, 一直没有找到合适的方案.  

系统下的键盘设置根本不支持这种需求; 使用 sublime Eclipse Idea 等工具时, 设置按键的映射, 这种方式只能影响一个软件自身环境下的按键, 而很多时候我所需要的是系统全局的. 因为这种便捷的操作很快会成为习惯. AutoKey 这个工具可以实现这个功能, 但是性能实在太差了, 有时候还会崩溃....

终极解决方案: 修改 xbk 

/usr/share/X11/xkb/symbols/pc  中
找到  `Key <CAPS>` 的设置项,  把 symbols 改为 ` [ Mode_switch ] `  把 大写锁定改为模式切换

找到 `Key <RCTL>`, 把 symbols 改为 `[Caps_Lock]` 
找到`modifier_map Control` 项, 将其中的 `Control_R` 删掉
右 Control 不怎么用, 因此用此方式改为大写锁定.

至此, 所有 `CAPS + Any` 会被映射到 Group2 符号组. (模式切换键也可以按照同样的思路改为其他按键, 只要自己觉得习惯, 并且和现有的其他组合键尽量避免冲突即可)

下来需要将我们需要的功能绑定到对应的按键上了, 

/usr/share/X11/xkb/symbols/us 中, 在 basic 定义模块中, 找到 `i` , 对应的是 `Key <AD08>` .
默认的 symbols 是 : `{  [   i,    I    ]   };` 这个是 Group1 中的 Level1 和 Level2.
我们现在需要给他加上 Group2, 并且该 Group2 中只有一个 Level.
`{ [ i, I ] , [ Up ] }` 这样, 我们就将 "i" 键的 Group2 定义为 方向键 上.
同样的道理, 找到别的键, 并设置好自己想要的映射.
我自己使用的映射是:
```
// 默认都是按住 Mod_switch 键的
i --> Up
j --> Left
k --> Down
l --> Right
u --> Home
o --> End
[ --> Prior (PageUp)
; --> Next (PageDown)
d --> BackSpace
f --> Delete
```

全部配置完之后, 保存.

然后进入以下路径 : `/var/lib/xkb` , 将该路经下 所有的 .xkm 文件都删除.
然后 logout, 再重新登录到系统. 此时按键修改完成.

**警告** ： 该方法有风险， 如果配置文件有配置错的地方， 会导致键盘彻底用不了。 出现这种情况时， 我自己的方法是， 用事先准备好的 ubuntu 系统U盘启动， 然后重新检查并修改配置文件， 重复上述操作后， 重新启动进入系统， 如果修改成功， 键盘更能将回复， 否则重新用U盘启动进行修改， 实在不行， 用之前备份的原始配置文件进行替换。

参考资料 : 
http://madduck.net/docs/extending-xkb/
http://www.charvolant.org/~doug/xkb/
http://pascal.tsu.ru/en/xkb/



------------------------------------------------------

配置科学上网 :
我自己习惯使用 shadowsocks, 因为手里刚好有比较好用的  shadowsocks 账号. 
首先需要有 python 环境, 安装 pip.  ubuntu 默认有 python 环境. 所以直接执行 :
`sudo apt-get install python-pip`
然后直接安装 shadowsocks
`sudo pip install shadowsocks`
安装后用 sslocal 启动客户端.
我这里图方便, 创建了一个脚本:
```shell
nohup sslocal -s [你的服务端地址] -p [服务端口] -k [密码] 2>&1 1>/dev/null &
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


配置笔记环境:
喜欢快捷方便好用的 [stackedit](https://stackedit.io/) 在线 markdown 编辑器 + Google Driver 云同步.
其实这个方案也没有用太久, 以前使用 windows 的时候用的是 sublime + 百度的自动同步.
步入正题.  stackedit 虽然是网页版的编辑器, 但其实它是可以支持离线使用的. 编辑的文件也是实时保存在本地的.  可以去 chrome 的 app store 下载 stackedit. 其实还是个网页链接而已. 我都是直接收藏即可.
然后, 需要有一个谷歌账号. 并且开通  Google Drive 服务, 进入页面后创建一个给stackedit 同步用的文件夹. 然后, 在stackedit 页面点击左上角的 LOGO,  点 sychronize , 选择 save on Google Drive.  之后会有一个三方授权的过程, 正常授权后, 选择保存的文件名, 有折叠起来的选项, 还有一个自动同步的功能, 打开它, 然后将保存的文件夹指定为在 Google Drive 上给 stackedit 创建的文件夹. 文件名的位置什么都不填.  实际保存的文件名和 stackedit 右上角的文件名是一致的. 
全部设定成功后, 就可以在这个环境下写东西了, 每隔几分钟就会同步一次. 其实完全不用担心这个时间间隔, 因为 stackedit 本身就是实时保存本地的, 正在写东西的时候直接关掉浏览器也不要紧, 不会丢东西的. 
另外需要注意,  Google Drive 需要跨墙使用. 







> Written with [StackEdit](https://stackedit.io/).
