export default {
  appTitle: 'ポニーラン', tagline: '1台のスマホを囲んで、アイテムをつかみゴールへダッシュ', loading: '読み込み中…', langName: 'JA',
  start: { ponies: 'ポニーは何頭？', names: '名前 / 色（任意）', play: 'スタート', hint: '飛んでくるアイテムをタップして大騒ぎ · レアほど速く、難しく、ハチャメチャ', tapName: 'タップで名前を変更' },
  settings: { track: 'コースの長さ', items: 'アイテムの量', off: 'オフ' },
  guide: {
    open: '遊び方', title: '遊び方', rulesTitle: 'レースのルール', itemsTitle: 'アイテム', back: '設定に戻る',
    penaltyLegend: '🤡 1つで罰ゲーム1回。+1で1回追加、−1で1回減ります。',
    rules: { setup: 'ポニーを2〜4頭選び、スマホを横向きでテーブルに置いてみんなで囲みます。', catch: 'アイテムが飛んできたらタップ。同じレーンのポニーに効果がかかります。', finish: '最初にゴールしたポニーが罰ゲームなしで優勝。その他は最低1回の罰ゲームを受けます。' },
    items: {
      dash: { name: 'ダッシュ', desc: '短時間スピードアップして前へ走ります。' }, banana: { name: 'バナナの皮', desc: 'すべって止まり、少し後ろに下がります。' },
      penaltyPlus: { name: '罰ゲーム +1', desc: '最後の罰ゲームが1回増えます。' }, penaltyMinus: { name: '罰ゲーム −1', desc: '最後の罰ゲームが1回減ります。' },
      missile: { name: 'ミサイル', desc: 'ポニーを大きく後ろへ吹き飛ばします。' }, hitchhike: { name: 'ヒッチハイク', desc: '車でポニーを大きく前へ運びます。' },
    },
  },
  race: { ready: 'よーい…', go: 'スタート！', tapItems: 'アイテムをタップ！', photoFinish: 'フォトフィニッシュ！' },
  result: { winner: '優勝', loser: 'ビリ', safe: '罰ゲームなし', noPenalty: '罰ゲームなし ✨', penalty: '罰ゲーム ×{n}！', complete: 'レース終了！', replay: 'もう一度', setup: '設定', rankTitle: 'リザルト' },
  items: { dash: 'ダッシュ！', banana: 'すべった！', penaltyPlus: '罰ゲーム +1', penaltyMinus: '罰ゲーム −1', swap: '入れ替え！', missile: 'ミサイル！', hitchhike: 'ヒッチハイク！', miss: 'ミス…' },
  rotate: { title: 'スマホを横向きにしてください', desc: '横向きでテーブルに置き、みんなで遊びましょう' },
  install: { tap1: 'フルスクリーンにするには', tap2: '共有 →「ホーム画面に追加」' },
  colors: { white: 'スノー', brown: 'ココア', gray: 'スモーキー', yellow: 'サニー' },
};
