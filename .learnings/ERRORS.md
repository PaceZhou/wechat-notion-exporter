# Errors Log

## [ERR-20260302-001] wechat-notion-exporter

**Logged**: 2026-03-02T00:16:00Z
**Priority**: high
**Status**: pending
**Area**: backend

### Summary
Puppeteer 微信公众号抓取失败 - 浏览器进程卡住，无法提取内容

### Error
```
Failed to launch the browser process!
TROUBLESHOOTING: https://pptr.dev/troubleshooting
```

### Context
- Command: `npm run start "https://mp.weixin.qq.com/s?src=11..."`
- Input: DPH 上海航天科技城项目 URL
- Environment: macOS with Google Chrome 145.0.7632.117
- Puppeteer config: headless=true, no-sandbox, system Chrome path

### Suggested Fix
1. Check if Chrome is properly installed and accessible
2. Verify network connectivity to wechat servers
3. Add more robust error handling and timeout mechanisms
4. Consider using alternative approaches like direct HTTP requests with proper headers

### Metadata
- Reproducible: yes
- Related Files: src/core/wechat-scraper.ts
- See Also: 
- Source: execution_error

---
## [ERR-20260303-001] wechat-notion-exporter

**Logged**: 2026-03-03T00:35:58.193Z
**Priority**: high
**Status**: pending
**Area**: backend

### Summary
微信公众号内容抓取失败: WeChat article scraping failed

### Error
```
Waiting for selector `#js_content` failed: Waiting failed: 30000ms exceeded
```

### Context
- Command/operation attempted: npm run start <wechat-article-url>
- Input URL: https://mp.weixin.qq.com/s?src=11&timestamp=1772343584&ver=6571&signature=MUr8QFqbLn-BHRQVutmVE6Jl5Wwye7Tq-y2-HoqWPAAmUBuMP*80gKmUWSEzPVkXGrsPVyB6AagmJmPngIREJMzQo3OV6T1kOT61YQgHBa62NFVxn3DnlIqPuB4zN*u-&new=1
- Environment: macOS with Puppeteer + Chrome 145.0.7632.117

### Suggested Fix
1. 检查微信反爬虫机制是否过于严格
2. 尝试增加更真实的用户行为模拟
3. 考虑使用代理或延迟策略
4. 验证网络连接和防火墙设置

### Metadata
- Reproducible: yes
- Related Files: src/core/wechat-scraper.ts
- See Also: 

---
