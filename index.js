const fs = require('fs');

// 文件路径
const filePath = './testFile.html';

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
    needAddSplitIndex.forEach((position, index) => {
        if (index === needAddSplitIndex.length - 1) {
            splitStrArr.push(strData.slice(position+1))
        }
        else if (index === 0) {
            splitStrArr.push(strData.slice(position, needAddSplitIndex[index + 1]));
        }
        else {
            splitStrArr.push(strData.slice(position+1, needAddSplitIndex[index+1]+1))
        }
    })

    const endStr = splitStrArr.join('\r\n');
    const endStrArr = endStr.split('\r\n');
    if (endStrArr[endStrArr.length - 1].length === 0) {
        endStrArr.pop();
    }

    console.dir(endStrArr);
}

// 使用fs.readFile异步读取文件
fs.readFile(filePath, 'utf8', fileHandler);
