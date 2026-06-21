# 小马快跑 · PonyRun 🐴

> 围着一台手机，看几只可爱的线条小马赛跑，过程中抢道具搞事情，最后输的人喝酒。点开链接即玩——无需安装、无需注册、无需联网。
>
> A tiny party game: gather round **one phone laid flat on the table**, watch cute line-drawn ponies race, tap items flying by to cause chaos, and the loser drinks. Open the link and play — no install, no signup, no network.

中文 / English 双语 · 横屏 · 纯静态 · 运行时零 API 调用。

---

## 玩法 / How to play

1. 选 2–4 只小马（可改名）。Pick 2–4 ponies (rename if you like).
2. 比赛中**道具像流星划过屏幕**，用手指点击抓取。Tap items as they streak across.
3. **越稀有 → 飞得越快 → 越难抓 → 效果越炸裂。** Rarer = faster = harder = wilder.
4. 终点揭晓，**最后一名喝酒**。Last across the line drinks. 🍺

### 道具 / Items
| | 道具 | 效果 |
|---|---|---|
| 常见 Common | ⚡ 冲刺 Dash | 小马切换四脚兽态狂奔向前冲 |
| | 🍌 香蕉皮 Banana | 绊倒、停顿、后退 |
| | 🍺 罚酒 ±1 Penalty | 喝酒数 +1 / −1 |
| 罕见 Rare | 🔄 乾坤大挪移 Swap | 两只小马位置互换 |
| | 🚀 导弹空袭 Missile | 当前第一名被炸退一大段 |
| | 🚗 搭便车 Hitchhike | 当前最后一名搭车冲前 |

---

## 输赢三层影响模型 / The 40-30-30 model

最终名次由三层叠加决定，且经蒙特卡洛模拟验证（见 `src/logic/race.test.js`）：

| 层级 Layer | 占比 | 性质 |
|---|---|---|
| ① 基础奔跑速度 Base speed | ~40% | 开局定、纯运气 |
| ② 随机减速事件 Slowdown | ~30% | 非道具；领先者略易触发（橡皮筋追赶） |
| ③ 道具效果 Items | ~30% | 玩家主动抓取 |

手气好的小马大概率领先，但减速事件 + 道具合计 60% 的影响力**完全可能翻盘**——这就是戏剧性的来源。

---

## 技术栈 / Tech stack

- **Vite** + **PixiJS v8**（WebGL 2D，序列帧 `AnimatedSprite`）— 无 React。
- **逻辑层 / 渲染层解耦**：`src/logic/`（可独立测试的纯逻辑）↔ `src/render/`（只负责"演"）。道具效果通过事件注入。
- **美术全部用 Gemini（Nano Banana Pro）在开发期预生成**，以用户概念图为风格参考；切帧打包为 sprite-sheet strip + `manifest.json`。**运行时纯播放本地资源，不调用任何 API。**
- 角色动作走序列帧：`run` 两脚萌跑 ↔ `sprint` 四脚兽奔（吃到加速时切换，反差萌）；另有 `idle/trip/cry/taunt/hit`。
- 音效 / BGM 用 **Web Audio 程序化合成**，零音频文件。
- 中英双语 `src/i18n/`，浏览器语言自动识别，可一键切换。

```
src/
  logic/      rng · constants · items · race (+ tests)   ← 纯逻辑，无渲染
  render/     assets · Track · PonyActor · ItemMeteor · effects · RaceView
  audio/      sfx · bgm   (Web Audio, 程序化)
  ui/         screens · dom   (原生 DOM)
  i18n/       zh · en
scripts/gen/  开发期美术流水线（Gemini 生成 + 抠图切帧打包）
public/assets/ 预生成并打包的静态资源
```

---

## 本地开发 / Local dev

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 逻辑层单测（含 40/30/30 方差验证）
npm run build      # 产物 → dist/（纯静态）
```

### 重新生成美术（可选）/ Regenerate art (optional, dev-time only)

需要 `GEMINI_API_KEY` 或 `GOOGLE_API_KEY`。仅开发期使用，线上产物不依赖。

```bash
python scripts/gen/restyle_ponies.py   # 4 只小马 × 7 个动作
python scripts/gen/build_assets.py     # 抠图/切帧/打包 + 写 manifest
```

---

## 部署 / Deploy

纯静态，任意静态托管皆可（Vercel / Cloudflare Pages）。Build command `npm run build`，输出目录 `dist`。

🤖 Art generated with Gemini · Built with [Claude Code](https://claude.com/claude-code)
