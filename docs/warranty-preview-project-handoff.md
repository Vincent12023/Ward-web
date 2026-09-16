# Ward Rain&Sun Warranty 项目交接说明

> 更新日期：2026-09-16  
> 当前状态：第一阶段正式候选已在本地实现；未提交、未推送、未部署。

## 1. 当前方案

`/warranty` 定位为面向 Amazon.com 美国买家的 **Warranty Help & Care** 支持页。它帮助扫描旧包装卡的客户找到正确渠道，但不在站外创建 Warranty Registration、Warranty Record 或 Claim。

客户路径：

1. 页面确认客户已到达正确位置，并说明无需在线表单即可请求帮助，应保留购买凭证。
2. Amazon Your Orders 是订单、退换及与购买相关问题的主要入口。
3. `support@wardrainsun.com` 是产品护理及包装卡问题的次级制造商支持入口。
4. 页面提供经过收敛的通用安全与护理建议。

第一阶段不展示 Lifetime 定义、覆盖摘要、免费换新、无需退回、固定处理时间或其他未经法务批准的承诺。本页不是正式 Warranty Terms。

## 2. 已实现内容

### 公开页面

- `warranty.html`：正式候选支持页，无表单、输入、上传、sessionStorage 或业务数据请求。
- `index.html`：所有旧激活漏斗与期限/固定补救承诺已移除，统一指向 Warranty Help & Care。
- `support.html`：删除旧注册 FAQ、确认邮件、资格和固定补救承诺；Amazon Your Orders 优先，客服邮箱次级。
- `privacy.html`：披露 GA4、Cookie/标识符、设备/浏览器信息、近似位置、用途、Google 数据处理与联系邮箱。

### 路由与部署边界

- `/warranty-preview` → `/warranty`，永久重定向。
- `/warranty-success` → `/warranty`，永久重定向。
- `.vercelignore` 排除 `docs/`、`tmp/` 和 Markdown 文件。
- `vercel.json` 保留 clean URLs 与无尾斜杠设置，并增加基础安全响应头。

### Analytics

- GA4 ID：`G-ZMWVTXSWFM`。
- 默认直接加载，仅面向当前 Amazon.com 美国买家场景。
- `allow_google_signals: false`。
- `allow_ad_personalization_signals: false`。
- 不得把邮箱、订单号、照片或 URL 参数中的个人信息发给 Analytics。

### 内部归档

旧页面和原型位于：

`docs/archive/warranty-registration-prototype/`

归档包含：

- 旧 Google Forms 注册页副本；
- 旧 Preview 和成功页；
- 旧 Warranty Record / Claim CSS、JavaScript 与数据模型。

这些资产被 `.vercelignore` 排除，不是线上接口，也不代表当前产品方向。

## 3. 两阶段路线

### 第一阶段：支持页

当前实现范围：支持分流、通用护理、安全提示、隐私披露和旧路径重定向。页面不得暗示必须在某期限内完成站外操作才能获得帮助。

### 第二阶段：正式 Warranty Information

只有法务批准以下内容后才能进入：

- 完整 Limited Warranty 文本；
- “Lifetime”如继续使用时的精确定义；
- 覆盖、排除、补救方式和适用法律；
- 消费者法定权利；
- 购买前条款可访问性；
- 各渠道与包装文案的一致性。

自动伞的详细操作步骤也必须由产品团队使用实物确认后才能上线。

## 4. 残余风险与假设

- 当前包装卡仍包含旧激活、时限与营销语言；网站改造不能消除实体卡本身的风险。
- `support@wardrainsun.com` 假设有人持续处理产品及包装卡问题。
- 当前方案降低站外数据收集和营销漏斗风险，但不保证 Amazon 合规。
- 完整客户路径和下一批包装卡文案仍应提交 Amazon Seller Support 获取书面反馈。
- 当前默认加载 Analytics。若受众扩展至欧盟、英国等市场，需要重新评估并改为获得适用同意后加载。

## 5. 上线前验收闸门

1. 检查 320×568、390×844、768×1024 和 1440×900。
2. 检查键盘导航、Skip Link、焦点状态、标题层级、44px 触控区域和 WCAG AA 对比度。
3. 检查 Amazon、`mailto:`、canonical 与永久重定向。
4. 对公开部署文件执行旧漏斗文字回归。
5. 确认 `/warranty` 无表单、输入、上传、sessionStorage 或业务请求。
6. 确认 GA 配置、无 PII 参数，且 `/privacy` 可访问。
7. 使用实际手机扫描当前包装二维码，确认最终落点为 `/warranty`。
8. 先交付截图、改动清单与测试结果。

未经负责人第二次明确授权，不得提交、推送或部署。
