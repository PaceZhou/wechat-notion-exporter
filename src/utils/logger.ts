import fs from 'fs';
import path from 'path';

export class Logger {
  private static logDir = path.join(process.cwd(), '.learnings');
  
  static async init() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  static async logError(error: Error, context: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `## [ERR-${new Date().toISOString().replace(/[-:T]/g, '').substring(0, 8)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}] playwright-wechat-exporter

**Logged**: ${timestamp}
**Priority**: high
**Status**: pending
**Area**: backend

### Summary
Playwright 微信公众号抓取失败

### Error
\`\`\`
${error.message}
\`\`\`

### Context
- Command: ${context}
- Environment: ${process.platform} ${process.version}
- Playwright version: 1.41.0

### Suggested Fix
1. Check network connectivity to wechat servers
2. Verify Playwright browser installation
3. Add more robust error handling and retry logic

### Metadata
- Reproducible: yes
- Source: execution_error

---
`;
    
    const logPath = path.join(this.logDir, 'ERRORS.md');
    fs.appendFileSync(logPath, logEntry);
    console.error('❌ Error logged to .learnings/ERRORS.md');
  }
  
  static async logLearning(message: string, category: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `## [LRN-${new Date().toISOString().replace(/[-:T]/g, '').substring(0, 8)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}] ${category}

**Logged**: ${timestamp}
**Priority**: medium
**Status**: pending
**Area**: backend

### Summary
${message}

### Details
Playwright implementation for wechat article export

### Suggested Action
Continue development with improved error handling

### Metadata
- Source: learning
- Tags: playwright, wechat, export

---
`;
    
    const logPath = path.join(this.logDir, 'LEARNINGS.md');
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '# Learnings Log\n\n');
    }
    fs.appendFileSync(logPath, logEntry);
  }
}