_环境:  Ubuntu 14.04_
_node.js 版本 :  0.12.2_
_npm 版本 :  2.10.0_


* 创建一个新的文件夹(比如 test ) 作为工程文件夹.
* 进入 test 文件夹, 运行 `npm init` 创建并初始化一个 package.json 文件. 最简单的方式: 一路回车.

----------------
* 在该目录下安装模块, 语法: `npm install <module name>` , 这会在当前目录下创建一个 node_module 文件夹, 安装的模块会存入该路径下. 
* 此处安装一个 "once" 模块. 执行命令  `npm install once` . 如果前一步的 package.json 文件采用了偷懒的方式创建, 此处可能会有警告信息 : 没有描述, 没有 repository, 没有 README. 不过不影响什么. 
* 认真一点话, 我们可以在当前工程目录下创建一个 README.md 文件, 对当前的工程或模块进行描述
* 编辑 package.json 文件中的 description 属性 和 repository 属性. 或者再次执行 `npm init` 在交互命令行中完成信息的完善工作.

--------------------

* 使用 `npm ls` 可以列出当前工程中安装了的模块. 此处执行后会有错误提示. 现实 "extranous". 这是因为我们直接安装了 once 模块, 但是在 package.json 工程配置文件中没有加入该模块的依赖信息. 
* 我们可以适用 `npm install once --save` 的方式来安装模块, --save 参数会在 package.json 文件中自动加入模块的依赖信息. 此时再执行 `npm ls` 就不会有错误信息了. 

--------------

* npm 不仅可用于安装模块, 还可以用作执行器. 打开 package.json 文件, 可以看到其中有如下信息
```
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```
执行 `npm test` 的时候会看到这行报错信息. 我们可以在当前路径下创建一个 test.js 文件, 其中包含如下内容:
```
console.log("My Test Succeed");
return;
```
然后修改 package.json 文件中 的  scripts 属性为如下样式: 
```
"test": "node test.js"
```
保存退出后, 执行 `npm test` 即可看到 test.js 脚本被执行. 

----------------------

* 我们可以创建一个 npm 账户, 并将我们自己的模块上传到网上. 
* 现在可以使用 `npm whoami` 查看当前用户是谁. 如果没有的话, 我们可以使用 npm adduser 创建用户
* 创建用户后, 再次使用 `npm whoami` 查看当前登录的用户, 就已经是我们自己的账号了
* 账户是由 ( https://www.npmjs.com/ ) 网站维护

------------------

* 帐号登录后, 我们可以将当前的工程(模块)上传到网上. 使用命令 : `npm publish` 上传
* 注意模块的名字需要符合规范, 文件夹的名称和模块名称要一致, author 和当前登陆的用户要一致.
* 发布成功后,  会显示  +[模块名]@[版本号]
* 然后使用 npm view [模块名] 可以查看这个模块的相关信息.

--------------------

* 维护版本:
 > 版本号格式 :  `major.minor.patch-preNum`
 > 比如说 2.1.7-0 ,   2是主版本号, 1是次版本号, 7是补丁版本号, 0表示这是该补丁版本的预发布版本.

* repo 上进行 publish 要求版本号必须发生变化, 不能重复提交同一个版本.  
* 更新模块版本的两个方法: 1. 手动修改 package.json 文件;  2, 使用 npm version 对版本的对应字段进行自增, 具体使用方式可以查看 npm version help
* 用户使用中默认会下载 dist-tag 标记为 latest 的版本.  publish 新版本后, 默认会自动将新版本标记为 latest .  如果需要将 latest 的版本指定为其他版本, 需要使用  dist-tag 命令. 如:
 `npm dist-tag add [模块名]@[版本号] latest`
 这样可将该命令中指定的版本号标记未目前的 latest 版本. 
 也可以将某个版本号标记为其他的 tag , 比如 stable, beta 等. 
*  删除 tag 标记:   `npm dist-tag rm [模块名] [要删除的tag名称]`  
注意, latest 标记不能被删除, 只能改变其指向的版本. 

-----------------------

* 依赖管理
* 我们的模块中可能依赖了很多其他的模块, 在依赖中我们指定了模块的名称和版本范围. 一段时间后, 我们可能希望知道我们所依赖的模块是否已经有了更新.   可以使用  `npm outdated`  命令查看当前模块的依赖模块的版本状况.
* 当发现有一些依赖的模块更新了版本时, 可能我们希望将这些依赖也升级到最新.  我们可以手动编辑 package.json 来修改依赖模块的版本,  我们也还有另外一个选择:  使用  `npm upgrade` 命令一次性全部升级.
* 如果某个曾经依赖的模块我们现在不再依赖, 可以使用  `npm rm` 或 `npm uninstall` 命令将它从我们的模块中删除.  当然, 聪明人还是会使用  `--save` 参数让这个删除操作同时改变我们的 package.json 文件.



以上部分参考 how-to-npm 教程. 

----------------------



npm 常用命令补充 : 

#### 安装依赖包

`npm install [packageName]` 将包安装到当前路径下的 node_modules 目录中. 用于在当前的项目中使用该依赖包.

`npm install [packageName] -g` 是全局安装模式.  对于命令行工具类型的包, 使用该方法安装, 会将该包的入口模块注册到 shell 环境中 ( 实际上是放在了NODE_HOME 的 node_module目录下, 并在 bin 目录中建立软链接 ), 

通过以下方式可以实现离线安装.  tar包 或者  folder 中需要包含有 package.json 文件
```
npm install [tar file] 
npm install [tar url]
npm install [folder]
```

修改安装源:

一次性的方式: `npm install [packageName] --registry=http://example.url`

修改 npm 的配置: `npm config set registry http://example.url`

列出所有npm的配置项: `npm config ls -l`

npm 用户配置文件位置:  `~/.npmrc` . 直接将需要覆盖的配置项写在其中即可


[gist](https://gist.github.com/Chunlin-Li/fac7a8ac85741fc78014)


> Written with [StackEdit](https://stackedit.io/).
