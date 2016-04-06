ElasticSearch 的查询
=======================


ES 的查询可以直接以 query string 的形式通过 get 请求发送, 但更复杂的查询方式需要通过 post 请求发送 JSON 形式的 DSL 查询语句来实现.



### JSON 的最外层的属性:
 
* 通常是 `query`, 其中包含查询语句
* 比较复杂的查询中可能带有聚合 `aggs`, 也是放在最外层的
* 另外, 可以使用 `size` `from` 选项控制每次查询返回的文档数量以及查询跳过的文档数量. 联合使用可以用于分页.
* 使用 `sort` 指定结果的排序方式.
* 使用 `_source` 可以指定查询返回的字段, 也可以关闭 _source 的返回.

### query 

查询条件需要包在  query 中. 

#### 查询语句分成两类: 叶子查询语句; 符合查询语句

复合查询由 `bool, dis_max, not, constant` 将其他叶子或符合语句连接起来构成.

* `bool`: 通过组合的布尔查询表达式匹配过滤搜索结果. 
* `dis_max`: 类似布尔查询, 但是对分值的计算方式不是加和, 而是取最大值.
* `not`: 不匹配条件.
* `constant`: 常数分值查询.

叶子查询通常包含 `match, term, range` 查询条件.

* `match`: 接受文本数字和日期, 对其分词, 构造查询条件进行查询. 其中又分三种查询类型
	* `boolean`: 默认就是布尔, 可以设定 `operator` 是 or(默认) 还是 and.
	* `phrase`: 对查询文本分词并组合成 phrase 进行查询, 涉及一个 `slop` 概念.
	* `phrase_prefix`: 可以对最后一个 term 进行扩展.
* `term`: 接受一个 term, 查询文档中特定字段是否具有该指定的 term. term 的生成与分词方式有关
* `range`: 查询一个范围, 可以指定 `lt lte gt gte` 设定边界. 对于 date 类型可以指定 format. 


##### Bool 查询

bool 的值是一个对象, 其中包含不同类型的子条件. 各个条件叠加到一起进行判定. 该算分的算分, 该过滤的过滤.

* `must`: 文档必须符合该查询条件. 且分数计入总分.
* `should`: 文档应该满足的条件, 计入总分, 也可以不满足. 通过设置 `minimum_should_match` 设定至少应该满足的条件数.
* `filter`: 和 must 一样, 只是不会计入分数.
* `must_not`: 与 must 相反.


##### Filter 过滤.  用于 bool 下.



* and
* or
* not
* exist


Term 级别的查询

* range
* exists
* missing
* prefix
* wildcard
* regexp
* fuzzy
* type
* ids

