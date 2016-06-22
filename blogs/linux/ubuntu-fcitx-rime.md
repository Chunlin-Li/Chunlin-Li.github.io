Ubuntu 14.04 下 fcitx Rime 输入法配置笔记
-----------------


## 安装
ubuntu 安装 rime 相对来说比较方便， 看到很多网友说因为 PPA上不是最新的版本， 而去下载代码自行编译， 我只能说我不过是需要一个还算比较顺手的输入法而已， 真心没必要搞得太复杂（其实是因为我技术太菜搞不定）。 
```shell
# 1.安装
sudo apt-get install fcitx-rime
# 2.配置 fcitx 为默认. 然后重启
im-config
sudo reboot
# 3.添加输入法
fcitx-config-gtk3
```
直接进行安装， 不需要卸载 ibus， 也不需要自己安装 fcitx， ubuntu 已经给装好了。

安装完成后将 fcitx 设置为默认， 重启。 然后添加输入法（貌似不添加也可以直接使用）， 在配置界面中点击 ’+‘ 号， 去掉 only xxxxx 前面 checkbox 的勾， 然后搜 Rime 找到并添加。 有时可能找不到， 但其实已经添加好了。

然后随便打开个编辑器， `Ctrl + Space` 试试看有没有切换到RIME输入法。
如果没有的话， 可以尝试手动点击 fcitx 的图标切换输入法。 如果可以切换， 说明安装成功。
点击可以切换， 快捷键无效， 可以在 fcitx 的配置工具中查看 global config 选项卡中的快捷键是否设置正确。


## 配置

Rime 有很多输入法配置方案， 不同的方案之间会有很大的差别。 Rime 号称是一个输入法引擎， 事实上他也确实扮演着这样一种角色。 通过更改不同的方案配置， 可以实现不同语言， 不同方式的输入法， 比如日语， 简体中文， 繁体， 各种方言版本， 拼音输入法， 五笔输入法等。 

Rime 默认方案被称为 ”朙月拼音“， 是繁体拼音输入法， 对于大陆的朋友来说不是很方便， 所以首先必须要切换到简体中文的拼音输入法： 

`Ctrl + grave(重音符号，就是tab键上面的那个)`  可以调出方案切换菜单， 在里面可以找到 朙月拼音简体版， 选中切换后， 再进行输入就会发现已经是简体中文了。 

这样我们就完成了最简单的配置，可以正常使用 Rime 输入法了。 

但这仅仅是开始。 配置的重头戏在于对输入法配置文件的修改和定制。

---------------------------------------------------

---------- _**以下是进阶配置**_ ----------------

[配置文件](https://gist.github.com/Chunlin-Li/d85292f8b62514e7753df5d1b722026f)

配置文件的路径：
```
~/.config/fcitx/rime		# 用户配置信息路径 （我们要修改的配置）
/usr/share/rime-data		# 系统共享配置文件路径 （只读）
```

配置文件的作用：
```bash
default.yaml				# 全局配置文件 （）
install.yaml				# 安装版本信息
<方案名称>.schema.yaml		# 对应输入方案的配置副本
user.yaml					# 用户状态信息

default.custom.yaml 		# 用户对全局配置的定制修改
<方案名称>.custom.yaml		# 用户对输入法方案的定制修改


<方案名称>.prism.bin			# Rime 棱镜
<词典名>.table.bin			# Rime 固态词典
<词典名>.reverse.bin			# Rime 反查词典
# 总之 .bin 文件都是便宜后生成的二进制文件， 我们不需要太多关注它们

# 记录用户输入的词典文件：
<词典名>.userdb.kct			# 用户词典文件
<词典名>.userdb.txt、			# 文本格式的用户词典快照
<词典名>.userdb.kct.snapshot # 用户词典快照
```

通用配置修改方法：
```bash
# 所有的 xxx.custom.yaml 都可以看作是 xxx.yaml 的补丁
patch:
# patch 相当于是根级， 以下的子级都有两个空格的缩进， 不要使用 tab. 
  "第一级/第二级/第三级": 新值
  "第一级/某个列表式配置项": 
    - "列表项一": 值
    - "列表项二": 值
# 需要注意， 每个冒号后面都有一个空格，即使是要换行也不能省略
```

不过我为了图省事， 我都是直接修改了源文件， 即没有创建任何  *.custom.yaml 文件， 而是直接修改 *.yaml 文件。  官方推荐尽量使用 *.custom.yaml 进行分离的配置， 原因是当 Rime 升级的时候， 原有的配置文件会被新的替换， 这时候将导致自己之前的配置丢失。 

----------------------------

## 我自己使用的配置：

* 将默认的5个候选字改为4个

```bash
# default.yaml 中配置
  "menu/page_size": 4
```

* 关掉全角标点符号
 参考后面的方案, 将方案选单中的全角半角选项删掉, 但是这样快捷键`Shift + Space`还是会切换全角半角. 因此需要打开 fcitx 的配置界面进行配置: 
```bash
# 终端中执行以下命令打开配置窗口
fcitx-config-gtk3
# 配置项路径 : 
# Global Config --> Show Advance Option --> Switch Full Width Character Mode
```
如果以上方式配置后还不行, 可以编辑 default.yaml 文件,在 `key_binder -> bindings` 中找到 full shape 的那行, 用 `#` 将其注释掉. 这样你的你自己的方案中导入的 default.yaml 就没有这个快捷键了. 当然, 可能你需要重新 Deplooy 一下输入法.

* 删掉方案列表中对我没有用的输入方案

```bash
# default.yaml 中只留一个， 其他的 schema 都删除
"schema_list":
  - schema: luna_pinyin_simp`
```
* 删掉多余的方案选单快捷键
```bash
# *.schema.yaml 中：
switches:
  - name: ascii_mode
    reset: 0
    states: [ 中文, 西文 ]
  - name: zh_simp
    reset: 1
# ascii_mode 是输入法下用 shift 切换中英文
# zh_simp 是对中文简体的支持
# states 那行删掉不影响功能， 只是不在方案选单中出现该选项。
# 我自己尝试不知道为什么 ascii_punct 设置好像没有什么用
```
* 设置成中文下默认输入英文标点符号

 在[这里](https://gist.github.com/lotem/2334409)可以找到官方的替换标点方案 `alternative.yaml`. 将该文件放在用户配置目录下, 然后编辑 <方案名称>.schema.yaml 文件并做如下修改.

```bash
# 将默认的 default 改为 alternative
punctuator:
  import_preset: alternative
```

### 参考: 

更多的配置方法和参数可以参考官方文档： [rime 的 GitHub wiki](https://github.com/rime/home/wiki)



