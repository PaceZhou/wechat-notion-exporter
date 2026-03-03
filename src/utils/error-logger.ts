import fs from 'fs';
import path from 'path';

export class ErrorLogger {
  private static logDir = path.join(process.cwd(), '.learnings');
  
  static async logError(error: any, context: any) {
    try {
      const errorEntry = this.createErrorEntry(error, context);
      const logPath = path.join(this.logDir, 'ERRORS.md');
      
      // Read existing content
      let existingContent = '';
      if (fs.existsSync(logPath)) {
        existingContent = fs.readFileSync(logPath, 'utf8');
      }
      
      // Append new error
      const updatedContent = existingContent + '\n' + errorEntry;
      fs.writeFileSync(logPath, updatedContent);
      
      console.log('✅ Error logged to .learnings/ERRORS.md');
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
  }
  
  static async logLearning(learning: any) {
    try {
      const learningEntry = this.createLearningEntry(learning);
      const logPath = path.join(this.logDir, 'LEARNINGS.md');
      
      let existingContent = '';
      if (fs.existsSync(logPath)) {
        existingContent = fs.readFileSync(logPath, 'utf8');
      }
      
      const updatedContent = existingContent + '\n' + learningEntry;
      fs.writeFileSync(logPath, updatedContent);
      
      console.log('✅ Learning logged to .learnings/LEARNINGS.md');
    } catch (logError) {
      console.error('❌ Failed to log learning:', logError);
    }
  }
  
  private static createErrorEntry(error: any, context: any): string {
    const timestamp = new Date().toISOString();
    const id = `ERR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-002`;
    
    return `## [${id}] wechat-notion-exporter

**Logged**: ${timestamp}
**Priority**: high
**Status**: pending
**Area**: backend

### Summary
Puppeteer configuration updated with additional args and timeout handling

### Error
\`\`\`
${error.message || JSON.stringify(error)}
\`\`\`

### Context
- Command: ${context.command || 'npm run start'}
- URL: ${context.url || 'unknown'}
- Environment: macOS with Google Chrome 145.0.7632.117
- Puppeteer config: headless=true, no-sandbox, disable-dev-shm-usage, disable-gpu, user-agent
- Additional args: --disable-web-security --disable-features=IsolateOrigins,site-per-process

### Suggested Fix
1. Test with different Chrome flags
2. Add network request interception to handle redirects
3. Implement retry mechanism with exponential backoff
4. Consider using Playwright as alternative

### Metadata
- Reproducible: yes
- Related Files: src/core/wechat-scraper.ts
- See Also: ERR-20260302-001
- Source: execution_error

---
`;
  }
  
  private static createLearningEntry(learning: any): string {
    const timestamp = new Date().toISOString();
    const id = `LRN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-001`;
    
    return `## [${id}] puppeteer-wechat-bypass

**Logged**: ${timestamp}
**Priority**: medium
**Status**: pending
**Area**: backend

### Summary
WeChat public account has advanced anti-bot detection that requires more sophisticated browser automation

### Details
Even with real Chrome browser, proper user-agent, and sandbox disabled, WeChat still blocks automated access. This suggests they use:
- Behavioral analysis (mouse movements, scroll patterns)
- Network fingerprinting (request headers, timing)
- IP reputation checking
- Session validation

### Suggested Action
Implement more human-like browser behavior:
- Random delays between actions
- Natural scrolling patterns
- Mouse movement simulation
- Request header randomization

### Metadata
- Source: error_analysis
- Related Files: src/core/wechat-scraper.ts
- Tags: wechat, anti-bot, puppeteer
- See Also: ERR-20260302-001

---
`;
  }
}