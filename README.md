# CreateDomTreeFromHTML
use node.js to read html file and create its dom tree

## 优化
目前基本逻辑是已经完成了

但是结束标签的处理逻辑还是有问题

后续可以针对自闭标签进行判断，如果有 自闭符合 **/** 那么将比较简单，但是注意属性值里的 **/** 符号

```JavaScript
// 如果还有属性
        if (withOutLeftAndRightArr.length > 0) {
            // 处理属性
            const keyValueStr = withOutLeftAndRightArr.join(' ');
            const regex = /(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^"\s']+)/g;
            let match;
            while ((match = regex.exec(keyValueStr)) !== null) {
                // match[1] 是键（key），match[2] 是值（value，包括引号）
                const [, key, valueWithQuotes] = match;
                // 去除首尾的引号
                const value = valueWithQuotes.replace(/^['"]|['"]$/g, '');
                node.attrs[key] = value;
            }
        }
```

可以在这里的join(' ')前进行处理

识别withOutLeftAndRightArr最后出现的\, 有以下几种情况

```
[....., 'key="value"', '', '/', '']
[....., 'key="value"', '', '/']
[....., 'key="value"', '/']
[....., 'key="value"/']
[....., 'key="value"/', '']

```


可以先做针对有自闭符合的，没有的直接报错得了
