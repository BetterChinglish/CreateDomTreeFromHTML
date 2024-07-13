const fs = require('fs');

// 文件路径
const filePath = './testFile.html';

const fileHandler =  (err, data) => {
    if (err) {
        console.error('读取文件时发生错误:', err);
        return;
    }
    // 文件内容
    const fileLines = data.split('\r\n');
    const fileLinesInfos = [];
    fileLines.forEach(line => {
        const newLine = line.trim();
        if (newLine.length !== 0) {
            fileLinesInfos.push(newLine)
        }
        
    })
    console.log(fileLinesInfos);
}

// 使用fs.readFile异步读取文件
fs.readFile(filePath, 'utf8',fileHandler);
