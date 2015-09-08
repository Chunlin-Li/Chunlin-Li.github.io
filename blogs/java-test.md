Java 测试
---------------

## 首先, 需要站在巨人的肩膀上不是么?

找到几篇关于 java 测试的最佳实践. 无论是否真的是最佳, 至少都是高手的经验之谈.

### JUnit Best Practices

[原文链接](http://examples.javacodegeeks.com/core-java/junit/junit-best-practices/)  作者: Alvin Reyes

1. TDD, 写代码前先写好对应的测试用例.
2. 避免在测试代码中对其他非测试部分产生影响.  
  * 避免在测试用例中操作任何生产环境或其他环境的数据  
  * 避免写出需要人为干预的测试用例.
  基于以上, 测试用例所使用的数据应该是封闭的, 每次运行前都处于明确的状态下, 以保证每次运行测试用例的效果完全一致. 测试完成后, 需要恢复测试使用的数据, 或者直接清除测试用例专用的测试数据库  
3. 绝不要在 Build 的时候跳过测试, 比如 `-Dmaven.test.skip=true`
4. 要使用有意义的测试用例名称, 要能够大致描述测试的对象或行为  
  比如, 待测方法名称为 createOrder(), 对应测试方法名称之一可以是 testSampleServiceCreateOrder().
  此外, 断言中的描述对于测试也非常重要.  
5. 每个测试单元中, 至少需要包含有一个断言. "经验法则 : 每一个断言, 都是一个测试"  
6. 好好利用 Junit 中的 Assert 及其他工具包, 如果可以联合其他相关的模式匹配工具则更好(比如 Hamcrest ).
7. 在合适的位置使用合适的注解.
8. 测试代码 Package 的命名和结构应该保持和实现代码的保持一致. 这样可以提高测试代码的可维护性.  
9. 生产环境或发布版本中不能带有测试代码, Build 工具 (比如 Maven) 一般都有相应的功能.  
10. 不要使用构造器来构造测试用例, 而应该使用 @Before @After 等注解.  
11. 不要为了通过一项测试用例, 而写一个无意义的测试, 比如仅有一句 `assert(true);`  
12. 避免在测试用例中自己写 try catch 来处理异常, 而应该使用 Junit 提供的注解声明预期产生的异常.
13. 没有必要为了打印异常的详细信息而使用 try catch 来手动捕获异常, 应该交给 assert 来做异常输出.  
14. 如非必要, 尽量避免在测试用例中引入线程, 另外, 也不要使用 Thread.sleep() 等方式让执行暂停.
15. 使用日志打印必要的信息.
16. 使用 Maven 或 Gradle 等自动化 Build 工具.  
17. 使用工具进行测试用例覆盖度的检测, 并对测试结果生成展现形式更友好的报告. 推荐使用 surefire 插件.  
18. 代码的测试覆盖率应该尽可能到达 80% ( 业界经验准则 )
19. 在测试中使用适当的 Mock 技术, 有很多可用的 Mock 工具. 数据和对象都可以 Mock.
20. 测试代码要精简, 执行要快, 压力或负载测试应该独立出去.

以上这些 "最佳实践" 基本上让我们对单元测试有一个大致的认识, 那些是对的, 那些是错的. 但是具体怎么做呢?

### Test Driven Development (TDD): Example Walkthrough

[原文链接](http://technologyconversations.com/2013/12/20/test-driven-development-tdd-example-walkthrough/) 作者: [Viktor Farcic](http://technologyconversations.com/about/)

TDD, 测试驱动开发其实是一种开发模式. 定义了一种高精度高质量的开发流程:

```
while (有需求) {

  根据需求编写测试用例

  do {
    编写或修正代码以通过测试
  } while (测试执行失败)

  do {
    重构并优化代码
  } while (测试执行失败)

}
```

原文中给出了一个使用 TDD 进行开发的实例, 很形象的描绘了 TDD 开发过程.

对于 TDD, 到底是让开发变的更敏捷还是更迟缓了?

con :
  * 开发前需要将产品需求拆解成代码模块需求(单元)
  * 需要针对模块需求编写测试用例, 测试代码的代码量甚至比实现代码更多

pro :
  * 功能需求的拆解使得代码更加模块化, 进一步使得代码结构的设计质量更高
  * 测试保证了代码的质量, Bug 更少, Debug 更快
  * 是代码重构的一个前提条件, 可以保证重构后代码的逻辑正确性
  * 测试代码本身就是整个项目的最好的开发文档

TDD 结合 ATDD(Acceptance Test Driven Development) 和 BDD(Behavior Driven Development) 可以更好的覆盖单元测试和功能测试, 并且完全能够充当开发文档.


### Test Driven Development (TDD): Best Practices Using Java Examples

[原文链接](http://technologyconversations.com/2013/12/24/test-driven-development-tdd-best-practices-using-java-examples-2/)   作者: [Viktor Farcic](http://technologyconversations.com/about/)

该文承接上文, 给出了 TDD 的最佳实践, 此文曾被 Hacker News 收录.  另, 该文作者著有_[Test-Driven Java Development](https://www.packtpub.com/application-development/test-driven-java-development)_

最佳实践是在特定情景下的一类问题的通用解决方案, 不采纳最佳实践会导致我们重新去发明轮子, 并花费时间精力去解决那些已经被解决过的问题.
但从另一个角度来说, 我们也不能盲目的采纳所谓的最佳实践, 而是应该去学习去尝试, 在完全了解它之后, 再根据自己的实际情况进行部分修改调整, 然后采纳; 或者, 如果不适合目前的状况, 就不必引入了.

最佳实践主要设计以下几个方面:

* 命名习惯
* Processes
* Development practices
* Tools


**命名习惯**
