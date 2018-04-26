断路器模式
==========
> 译自 [Circuit Breaker pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)



## 问题与背景

在分布式的环境中, 调用远程资源或服务时, 可能会因为一些短暂的问题而导致失败, 比如网络变慢, 超时, 一些服务发生过载或者是临时不可用等. 这些问题通常在一段时间后是会自己恢复的, 因此一个健壮的系统应该通过一些策略 (比如重试) 来应付这些问题.

然而, 有时问题可能由一些非常意外的问题导致, 并且可能需要更长的时间来修复. 从部分连接无法建立到整个服务彻底 Down 掉等都可能发生. 这种时候系统依然在对不可能成功的请求进行不断重试是毫无意义的, 而应该采用更合理的方式处理这种情景.

另外, 在一个服务压力很大的时候, 其中的一部分出现故障, 很可能会导致故障扩散. 比如, 一个服务调用的请求中配置了超时机制, 当一段时间内没有响应的时候, 它将直接返回一段错误信息. 然而这种方式可能导致堆积大量请求 (等待超时返回) 在当前服务中, 这种堆积将消耗大量的系统资源, 如内存, 线程, 数据库连接等. 最终堆积将耗尽所有资源, 并导致该服务其他与此无关的部分也无法正常工作. 这种场景下其实更好的做法是能让这些请求快速失败返回, 直到系统认为它所依赖的服务已经恢复了正常. _注意_: 上述案例中, 如果将超时时间设置的更短, 有可能解决问题, 但更多的时候, 设置太短的超时时间将使得很多原本能正常处理并返回的请求都因超时而失败.

## 解决方案

断路器模式可以防止程序不断尝试执行一个大概率会失败的操作 (断路器模式是因 Michael Nygard 的 _Release It_ 一书而流行起来的). 它可以让程序在故障时无须等待而继续执行, 避免在那些会持续一小段时间的故障上浪费大量资源. 同时断路器也可以使得程序能够自动检测到故障的修复. 当发现问题已经解决后, 断路器将会尝试正常执行原本故障的操作.

> 断路器模式的目的与重试不同. 只有在再尝试一次大概率会成功的情况下才适合使用重试机制. 断路器是处理大概率失败的场景的. 程序中可以考虑结合断路器和重试, 即由重试机制, 通过断路器来执行请求, 如果是因为断路器的"开路"状态导致的失败, 则不需要执行重试逻辑.

断路器其实就是加在真实操作之前的一层代理. 它监控最近一段时间的出错状况, 并据此判断该操作是否需要快速失败.

我们可以用状态机去实现一个断路器, 其原理就是模拟电路中的真实断路器:

* **闭合状态**: 来自程序的请求会到达目标操作. 断路器维护一个计数器, 记录最近的失败操作, 如果操作返回失败, 则计数器自增. 如果在最近的一段时间内, 失败次数超过一定阈值, 断路器将状态置为**开路状态**, 同时启动一个定时器, 当时间结束后, 断路器将自己置为**半开状态**.
> 定时器的目的是给系统一个恢复时间, 然后再尝试放行操作来试探是否完成恢复

* **开路状态**: 此时来自程序的所有请求都将不执行目标操作, 而直接返回失败.

* **半开状态**: 此时只有部分请求可以通过断路器, 如果他们全部成功, 则认为故障已经恢复了, 因此断路器将转为**闭合状态**(同时重置失败计数器). 但如果这些请求中任何一个又失败了, 则断路器认为故障依然存在, 因此应该回到**开路状态**并再次启动定时器, 等待下一轮的**半开状态**.
> 对于故障服务重新启动时, **半开状态**状态能够避免出现突然涌入大量请求而导致雪崩效应. 当一个服务正在恢复过程中时, 它只能支持有限的负载, 并逐步增加直到它完全恢复, 此时突然激增的请求将使得服务在完全启动之前再次故障

![pic](https://docs.microsoft.com/en-us/azure/architecture/patterns/_images/circuit-breaker-diagram.png)

上图中**闭合状态**下的失败计数器是基于时间的, 每过一段时间将自动刷新. 这将避免断路器因一些偶然的出错情况而进入**开路状态**. 只有在单位时间内错误数量达到阈值, 才会触发状态的变化. 在**半开状态**下, 只有满足连续指定次数的成功操作, 才会认为故障已经修复. **半开状态**下的任何出错都会使状态回到**开路状态**.
> 通过外部方式恢复系统的手段通常是数据复原, 重启失败的组件或修复网络连接问题.

断路器模式能够给系统的故障恢复提供稳定性以及尽可能小的性能冲击. 通过快速失败返回的方式, 将系统的响应时间维持在一个较低水平, 而不是傻等操作超时. 给断路器的状态转换时间增加日志输出, 就可以以此作为系统状态的一个监控维度, 并且当系统进入开路状态后给管理员发出报警信息.

该模式还可以根据不同的错误类型进行行为自定义. 比如, 可以采用一个自增超时时间的定时器. 即首次故障时, 只等待几秒, 之后如果依然故障, 则等待的时间可以逐步增加到几分钟 (类指数退避策略). 再比如当断路器处于**开路状态**时, 也可以考虑直接返回一个有意义的默认值, 而不是简单的抛出异常.

## 问题与思考

当实现一个断路器的时候, 你可能需要思考以下几个方面:

**异常处理**: 断路器模式中的调用方, 需要能够处理服务方不可用时所返回的异常, 处理方式由实际的业务决定. 比如临时降级, 调用其他具类似功能的备用服务, 或直接给用户报告异常并提示稍后重试.

**异常类型**: 请求会因为各种原因而失败, 其中一些故障会更加严重一些. 比如服务彻底崩溃可能需要几分钟来恢复, 或者是某些资源临时发生了过载. 断路器最好能根据不同的故障原因采用不同的策略, 比如断路器需要单位时间内50次超时错误才触发**开路**, 但仅需要5次服务不可用错误就触发**开路**.

**日志**: 断路器应记录所有的失败请求 (可能也需要记录成功的), 避免管理员对服务状态进行监控.

**可恢复性**: 短路器的配置应该匹配对应请求的恢复特征或类型. 否则它可能会服务恢复后还依然长时间处于开路状态, 也可能会过于频繁的在开路和半开状态之间转换. 

**测试失败操作**: 除了在**开路状态**下设置定时器并转为**半开状态**之外, 还可以考虑通过其他手段进行试探, 比如通过周期性的 Ping 对应的主机, 或通过对应服务提供的一个特定操作来判断对应的状态, 相关的细节可以参考[节点健康监控模式](https://docs.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring).

**手动干预**: 对于某些特殊情况下, 故障恢复时间很难确定, 此时最好能给管理员提供一个手动复位的方式. 同样的, 也可以给管理员提供一个强制**开路**的开关.

**并发**: 同一个断路器可能会被大量的服务并发访问. 因此断路器的设计中需要避免阻塞并发请求, 以及过高的性能开销.

**资源差异化**: 当一个断路器所保护的操作, 其背后是由多个相互独立的部分提供服务的, 需要注意处理这种差异性. 比如数据库分多个 shard, 其中一个 shard 发生故障而其他的都正常工作时, 很可能会使得访问正常 shard 的时候被开路, 而访问故障 shard 的时候却处于闭合状态.

> 如果服务进入了节流状态, 可以返回 HTTP 429 (Too Many Requests), 如果服务当前处于不可用状态, 可以返回 503 (Service Unavailable). 响应中也可以包含其他有用的信息, 比如建议的重试时间等.

**重放失败的请求**: 断路器处于开路状态时, 除了可以快速失败返回, 还可以记录下所有的请求, 并在服务恢复后对这些请求进行重放.

**对外部服务不当的超时设置**: 对于一些外部请求我们可能会设置较长的超时时间, 这种情况下断路器可能无法很好的起到保护作用, 因为在请求发出并等待超时的过程中可能会有大量的并发请求也同时抵达, 从而导致许多注定失败的请求没有有效快速失败并返回.

## 何时使用断路器模式

适用场景:

* 防止程序在某些故障发生时仍大量调用一个几乎不会成功返回的远程请求.

不适用场景:

* 保护本地资源的访问, 比如内存中的共享数据, 这种场景下断路器会引入过高的额外开销.
* 作为处理业务逻辑异常的机制

## 案例

在 Web 应用中, 一些页面中会使用外部服务提供的数据, 如果没有充分的利用缓存, 则大多情况下都需要消耗一次请求往返的时间. 通常该 Web 应用与外部服务之间配置了 60 秒的超时时间, 如果没有按时得到响应, 则 Web 应用会认为该服务不可用, 并抛出异常.

然而, 如果服务发生故障, 且系统本身压力也很大, 用户将不得不等待 60 秒才收到异常. 最终, 内存, 连接池, 线程池将被耗尽, 其他用户即使访问别的页面, 也无法再与服务建立连接了.

通过增加服务器和负载均衡进行横向扩展, 只能延缓问题出现的时间, 而无法解决问题, 因为用户的请求一直没有响应, 整个系统最终还是会资源耗尽.

将连接外部服务并获取数据的逻辑封装到一个断路器中将解决这个问题, 并更加优雅的处理服务故障. 用户请求将快速失败返回, 资源将不会被阻塞.

`CircuitBreaker`类中维护着断路器状态信息, 其实现了`ICircuitBreakerStateStore`借口
```C#
interface ICircuitBreakerStateStore
{
  CircuitBreakerStateEnum State { get; }

  Exception LastException { get; }

  DateTime LastStateChangedDateUtc { get; }

  void Trip(Exception ex);

  void Reset();

  void HalfOpen();

  bool IsClosed { get; }
}
```
`State`属性表示当前断路器状态, `CircuitBreakerStateEnum`定义了 **Open**, **HalfOpen** 和 **Closed**状态. `IsClosed`用来判断断路器是否处于闭合状态. `Trip`方法将断路器转换为**Open**状态并将导致失败的异常信息, 触发时间记录下来. 通过`LastException`和`LastStateChangedDateUtc`可以获取到异常相关的信息. `Reset`方法将闭合断路器, `HalfOpen`方法将断路器置为**半开状态**.

例子中的 `InMemoryCircuitBreakerStateStore` 类包含了 `ICircuitBreakerStateStore` 接口的一种实现方式. `CircuitBreaker` 类创建一个实例来维护断路器的状态.

`ExecuteAction` 方法中将执行的逻辑封装为一个 `Action` 代理. 如果断路器为闭合态, `ExecuteAction`将调用`Action`代理. 如果操作失败, 异常处理器将调用 `TrackException`, 这将使得断路器转为 Open 状态. 代码如下: 
```C#
public class CircuitBreaker
{
  private readonly ICircuitBreakerStateStore stateStore =
    CircuitBreakerStateStoreFactory.GetCircuitBreakerStateStore();

  private readonly object halfOpenSyncObject = new object ();
  ...
  public bool IsClosed { get { return stateStore.IsClosed; } }

  public bool IsOpen { get { return !IsClosed; } }

  public void ExecuteAction(Action action)
  {
    ...
    if (IsOpen)
    {
      // 断路器处于开路状态
      ... (see code sample below for details)
    }

    // 断路器处于闭合状态, 执行 action
    try
    {
      action();
    }
    catch (Exception ex)
    {
      // 如果异常持续触发, 则断路器立即断开
      this.TrackException(ex);

      // 抛出异常以便调用者可以收到异常信息
      throw;
    }
  }

  private void TrackException(Exception ex)
  {
    // 为了简化实例, 这里在首次异常后就断开断路器.
    // 实际上此处的实现会更复杂些. 某种异常会立即触发断路器断开
    // 而另外一些可能会通过计数并计算错误率来决定是否断开.
    this.stateStore.Trip(ex);
  }
}
```


下面的代码将会在断路器在非闭合态下执行. 首先检查断路器是否已经保持在断开状态并达到`OpenToHalfOpenWaitTime`所指定的时间. 如果是, `ExecuteAction`方法将断路器置为半开状态, 然后尝试执行`Action`.

如果操作成功, 断路器将重置为闭合状态. 如果操作失败, 它将重新回到 Open 断开状态, 异常发生时间也将更新, 以便断路器再次等待一段时间后再次尝试试探性的操作.

如果断路器依然处于 Open 状态且定时器未触发, 则 `ExecuteAction` 方法直接抛出 `CircuitBreakerOpenException` 异常并返回最近一次导致断路器断开的错误信息.

另外, 可以使用一个锁来防止断路器在半开状态下尝试并发执行目标操作. 当有并发请求进入时, 断路器将会对后来者直接进行快速失败的返回, 从而避免同一时间有多于一个试探请求处于执行状态.


```C#
...
    if (IsOpen)
    {
      // The circuit breaker is Open. Check if the Open timeout has expired.
      // If it has, set the state to HalfOpen. Another approach might be to
      // check for the HalfOpen state that had be set by some other operation.
      if (stateStore.LastStateChangedDateUtc + OpenToHalfOpenWaitTime < DateTime.UtcNow)
      {
        // The Open timeout has expired. Allow one operation to execute. Note that, in
        // this example, the circuit breaker is set to HalfOpen after being
        // in the Open state for some period of time. An alternative would be to set
        // this using some other approach such as a timer, test method, manually, and
        // so on, and check the state here to determine how to handle execution
        // of the action.
        // Limit the number of threads to be executed when the breaker is HalfOpen.
        // An alternative would be to use a more complex approach to determine which
        // threads or how many are allowed to execute, or to execute a simple test
        // method instead.
        bool lockTaken = false;
        try
        {
          Monitor.TryEnter(halfOpenSyncObject, ref lockTaken);
          if (lockTaken)
          {
            // Set the circuit breaker state to HalfOpen.
            stateStore.HalfOpen();

            // Attempt the operation.
            action();

            // If this action succeeds, reset the state and allow other operations.
            // In reality, instead of immediately returning to the Closed state, a counter
            // here would record the number of successful operations and return the
            // circuit breaker to the Closed state only after a specified number succeed.
            this.stateStore.Reset();
            return;
          }
          catch (Exception ex)
          {
            // If there's still an exception, trip the breaker again immediately.
            this.stateStore.Trip(ex);

            // Throw the exception so that the caller knows which exception occurred.
            throw;
          }
          finally
          {
            if (lockTaken)
            {
              Monitor.Exit(halfOpenSyncObject);
            }
          }
        }
      }
      // The Open timeout hasn't yet expired. Throw a CircuitBreakerOpen exception to
      // inform the caller that the call was not actually attempted,
      // and return the most recent exception received.
      throw new CircuitBreakerOpenException(stateStore.LastException);
    }
    ...
```


程序中创建一个`CircuitBreaker`类的实例并调用 `ExecuteAction` 来保护对应的操作, 将要执行的逻辑作为参数传进去. 然后我们捕获其中可能抛出的 `CircuitBreakerOpenException` 异常, 代码如下:
```C#
var breaker = new CircuitBreaker();

try
{
  breaker.ExecuteAction(() =>
  {
    // Operation protected by the circuit breaker.
  });
}
catch (CircuitBreakerOpenException ex)
{
  // Perform some different action when the breaker is open.
  // Last exception details are in the inner exception.
}
catch (Exception ex)
{
}
```