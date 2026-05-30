'use client'

import { useState } from 'react'

const TABS = [
  { id: 'overview', label: 'Overview semua negara' },
  { id: 'id',       label: '🇮🇩 Indonesia' },
  { id: 'my',       label: '🇲🇾 Malaysia' },
  { id: 'sg',       label: '🇸🇬 Singapore' },
  { id: 'hk',       label: '🇭🇰 Hong Kong' },
  { id: 'au',       label: '🇦🇺 Australia' },
  { id: 'us',       label: '🇺🇸 United States' },
  { id: 'accel',    label: '⚡ Cara percepat' },
]

const CSS = `
.dt-wiki {
  --ct-primary:   #f4f4f5;
  --ct-secondary: #a1a1aa;
  --ct-tertiary:  #71717a;
  --cb-primary:   #18181b;
  --cb-secondary: #27272a;
  --cb-success:   rgba(20,83,45,.25);
  --cb-info:      rgba(30,58,95,.25);
  --cb-warning:   rgba(120,53,15,.25);
  --cbr-primary:  #52525b;
  --cbr-secondary:#3f3f46;
  --cbr-tertiary: #27272a;
  --cbr-warning:  #92400e;
  --cbr-info:     #1e3a8a;
  --r-md: 8px;
  --r-lg: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  padding: 1rem 0;
  color: var(--ct-primary);
}

/* Tabs */
.dt-tabs { display:flex; gap:6px; margin-bottom:1.5rem; flex-wrap:wrap }
.dt-tab {
  padding:7px 16px; border-radius:var(--r-md);
  border:.5px solid var(--cbr-secondary); background:transparent;
  color:var(--ct-secondary); font-size:13px; cursor:pointer; transition:all .15s;
}
.dt-tab:hover { color:var(--ct-primary); border-color:var(--cbr-primary) }
.dt-tab.on {
  background:var(--cb-secondary); color:var(--ct-primary);
  border-color:var(--cbr-primary); font-weight:500;
}

/* Section label */
.slbl {
  font-size:11px; font-weight:500; color:var(--ct-tertiary);
  letter-spacing:.08em; text-transform:uppercase;
  margin:1.5rem 0 .75rem; padding-bottom:6px;
  border-bottom:.5px solid var(--cbr-tertiary);
}

/* Country card */
.cc { border-radius:var(--r-lg); overflow:hidden; margin-bottom:14px }
.cc-head { padding:1rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:12px }
.cc-flag { font-size:24px; flex-shrink:0 }
.cc-info { flex:1 }
.cc-name { font-size:16px; font-weight:600 }
.cc-sub  { font-size:12px; color:var(--ct-secondary); margin-top:2px }
.cc-timeline { display:flex; align-items:center; gap:8px }
.cc-days { font-size:28px; font-weight:700 }
.cc-unit { font-size:12px; color:var(--ct-secondary); line-height:1.3 }
.cc-body {
  background:var(--cb-secondary); border:.5px solid var(--cbr-tertiary);
  border-top:none; border-radius:0 0 var(--r-lg) var(--r-lg); padding:1rem 1.25rem;
}
.cc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:8px; margin-bottom:10px }
.cc-stat { background:var(--cb-primary); border-radius:var(--r-md); padding:.625rem .875rem }
.cc-stat-label { font-size:10px; color:var(--ct-tertiary); letter-spacing:.06em; text-transform:uppercase; margin-bottom:3px }
.cc-stat-val   { font-size:15px; font-weight:500 }
.cc-rows { display:flex; flex-direction:column; gap:5px }
.cc-row {
  display:flex; align-items:flex-start; gap:8px; font-size:12px;
  color:var(--ct-secondary); padding:5px 0;
  border-bottom:.5px solid var(--cbr-tertiary); line-height:1.5;
}
.cc-row:last-child { border-bottom:none }
.cc-row-icon { font-size:14px; flex-shrink:0; margin-top:1px }
.cc-row strong { color:var(--ct-primary); font-weight:500 }
.verdict-box { border-radius:var(--r-md); padding:.75rem 1rem; font-size:13px; line-height:1.6; margin-top:10px; border-left:3px solid transparent }
.vb-green  { background:rgba(46,204,113,.12); border-left-color:#2ECC71 }
.vb-blue   { background:rgba(55,138,221,.12); border-left-color:#378ADD }
.vb-amber  { background:rgba(239,159,39,.12); border-left-color:#EF9F27 }
.vb-red    { background:rgba(216,90,48,.12);  border-left-color:#D85A30 }

/* Timeline bar */
.tl-wrap { margin:1.5rem 0 }
.tl-row { display:flex; align-items:center; gap:10px; margin-bottom:8px }
.tl-label { font-size:12px; width:130px; flex-shrink:0; font-weight:500 }
.tl-bar-wrap { flex:1; background:var(--cb-secondary); border-radius:100px; height:20px; overflow:hidden }
.tl-bar { height:100%; border-radius:100px; display:flex; align-items:center; padding-left:8px; font-size:10px; font-weight:500; color:white }
.tl-days  { font-size:11px; color:var(--ct-secondary); width:60px; text-align:right; flex-shrink:0 }
.tl-phase { font-size:11px; color:var(--ct-tertiary); width:80px; flex-shrink:0; text-align:right }

/* Comparison table */
.comp-table { width:100%; border-collapse:collapse; font-size:12px }
.comp-table th {
  background:var(--cb-secondary); padding:10px 12px; text-align:left;
  font-weight:500; color:var(--ct-secondary);
  border-bottom:.5px solid var(--cbr-tertiary); white-space:nowrap;
}
.comp-table td {
  padding:9px 12px; border-bottom:.5px solid var(--cbr-tertiary);
  vertical-align:top;
}
.comp-table tr:hover td { background:var(--cb-secondary) }
.comp-table tr:last-child td { border-bottom:none }

/* Pills */
.spill { font-size:11px; padding:2px 8px; border-radius:100px; font-weight:500; white-space:nowrap; display:inline-block }
.sp-green  { background:rgba(46,204,113,.2);  color:#2ECC71 }
.sp-blue   { background:rgba(55,138,221,.2);  color:#60a5fa }
.sp-amber  { background:rgba(239,159,39,.2);  color:#EF9F27 }
.sp-red    { background:rgba(216,90,48,.2);   color:#f87171 }
.sp-purple { background:rgba(99,102,241,.2);  color:#a78bfa }
.sp-grey   { background:rgba(100,100,100,.2); color:var(--ct-secondary) }

/* Accelerators */
.acc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:10px }
.acc-card { background:var(--cb-secondary); border:.5px solid var(--cbr-tertiary); border-radius:var(--r-lg); padding:1rem }
.acc-title { font-size:13px; font-weight:500; margin-bottom:8px; display:flex; align-items:center; gap:6px }
.acc-items { display:flex; flex-direction:column; gap:4px }
.acc-item { font-size:12px; color:var(--ct-secondary); padding:3px 0; display:flex; align-items:flex-start; gap:6px; line-height:1.5 }
.acc-item::before { content:"›"; color:var(--ct-tertiary); flex-shrink:0 }

/* Alerts */
.warn { background:var(--cb-warning); border:.5px solid var(--cbr-warning); border-radius:var(--r-md); padding:.875rem 1rem; font-size:12px; line-height:1.7; margin-bottom:12px }
.tip  { background:var(--cb-info);    border:.5px solid var(--cbr-info);    border-radius:var(--r-md); padding:.875rem 1rem; font-size:12px; line-height:1.7; margin-bottom:12px }

/* Stats row */
.stat-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; margin-top:8px }
.stat-box { background:var(--cb-secondary); border-radius:var(--r-md); padding:.875rem; text-align:center }
.stat-box-val { font-size:22px; font-weight:600 }
.stat-box-lbl { font-size:11px; color:var(--ct-secondary); margin-top:2px }
`

const panels: Record<string, string> = {
overview: `
<div class="tip">Angka di bawah adalah <strong>estimasi dari first outreach sampai kontrak ditandatangani</strong> — dengan asumsi kamu melakukan outreach secara konsisten dan menggunakan BI reference dengan benar. Kondisi aktif = kamu outreach minimal 3x/minggu ke market tersebut.</div>
<div class="slbl">Timeline first deal — dari outreach pertama sampai kontrak signed</div>
<div class="tl-wrap">
  <div class="tl-row"><div class="tl-label">🇮🇩 Indonesia</div><div class="tl-bar-wrap"><div class="tl-bar" style="width:22%;background:#2ECC71">45–75 hari</div></div><div class="tl-days">45–75 hr</div><div class="tl-phase"><span class="spill sp-green">Tercepat</span></div></div>
  <div class="tl-row"><div class="tl-label">🇲🇾 Malaysia</div><div class="tl-bar-wrap"><div class="tl-bar" style="width:32%;background:#378ADD">60–90 hari</div></div><div class="tl-days">60–90 hr</div><div class="tl-phase"><span class="spill sp-blue">Cepat</span></div></div>
  <div class="tl-row"><div class="tl-label">🇸🇬 Singapore</div><div class="tl-bar-wrap"><div class="tl-bar" style="width:42%;background:#5B8DEF">90–120 hari</div></div><div class="tl-days">90–120 hr</div><div class="tl-phase"><span class="spill sp-blue">Sedang</span></div></div>
  <div class="tl-row"><div class="tl-label">🇭🇰 Hong Kong</div><div class="tl-bar-wrap"><div class="tl-bar" style="width:55%;background:#EF9F27">120–150 hari</div></div><div class="tl-days">120–150 hr</div><div class="tl-phase"><span class="spill sp-amber">Agak Lama</span></div></div>
  <div class="tl-row"><div class="tl-label">🇦🇺 Australia</div><div class="tl-bar-wrap"><div class="tl-bar" style="width:67%;background:#D85A30">150–180 hari</div></div><div class="tl-days">150–180 hr</div><div class="tl-phase"><span class="spill sp-red">Lama</span></div></div>
  <div class="tl-row"><div class="tl-label">🇺🇸 United States</div><div class="tl-bar-wrap"><div class="tl-bar" style="width:85%;background:#993C1D">180–270 hari</div></div><div class="tl-days">180–270 hr</div><div class="tl-phase"><span class="spill sp-red">Terlama</span></div></div>
</div>
<div class="slbl">Perbandingan lengkap 6 negara</div>
<div style="overflow-x:auto">
<table class="comp-table">
  <thead><tr><th>Negara</th><th>First deal est.</th><th>Deal size</th><th>Tingkat kesulitan</th><th>BI reference impact</th><th>Butuh presence fisik?</th><th>Entry point terbaik</th><th>Prioritas mulai</th></tr></thead>
  <tbody>
    <tr><td><strong>🇮🇩 Indonesia</strong></td><td><strong>45–75 hari</strong></td><td>IDR 150M–2B</td><td><span class="spill sp-green">Mudah</span></td><td><span class="spill sp-green">Sangat kuat</span></td><td>Tidak wajib</td><td>Warm referral dari BI network</td><td><span class="spill sp-green">Sekarang</span></td></tr>
    <tr><td><strong>🇲🇾 Malaysia</strong></td><td><strong>60–90 hari</strong></td><td>MYR 80K–500K</td><td><span class="spill sp-blue">Mudah-Sedang</span></td><td><span class="spill sp-blue">Kuat</span></td><td>1 trip KL cukup</td><td>Islamic finance + diaspora ID</td><td><span class="spill sp-blue">Bulan 1–2</span></td></tr>
    <tr><td><strong>🇸🇬 Singapore</strong></td><td><strong>90–120 hari</strong></td><td>SGD 50K–500K</td><td><span class="spill sp-blue">Sedang</span></td><td><span class="spill sp-blue">Kuat di FSI</span></td><td>1–2 trip SG</td><td>Blockchain/crypto + diaspora ID</td><td><span class="spill sp-blue">Bulan 2–3</span></td></tr>
    <tr><td><strong>🇭🇰 Hong Kong</strong></td><td><strong>120–150 hari</strong></td><td>HKD 200K–2M</td><td><span class="spill sp-amber">Sedang-Sulit</span></td><td><span class="spill sp-amber">Sedang</span></td><td>Wajib 1 trip</td><td>Blockchain/digital assets</td><td><span class="spill sp-amber">Bulan 3–4</span></td></tr>
    <tr><td><strong>🇦🇺 Australia</strong></td><td><strong>150–180 hari</strong></td><td>AUD 50K–300K</td><td><span class="spill sp-red">Sulit</span></td><td><span class="spill sp-red">Lemah</span></td><td>Sangat disarankan</td><td>Indonesian diaspora + Clutch.co</td><td><span class="spill sp-amber">Bulan 4–5</span></td></tr>
    <tr><td><strong>🇺🇸 United States</strong></td><td><strong>180–270 hari</strong></td><td>USD 30K–300K</td><td><span class="spill sp-red">Sangat Sulit</span></td><td><span class="spill sp-red">Hampir tidak ada</span></td><td>Wajib atau hire local</td><td>Clutch.co + inbound + referral</td><td><span class="spill sp-red">Bulan 6+</span></td></tr>
  </tbody>
</table>
</div>
<div class="slbl">Realistic expectation — dengan 50 jam/minggu kamu</div>
<div class="stat-row">
  <div class="stat-box"><div class="stat-box-val">30–45</div><div class="stat-box-lbl">hari · Indonesia first deal</div></div>
  <div class="stat-box"><div class="stat-box-val">60–75</div><div class="stat-box-lbl">hari · Malaysia first deal</div></div>
  <div class="stat-box"><div class="stat-box-val">90–105</div><div class="stat-box-lbl">hari · Singapore first deal</div></div>
  <div class="stat-box"><div class="stat-box-val">7–9</div><div class="stat-box-lbl">bulan · semua 6 negara ≥1 deal</div></div>
</div>
`,

id: `
<div class="cc">
  <div class="cc-head" style="background:rgba(46,204,113,.15)">
    <div class="cc-flag">🇮🇩</div>
    <div class="cc-info"><div class="cc-name">Indonesia</div><div class="cc-sub">Home market · BI reference = unfair advantage · Mulai hari ini</div></div>
    <div class="cc-timeline"><div class="cc-days" style="color:#2ECC71">45</div><div class="cc-unit">–75 hari<br>first deal</div></div>
  </div>
  <div class="cc-body">
    <div class="cc-grid">
      <div class="cc-stat"><div class="cc-stat-label">Fase 1: Outreach</div><div class="cc-stat-val">Hari 1–14</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 2: Discovery</div><div class="cc-stat-val">Hari 15–30</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 3: Proposal</div><div class="cc-stat-val">Hari 30–45</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 4: Negotiasi</div><div class="cc-stat-val">Hari 45–75</div></div>
    </div>
    <div class="cc-rows">
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Keuntungan terbesar:</strong> BI reference dikenal semua institusi keuangan Indonesia. Satu nama = pintu terbuka.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Bahasa &amp; budaya sama:</strong> Tidak ada barrier komunikasi. Bisa meeting langsung kapan saja. Sales cycle jauh lebih alami.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Network sudah ada:</strong> Dari proyek BI, kamu punya warm contacts yang bisa langsung diminta intro ke bank lain atau BUMN.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Risiko utama:</strong> Procurement BUMN dan bank besar bisa lambat (4–6 bulan). Fokus ke bank swasta menengah dan fintech untuk first deal yang cepat.</div></div>
      <div class="cc-row"><span class="cc-row-icon">🎯</span><div><strong>Target first deal yang realistis:</strong> Fintech Series B+ atau bank swasta menengah. Mulai dengan pilot project IDR 150–300M. Lebih mudah approve, lebih cepat close.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚡</span><div><strong>Cara paling cepat:</strong> Hubungi kontak BI proyek hari ini. Minta 2 intro ke bank atau fintech yang mereka kenal. Satu intro bisa close deal dalam 30 hari.</div></div>
    </div>
    <div class="verdict-box vb-green"><strong>Verdict:</strong> Ini adalah satu-satunya market di mana kamu bisa close deal dalam 30 hari jika kamu bermain kartu BI reference dengan benar dan masuk lewat warm intro. Prioritaskan ini di atas semua market lain.</div>
  </div>
</div>
`,

my: `
<div class="cc">
  <div class="cc-head" style="background:rgba(55,138,221,.15)">
    <div class="cc-flag">🇲🇾</div>
    <div class="cc-info"><div class="cc-name">Malaysia</div><div class="cc-sub">Beachhead overseas · Islamic finance angle · Bahasa proximity</div></div>
    <div class="cc-timeline"><div class="cc-days" style="color:#60a5fa">60</div><div class="cc-unit">–90 hari<br>first deal</div></div>
  </div>
  <div class="cc-body">
    <div class="cc-grid">
      <div class="cc-stat"><div class="cc-stat-label">Fase 1: Remote outreach</div><div class="cc-stat-val">Minggu 1–4</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 2: Virtual meetings</div><div class="cc-stat-val">Minggu 4–6</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 3: KL trip + close</div><div class="cc-stat-val">Minggu 7–10</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 4: Contract</div><div class="cc-stat-val">Minggu 10–13</div></div>
    </div>
    <div class="cc-rows">
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Islamic finance angle unik:</strong> Bank Negara Malaysia dan Bank Indonesia punya regulatory overlap. BI reference sangat relevan untuk bank Islam dan GLC Malaysia.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Bahasa hampir sama:</strong> Tidak perlu penerjemah. Bisa komunikasi natural dalam Bahasa Melayu/Indonesia. Trust lebih cepat terbangun.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Diaspora Indonesia di KL:</strong> Ribuan senior professional Indonesia bekerja di CIMB, Maybank, Petronas, dll. Satu DM ke mereka = internal champion gratis.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>MY–ID remittance corridor:</strong> Kamu paham kedua sisi. Ini adalah angle yang tidak bisa diklaim firm Singapore atau Malaysia manapun.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Perlu 1 trip KL:</strong> Malaysia decision makers lebih suka ketemu langsung sebelum sign. Budget 1 trip KL (~IDR 3–5 juta) untuk tutup first deal senilai MYR 100K+.</div></div>
      <div class="cc-row"><span class="cc-row-icon">🎯</span><div><strong>Target first deal:</strong> Islamic fintech startup di KL atau bank Islam menengah. Pilot project MYR 80–150K. Mereka decide lebih cepat dari GLC.</div></div>
    </div>
    <div class="verdict-box vb-blue"><strong>Verdict:</strong> Malaysia adalah overseas market yang paling realistis untuk first deal. Start remote outreach minggu ini, plan 1 trip KL di bulan ke-2 ketika sudah ada 5+ warm conversations. Target close bulan ke-3.</div>
  </div>
</div>
`,

sg: `
<div class="cc">
  <div class="cc-head" style="background:rgba(91,141,239,.15)">
    <div class="cc-flag">🇸🇬</div>
    <div class="cc-info"><div class="cc-name">Singapore</div><div class="cc-sub">Positioning market · Deal 3–5x lebih besar · Satu win = SEA credibility</div></div>
    <div class="cc-timeline"><div class="cc-days" style="color:#60a5fa">90</div><div class="cc-unit">–120 hari<br>first deal</div></div>
  </div>
  <div class="cc-body">
    <div class="cc-grid">
      <div class="cc-stat"><div class="cc-stat-label">Fase 1: Remote outreach</div><div class="cc-stat-val">Bulan 1–1.5</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 2: Virtual discovery</div><div class="cc-stat-val">Bulan 1.5–2</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 3: SG trip + proposal</div><div class="cc-stat-val">Bulan 2.5–3</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 4: Legal + sign</div><div class="cc-stat-val">Bulan 3–4</div></div>
    </div>
    <div class="cc-rows">
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Deal size 3–5x lebih besar:</strong> Pekerjaan yang sama dibayar SGD 80–150K di SG vs IDR 300–500M di Indonesia. Satu deal SG = 3 deal Indonesia.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Blockchain/crypto hub Asia:</strong> 200+ MAS-licensed crypto/blockchain firms. Capability kamu sangat rare dan dicari di market ini.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Price advantage:</strong> Kamu bisa charge 40–50% lebih murah dari Singapore firm dengan kualitas yang sama. Ini adalah USP yang sangat kuat.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Diaspora Indonesia di SG:</strong> Ribuan WNI di DBS, OCBC, Grab, Sea, Prudential. Mereka adalah internal champion potensial yang sangat hangat.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Kompetisi lebih ketat:</strong> SG market penuh dengan firm regional yang bagus. Harus sangat specific dalam positioning — jangan generic "we do AI/cloud".</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Perlu Singapore entity eventually:</strong> Untuk deal &gt;SGD 100K, banyak buyer prefer vendor dengan SG entity. Bisa disetup dalam 1 minggu via Osome/Sleek (~SGD 300).</div></div>
      <div class="cc-row"><span class="cc-row-icon">🎯</span><div><strong>Target first deal:</strong> Crypto/blockchain startup dengan MAS licensing need, atau regional fintech dengan Indonesia operations yang butuh infra partner yang paham lokal.</div></div>
    </div>
    <div class="verdict-box vb-blue"><strong>Verdict:</strong> Singapore adalah market yang paling worth the effort secara revenue. Tapi jangan prioritaskan sebelum Indonesia pipeline stable. Ideal: start SG outreach di bulan ke-2 sambil Indo pipeline sudah berjalan.</div>
  </div>
</div>
`,

hk: `
<div class="cc">
  <div class="cc-head" style="background:rgba(239,159,39,.15)">
    <div class="cc-flag">🇭🇰</div>
    <div class="cc-info"><div class="cc-name">Hong Kong</div><div class="cc-sub">Blockchain &amp; digital assets hub · Niche play · Perlu trip fisik</div></div>
    <div class="cc-timeline"><div class="cc-days" style="color:#EF9F27">120</div><div class="cc-unit">–150 hari<br>first deal</div></div>
  </div>
  <div class="cc-body">
    <div class="cc-grid">
      <div class="cc-stat"><div class="cc-stat-label">Fase 1: Remote outreach</div><div class="cc-stat-val">Bulan 1–2</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 2: Virtual calls</div><div class="cc-stat-val">Bulan 2–3</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 3: HK trip</div><div class="cc-stat-val">Bulan 3–4</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 4: Contract</div><div class="cc-stat-val">Bulan 4–5</div></div>
    </div>
    <div class="cc-rows">
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Blockchain adalah pintu masuk:</strong> HK adalah blockchain dan digital asset hub Asia setelah Singapore. SFC licensing adalah pain point yang sangat spesifik dan kamu bisa solve.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Deal size besar:</strong> HKD 200K–2M per project. Satu deal HK bisa setara dengan 5–10 deal Indonesia.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Tidak ada BI reference impact:</strong> Hong Kong buyers tidak kenal Bank Indonesia. Harus repositioning ke "central bank-grade infrastructure" — lebih generic tapi masih credible.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Bahasa barrier:</strong> HK business community mix English dan Cantonese. Semua komunikasi harus dalam English yang sangat polished.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Wajib trip fisik:</strong> HK culture sangat relationship-driven. Sulit close deal tanpa pernah bertemu langsung. Budget 1 trip HK (~IDR 8–12 juta) untuk close deal pertama.</div></div>
      <div class="cc-row"><span class="cc-row-icon">🎯</span><div><strong>Target first deal:</strong> Crypto exchange atau digital asset firm yang butuh MAS/SFC-compliant blockchain infrastructure.</div></div>
    </div>
    <div class="verdict-box vb-amber"><strong>Verdict:</strong> Hong Kong adalah high-reward tapi high-effort market. Jangan masuk sebelum Singapore sudah berjalan. Ideal: mulai HK outreach di bulan ke-3–4 sebagai pipeline jangka menengah.</div>
  </div>
</div>
`,

au: `
<div class="cc">
  <div class="cc-head" style="background:rgba(216,90,48,.15)">
    <div class="cc-flag">🇦🇺</div>
    <div class="cc-info"><div class="cc-name">Australia</div><div class="cc-sub">High-value contracts · Indonesian diaspora angle · Butuh Clutch presence</div></div>
    <div class="cc-timeline"><div class="cc-days" style="color:#f87171">150</div><div class="cc-unit">–180 hari<br>first deal</div></div>
  </div>
  <div class="cc-body">
    <div class="cc-grid">
      <div class="cc-stat"><div class="cc-stat-label">Fase 1: Build presence</div><div class="cc-stat-val">Bulan 1–2</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 2: Inbound + outreach</div><div class="cc-stat-val">Bulan 2–4</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 3: Proposal + due dil.</div><div class="cc-stat-val">Bulan 4–5</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 4: Contract</div><div class="cc-stat-val">Bulan 5–6</div></div>
    </div>
    <div class="cc-rows">
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Deal size sangat besar:</strong> AUD 50–300K per project. Australia enterprise buyers punya budget besar dan biasanya loyal — satu client bisa jadi retainer jangka panjang.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Indonesian diaspora di AU:</strong> Komunitas Indonesia di Sydney, Melbourne, Perth cukup besar. Entry lewat diaspora network jauh lebih efektif dari cold outreach.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Clutch.co sangat efektif di AU:</strong> Australia buyers aktif cari vendor di Clutch. List sekarang, dapat 2–3 reviews dari proyek BI, dan kamu akan muncul di search hasil mereka.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Due diligence sangat ketat:</strong> Australia buyers melakukan background check, referral check, dan security assessment yang sangat mendetail. Proses ini sendiri bisa 4–6 minggu.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>BI reference tidak dikenal:</strong> Perlu reframe sebagai "G20 central bank" dan provide English-language case study yang sangat polished dengan metrics yang jelas.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Timezone challenge:</strong> Sydney adalah UTC+10/11. Overlap dengan WIB hanya 2–3 jam di pagi hari (7–9am WIB = 12–2pm AEST).</div></div>
      <div class="cc-row"><span class="cc-row-icon">🎯</span><div><strong>Target first deal:</strong> Fintech startup Australia yang expand ke Indonesia/SEA, atau perusahaan yang butuh SEA market entry partner dengan local knowledge.</div></div>
    </div>
    <div class="verdict-box vb-red"><strong>Verdict:</strong> Australia adalah market yang sangat worth it jangka panjang tapi butuh investasi waktu terbesar. Fokus bangun Clutch presence sekarang (gratis, passive), tapi aktif outreach mulai bulan ke-4 setelah pipeline ID/MY/SG sudah berjalan.</div>
  </div>
</div>
`,

us: `
<div class="cc">
  <div class="cc-head" style="background:rgba(153,60,29,.2)">
    <div class="cc-flag">🇺🇸</div>
    <div class="cc-info"><div class="cc-name">United States</div><div class="cc-sub">Highest reward · Highest difficulty · Long game play</div></div>
    <div class="cc-timeline"><div class="cc-days" style="color:#f87171">180</div><div class="cc-unit">–270 hari<br>first deal</div></div>
  </div>
  <div class="cc-body">
    <div class="cc-grid">
      <div class="cc-stat"><div class="cc-stat-label">Fase 1: Build credibility</div><div class="cc-stat-val">Bulan 1–3</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 2: Inbound nurture</div><div class="cc-stat-val">Bulan 3–5</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 3: Proposal</div><div class="cc-stat-val">Bulan 5–7</div></div>
      <div class="cc-stat"><div class="cc-stat-label">Fase 4: Legal + sign</div><div class="cc-stat-val">Bulan 7–9</div></div>
    </div>
    <div class="cc-rows">
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Deal size terbesar:</strong> USD 30–300K per project. Retainer bulanan USD 5–15K sangat umum untuk managed services. Satu client US = income setara 10+ client Indonesia.</div></div>
      <div class="cc-row"><span class="cc-row-icon">✅</span><div><strong>Inbound sangat possible:</strong> US buyers aktif di Clutch.co, Upwork Enterprise, dan LinkedIn. Jika Clutch profile kamu bagus dengan strong BI case study, mereka akan reach out sendiri.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Hampir zero BI reference impact:</strong> US buyers tidak tahu Bank Indonesia. Reframe: "We built infrastructure for a G20 nation's central bank managing $400B+ in reserves."</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Kompetisi sangat keras:</strong> Kamu bersaing dengan ratusan firm dari India, Eastern Europe, Latin America yang sudah punya US client list panjang.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>SOC 2 / ISO 27001 hampir wajib:</strong> US enterprise buyers mensyaratkan security certifications. Proses sertifikasi butuh 3–6 bulan dan biaya cukup besar.</div></div>
      <div class="cc-row"><span class="cc-row-icon">⚠️</span><div><strong>Timezone ekstrem:</strong> US Eastern Time adalah UTC-5. WIB = ET+12. Meeting harus jam 8–10 malam WIB untuk ET morning.</div></div>
      <div class="cc-row"><span class="cc-row-icon">🎯</span><div><strong>Entry point terbaik:</strong> US companies yang punya Southeast Asia operations, blockchain/DeFi startups, atau via YC network — perusahaan YC sering outsource ke Asia.</div></div>
    </div>
    <div class="verdict-box vb-red"><strong>Verdict:</strong> US adalah long game. Jangan aktif kejar US sekarang — resources kamu lebih baik dipakai untuk ID/MY/SG. Yang perlu dilakukan sekarang: setup Clutch profile bagus dan optimize LinkedIn untuk inbound. Biarkan US datang ke kamu dulu.</div>
  </div>
</div>
`,

accel: `
<div class="warn">Semua timeline di atas bisa dipotong <strong>30–50%</strong> jika kamu melakukan hal-hal di bawah ini dengan benar. Yang paling impactful ada di baris pertama.</div>
<div class="slbl">Deal accelerators — universal untuk semua negara</div>
<div class="acc-grid">
  <div class="acc-card">
    <div class="acc-title" style="color:#2ECC71">🤝 Warm intro > cold outreach</div>
    <div class="acc-items">
      <div class="acc-item">Satu warm intro dari BI contact bisa mempersingkat cycle 4–6 minggu</div>
      <div class="acc-item">Minta intro spesifik: "Apakah Pak X kenal CTO di Bank Y?"</div>
      <div class="acc-item">Di MY/SG: diaspora Indonesia = instant warm intro ke dalam perusahaan</div>
      <div class="acc-item">Di HK/AU/US: partner lokal yang introduce kamu = bypass 3 bulan cold outreach</div>
    </div>
  </div>
  <div class="acc-card">
    <div class="acc-title" style="color:#60a5fa">📄 Pilot project kecil dulu</div>
    <div class="acc-items">
      <div class="acc-item">Jangan langsung propose project IDR 1B — mulai dengan pilot IDR 150–300M</div>
      <div class="acc-item">Pilot lebih mudah approve, tidak perlu tender formal, bisa start dalam 2 minggu</div>
      <div class="acc-item">Pilot yang berhasil = auto-renewal dan referral ke divisi lain</div>
      <div class="acc-item">Di overseas: "proof of concept" USD 5–15K jauh lebih mudah close dari USD 100K project</div>
    </div>
  </div>
  <div class="acc-card">
    <div class="acc-title" style="color:#EF9F27">📈 ROI yang sangat spesifik</div>
    <div class="acc-items">
      <div class="acc-item">Jangan jual "AI/cloud platform" — jual "kurangi waktu rekonsiliasi dari 5 hari ke 4 jam"</div>
      <div class="acc-item">Hitung dalam angka Rupiah/SGD/USD berapa yang mereka hemat per tahun</div>
      <div class="acc-item">ROI yang jelas = CFO approve lebih cepat = sales cycle lebih pendek</div>
      <div class="acc-item">Contoh: "Setiap 1% peningkatan claim approval rate = IDR X miliar/tahun untuk RS ini"</div>
    </div>
  </div>
  <div class="acc-card">
    <div class="acc-title" style="color:#a78bfa">🏢 Co-sell dengan partner lokal</div>
    <div class="acc-items">
      <div class="acc-item">Partner dengan Big 4 (Deloitte, PwC, EY, KPMG) sebagai tech delivery arm mereka</div>
      <div class="acc-item">Partner dengan AWS/GCP Indonesia — mereka bawa clients, kamu implement</div>
      <div class="acc-item">Di MY/SG: partner dengan lokal system integrator yang punya existing vendor status</div>
      <div class="acc-item">Deal split 70/30 (partner/kamu) tapi kamu dapat "big logo" di portfolio</div>
    </div>
  </div>
  <div class="acc-card">
    <div class="acc-title" style="color:#f87171">📅 Timing yang tepat</div>
    <div class="acc-items">
      <div class="acc-item">Approach saat budget cycle baru: Januari (anggaran baru cair) atau Oktober (Q4 spend)</div>
      <div class="acc-item">Approach dalam 30 hari setelah CTO baru diangkat — window terbaik</div>
      <div class="acc-item">Approach 2–4 minggu setelah funding announcement di fintech</div>
      <div class="acc-item">Approach segera setelah perusahaan kena sanksi regulator — urgent need</div>
    </div>
  </div>
  <div class="acc-card">
    <div class="acc-title" style="color:#2ECC71">⭐ English case study yang kuat</div>
    <div class="acc-items">
      <div class="acc-item">Untuk MY/SG/HK/AU/US: buat satu-page case study BI dalam English yang sangat polish</div>
      <div class="acc-item">Sertakan: problem, approach, measurable outcome, timeline, tech stack used</div>
      <div class="acc-item">Quote dari stakeholder BI (dengan izin) = social proof yang paling kuat</div>
      <div class="acc-item">PDF ini adalah senjata paling powerful di semua overseas market</div>
    </div>
  </div>
</div>
<div class="slbl">Timeline realistis jika semua accelerator dijalankan</div>
<div class="stat-row">
  <div class="stat-box" style="background:rgba(46,204,113,.12)"><div style="font-size:10px;color:#2ECC71;font-weight:500;margin-bottom:4px">🇮🇩 INDONESIA</div><div class="stat-box-val" style="color:#2ECC71">30–45 hari</div><div class="stat-box-lbl" style="color:#2ECC71">dengan warm intro BI</div></div>
  <div class="stat-box" style="background:rgba(55,138,221,.12)"><div style="font-size:10px;color:#60a5fa;font-weight:500;margin-bottom:4px">🇲🇾 MALAYSIA</div><div class="stat-box-val" style="color:#60a5fa">50–70 hari</div><div class="stat-box-lbl" style="color:#60a5fa">dengan diaspora intro</div></div>
  <div class="stat-box" style="background:rgba(91,141,239,.12)"><div style="font-size:10px;color:#60a5fa;font-weight:500;margin-bottom:4px">🇸🇬 SINGAPORE</div><div class="stat-box-val" style="color:#60a5fa">75–100 hari</div><div class="stat-box-lbl" style="color:#60a5fa">dengan partner lokal</div></div>
  <div class="stat-box" style="background:rgba(239,159,39,.12)"><div style="font-size:10px;color:#EF9F27;font-weight:500;margin-bottom:4px">🇭🇰 HONG KONG</div><div class="stat-box-val" style="color:#EF9F27">90–120 hari</div><div class="stat-box-lbl" style="color:#EF9F27">dengan blockchain niche</div></div>
  <div class="stat-box" style="background:rgba(216,90,48,.12)"><div style="font-size:10px;color:#f87171;font-weight:500;margin-bottom:4px">🇦🇺 AUSTRALIA</div><div class="stat-box-val" style="color:#f87171">120–150 hari</div><div class="stat-box-lbl" style="color:#f87171">dengan Clutch inbound</div></div>
  <div class="stat-box" style="background:rgba(100,100,100,.12)"><div style="font-size:10px;color:#a1a1aa;font-weight:500;margin-bottom:4px">🇺🇸 US</div><div class="stat-box-val">150–210 hari</div><div class="stat-box-lbl">dengan SEA-expansion angle</div></div>
</div>
`,
}

export default function WikisPage() {
  const [active, setActive] = useState('overview')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Deal Timeline by Country</h1>
        <p className="text-zinc-400 text-sm mt-1">Estimasi waktu first deal dari outreach hingga kontrak signed</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="dt-wiki">
        {/* Tabs */}
        <div className="dt-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`dt-tab${active === t.id ? ' on' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active panel */}
        <div dangerouslySetInnerHTML={{ __html: panels[active] ?? '' }} />
      </div>
    </div>
  )
}
