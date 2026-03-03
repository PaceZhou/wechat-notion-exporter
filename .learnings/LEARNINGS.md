# Learnings Log

## [LRN-20260302-001] wechat-anti-bot

**Logged**: 2026-03-02T00:16:30Z
**Priority**: high
**Status**: pending
**Area**: backend

### Summary
微信公众号有严格的反爬虫机制，即使使用真实 Chrome 浏览器也无法绕过

### Details
微信公众号实施了多层反爬虫保护：
1. User-Agent 检测 - 需要真实的浏览器标识
2. 行为检测 - 需要模拟真实用户行为（鼠标移动、滚动等）
3. Cookie/Session 验证 - 需要有效的登录状态
4. IP 限制 - 频繁请求会被临时封禁

即使配置了 Puppeteer 使用系统 Chrome 并禁用沙盒，仍然无法成功抓取内容。

### Suggested Action
1. Implement more sophisticated browser automation with human-like behavior simulation
2. Consider using proxy rotation to avoid IP blocking
3. Add cookie/session management to maintain authenticated state
4. Evaluate alternative approaches like manual content extraction + automated processing

### Metadata
- Source: error_analysis
- Related Files: src/core/wechat-scraper.ts
- Tags: wechat, anti-bot, puppeteer
- See Also: ERR-20260302-001
- Pattern-Key: wechat.anti_bot_detection
- Recurrence-Count: 1
- First-Seen: 2026-03-02
- Last-Seen: 2026-03-02

---