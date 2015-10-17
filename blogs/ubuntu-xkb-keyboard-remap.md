Ubuntu 14.04 下通过 XKB 修改键盘映射, 实现自定义按键
============================


XKB :  全称 X Keyboard Extension, 是 Liunx 下管理键盘输入的一套较为复杂的系统.
Ubuntu 14.04 采用这套系统来支持图形界面下的键盘管理.

### 几个基本概念
**key code** : 键盘上按键的物理代号或者说是物理座标， 比如Q键是 `<AD01>`, 我们可以改变它的映射，让Q键变成A键， 但是这个键的 Key code 还是 `<AD01>`。

**key symbols** : 表示按键的实际意义， 比如 `<AD01>` 只是一个键盘上按键的位置， 而字母Q是一个具有实际意义的符号, 当 key code 和 key symbols 建立关联后, 按下 `<AD01>` 位置的按键, 就会输入一个字母 Q.

按键和符号建立了联系, 可是, 我们一个按键上可不止一种符号.  比如, 小写的 q 和 大写的 Q 都是在一个按键上, 这就需要引入以下的概念了

**level** : 我们键盘上的按键, 通常都是通过切换 level 来实现的, 比如 小写字母是 level 1 , 而大写字母是 level 2. 通常只有 2 个 level , 但是我们也可以增加更多的 level 来让一个按键可以表示更多的意义. 

**group** :  作用类似于 level, 但一般是用于切换整个字符集. 比如要用键盘输入日语啥的.

**modifier key** :  起修饰作用的键, 比如常见的 `Shift`,  `Ctrl`, `Caps Lock` 都属于修饰键.


### 基本的配置修改步骤

> 这里以我自己的使用习惯为例, 介绍一下 xkb 的比较简单的配置修改方式. 注意这并不是唯一的修改方式.
 
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

留意 xkb_symbols 这行, 其中显示是  pc + us. 说明我们需要修改的就是这两个 symbols 文件 inet 一般用不到.

根据之前介绍的概念, 我们修改按键映射, 其实就是修改 key code 和 key symbols 之间的映射关系, 这个映射关系主要保存在以下路径下:

配置文件的位置 :  `/usr/share/X11/xkb/symbols/`

在以上路径下可以找到 pc 和 us 两个文件.  

> **_强调一下: 注意备份原始的配置文件, 否则改键失败有可能只能重装系统了_**

使用 vim 等编辑器打开 pc 文件, 会看到类似如下结构

```
default  partial alphanumeric_keys modifier_keys
xkb_symbols "pc105" {
	include "pc(editing)"
	key <LCTL> {  [ Control_L ]  };
};
```

其中前两行的部分是这个区块的头, 可以类比与编程语言中函数或方法的概念. 那这两行其实就是函数(方法)的声明(签名). 

花括号中的部分是主体内容. 

include 的功能就是其字面意思, 将其他部分的内容包含进来. 小括号左边的部分即例子中的 pc , 其实就是当前我们编辑的这个文件, 当然他也可以是别的 symbols 文件夹下的文件名. 而小括号内的部分是前面的名称指定的文件中的一个区块名称. 这里引入的是 pc 中的 editing 区块, 它其实就在这个文件的最后面.  而我们当前所在的区块, 按照这种命名方式就应该是  pc(pc105) 了.

第四行就是定义按键实际意义的部分了. 左边的格式固定为  key <**key code**>, 表示要定义哪个物理按键. 右边的花括号中包含其按键意义, 一个中括号是一个 *group*, 也可以定义多个 group, 可以这样跟在后面写， 中括号内是不同 Level 的意义, level 的个数最多支持 8 个: 
```
key <xxx> { [ level 1 , level 2, level3, ... ], 
			[ level 1 , level 2 ] }
```

---------------------------------------------------

我要在 pc(pc105) 中找到  `Key <CAPS>` 的设置项,  把 symbols 改为 ` [ Mode_switch ] `. 这样, 就把大小写切换键改为模式切换键. (模式切换键可以用于将一个按键的符号意义切换到 group 2)

接下来找到 `Key <RCTL>` 这行, 把 symbols 改为 `[Caps_Lock]`. 这是因为右边的 Ctrl 键我几乎不会用到, 因此把它改成大小写切换键.

然后找到找到`modifier_map Control{ Control_L, Control_R };` 这行. 意思是说, 通用的 Control 修饰键可以由 Control_L 和 Control_R 来触发. 我将其中的 `Control_R` 删掉, 因为我要让右边的 Ctrl 键实现大小写切换的功能来替代 Caps Lock 键.

至此, 所有 `CAPS + AnyKey` 会被映射到这个键的 Group1 符号组. (模式切换键也可以按照同样的思路改为其他按键, 只要自己觉得习惯, 并且和现有的其他组合键尽量避免冲突即可)

下来需要将我需要的功能绑定到对应的按键上了,  需要编辑 us 文件, 这是 English us 键盘布局. 这个文件的结构与 pc 类似, 只不过要长得多.

虽然 us 文件很长, 但是我所要实现的功能只需要关注 `us(basic)` 区块就足够了.

`key <AD08> { [ i, I ] };` 这行, 我需要让 `Caps Lock + i` 变成方向键上, 我只需将其改成 :

```bash
key <AD08> { [ i, I ], [ Up ] }; 
```

第二个中括号就是 group 2 了, 其中只包含一个 Up, 就是说这个 group 中只有一个 Level 1. 

同样的道理, 找到别的键, 并设置好自己想要的映射.
我使用的映射是:
```bash
// 默认都是按住 Mode_switch 键 (即改后的 Caps Lock) 的
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

// 在 Poker 2 这种紧凑的键盘上, 
数字键 1-0 以及 - = 键依次加上  F1 - F12 键

```

全部配置完之后, 保存.

---------------------------------------

**注意: 接下来的步骤有可能导致系统不能正常使用. 没有 Linux 使用经验的朋友请在高手指导下操作, 或者做好重装系统的准备.**

现在需要让系统重新编译配置文件, 我们进入以下路径: 
 `/var/lib/xkb` ,
将该路经下所有的 .xkm 文件都删除.
然后 logout 注销用户, 再重新登录到图形界面. 如果一切顺利, 此时按键修改完成.

但是, 哪来那么多一切顺利? 你很有可能碰到以下两种情况:

1. 键盘还是原先的老样子, 按键并没有修改成功
	恭喜你, 虽然没有成功, 但至少不算最糟. 这种情况一般是由于某些配置步骤遗漏, 致使 group 2 没有被正常触发. 用户登录界面, 即输密码的界面右上角, 有个星星状图标, 点以下打开屏幕虚拟键盘, 看看 Caps Lock 键有没有按照预期发生改变, 比如 Mode_switch 按键在这里会显示 `AltGr`. 仔细检查配置文件后重新来过.
2. 键盘上的所有按键都完全没有任何反应, 只有鼠标能动
	呵呵, 这种情况我真的只能呵呵了, 由于水平有限, 我自己的解决方案是, 用 ubuntu 启动 U 盘启动, 进入试用, 然后通过挂载上来的原磁盘, 找到配置文件仔细检查, 这种问题一般是由于格式错误, 括号写反等低级错误导致, 也有是因为配置了一种 xkb 不支持的映射, 找到他们, 尝试修改, 重新再试.
	如果实在搞不定, 直接恢复成之前备份的配置文件, 放弃改键吧. xkb 的难用是出了名的. 替换完后删掉 .xkm 文件重启就 OK 了.


### 另一种可能的键盘配置, 适用于 Mac 笔记本   2015-10-17 更新

Caps Lock --> Control     ( 交换keycode )
ALT R --> Mode Switch    (右 Alt 变 MDSW,  原 MDSW 注掉)

上下左右 Home End PageUp PageDown  仍然映射为 Mode Switch + 右手区域的按键, 如之前的方案. 

MAC 需要将左侧的 Command 和 Alt 交换位置,  右侧 Command 映射为 Mode,  相对比较复杂.

详细的配置方式参考代码片段: 

/usr/share/X11/xkb/symbols/us 的配置和最初的一样, 不需要修改. 

/usr/share/X11/xkb/symbols/pc 的关键代码如下: 

```
	key  <TAB> {        [ Tab,  ISO_Left_Tab    ]       };
    key <RTRN> {        [ Return                ]       };

    key <CAPS> {        [ Caps_Lock             ]       };
    key <NMLK> {        [ Num_Lock              ]       };

    key <LFSH> {        [ Shift_L               ]       };
    key <LCTL> {        [ Control_L             ]       };
    key <LWIN> {        [ Super_L               ]       };

    key <RTSH> {        [ Shift_R               ]       };
    key <RCTL> {        [ Control_R             ]       };
    key <RWIN> {        [ Super_R               ]       };
    key <MENU> {        [ Menu                  ]       };
// 注: 以上代码都保持不变, 否则更换不同布局的键盘会导致越改越乱的情况.

	// Beginning of modifier mappings.
    modifier_map Shift  { Shift_L, Shift_R };
    // modifier_map Lock   { Caps_Lock };
    modifier_map Control{ Control_L, Control_R };
    modifier_map Mod2   { Num_Lock };
    modifier_map Mod4   { Super_L, Super_R };
// 注: 以上部分只需将 Lock 的那行注掉不用就行. 其他的也不做更改.

    key <ALT>  {        [ NoSymbol, Alt_L       ]       };
    // include "altwin(meta_alt)"
    key <LALT> {        [ Alt_L, Meta_L         ]       };
    key <RALT> {        [ Mode_switch           ]       };
    modifier_map Mod1 { Alt_L, Meta_L };
// 注: 原有的 include 的配置直接拿过来做修改, 这样就不再依赖 altwin 配置文件.
// 注意 RALT 的对应 Symbol 改成 MDSW 了, 另外, Mod1 中和 RALT 有关的都删掉.

    // Fake keys for virtual<->real modifiers mapping:
    key <MDSW> {        [ Mode_switch           ]       };
    modifier_map Mod5   { <MDSW>, <RALT> };
// Mod5 中根据需要将 RALT 加进来,

```

/usr/share/X11/xkb/keycodes/evdev   主要是修改 keycode 到 对应变量的映射. 涉及具体键盘布局的问题, 主要是要修改这个文件.

```
        // <CAPS> = 66;
        <RCTL> = 66;
// 将 CAPS 替换成 RCTL        
        // <RCTL> = 105;
        <CAPS> = 105;
// 将 RCTL 替换成 CAPS        
        // <RALT> = 108;
         <MDSW> = 108;
        // <MDSW> =   203;
// 将 RALT 替换成 Mode Switch
```

如果是Mac键盘,   evdev 配置如下
```
        // <CAPS> = 66;
        <RCTL> = 66;
        // <RCTL> = 105;
        <CAPS> = 105;
// 交换 CAPS 和 RCTL 键, 其实 RCTL 几乎很少用
        // <LALT> = 64;
        <LWIN> = 64;
        // <LWIN> = 133;
        <LALT> = 133;
// 交换左Command 键和 Alt 键                
        // <RALT> = 108;
        <PRSC> = 108;
        // <PRSC> = 107;
// RALT 也没什么用了, 干脆换成 Print Screen
        // <RWIN> = 134;
        <MDSW> = 134;
        // <MDSW> =   203;
// RCOMMAND 键设置为 Mode Switch

```

### xkb 的导出和导入

当前配置导出 :   
```
xkbcomp $DISPLAY myxkb.dump
// 导出的文件是文本, 可编辑, 但结构比较复杂.
```
导入配置:
```
xkbcomp myxkb.dump $DISPLAY
```
直接切换配置文件并生效:   可以参考文末第一篇引用文章.
```
setxkbma -keycodes [keycodes配置文件名] -print | xkbcomp - $DISPLAY
```




以上都是低级用法, 更详细的文档和指导请参考这里 : 

* [http://madduck.net/docs/extending-xkb/](http://madduck.net/docs/extending-xkb/)
* [http://www.charvolant.org/~doug/xkb/](http://www.charvolant.org/~doug/xkb/)
* [http://pascal.tsu.ru/en/xkb/](http://pascal.tsu.ru/en/xkb/)


> Written with [StackEdit](https://stackedit.io/).