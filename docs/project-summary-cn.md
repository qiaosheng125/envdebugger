# 第八站项目总结：Vercel Env Checker

日期：2026-06-03

## 1. 这个站是什么

`Vercel Env Checker` 是一个 Next.js / Vercel 环境变量排查工具。

用户回答几个问题后，工具输出：

- 最可能原因排序；
- 修复检查清单；
- 可复制 Vercel 命令；
- 不打印真实 secret 的安全 debug snippet；
- 官方文档链接；
- 可复制 Markdown 报告。

当前本地地址：

```text
http://127.0.0.1:3009
```

已购买域名：

```text
envdebugger.com
```

计划 canonical：

```text
https://www.envdebugger.com
```

## 2. 解决什么问题

它解决的是：

```text
我明明在 Vercel / Next.js 里配置了环境变量，为什么线上还是 undefined、旧值、空值，或者浏览器端读不到？
```

常见原因：

- 在浏览器端读取了没有 `NEXT_PUBLIC_` 的变量。
- 把 secret 错误地加了 `NEXT_PUBLIC_`。
- 改了 `NEXT_PUBLIC_` 变量但没有重新部署。
- Production / Preview / Development 环境配置错。
- 本地 `.env.local` 和 Vercel 项目变量不同步。
- Sensitive env 变量不能按普通方式拉取或显示。
- 用户为了调试在日志里打印了真实 secret。

## 3. 用户是谁

核心用户：

- Next.js / Vercel 开发者；
- 独立开发者；
- v0 / vibe coding 用户；
- 正在接 GA4、Clarity、Stripe、Supabase、数据库、Slack webhook、第三方 API 的人；
- 会部署，但对 Next.js build-time / runtime env 机制不熟的人。

用户状态通常是：

- 已经在上线或部署；
- 某个功能被环境变量卡住；
- 急需一个具体排查顺序；
- 不想再翻多篇官方文档、Reddit、Stack Overflow。

## 4. 我是怎么筛选出来的

第八站没有沿用旧候选池，而是从空白研究记录开始。

先看了 3 个候选：

| 候选 | 结论 | 原因 |
|---|---|---|
| Chrome Extension Permission Checker | WAIT+ | 需求存在，但 Zovo、Chrome-Stats、CRXcavator 等竞品较强，且安全承诺风险高。 |
| Webpage / URL to Markdown | REJECT | 竞品非常多，Firecrawl、Mdream、Web2MD、htmltomarkdown、MarkDownload 等都已覆盖。 |
| WhatsApp Order to CSV | WAIT | 商业痛点强，但完整价值偏 WhatsApp 集成和 SaaS，轻量粘贴工具可能太薄。 |

后来加入 C004：

`Vercel / Next.js Env Checker`

它胜出的原因：

- 痛点来自真实开发流程，第七站也踩过环境变量和 redeploy 问题。
- 搜索词非常任务型，不是泛大词。
- 官方文档能支撑规则，降低胡编风险。
- 现有结果多是文档、帖子和问答，交互式诊断工具较少。
- MVP 不依赖付费 API，不需要用户输入 secret。
- 1-3 天内能做出真实可用结果。

## 5. 关键词和长尾词

主词：

- `vercel environment variables not working`
- `nextjs environment variables not working`

长尾词：

- `vercel env variables not updating`
- `NEXT_PUBLIC environment variable not working`
- `vercel redeploy after environment variable change`
- `why is my Vercel env variable undefined`

工具词：

- `vercel env checker`
- `nextjs env checker`
- `environment variable debug checklist`

当前判断：

- 搜索量可能不是大词级别；
- 但用户意图强；
- 适合用一个具体工具页承接；
- 不能做泛开发者工具站，必须紧贴 env debug。

## 6. 竞品和差异化

现有结果主要是：

- Next.js 官方文档；
- Vercel 官方文档；
- Vercel Community；
- Reddit / Stack Overflow；
- 博客教程；
- 通用 env validation 库。

这些内容的问题：

- 分散；
- 需要用户自己判断分支；
- 不能根据症状输出具体排查顺序；
- 很多回答没有强调 secret 安全。

本站差异化：

```text
不是再写一篇教程，而是做一个交互式 debug wizard。
```

用户选择症状后，直接拿到：

- 为什么可能错；
- 先查什么；
- 执行什么命令；
- 怎么安全打印调试信息；
- 哪些做法不要做。

## 7. MVP 已完成什么

已完成：

- 首页诊断工具；
- 分支规则；
- 结果卡片；
- copy report；
- copy commands；
- copy debug snippet；
- About / Contact / Privacy / Terms；
- robots；
- sitemap；
- responsive UI；
- 本地 smoke check；
- 规则测试。

规则测试覆盖：

- 浏览器读取 server-only 变量；
- `NEXT_PUBLIC_` 旧值；
- Vercel 环境配置错；
- 本地和 Vercel 不同步；
- secret 错误使用 `NEXT_PUBLIC_`；
- debug snippet 不打印真实值。

## 8. 当前不能做什么

当前不做：

- 不连接 Vercel API；
- 不读取用户 repo；
- 不让用户粘贴真实 secret；
- 不保存输入；
- 不做完整部署审计；
- 不接账号系统；
- 不接支付；
- 不上线。

## 9. 上线前还缺什么

如果决定买域名并上线，还需要：

1. 确认产品名。
2. 选域名。
3. 配置 `NEXT_PUBLIC_SITE_URL`。
4. 配置真实 support 邮箱。
5. 部署到 Vercel。
6. 绑定域名和 HTTPS。
7. 接 GA4 / Clarity。
8. 提交 GSC / Bing。
9. 用最终域名检查 robots、sitemap、canonical。
10. 做上线后 7/14/30 天复盘。

## 10. 是否建议买域名

当前状态：

```text
域名 envdebugger.com 已购买，可以进入部署与上线配置阶段。
```

理由：

- 方向比前三个候选更干净；
- MVP 已经真实可用；
- 搜索意图明确；
- 风险低；
- 但搜索量可能不大，需要域名候选和 SERP 再确认一次。

建议下一步：

部署到 Vercel，绑定 `www.envdebugger.com`，配置 support 邮箱、GA4、Clarity、GSC 和 Bing。
