# Warranty Help & Care 本地 QA

> 日期：2026-09-16  
> 环境：本地静态服务器 + Codex in-app Chromium  
> 结论：本地正式候选通过；仍未提交、推送或部署。

## 响应式与首屏

已生成并目视检查以下视口截图：

| 视口 | 结果 |
|---|---|
| 320×568 | 通过；无横向溢出；Amazon 主按钮完整显示，44px 高；客服邮箱在首屏内可见 |
| 390×844 | 通过；双入口按 Support → Care 顺序纵向排列，两个入口均在首屏内 |
| 768×1024 | 通过；双入口横向排列，无重复 ID 或溢出 |
| 1440×900 | 通过；内容宽度、留白与卡片层级正常，无横向溢出 |

小屏首轮曾发现 320×568 下邮箱落在首屏下方，已压缩 Hero 和支持卡间距并复测通过。

## 无障碍

- 每个公开页面只有一个 H1。
- Warranty 标题层级为 H1 → H2 → H3，无跳级。
- Skip Link 可通过 Tab 获得焦点，具有 3px 可见焦点环；主内容可接收跳转焦点。
- Amazon 主按钮最小高度 44px。
- Support FAQ 使用原生 `details/summary`，已验证 Enter 键可展开。
- 支持 `prefers-reduced-motion`。
- 关键颜色组合对比度：4.67:1–13.92:1，均达到普通文本 WCAG AA 的 4.5:1 阈值。

## 内容与数据边界

- 公开 HTML/CSS 未检出旧漏斗词：Activate、Register、30-day、Exclusive offers、Free replacement、No returns 或评论请求。
- `/warranty` 未检出表单、输入、上传、localStorage、sessionStorage、Fetch、XHR、URL 参数读取或业务数据请求。
- Warranty 页邮件链接只有中性主题：`Product Support Question`，没有正文模板或个人信息参数。
- 所有本地相对链接目标存在。
- Canonical：`https://wardrainsun.com/warranty` 与 `https://wardrainsun.com/privacy`。

## 路由与配置

- `vercel.json` JSON 解析通过。
- `/warranty-preview` 与 `/warranty-success` 已配置永久重定向至 `/warranty`。
- 本地路由模拟验证两个旧路径均返回 308 并指向 `/warranty`。
- `cleanUrls: true`，`trailingSlash: false`。
- 四个基础安全响应头已配置。
- `.vercelignore` 排除 `docs/`、`tmp/` 与 Markdown 文件。

## Analytics 与隐私

- 四个公开页面均包含 GA4 ID `G-ZMWVTXSWFM`。
- 四个页面均配置 `allow_google_signals: false` 和 `allow_ad_personalization_signals: false`。
- `/warranty` URL、Amazon 链接及 `mailto:` 不含订单号、邮箱值、照片或客户参数。
- `/privacy` 本地返回 200 并完成目视检查。
- 外部 GA 请求及生产域名下的实际采集仍需在 Vercel Preview/Production 环境的浏览器 Network 面板复核；本次没有发布，因此未产生生产验证结果。

## Git 与文件

- `git diff --check` 通过；仅有仓库现有的 LF/CRLF 提示。
- 旧注册、成功页和 Claim/Record 原型已归档到 `docs/archive/warranty-registration-prototype/`。
- 未提交、未推送、未部署。

## 尚需人工或外部完成

1. 用实际 iOS 与 Android 手机扫描现有包装二维码，确认最终到达 `/warranty`。
2. 将完整客户路径和下一批包装卡文案提交 Amazon Seller Support，保留书面反馈。
3. 第二阶段 Warranty Terms 由法务批准。
4. 自动伞详细操作方法由产品团队用实物确认。
5. 获得负责人第二次明确授权后，才可提交、推送或发布；发布后复核正式 308、安全响应头与 GA Network 请求。
