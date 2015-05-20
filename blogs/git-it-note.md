
_推荐下载 [node school](http://nodeschool.io/) 的 git-it 课程进行学习_

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


> Written with [StackEdit](https://stackedit.io/).
