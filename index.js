const fs = require('fs');
const { skip } = require('node:test');

// 文件路径
const filePath = './testFile.html';

const TAGNAMES = {
    HTML: 'html',
    HEAD: 'head',

}

const fileHandler =  (err, data) => {
    if (err) {
        console.error('读取文件时发生错误:', err);
        return;
    }

    // 以换行符分割、排除空行
    const strArr = data.toString().split('\r\n');
    const strArrHandled = [];
    strArr.forEach(line => {
        const newLine = line.trim();
        // 排除空行
        if (newLine.length !== 0) {
            strArrHandled.push(newLine)
        }
    })

    // 恢复原貌，排除了空行与每行前后的空格
    const strData = strArrHandled.join('\r\n');

    // 查找需要添加换行符的下标
    const needAddSplitIndex = [];
    for (let i = 2; i < strData.length - 2; i++) {
        // > 后添加换行符
        if (strData[i] === '>' && strData[i - 1] !== '\\' && strData[i + 1] + strData[i + 2] !== '\r\n') {
            needAddSplitIndex.push(i);
        }
        // < 前添加换行符
        if (strData[i] === '<' && strData[i + 1] === '\/' && strData[i - 2] + strData[i - 1] !== '\r\n') {
            needAddSplitIndex.push(i - 1);
        }
    }
    // 以下标将字符串分割
    const splitStrArr = [];
    needAddSplitIndex.unshift(0);
    // TODO: 使用splice优化
    needAddSplitIndex.forEach((position, index) => {
        // 开头字符串
        if (index === 0) {
            splitStrArr.push(strData.slice(position, needAddSplitIndex[index + 1] + 1));
        }
        // 末尾字符串
        else if (index === needAddSplitIndex.length - 1) {
            splitStrArr.push(strData.slice(position+1))
        }
        else {
            splitStrArr.push(strData.slice(position+1, needAddSplitIndex[index+1] + 1))
        }
    })

    const endStr = splitStrArr.join('\r\n');
    const endStrArr = endStr.split('\r\n');
    if (endStrArr[endStrArr.length - 1].length === 0) {
        endStrArr.pop();
    }

    // TODO: 移到最前面判断前15个字符是否符合html文档标签
    if (endStrArr[0] === '<!DOCTYPE html>') {
        console.log('识别为html文档, 开始进行处理...');
    }
    console.dir(endStrArr);

    // 构建dom树
    const tagStack = [];
    /**
     * @param tagName 节点名称  string
     * @param content 节点内容 []
     * @param attrs 节点属性 {key: value}
     * @param subNodes 子节点   []
     * 
     */
    let domTree = null;
    let needSkip = true;
    endStrArr.forEach((line, index) => {
        // 跳过非<html>开始前所有标签
        if ((!line.startsWith('<html') || !line.endsWith('>')) && needSkip) {
            return;
        }
        needSkip = false;

        if (!(line.startsWith('<') && line.endsWith('>'))) {
            tagStack[tagStack.length - 1].content.push(line);
            return;
        }

        // 读取节点标签名与属性键值
        const withOutLeftAndRightArr = line.split('<')[1].split('>')[0].split(' ');

        // 开始还是结束标签
        if (withOutLeftAndRightArr[0].startsWith('\/')) {
            console.log('结束标签', withOutLeftAndRightArr[0].slice(0));
            // TODO: 结束标签处理
            if (tagStack.length === 1) {
                domTree = tagStack[0];
            }
            tagStack.pop();
            console.log(tagStack);
            console.log('--------------------------');
            return;
        }
        console.log('开始标签');

        // 开始标签处理
        // 创建节点对象
        /**
         * @param tagName 节点名称  string
         * @param content 节点内容 []
         * @param attrs 节点属性 {key: value}
         * @param subNodes 子节点   []
         * 
         */
        const node = {
            tagName: withOutLeftAndRightArr.shift(),
            content: [],
            attrs: {},
            subNodes: [],
        };

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

        // 放入栈, 判断是否已经有节点, 如果有还需要加到最上面那个节点的子节点中
        if (tagStack.length === 0) {
            tagStack.push(node);
        }
        else {
            tagStack[tagStack.length - 1].subNodes.push(node);
            tagStack.push(node);
        }

        // TODO: 自闭标签处理
        if (node.tagName === 'meta') {
            tagStack.pop();
        }


        console.log(tagStack);
        console.log('--------------------------');
    })
    console.log(JSON.stringify(domTree, null, 2));
}

// 使用fs.readFile异步读取文件
fs.readFile(filePath, 'utf8', fileHandler);
