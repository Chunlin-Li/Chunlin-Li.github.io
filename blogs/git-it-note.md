Git 笔记
=======

## [node school](http://nodeschool.io/) 的 git-it 课程学习笔记

-------------------------------

* 配置 git : 
* 首先需要配置一个账户.  这里配置全局用户
 `git config --global user.name [本地名字/昵称]`
 `git config --global user.email [邮箱, 相当于是账号]` 
* 配置 github 账户
 `git config --global user.username [github上的用户名]`

----------------------------------

* 初始化一个新的 repository
* 创建一个文件夹, cd 进去后 执行 `git init` , 使用 `ls -la` 会看到有一个 .git 的隐藏文件夹.

---------------------------------

* 创建一个新文件,  `touch readme.txt` 里面随便写点东西
* `git add readme.txt` 可以将该文件添加到  git 中. 这样, 使用 `git status` 查看状态的时候, 就会显示有一个新的文件.
* `git commit -m [本次提交的注释信息]` 可以将当前 `git status`中包含的所有修改提交到 repository.

-------------------------------------

* 使用 github 作为 git server
* `git remote add [远端repo别名] [远端repo url]` 可以将当前 repo 与远端的 repo 建立关系.  一个本地的 repo 可以与多个远端的 repo 建立关系. 对于主 repo 我们通常使用 origin 作为名字. 
* 可以通过命令 `git remote -v` 来查看与远端 server 建立的联系.
*  建立关系后就可以 推拉( pull / push )了:
 `git push [远端repo别名] [本地branch名称]`  比如说这里 repo别名就是上例中的 origin, 本地 branch 默认是在 master 上, 因此, 就是  `git push origin master` 了, 提交成功后, 在 github 的页面上就可以看到刚才提交的内容了.  

--------------------------------------

* fork 其他人的 repo
* 在  github 网页上找到要 fork 的项目, 点击 fork, fork 完成后, 将会生成一个属于自己的, 和目标项目同名的项目. 复制该项目的 http url, 
* 在本地执行 `git clone [http url]` 可以将自己 fork 过来的项目克隆到本地. clone 会自动建立与 server 的关联. 命名为 origin
* 有时我们还需要从父项目上同步一些它们的修改, 因此需要建立和父项目的联系, 可以使用之前提到的 `git remote add` 命令来完成.  通常习惯将其命名为 upstream. 

----------------------------------------

* 创建分支, 修改并提交到分支
* 使用 `git branch [分支名称]` 创建分支
* 创建完成后可以使用  `git checkout [分支名称]` 来切换到刚刚建立的分支上. 
* 使用  `git status` 命令可以查看当前所在的分支, 以及分支上的文件修改状况.
* 修改后需要使用  `git add [文件名]` 将修改的文件添加到 git 的提交内容中.  然后如同前面介绍的方式, 使用 `git commit` 命令进行提交.
* 提交后, 我们要将这部分的修改 push 到我们远端的 repo 上, 使用命令 `git push [目标远端名] [分支名]`

-----------------------------------------------------

* 添加一个合作者 ( collaborator )
* 进入 github repo 页面, 进入 setting  -- > Collaborator 中进行设置添加
* 两个人在进行同一个项目的开发, 我需要同步对方做出的修改, 用 pull 的方式: 
 `git pull [远端名称] [本地分支名称]`
 如果没有更新, 将显示 : Already up to date . 如果有更新, 将以文本方式显示更新的内容. 并且自动将更新的内容合并到本地.
* 如果只是检查更新信息, 而不想自动合并到本地, 可以使用 `git fetch --dry-run` 命令.

---------------------------------------------------

* 请求合并到原始项目 ( pull request )
* 进入原始项目的页面, 点 compare & pull request ,  github 将自动检测到对应的 fork 信息, 会自动选择相应的branch进行合并. 我们需要填写一些备注信息, 然后点击 send pull request 即可. 
* 如果 request 被拒绝, 我们可能需要关闭这个 pull request , 然后完成相应的修正后重新提交 pull request.

----------------------------------------------------

* 将分支上的修改合并到本地的主干上, 删除之前的修改分支
* 使用命令 `git checkout [要切到的主干分支名]` 切换到主干上
* 使用命令 `git merge [想要合并的分支名称]` 将之前的修改分支上的内容合并到主干上.
* 完成后我们就可以删除已经不需要的修改分支了. 使用命令 `git branch -d [要删除的分支名称]`
* 可以使用命令 `git branch` 查看所有建立的分支. 
* 将本地的分之删除后, 可能还会需要将远端 repo 上的分支也删除, 可以使用命令 `git push [远程 repo 名称] --delete [要删除的分支名称]`





## JetBrains IDE Git Integration


### SVN 现有代码迁移到 Git 的步骤

> JetBrains 以 idea 为例；git server 以 gitlab 为例；项目是 java 项目.

* 新建一个项目， 从 SVN 检出目标项目代码到 idea 中， 再打开项目
* 在 gitlab 中创建一个空的 repo, 用于管理目标项目
* 在 idea 的菜单栏点选 `vcs` -> `import into Version control` -> `create Git repository`. 
	Git 路径选择当前项目所在的本地路径.
	该操作会将当前项目的 VCS 从 SVN 切换到本地 Git.
* 此时在 project 窗口中展开项目中的文件发现都是红棕色， 因为默认这些文件都没有添加到本地的Git Repo中。 选择需要提交的文件， add 到Git中， 然后对整个项目 commit
* commit 对话框中， 在 commit 按钮旁有下拉菜单， 选择 `commit and push`, 代码将首先提交到本地的 repo 中， 然后执行 push 时会弹出 `push commits` 窗口
* 点击蓝色的 `Define remote` 链接， 将开始在 gitlab 中创建的空 repo 的 URL 复制粘贴过来， 点击确定完成定义
* 回到 `commit and push` 菜单， 点击 push 将代码提交到 gitlab 的项目中
* 至此， 项目成功迁移到 gitlab 中， 不再需要 SVN 。

`git config --local user.username [github上的用户名]`



### 基于 Git 的版本控制方式

在 gitlab 中可以从 任意分支创建新的分支出来    
创建分支后， 在 idea 中 git | pull 打开对话窗口， 刷新 remote， 可以看到多出新的分支。

#### 本地 checkout 新的开发分支： 

从本地 master 分支开始, 先在本地创建一个新的分支, 比如叫 dev-new.  此时本地 dev-new 分支和本地 master 是一样的.       
然后此时 打开 git 的 pull 对话框, 更新远端 repo 的信息, 然后在 Branches 中选择我们需要 checkout 的分支, 比如叫做 dev-2.3 .      
pull 过之后,  本地的 dev-new 就和 dev-2.3 一致了, 并且建立了他们的对应关系, 以后本地 dev-new 分支在 Push 的时候, 默认就是 push 到 dev-2.3 的服务器分支上了. 


#### 将服务器指定分支上的代码同步到本地 : 

一般使用 pull 命令.   相当于是 SVN 中的 Update .      
如果之前在分支 A 上, 我们也可以从分支 B 上 pull, 这样我们本地的分支将会和最新一次 pull 的远端分支建立关联    


#### 将自己的开发分支合并到主开发分支 :

假设, 主开发分支是 D, 我们自己的分支是 D1,  本地分支 LD1 对应远端分支 D1.

1. 我们可以将LD1分支的修改都 push 到 D1 分支, 然后在 gitlab 对应的 project 下使用 Merge Request 功能, 创建一个 D1 到 D 的 Merge, ( 可以勾选合并后自动删除 D1 分支的选项 )
2. 直接从本地的 LD1 向远端的 D push 代码, 此时可能需要进行 pull and push 方式, 先从远端 D 分支 pull 最新分支到本地合并, 然后再 push 到 远端 D 分支上. 

#### 将当前远端分支回滚到之前指定分支 :

直接在 VCS 中选择对应的 commit, 将其 checkout 出来即可, 已经提交的修改将回滚到指定的 Commit , 而尚未提交的 修改, 则仍然保留.


#### **Rebase : **

开始的时候从分支 A 上签出代码创建本地分支, 修改了几次后发现, 分支A 已经被别人提交过修改了, 此时可以将 A' pull 到本地的分支上.  而另一种可以达到同样效果的方法就是 rebase.

相当于之前 base A 分支, 现在发现那个 A 分支已经过时陈旧了, 因此重新 base 到 A' 或者 B 什么的.     
开始的时候 从 A 上签出代码后我们做的所有修改提交的集合假设为 C,  那么我们 rebase 前, 我们自己分支的代码应该是 A + C,   rebase 之后, 我们自己的分支应该是 A' + C 了.



#### 服务器上部署git上的项目

在部署脚本中加入如下命令：

```
git clone [git ssh url]
cd [working tree]
git fetch --all
git reset --hard  origin/[branch name]
```

然后需要在 gitlab 中配置该项目的 **deploy key**, 将目标服务器的 ssh 公钥设置进去

这样， 就可以通过执行部署脚本将git上的项目部署到服务器了。 

如果需要切换分支， 只需要改变最后一行中的  `branch name` 即可


#### Amend 的使用

可以修改当前分支的最近的一个已经提交到本地 repo 的 commit.    
修改不会在 branch 上增加一个新的 commit, 而是直接换掉当前 head 的 commit. 

在 JetBrains 中直接在 git commit 的对话框右边勾选 amend 的 checkbox, 然后再进行 commit 即可.


#### 修改本地位于 branch 中间的某个 commit

工作中经常遇到这种情况, 为了保持 commit history 的干净明了, 

当前分支"脑袋"中的 commit 大致如下

`C1:实现鼻子 --- C2:实现眼睛 --- C3:实现耳朵`

然后发现, 眼睛有点歪, 得改一下, 但又不想重新创建一个 "修改一下眼睛" 的 commit 上去, 所以只能绕一圈了. 

基于"脑袋"分支再创建一个新的分支"改脑袋";

将"改脑袋"分支 hard reset 到"C2:实现眼睛"分支;
 
在"改脑袋"分支上修改眼睛的部分, 然后提交"C4:修改眼睛". 完成后大致是这样:

```
C1:实现鼻子 --- C2:实现眼睛 --- C3:实现耳朵 (脑袋分支)
                        \
                         -- C4:修改眼睛 (改脑袋分支)
```

现在将分支切换到"脑袋", rebase onto "改脑袋"的分支: 
 
```
C1:实现鼻子 --- C2:实现眼睛 --- C4:修改眼睛 (改脑袋分支) --- C3:实现耳朵 (脑袋分支) 
```

然后对 "脑袋" 分支用交互方式 rebase 一下(onto C1 或者其他更早的共有 Commit), 将 C4:修改眼睛 分支 squash 掉就行了.

以上是 1次commit + 2次rebase 的方式, 其实也可以用 1次amend + 1次rebase 的方式来实现. 不过 rebase 的时候记得要 skip 掉旧的 commit

对了, 如果本地分支已经 push 过, 那么采用这种方式处理后, 需要 force push 到远端分支才行, 或者删掉重新 push 一下或换个分支名字都行.


> Written with [StackEdit](https://stackedit.io/).
