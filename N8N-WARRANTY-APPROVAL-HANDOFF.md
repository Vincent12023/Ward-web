# Ward Rain&Sun 保修审批流程交接记录

> 更新时间：2026-10-04（Asia/Shanghai）  
> 用途：供新的 Codex/AI 窗口快速理解背景、当前线上状态、已验证结果和下一步升级方向。

## 1. 项目与系统背景

- 本地项目：`D:\code\wardrainsun-website-v2\brand-support\Ward-web`
- 网站类型：无构建依赖的静态 HTML/CSS 网站，部署到 Vercel。
- 主要网页：`index.html`、`warranty.html`、`warranty-success.html`、`support.html`。
- `warranty.html` 会把订单号、客户资料和照片提交到 N8N。
- 本次没有修改任何现有网站文件；只修改了 N8N 工作流，并新增本交接文档。

### 相关 N8N 工作流

| 用途 | 工作流 | ID | 当前状态 |
|---|---|---|---|
| 保修登记 | WardRainSun — Warranty Registration | `eVGskfUmmjzlELO1` | Active |
| 批准保修 | WardRainSun — Warranty Approval | `TqDohDITOTjdPyNk` | Active，已修改并发布 |
| 拒绝保修 | WardRainSun — Warranty Rejection | `ruOTekp7Rmkzddo9` | Active，未修改 |

## 2. 最初问题与根因

客户在保修获批后会收到两封相同的 Warranty Activated 邮件。

只读检查执行记录后确认：

- Approval 工作流中的客户邮件节点只有一条输入路径，每次执行只调用 Mailgun 一次。
- 重复邮件来自两条独立的 webhook 执行，而不是邮件节点自身重试。
- 典型重复执行：`613/614`、`609/610`、`602/603`，两次请求仅相差约 0.09–0.47 秒。
- 每条执行都获得不同的 Mailgun Message ID，因此实际排队了两封邮件。
- 第一条请求通常是通用 Chrome User-Agent、`Accept: */*`，符合邮件安全扫描/预加载特征。
- 第二条请求来自 QQ 客户端，Referer 为 `https://wx.mail.qq.com/`，符合管理员真实点击。
- 历史上还出现过十几次请求集中在数秒内触发，进一步证明存在自动扫描。

根因是原流程把具有副作用的审批操作直接放在 GET 链接后面：

```text
GET /webhook/warranty-approve
→ 更新 Google Sheets
→ 调用 Mailgun
→ 返回成功页
```

QQ 邮箱安全扫描器访问 GET 链接时就已经完成审批和发信；管理员随后点击又完整执行一次。

## 3. 已经实施并发布的修改

工作流：`WardRainSun — Warranty Approval`（`TqDohDITOTjdPyNk`）

现在线上流程分成两条完全独立的路径：

```text
GET /webhook/warranty-approve
→ Approve Webhook
→ Extract Params
→ Return Confirmation Page
→ 结束，不访问 Google Sheets，不调用 Mailgun

POST /webhook/warranty-approve-confirm
→ Approve Confirm Webhook
→ Extract POST Params
→ Update row in sheet
→ Email Customer: Warranty Activated
→ Return Approval Page
```

### GET 路径

- 保留原有地址和查询参数，因此历史管理员邮件仍然有效。
- 读取 `orderId`、`email`、`name`。
- 对显示值和隐藏表单值进行 HTML 转义。
- 返回一个品牌化的 `Confirm Warranty Approval` 页面。
- 页面显示客户姓名、订单号和邮箱。
- 页面包含：
  - `Approve & Send Email`
  - `Cancel`
- GET 本身不再修改任何数据或发送邮件。

确认页中的表单：

```html
<form method="POST" action="/webhook/warranty-approve-confirm">
  <input type="hidden" name="orderId" value="...">
  <input type="hidden" name="email" value="...">
  <input type="hidden" name="name" value="...">
  <button type="submit">Approve &amp; Send Email</button>
</form>
```

提交时按钮会立即禁用并显示 `Processing...`，减少普通双击。

### POST 路径

- 新增 POST webhook：`warranty-approve-confirm`。
- `Extract POST Params` 从 request body 读取订单号、邮箱和姓名。
- 缺少订单号/邮箱或邮箱格式错误时，在进入外部节点之前停止。
- 原 Google Sheets、Mailgun和成功页节点已全部迁移到 POST 分支。
- 客户邮件节点和成功页内的表达式已由：

```javascript
$('Extract Params').item.json
```

改为：

```javascript
$('Extract POST Params').item.json
```

### 当前客户邮件

客户邮件正文尚未修改，仍是原来的 Warranty Activated 邮件：

- Subject：`Your Ward Rain&Sun Lifetime Warranty Is Now Active ✓`
- Google Sheets仍写入：
  - `email send? = CONFIRMED`
  - `active state = active`

## 4. 发布与验证结果

### 工作流结构校验

- Validation：通过。
- 可执行节点：8 个；另有 1 个 Sticky Note。
- Trigger 节点：2 个。
- 有效连接：6 条。
- 无效连接：0 条。
- 已验证表达式：14 个。
- 错误：0。
- 警告：0。
- 当前已发布 Active Version ID：`00df74a3-0e2a-417e-8f90-57f98e423b7e`。

### GET 安全测试

- 执行 `619`：成功返回确认审批页面。
- 并发执行 `621`、`622`：模拟邮件扫描器重复访问。
- 两条并发执行均只运行：
  1. `Approve Webhook`
  2. `Extract Params`
  3. `Return Confirmation Page`
- `Update row in sheet` 和 `Email Customer: Warranty Activated` 均未运行。
- 两次响应均为 HTTP 200，并包含正确的 POST 表单。

### POST 安全测试

- 执行 `620`：向 POST 地址提交空数据。
- 执行只运行：
  1. `Approve Confirm Webhook`
  2. `Extract POST Params`
- 随后以 `Missing orderId or email` 停止。
- Google Sheets 和 Mailgun均未运行。

### 尚未执行的测试

没有执行一次完整的成功 POST，因为它会真实更新 Google Sheets，并向指定客户发送邮件。应使用明确的测试订单行和内部测试邮箱完成最终端到端验收。

### 回滚

N8N MCP 在修改前创建了本地备份：

- Backup Version ID：`489`
- Trigger：`partial_update`
- Operation Count：15

如新版本出现问题，可通过 N8N MCP 的 workflow version rollback 恢复该版本。

## 5. 当前已知限制

本轮只解决 QQ 邮箱扫描 GET 链接导致的误审批，以下问题尚未解决：

1. 两次真实 POST 同时到达时，仍可能发送两封邮件。
2. 尚未增加数据库锁、唯一键或严格幂等控制。
3. POST 表单参数仍由浏览器提交，没有签名 Token。
4. GET 地址仍在 URL 中携带订单号、客户邮箱和姓名。
5. 错误 POST 当前在 N8N 执行记录中报错；尚未制作友好的 HTTP 400 错误页。
6. `Warranty Rejection` 工作流未修改，如果其邮件链接同样是有副作用的 GET，也可能被邮箱扫描器误触发。
7. 浏览器手动刷新 POST 结果或重复点击仍可能重复处理。

## 6. 已讨论但尚未实施的邮件升级

用户希望把客户激活邮件改为“三项确认”邮件，大部分原始正文都要保留，并重点保证整体可读性。

### 希望保留的正文内容

- Joey 的客服团队自我介绍。
- 对客户照片的称赞。
- 感谢客户提供 Order ID 和产品照片。
- 说明保修需要在购买后 30 天内登记。
- Q1：如何快速获得支持，通常约 3 个工作日回复。
- Q2：正确打开和关闭自动伞的完整步骤，这是最重要部分。
- Q3：自愿分享 Amazon 使用体验，不影响保修或客服支持。
- 关键摘要使用粗体，三个问题分别放入清晰的卡片区域。

### 讨论过的选项

- Q1：`Yes, I understand.` / `I need more help.`
- Q2：`Yes, I have reviewed them.` / `I need more help.`
- Q3：
  - `I will share my experience soon.`
  - `Maybe later.`
  - `No, thank you.`

### 邮箱技术限制与已选方向

普通 HTML 邮件无法可靠实现“在邮件内点击多个选项，最后一个按钮动态汇总答案”，原因包括：

- QQ 邮箱、Gmail、Outlook 通常禁用 JavaScript。
- 邮件客户端可能删除或限制表单、单选框及动态提交。
- `mailto:` 链接无法读取客户之前在邮件里点过的选项。
- AMP 互动邮件不适合作为 QQ 邮箱兼容方案。

用户已选择的可行替代方向是：

```text
客户阅读完整邮件
→ 点击 Choose My Answers
→ 打开 Ward Rain&Sun 网站确认页面
→ 选择 Q1/Q2/Q3
→ 页面动态生成 mailto 邮件
→ 打开客户自己的邮箱客户端
→ 客户最后点击发送至 support@wardrainsun.com
```

该网页和邮件升级目前都尚未实施。

### 预期的后续业务状态

如果继续实施三项确认方案，先前讨论的状态是：

- 管理员确认后：
  - `email send? = CONFIRMATION_REQUEST_SENT`
  - `active state = awaiting_customer_confirmation`
- 客户回复后由客服人工检查，并改为：
  - `email send? = CONFIRMED`
  - `active state = active`
- 客服随后人工发送最终激活及护理说明邮件。

以上状态调整尚未实施；当前线上仍会在管理员 POST 审批后立即写入 `CONFIRMED/active`。

## 7. 建议的下一步顺序

1. 准备一个专用测试订单行和内部测试邮箱，完成一次真实 POST 端到端测试。
2. 检查并以同样的 GET 确认页方式保护 `Warranty Rejection` 工作流。
3. 决定是否正式上线“三项客户确认”业务流程。
4. 如上线，新增 `warranty-confirm.html` 页面，并完成 Q1/Q2/Q3 选择和动态 `mailto:` 汇总。
5. 修改客户邮件正文、Subject 和 Google Sheets状态。
6. 最后再评估签名 Token、友好错误页和服务端幂等保护。

## 8. 新窗口建议开场提示

可以在新窗口直接发送：

```text
请先阅读项目根目录的 N8N-WARRANTY-APPROVAL-HANDOFF.md。
使用已配置的 N8N MCP 检查其中记录的线上工作流状态，先不要修改。
重点确认 WardRainSun — Warranty Approval（TqDohDITOTjdPyNk）的 GET/POST 双分支仍与交接文档一致，然后基于“已讨论但尚未实施的邮件升级”继续优化方案。
```

