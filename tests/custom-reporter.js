const fs = require('fs');
const path = require('path');

class CustomReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.testResults = [];
    this.failedTests = [];
    this.passedTests = [];
    this.skippedTests = [];
    this.startTime = Date.now();
  }

  onRunStart(results, options) {
    this.startTime = Date.now();
    this.testResults = [];
    this.failedTests = [];
    this.passedTests = [];
    this.skippedTests = [];
  }

  onTestResult(test, testResult, aggregatedResult) {
    testResult.testResults.forEach((result) => {
      const testInfo = {
        file: testResult.testFilePath,
        name: result.fullName,
        status: result.status,
        duration: result.duration,
        failureMessages: result.failureMessages,
        ancestorTitles: result.ancestorTitles,
      };

      this.testResults.push(testInfo);

      if (result.status === 'failed') {
        this.failedTests.push(testInfo);
      } else if (result.status === 'passed') {
        this.passedTests.push(testInfo);
      } else if (result.status === 'pending' || result.status === 'skipped') {
        this.skippedTests.push(testInfo);
      }
    });
  }

  onRunComplete(contexts, results) {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    this.generateMarkdownReport(results, duration);
  }

  generateMarkdownReport(results, duration) {
    const outputPath = path.join(__dirname, 'test-result.md');
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    let markdown = `# Jest 测试结果报告\n\n`;
    markdown += `**生成时间**: ${dateStr} (${timestamp})\n`;
    markdown += `**执行耗时**: ${(duration / 1000).toFixed(2)} 秒\n\n`;
    
    // 测试摘要
    markdown += `## 📊 测试摘要\n\n`;
    markdown += `| 指标 | 数量 |\n`;
    markdown += `|------|------|\n`;
    markdown += `| ✅ 通过 | ${results.numPassedTests} |\n`;
    markdown += `| ❌ 失败 | ${results.numFailedTests} |\n`;
    markdown += `| ⏭️  跳过 | ${results.numPendingTests} |\n`;
    markdown += `| 📝 总计 | ${results.numTotalTests} |\n`;
    markdown += `| 📁 测试套件 | ${results.numTotalTestSuites} |\n`;
    markdown += `| ✅ 通过的套件 | ${results.numPassedTestSuites} |\n`;
    markdown += `| ❌ 失败的套件 | ${results.numFailedTestSuites} |\n\n`;
    
    // 测试状态
    const allPassed = results.numFailedTests === 0;
    markdown += `**测试状态**: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}\n\n`;
    
    // 失败测试详情（集中显示）
    if (this.failedTests.length > 0) {
      markdown += `## ❌ 失败的测试（${this.failedTests.length} 个）\n\n`;
      
      this.failedTests.forEach((test, index) => {
        const relativePath = path.relative(process.cwd(), test.file);
        markdown += `### ${index + 1}. ${test.name}\n\n`;
        markdown += `**文件**: \`${relativePath}\`\n\n`;
        
        if (test.ancestorTitles && test.ancestorTitles.length > 0) {
          markdown += `**测试套件**: ${test.ancestorTitles.join(' > ')}\n\n`;
        }
        
        markdown += `**执行时间**: ${test.duration}ms\n\n`;
        
        if (test.failureMessages && test.failureMessages.length > 0) {
          markdown += `**错误信息**:\n\n`;
          test.failureMessages.forEach((message, msgIndex) => {
            markdown += `\`\`\`\n${message}\n\`\`\`\n\n`;
          });
        }
        
        markdown += `---\n\n`;
      });
    }
    
    // 通过的测试（简要列表）
    if (this.passedTests.length > 0) {
      markdown += `## ✅ 通过的测试（${this.passedTests.length} 个）\n\n`;
      
      // 按文件分组
      const testsByFile = {};
      this.passedTests.forEach((test) => {
        const relativePath = path.relative(process.cwd(), test.file);
        if (!testsByFile[relativePath]) {
          testsByFile[relativePath] = [];
        }
        testsByFile[relativePath].push(test);
      });
      
      Object.keys(testsByFile).forEach((file) => {
        markdown += `### ${file}\n\n`;
        testsByFile[file].forEach((test) => {
          markdown += `- ✅ ${test.name} (${test.duration}ms)\n`;
        });
        markdown += `\n`;
      });
    }
    
    // 跳过的测试
    if (this.skippedTests.length > 0) {
      markdown += `## ⏭️  跳过的测试（${this.skippedTests.length} 个）\n\n`;
      this.skippedTests.forEach((test) => {
        const relativePath = path.relative(process.cwd(), test.file);
        markdown += `- ⏭️  \`${relativePath}\` - ${test.name}\n`;
      });
      markdown += `\n`;
    }
    
    // 覆盖率信息（如果有）
    if (results.coverageMap) {
      markdown += `## 📈 覆盖率信息\n\n`;
      markdown += `覆盖率数据已生成，请查看 coverage/ 目录。\n\n`;
    }
    
    // 建议和下一步
    if (this.failedTests.length > 0) {
      markdown += `## 🔧 修复建议\n\n`;
      markdown += `1. 查看上方失败的测试详情\n`;
      markdown += `2. 检查测试代码和实现代码\n`;
      markdown += `3. 运行单个失败的测试进行调试：\n`;
      markdown += `   \`\`\`bash\n`;
      markdown += `   npm test -- <测试文件路径> -t "<测试名称>"\n`;
      markdown += `   \`\`\`\n\n`;
      
      // 列出所有失败的文件，方便快速定位
      const failedFiles = [...new Set(this.failedTests.map(t => t.file))];
      markdown += `### 失败的文件列表\n\n`;
      failedFiles.forEach((file) => {
        const relativePath = path.relative(process.cwd(), file);
        markdown += `- \`${relativePath}\`\n`;
      });
      markdown += `\n`;
    }
    
    // 写入文件
    fs.writeFileSync(outputPath, markdown, 'utf8');
    console.log(`\n📝 测试结果已保存到: ${path.relative(process.cwd(), outputPath)}`);
    
    if (this.failedTests.length > 0) {
      console.log(`\n❌ 发现 ${this.failedTests.length} 个失败的测试，请查看报告了解详情。`);
    }
  }
}

module.exports = CustomReporter;
