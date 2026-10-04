# Ward Rain&Sun 保修成功页与 Lucky Draw 交接记录

> 更新时间：2026-10-04（Asia/Shanghai）  
> 用途：供新的 Codex/AI 窗口快速理解本次讨论、当前代码、已确定方案和后续升级方向。

## 1. 项目背景

- 项目目录：`D:\code\wardrainsun-website-v2\brand-support\Ward-web`
- 网站类型：无构建依赖的静态 HTML/CSS 网站，部署到 Vercel。
- 本次涉及：`warranty.html`、`warranty-success.html`。
- 保修表单提交到 N8N Webhook；只有 Webhook 返回成功后才进入成功页。
- 当前 Lucky Draw 改动已经包含在 Git 提交 `4631c08`（`update lucky draw`）中。
- 项目根目录另有 `N8N-WARRANTY-APPROVAL-HANDOFF.md`，记录保修审批工作流，属于另一条工作线。

## 2. 已确认的业务决策

### 保修状态

成功页不能说保修已经完成或激活，因为客户提交后仍需人工审核。当前准确文案为：

```text
Your warranty registration has been submitted for review.
```

### Lucky Draw 奖品结构

- 最高奖固定为一张 `$100 Amazon Gift Card`。
- 其他中奖者可能获得新款 Ward Rain&Sun 雨伞或其他较小奖品。
- 部分参与者可能不中奖。
- 页面不说明每月、定期或其他开奖频率。
- Lucky Draw 不得与 Amazon 评论、评分或晒单绑定。

因为不是所有奖品都价值 $100，最终采用 `Up to $100`，避免客户误以为所有奖品都是 $100 Amazon Gift Card。

## 3. 当前线上页面文案

成功页 Lucky Draw 区域只有“标题＋一行奖品说明＋按钮”：

```text
🎁 Enter for a Chance to Win Up to $100

Grand prize: a $100 Amazon Gift Card. Other prizes may include a new Ward Rain&Sun umbrella and more.

Open Email to Enter
```

刻意没有出现以下内容：

- `registration is complete`
- `monthly`
- `periodically`
- 保证人人中奖的表达
- 评论、评分或好评激励
- 倒计时或虚假紧迫感

## 4. 已实施的数据与邮件流程

### `warranty.html`

N8N 返回成功后，页面把本次提交信息保存在当前标签页的 `sessionStorage`：

```javascript
sessionStorage.setItem('wardWarrantySubmission', JSON.stringify({
  firstName,
  email,
  orderId
}));
```

- `email` 和 `orderId` 是必填项。
- `firstName` 是可选项。
- 保存失败会记录 `console.warn`，但不会阻止成功页跳转。
- 跳转地址是 `/warranty-success`，不再把姓名、邮箱或订单号放入 URL。

### `warranty-success.html`

- 从 `sessionStorage` 的 `wardWarrantySubmission` 读取信息。
- 有姓名时显示 `Thank you, Jane!`；没有姓名时显示 `Thank you!`。
- 审核通知区域继续显示客户提交的邮箱。
- Lucky Draw 按钮动态生成 `mailto:` 链接。
- 所有动态字段使用 `encodeURIComponent` 编码。
- 直接访问成功页或无法读取暂存数据时，退回可手动填写邮箱和订单号的邮件模板。

当前邮件配置：

```text
To: support@wardrainsun.com
Cc: wardrainsun@outlook.com
Subject: Lucky Draw Entry

Hello Ward Rain&Sun team,

I'd like to enter the Lucky Draw.

Name: [仅在客户填写姓名时出现]
Email: [提交邮箱]
Amazon Order ID: [提交订单号]

Thank you!
```

浏览器只能打开并预填客户的默认邮件应用，不能代替客户发送，也无法确认客户最后是否点击了发送。

## 5. 已完成的验证

- 有姓名时：问候语和邮件正文正确包含姓名。
- 无姓名时：页面正常显示，邮件正文完全不生成空白 `Name:` 行。
- 姓名含撇号、空格、`&` 等特殊字符时：邮件 URL 编码正确。
- 邮箱和订单号始终能进入邮件正文。
- 直接访问成功页时：生成可手填的备用邮件。
- 成功页 URL 不包含姓名、邮箱或订单号。
- 页面不存在 `monthly`、`periodically` 或保证中奖文案。
- `git diff --check` 已通过。
- 用户已在页面测试后多轮精简文案。

## 6. 当前方案的已知限制

1. `mailto:` 依赖客户设备已配置邮件应用；部分手机或电脑可能无法正常打开。
2. 客户仍需在邮件应用中点击发送，网站无法知道邮件是否真正发出。
3. `sessionStorage` 仅在当前浏览器标签页会话中存在；关闭标签页后不会长期保留。
4. 页面尚无 Lucky Draw `Official Rules` 链接，也未公开奖品数量、适用地区、年龄要求、参加期限、抽取方式或中奖概率。
5. 当前通过 Amazon Order ID 参加，若抽奖面向美国消费者，需要进一步确认免费参加渠道及适用规则；上线正式活动前应进行专业合规审查。
6. `Other prizes ... and more` 保留了灵活性，但正式开奖前仍需在规则中明确实际奖品和数量。
7. 当前没有记录 Lucky Draw 按钮点击事件，也无法统计邮件发送转化率。

## 7. 推荐的后续升级顺序

### 第一优先：补齐规则与业务定义

1. 确定每轮奖品数量、奖品价值、参加起止时间和抽取方式。
2. 确定适用国家/地区、年龄限制和获奖通知/领取期限。
3. 建立不要求购买或订单号的免费参加渠道，并保证机会一致。
4. 新建简洁的 Official Rules 页面，在成功页以低干扰文本链接展示。

### 第二优先：减少 `mailto:` 流失

把 `Open Email to Enter` 升级为网站内一键登记：

```text
客户点击 Enter Lucky Draw
→ 网站向 N8N Lucky Draw Webhook 提交登记
→ 服务端去重
→ 页面原地显示 You're in!
```

建议使用保修登记返回的不可猜测 `registrationId`，不要在 URL 中传递邮箱或订单号。保留 `mailto:` 作为失败时的备用渠道。

### 第三优先：数据与转化分析

- 使用现有 Google Analytics 记录 Lucky Draw CTA 点击。
- 如改为在线登记，同时记录提交成功、重复登记和失败事件。
- 对比成功页访问量、CTA 点击率和最终有效登记率。

### 第四优先：体验优化

- 在真实 iPhone、Android、Windows 和 macOS 上测试邮件打开行为。
- 检查 320px 宽度下标题、奖品说明和按钮换行。
- 如需进一步提高参与率，只强化“操作简单”，不要虚构开奖时间、中奖概率或紧迫感。

## 8. 新窗口建议开场提示

可以在新窗口直接发送：

```text
请先阅读项目根目录的 LUCKY-DRAW-SUCCESS-PAGE-HANDOFF.md，核对 warranty.html 和 warranty-success.html 的当前实现，先不要修改。

基于文档中的“当前方案”和“推荐的后续升级顺序”，评估 Lucky Draw 成功页下一步最值得做的改进。重点兼顾：页面简洁、客户参与率、奖品表达透明、隐私和合规。不要重新引入 monthly、periodically、保证中奖或评论激励文案。
```

## 9. 当前 Git 状态说明

- 本次 Lucky Draw 网站改动已经提交到 `4631c08`。
- 创建本文档前，工作区仅有未跟踪文件 `N8N-WARRANTY-APPROVAL-HANDOFF.md`。
- 本交接文档是新增文件；创建后它也会显示为未跟踪，除非后续单独加入 Git。

