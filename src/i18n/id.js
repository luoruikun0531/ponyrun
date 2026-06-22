export default {
  appTitle: 'PonyRun', tagline: 'Berkumpul di satu ponsel, ambil item, dan berlomba ke garis akhir', loading: 'Memuat…', langName: 'ID',
  start: { ponies: 'Berapa poni?', names: 'Nama / warna (opsional)', play: 'MULAI', hint: 'Ketuk item yang melintas untuk membuat kekacauan · makin langka = makin cepat = makin sulit = makin seru', tapName: 'ketuk untuk ganti nama' },
  settings: { track: 'Panjang lintasan', items: 'Jumlah item', off: 'Mati' },
  guide: {
    open: 'Cara bermain', title: 'Cara bermain', rulesTitle: 'Aturan balapan', itemsTitle: 'Item', back: 'Kembali ke pengaturan',
    penaltyLegend: 'Satu 🤡 berarti satu hukuman. +1 menambah hukuman; −1 menguranginya.',
    rules: { setup: 'Pilih 2–4 poni, taruh ponsel mendatar di meja, lalu berkumpullah.', catch: 'Ketuk item saat melintas; setiap item memengaruhi poni di jalurnya.', finish: 'Poni pertama yang finis menang tanpa hukuman. Poni lainnya mendapat minimal 1 hukuman.' },
    items: {
      dash: { name: 'Lari cepat', desc: 'Poni melesat maju dengan dorongan singkat.' }, banana: { name: 'Kulit pisang', desc: 'Poni terpeleset, berhenti, lalu mundur sedikit.' },
      penaltyPlus: { name: 'Hukuman +1', desc: 'Poni mendapat 1 hukuman akhir tambahan.' }, penaltyMinus: { name: 'Hukuman −1', desc: 'Hukuman akhir poni berkurang 1.' },
      missile: { name: 'Rudal', desc: 'Melempar poni jauh ke belakang.' }, hitchhike: { name: 'Tumpangan gratis', desc: 'Membawa poni jauh ke depan.' },
    },
  },
  race: { ready: 'Siap…', go: 'MULAI!', tapItems: 'Ketuk item!', photoFinish: 'Finis ketat!' },
  result: { winner: 'Pemenang', loser: 'Terakhir', safe: 'Tanpa hukuman', noPenalty: 'Tanpa hukuman ✨', penalty: 'Hukuman ×{n}!', complete: 'Balapan selesai!', replay: 'Main lagi', setup: 'Pengaturan', rankTitle: 'Hasil' },
  items: { dash: 'Melesat!', banana: 'Terpeleset!', penaltyPlus: 'Hukuman +1', penaltyMinus: 'Hukuman −1', swap: 'Tukar!', missile: 'Rudal!', hitchhike: 'Tumpangan gratis!', miss: 'Meleset…' },
  rotate: { title: 'Putar ponsel Anda', desc: 'Posisi mendatar, taruh di meja, dan main bersama' },
  install: { tap1: 'Ingin layar penuh? Ketuk', tap2: 'Bagikan → "Tambahkan ke Layar Utama"' },
  colors: { white: 'Salju', brown: 'Kakao', gray: 'Asap', yellow: 'Mentari' },
};
