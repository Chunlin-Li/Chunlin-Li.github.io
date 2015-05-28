
ubuntu 下禁用笔记本自带键盘
--------------------------------

最近买了一把 KBC 的 Poker 2 键盘， 非常之小巧便携， 正好可以放在我自己的 15寸 笔记本上使用， 但是， 遇到一个显而易见的问题： 机械键盘压在笔记本自带的键盘上， 根本没法使用。

笔记本有个功能键可以将自带的触摸板关闭， 却没有可以关闭键盘的功能键。 [Ask Ubuntu](http://askubuntu.com/)上溜达了一圈， 看到[这篇文章](http://askubuntu.com/questions/160945/is-there-a-way-to-disable-a-laptops-internal-keyboard)， 轻松搞定该问题。

总共只有 3 个命令：
```
xinput list 
# 用来查看输入设备列表及对应 ID

xinput float [设备id]
# 用来将指定 ID 的设备禁用， 让它 “漂” 起来

xinput reattach [设备id] [主节点ID]
# 逆向操作， 重新启用设备， 将其挂在指定 id 的主设备下
```

使用 list 命令查看设备列表的时候， 输出的行是以下格式：

`↳ Heng Yu Technology Poker II             	id=11	[slave  keyboard (3)]`

前面长长一串就是设备的名称了， 如果你有外接键盘， 应该不难找到自己的是哪个。

`id=11` 就是该设备的 id 了

`slave keyboard (3)` 括号中的 3 就是主节点设备的 id

-----------------------------------------

我们要做的是禁用笔记本自带的键盘， 我这里是能看到一个 `AT Translated Set 2 keyboard`, 我肯定没有使用 AT 接口的键盘， 那这个就是这个了， 其他的设备看名字也不像是键盘。

找到这行， 记下它的设备 id 和主节点 id，我这里看到设备id 是 14， 主节点id是 3。

 然后使用  `xinput float 14` 命令， OK， 搞定了！ 现在自带的键盘怎么按都没反应了。 （不过 Fn 对应的调节屏幕亮度， 关闭触摸板等功能还是有效的， 不过几乎不会误触到， 所以也就无所谓了 ）

之后， 我们还得能改回来， 那么就执行 `xinput reattach 14 3`， 这样自带的键盘就又可以使用了。

----------------------------------------------------

不过每次打开电脑， 插上外接键盘， 都要设置一下， 还得记住设备 ID 什么的真是烦， 于是用 python 写了个小脚本， 来自动检测外置键盘的插拔并对自带键盘进行禁用或启用操作。 ubuntu 下自带 python 环境， 将脚本设置为开机自动启动， 也蛮方便的。

```python
#!/usr/bin/python
__author__ = 'Chunlin'

import re
import commands
import time
import signal

kbid_pattern = re.compile('(?<=id=)\d+', re.I)
masterid_pattern = re.compile('\d+(?=\)\])', re.I)

IN_KB_ID = -1
IN_MASTER_ID = -1

def signal_handler(signal, frame):
    commands.getoutput('xinput reattach ' + str(IN_KB_ID) + ' ' + str(IN_MASTER_ID))
    print("the process stop safely!")
    exit()

signal.signal(signal.SIGINT, signal_handler)

def getCurrenStatus():
    global IN_KB_ID, IN_MASTER_ID
    # 在此处将 AT Translated 替换成自己系统中内置键盘的特征字符串
    output_in = commands.getoutput('xinput list|grep "AT Translated"')
    # 在此处将 Technology Poker 替换成自己外置键盘的特征字符串
    output_ex = commands.getoutput('xinput list|grep "Technology Poker"|tail -n1')
    inOk = re.match('.*slave  keyboard.*', output_in) is not None
    inDis = re.match('.*floating slave.*', output_in) is not None
    exOK = re.match('.*slave  keyboard.*', output_ex) is not None
    exNo = len(output_ex) == 0

    if inOk and exOK:
        # plug in
        s = re.search(kbid_pattern, output_in)
        IN_KB_ID = s.group(0)
        s = re.search(masterid_pattern, output_in)
        IN_MASTER_ID = s.group(0)
        print('xinput float ' + str(IN_KB_ID))
        commands.getoutput('xinput float ' + str(IN_KB_ID))
        return 1
    elif inOk and exNo:
        # only internal kb
        return 0
    elif inDis and exOK:
        # disabled internal kb
        return 2
    elif inDis and exNo:
        # unplugged external kb
        print('xinput reattach ' + str(IN_KB_ID) + ' ' + str(IN_MASTER_ID))
        commands.getoutput('xinput reattach ' + str(IN_KB_ID) + ' ' + str(IN_MASTER_ID))
        return 3


if __name__ == '__main__':
    while True:
        currentStatus = getCurrenStatus()
        time.sleep(2)

```

本人 python 功力目前还处于菜鸟阶段， 这段程序也就勉强能运行起来， 欢迎各路高手拍砖。



> Written with [StackEdit](https://stackedit.io/).