
[Elevator Saga](http://play.elevatorsaga.com/) 是一个基于 javascript 语言的电梯调度游戏, 玩家需要自行编写电梯和楼层的行为逻辑, 使得在任务规定的限制条件下, 达到要求的乘客运送目标. 是个非常有意思的编程挑战. 

以下是我自己的代码, Elevator Saga 版本为 1.6.2

> 通过标准都是连续尝试 5 次, 通过的次数不少于4 次.
> 半通过标准是连续尝试 5 次, 通过次数不少于2次.

### Solution 1

该方案只从电梯自身的角度进行调度, 不会被其他楼层的请求触发动作. 可以应付较为简单的几关:

通过 `01, 03, 04, 05, 16`    
半通过 `07`

从19关数据来看, 该方案的运输效率还可以, 只是最大等待时间可能会非常长:   
Transported 1074   
Elapsed time742s   
Transported/s1.45   
Avg waiting time13.8s   
Max waiting time468.2s   

```js
{
  init: function(elevators, floors) {
    var maxFloor = floors.length - 1;

    for(var i = 0; i < elevators.length; i++ ){
      var elevator = elevators[i];
      // 控制指示灯 -1 向下  0 双亮  1 向上
      elevator.setIndicator = function(d){
        if(d == 1) {
          this.goingUpIndicator(true);
          this.goingDownIndicator(false);
        }else if(d == -1){
          this.goingUpIndicator(false);
          this.goingDownIndicator(true);
        }else {
          this.goingDownIndicator(true);
          this.goingUpIndicator(true);
        }
      };
      // 带指示灯, 去除重复任务, 高优先级调度
      elevator.schedule = function(floorNum){
        var i = this.destinationQueue.indexOf(floorNum);
        var curt = this.currentFloor(), dest;
        if(i !== -1){
          dest = this.destinationQueue.splice(i, i)[0];
        }
        dest = floorNum;
        if(curt > dest){
          this.setIndicator(-1);
        }else if(curt < dest){
          this.setIndicator(1);
        }
        this.destinationQueue.unshift(dest);
        this.checkDestinationQueue();
      };

      elevator.on("idle", function() {
        // 闲置时的处理方式
        this.schedule(0);
      });

      elevator.on("passing_floor", function(floorNum, direction){ // direction : up down
        // 经过楼层时
        var floor = floors[floorNum];
        var loadThresh = 1 - 1/(this.maxPassengerCount() -1);
        // 如果任务队列中有该楼层, 将其提前执行.
        if(this.destinationQueue.indexOf(floorNum) !== -1){
          this.schedule(floorNum);
          return;
        }
        // 任务队列中没有该层, 但是该楼层有同向请求, 停靠并标记捕获
        if(this.goingUpIndicator()
              && floor.buttonStates.up == 'activated'
              && !floor.upCatch
              && this.loadFactor() < loadThresh){
          this.schedule(floorNum);
          floor.upCatch = true;
        }
        if(this.goingDownIndicator()
              && floor.buttonStates.down == 'activated'
              && !floor.downCatch
              && this.loadFactor() < loadThresh){
          this.schedule(floorNum);
          floor.downCatch = true;
        }

      });

      elevator.on("stopped_at_floor", function(floorNum ) {
        // 到达目的楼层
        var curt = this.currentFloor();
        // 到达两端时的指示灯控制
        if(curt === 0){
          this.setIndicator(1);
        }
        if(curt === maxFloor){
          this.setIndicator(-1);
        }
        // 根据下一个任务, 设置指示灯信号
        if(this.destinationQueue[0] > curt){
          this.setIndicator(1);
        }else if(this.destinationQueue[0] < curt){
          this.setIndicator(-1);
        }else {
          this.setIndicator(0);
        }
        // 释放该楼层的捕获信号
        if(this.goingUpIndicator() && floors[floorNum].upCatch)  floors[floorNum].upCatch = false;
        if(this.goingDownIndicator() && floors[floorNum].downCatch)  floors[floorNum].downCatch = false;

      });

      elevator.on("floor_button_pressed", function(floorNum ){
        // 电梯内按钮按下
        this.schedule(floorNum);
      });
    }
  },
  update: function(dt, elevators, floors) {
  }
}
```


### Solution 2
在 Solution 1 的基础上增加了楼层呼叫电梯的功能, 另外, 在电梯转换方向前, 会先判断前方是否有其他请求. 如果有的话, 会将该任务插入到队列中, 

通过 `01, 02, 03, 04, 05, 08, 09, 11, 12, 16, (06, 07)*`
半通过 `15`

对于 `06, 07` 两关, 都是需要限制电梯的总移动次数.
只需要将第 26 行, for 循环初始化所有电梯的地方修改条件, 使其只初始化第一部电梯, 即可稳稳过关.

```
{
  init: function(elevators, floors) {
    var maxFloor = floors.length - 1;
    var checkMoreReq = function(elevator, direction) {
      var curt = elevator.currentFloor();
      if(direction == 1){
        for(var i = maxFloor; i > curt; i-- ) {
          if(JSON.stringify(floors[i].buttonStates).indexOf('activated') == -1
                || floors[i].upCatch) continue;
          floors[i].upCatch = true;
          return i;
        }
        return -1;
      }
      if(direction == -1){
        for(var i = 0; i < curt; i++ ) {
          if(JSON.stringify(floors[i].buttonStates).indexOf('activated') == -1
                || floors[i].downCatch) continue;
          floors[i].downCatch = true;
          return i;
        }
        return -1;
      }
    }

    for(var i = 0; i < elevators.length; i++ ){
      var elevator = elevators[i];
      // 控制指示灯 -1 向下  0 双亮  1 向上
      elevator.setIndicator = function(d){
        if(d == 1) {
          this.goingUpIndicator(true);
          this.goingDownIndicator(false);
        }else if(d == -1){
          this.goingUpIndicator(false);
          this.goingDownIndicator(true);
        }else {
          this.goingDownIndicator(true);
          this.goingUpIndicator(true);
        }
      };
      // 带指示灯, 去除重复任务, 高优先级调度
      elevator.schedule = function(floorNum){
        var i = this.destinationQueue.indexOf(floorNum);
        var curt = this.currentFloor(), dest;
        if(i !== -1){
          dest = this.destinationQueue.splice(i, i)[0];
        }
        dest = floorNum;
        if(curt > dest){
          this.setIndicator(-1);
        }else if(curt < dest){
          this.setIndicator(1);
        }
        this.destinationQueue.unshift(dest);
        this.checkDestinationQueue();
      };

      elevator.on("idle", function() {
        // 闲置时的处理方式
        var dest = checkMoreReq(this, 1);
        if(dest == -1){
          this.schedule(0);
        }else {
          this.schedule(dest);
        }

      });

      elevator.on("passing_floor", function(floorNum, direction){ // direction : up down
        // 经过楼层时
        var floor = floors[floorNum];
        var loadThresh = 1 - (1 / (this.maxPassengerCount() -1)) - 0.1;
        // 如果任务队列中有该楼层, 将其提前执行.
        if(this.destinationQueue.indexOf(floorNum) !== -1){
          this.schedule(floorNum);
          return;
        }
        // 任务队列中没有该层, 但是该楼层有同向请求, 停靠并标记捕获
        if(this.goingUpIndicator()
              && floor.buttonStates.up == 'activated'
              && !floor.upCatch
              && this.loadFactor() < loadThresh){
          this.schedule(floorNum);
          floor.upCatch = true;
        }
        if(this.goingDownIndicator()
              && floor.buttonStates.down == 'activated'
              && !floor.downCatch
              && this.loadFactor() < loadThresh){
          this.schedule(floorNum);
          floor.downCatch = true;
        }

      });

      elevator.on("stopped_at_floor", function(floorNum ) {
        // 到达目的楼层
        var curt = this.currentFloor(), dest, changed;
        // 到达两端时的指示灯控制
        if(curt === 0){
          this.setIndicator(1);
        }else if(curt === maxFloor){
          this.setIndicator(-1);
        }else {
          // 检查任务, 判断中间楼层是否需要转向
          if(this.goingUpIndicator() && this.destinationQueue.filter(function(e){if(e >= curt) return e;}).length == 0){
            // 试图向下转向 检查上方是否还有未处理的任务
            dest = checkMoreReq(this, 1);
            if(dest == -1){
              // 没有任务, 切换指示灯, 带该层乘客, 直接转向
              if(floors[floorNum].buttonStates.down == 'activated'){
                this.destinationQueue.unshift(curt);
              }
            }else{
              this.destinationQueue.unshift(dest);
            }
            changed = true;
          }
          if(this.goingDownIndicator() && this.destinationQueue.filter(function(e){if(e <= curt) return e;}).length == 0){
            // 试图向上转向 检查下方是否还有未处理的任务
            dest = checkMoreReq(this, -1);
            if(dest == -1){
              if(floors[floorNum].buttonStates.up == 'activated'){
                this.destinationQueue.unshift(curt);
              }
            }else {
              this.destinationQueue.unshift(dest);
            }
            changed = true;
          }
        }


        // 根据下一个任务, 设置指示灯信号
        if(this.destinationQueue[0] > curt){
          this.setIndicator(1);
        }else if(this.destinationQueue[0] < curt){
          this.setIndicator(-1);
        }else {
          this.setIndicator(0);
        }
        // 释放该楼层的捕获信号
        if(this.goingUpIndicator() && floors[floorNum].upCatch)  floors[floorNum].upCatch = false;
        if(this.goingDownIndicator() && floors[floorNum].downCatch)  floors[floorNum].downCatch = false;

        if(changed){
          this.checkDestinationQueue();
        }

      });

      elevator.on("floor_button_pressed", function(floorNum ){
        // 电梯内按钮按下
        this.schedule(floorNum);
      });
    }
  },
  update: function(dt, elevators, floors) {
  }
}
```




> Written with [StackEdit](https://stackedit.io/).