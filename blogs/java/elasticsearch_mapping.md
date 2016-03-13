ElasticSearch mapping 
======================

自己学习过程中遇到的概念, 按照自己的理解总结以下. 准确的概念以官方文档为准

### 常见字段类型 [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/2.2/mapping-types.html)

* 数组类型
* 布尔类型
* 日期类型: 日期类型可以设定 format 参数, 可以适配多种不同格式
* 嵌套类型: 数组元素是对象, 且需要在搜索时保持对象单元的完整, 则需要使用该类型
* 数字类型: long 类型兼容 int, double 类型兼容 float
* 地理位置类型
* 地理形状类型
* IPv4类型
* 对象类型
* 字符串类型: 重点类型. 首先确定索引类型, 可以开分词也可以不开. 其次可以设置不同的分词器过滤器等
* Token-count类型

### 常见元字段 (meta-filed) [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/2.2/mapping-fields.html)

* _all: 不指定字段的查询相当于查询的该字段, 比如搜索引擎的搜索框在查询时不需要用户指定字段名一样.
* \_field\_name
* _id: 每个文档的唯一 id, 可以指定, 不指定则 ES 自动分配.
* _index: 该文档所属的 index 名称.
* _meta
* _parent
* _routing: 用于记录 route 信息, route 可以干预文档到 shard 的分配方式.
* _source: 原始的文档内容, 该字段可以被关闭.
* _ttl
* _timestamp: 文档的时间戳, 可以指定, 不指定默认是创建时间. 该字段可以被关闭
* _type: 该文档所属的 type 名称
* _uid


### 常见 mapping 参数 [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/2.2/mapping-params.html)

* analyzer: 可以为 string 类型的的字段配置特定的分词器
* boost: 给特定字段提高相关性分数的计算倍率
* coerce: 相当于强制类型转换
* copy_to: 将该字段也拷贝到指定的 XX 字段, 可用于组建自定义(原始文档中并不存在)的字段
* doc_values: 在索引时构建数据的列访问格式并持久化到磁盘. 用于加速 aggregation 操作, 减少堆内存使用, 但有性能和存储开销
* dynamic: 用于指定当前字段(对象类型)层级下是否允许动态创建新的字段映射. 默认是 true
* enabled: 默认 true. 如设置为 false, 则会直接忽略该字段(需对象类型)
* fielddata: 有点类似 doc_value 的作用, 但行为方式与其相对
* format: 用于时间类型的字段, 有几十种可选, 也可自定义如 yyyyMMdd_HH 什么的.
* geohash
* geohash_precision
* geohash_prefix
* ignore_above: 用于 string 类型字段, 如果长度大于该字段设置的值, 则忽略, 不做分词和索引.
* ignore_malformed
* include\_in\_all
* index: 关键属性. 三值可选: "no", "analyzed", "not_analyzed"
* index_options
* lat_lon
* fields: 可以将同一个字段按不同的方式索引多次, 比如一次是带分词的, 一次不带分词的.
* norms: 和计算相关性分数有关的一个参数
* null_value: 处理原始文档中 null 值的方式. 
* position\_increment\_gap: 用来修改数组元素之间的"间距"
* precision_step
* properties
* search_analyzer
* similarity
* store: 是否在索引中存储该字段, 默认是 false. 一般来说有 _source 就不需要这个了.
* term_vector


### 动态 mapping [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/2.2/dynamic-mapping.html)

* \_default\_ mapping: 默认映射. 可以在这里对 _all, _source, _timestamp 等字段进行设置. 其他的 type 自动继承这个索引的 \_default\_ 设置
* Dynamic field mapping: ES 如何将不同的数据映射成不同的类型. 其中两个比较有用的概念: date\_detection 和 numeric\_detection, 默认是开启的.
* Dynamic templates: 根据一些规则(类型, 字段名, 路径, 正则)捕获动态映射行为, 并根据自己的需要做定制化的修改.
* Override default template



#### 关于动态模板 dynamic template [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/2.2/dynamic-templates.html)

基本形式: 
```
"dynamic_templates": [
        {
          "my_template1": {
            "match_pattern": "regex",
            "match": "(price|money)",
            "mapping": {
              "type": "long"
            }
          }
        },
        {
	      "my_template2": {
            "match_mapping_type": "string",
            "mapping": {
              "type": "string",
              "index": "not_analyzed",
              "ignore_above": 128
            }
          }
        }
]
```

注意几个地方: 

* 所有的 tempalte 是放在一个数组中的, 先后顺序会影响最终匹配的映射模板
* 各个捕获类型: `match_mapping_type` `match` `path_match` 等可以配合使用
* 可以使用占位符表示捕获时的字段名和类型.