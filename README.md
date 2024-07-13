# CreateDomTreeFromHTML
use node.js to read html file and create its dom tree

## 优化
目前基本逻辑是已经完成了
但是结束标签的处理逻辑还是有问题
后续可以针对自闭标签进行判断，如果有 自闭符合 **/** 那么将比较简单，但是注意属性值里的 **/**符号
可以先做针对有自闭符合的，没有的直接报错得了
