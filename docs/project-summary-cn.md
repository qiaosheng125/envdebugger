# 第八站项目总结：Vercel Env Checker

日期：2026-06-03

## 这个站是什么

`Vercel Env Checker` 是一个面向 Next.js / Vercel 用户的环境变量排查工具。用户回答几个部署相关问题后，工具会输出：

- 最可能原因排序；
- 修复检查清单；
- 可复制的 Vercel 命令；
- 不打印真实 secret 的安全 debug snippet；
- 官方文档入口；
- 可复制的 Markdown 报告。

正式域名：

```text
https://www.envdebugger.com
```

裸域 `https://envdebugger.com` 已 308 跳转到 `www`。

## 解决什么问题

它解决的是开发者经常遇到的这个问题：

```text
我明明在 Vercel / Next.js 里配置了环境变量，为什么线上还是 undefined、旧值、空值，或者浏览器端读不到？
```

常见原因包括：

- 浏览器端读取了没有 `NEXT_PUBLIC_` 前缀的变量；
- 把 secret 错误地加了 `NEXT_PUBLIC_`；
- 改了 `NEXT_PUBLIC_` 变量但没有重新部署；
- Production / Preview / Development 作用域选错；
- 本地 `.env.local` 和 Vercel 项目变量不同步；
- 为了调试在日志或前端打印真实 secret。

## 用户是谁

核心用户：

- Next.js / Vercel 开发者；
- 独立开发者；
- v0 / vibe coding 用户；
- 正在接 GA4、Clarity、Stripe、Supabase、数据库、Slack webhook、第三方 API 的人；
- 会部署，但不熟悉 Next.js build-time / runtime env 机制的人。

他们通常已经卡在一个具体故障上，需要的是排查顺序和安全修复动作，而不是再读一篇泛教程。

## 如何筛选出来

第八站从空白研究文件开始，没有沿用旧候选池。

筛过的方向：

| 候选 | 结论 | 原因 |
|---|---|---|
| Chrome Extension Permission Checker | WAIT+ | 需求存在，但竞品强，安全承诺风险高。 |
| Webpage / URL to Markdown | REJECT | 工具和开源项目很多，差异化弱。 |
| WhatsApp Order to CSV | WAIT | 商业痛点强，但轻量 MVP 价值可能偏薄。 |
| Vercel / Next.js Env Checker | DO | 痛点具体、工具化强、无需付费 API、能快速做出可用结果。 |

这个方向胜出的原因：

- 痛点来自真实开发流程；
- 搜索词偏任务型，而不是泛开发者词；
- 官方文档可以支撑规则，降低误导风险；
- 搜索结果多是文档、帖子和问答，交互式诊断工具较少；
- MVP 不需要读取用户 repo，不需要用户粘贴真实 secret。

## 关键词与长尾词

主词：

- `vercel environment variables not working`
- `nextjs environment variables not working`

长尾词：

- `vercel env variables not updating`
- `NEXT_PUBLIC environment variable not working`
- `vercel redeploy after environment variable change`
- `why is my Vercel env variable undefined`
- `vercel env checker`
- `nextjs env checker`

判断：搜索量不一定大，但意图强，适合用具体工具页承接。

## 差异化

现有结果主要是：

- Next.js 官方文档；
- Vercel 官方文档；
- Vercel Community；
- Reddit / Stack Overflow；
- 博客教程；
- 通用 env validation 库。

本站差异化是：

```text
不是再写一篇教程，而是做一个交互式 debug wizard。
```

用户选择症状后，直接拿到先查什么、为什么可能错、执行什么命令、怎样安全打印调试信息。

## 当前完成情况

已完成：

- 诊断工具首页；
- 分支规则；
- 结果卡片；
- copy report；
- copy commands；
- copy debug snippet；
- About / Contact / Privacy / Terms；
- robots；
- sitemap；
- responsive UI；
- analytics 注入层；
- apex 到 www 的 308 canonical 跳转；
- Vercel 生产部署；
- 域名绑定和 HTTPS。

已测试：

```powershell
npm run test:rules
npm run build
$env:BASE_URL="http://127.0.0.1:3009"; npm run smoke
```

线上验证：

- `https://www.envdebugger.com` 返回 200；
- `https://envdebugger.com` 308 跳转到 `https://www.envdebugger.com/`；
- `robots.txt` 返回 200；
- `sitemap.xml` 返回 200；
- canonical 是 `https://www.envdebugger.com`；
- contact 页面显示 `support@envdebugger.com`。

## 当前不做什么

- 不连接 Vercel API；
- 不读取用户 repo；
- 不让用户粘贴真实 secret；
- 不保存用户输入；
- 不接账号系统；
- 不接支付；
- 不承诺完整部署审计。

## 还缺什么

上线 L0 前仍需补：

1. 创建并填入 GA4 Measurement ID。
2. 创建并填入 Clarity Project ID。
3. 提交 Google Search Console。
4. 提交 Bing Webmaster。
5. 配置 `support@envdebugger.com` 邮件转发。
6. 建 GitHub 远程仓库并推送。

## 是否值得买域名

域名已购买：`envdebugger.com`。

购买判断成立：

- 域名和工具意图匹配；
- 比泛泛的开发者工具名更清楚；
- `.com` 可用且短；
- 能覆盖后续扩展到 `.env`、build/runtime、Vercel、Next.js 调试工具集。

风险是搜索量可能不大，所以这个站应该以长尾词和工具页转化为主，不适合做成泛内容站。
