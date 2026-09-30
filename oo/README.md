# Ward Rain&Sun Website

Ward Rain&Sun 的纯静态品牌与客户支持网站。当前版本将 Warranty 客户路径调整为“订单支持 + 产品护理”，不在站外创建注册记录、接收上传或存储客户业务数据。

## 公开页面

- `index.html`：品牌首页
- `warranty.html`：Warranty Help & Care，Amazon.com 美国买家扫码后的主要落地页
- `support.html`：Support & FAQ
- `privacy.html`：Analytics 与联系渠道隐私披露

Vercel 开启 `cleanUrls`，因此对应公开路径为 `/`、`/warranty`、`/support` 和 `/privacy`。

`/warranty-preview` 与 `/warranty-success` 在 `vercel.json` 中永久重定向到 `/warranty`。

## Warranty 第一阶段边界

- Amazon Your Orders 是订单、退换及与购买相关问题的主要入口。
- `support@wardrainsun.com` 是产品护理及包装内卡片问题的次级制造商支持入口。
- 网站不提供表单、上传、账户、注册记录、Claim 接口、正式 Warranty Terms 或客户数据库。
- 页面不承诺覆盖范围、期限、补救方式、处理时间或换新方式。
- 自动伞的详细操作步骤须经产品团队拿实物验证后才可加入。

## Analytics 与隐私

公开页面使用 GA4 ID `G-ZMWVTXSWFM`。配置中关闭 Google Signals 与广告个性化信号。页面不得向 Analytics 发送姓名、邮箱、Amazon Order ID、照片或 URL 参数中的个人信息。

隐私披露见 `privacy.html`。当前第一阶段受众限定为 Amazon.com 美国买家；若扩展到欧盟、英国或其他需要事前同意的市场，应在加载 Analytics 前增加合适的同意机制。

## 项目结构

```text
.
├── index.html
├── warranty.html
├── support.html
├── privacy.html
├── css/
│   └── style.css
├── docs/
│   ├── warranty-preview-project-handoff.md
│   ├── packaging-card-next-print-checklist.md
│   └── archive/warranty-registration-prototype/
├── .vercelignore
└── vercel.json
```

`docs/`、`tmp/` 和 Markdown 文件已通过 `.vercelignore` 排除，不应出现在静态部署中。旧注册页、成功页和 Claim/Record 原型保存在 `docs/archive/warranty-registration-prototype/`，仅供内部追溯。

## 本地预览

无需构建工具。在项目目录启动任意静态服务器，例如：

```powershell
python -m http.server 4173
```

然后打开 `http://127.0.0.1:4173/warranty.html`。

## 发布闸门

在提交、推送或 Vercel 发布前必须完成本地 QA，并再次取得负责人明确授权。发布前至少确认：

1. 四种目标视口布局与键盘导航；
2. Amazon、邮箱、canonical 和重定向；
3. 公开文件的旧漏斗文字回归；
4. GA 配置与 `/privacy`；
5. 实际手机扫描现有包装二维码的最终落点；
6. Amazon Seller Support 对完整客户路径和新版包装文案的书面反馈。

第二阶段只有在法务批准完整 Limited Warranty、期限定义、消费者权利与购买前可访问条款后，才能增加正式 Warranty Information。
