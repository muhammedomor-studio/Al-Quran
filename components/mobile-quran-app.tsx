"use client";

import { useEffect, useMemo, useState } from "react";
import { suraList, padSuraId } from "@/lib/data/suras";
import "./mobile-app.css";

type Ayah = { number: string; arabic: string; arabic1?: string; bangla: string; audio?: { ar?: string; bn?: string } };
type TafsirMap = Record<string, string>;
const RAW_AUDIO = "https://raw.githubusercontent.com/muhammedomor-studio/Al-Quran/master/public";

async function loadAyahs(id: number): Promise<Ayah[]> {
  const data = await import(`../lib/data/ayahs/${padSuraId(id)}.json`);
  return (data.default || data) as Ayah[];
}
async function loadTafsir(id: number): Promise<TafsirMap> {
  const data = await import(`../lib/data/tafsirs/${padSuraId(id)}.json`);
  return (data.default || data) as TafsirMap;
}
function audioUrl(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${RAW_AUDIO}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function MobileQuranApp() {
  const [tab, setTab] = useState<"home"|"quran"|"saved"|"settings">("home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number|null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [tafsirs, setTafsirs] = useState<TafsirMap>({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"both"|"arabic"|"bangla">("both");
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState(29);
  const [saved, setSaved] = useState<string[]>([]);
  const [lastRead, setLastRead] = useState<{id:number; ayah:string}|null>(null);
  const [notice, setNotice] = useState("");
  const [tafsirItem, setTafsirItem] = useState<{number:string; html:string}|null>(null);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem("alquran-saved") || "[]"));
      setLastRead(JSON.parse(localStorage.getItem("alquran-last-read") || "null"));
      setDark(localStorage.getItem("alquran-dark") === "1");
      setFontSize(Number(localStorage.getItem("alquran-font-size") || "29"));
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("alquran-dark", dark ? "1" : "0"); }, [dark]);
  useEffect(() => { localStorage.setItem("alquran-saved", JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem("alquran-font-size", String(fontSize)); }, [fontSize]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return suraList;
    return suraList.filter((s:any) => `${s.id} ${s.nameBn} ${s.nameAr} ${s.slug} ${(s.keywords||[]).join(" ")}`.toLocaleLowerCase().includes(q));
  }, [query]);

  async function openSura(id:number, ayahToOpen?:string) {
    setSelected(id); setTab("quran"); setLoading(true); setAyahs([]); setTafsirs({});
    try {
      const [a,t] = await Promise.all([loadAyahs(id), loadTafsir(id)]);
      setAyahs(a); setTafsirs(t);
      const next = {id, ayah:ayahToOpen || "1"};
      setLastRead(next); localStorage.setItem("alquran-last-read", JSON.stringify(next));
    } catch (e) {
      console.error(e);
      setNotice("ডেটা লোড হয়নি। GitHub Actions-এর Build log পরীক্ষা করুন।");
    } finally { setLoading(false); }
  }
  function toggleSave(id:number, ayah:string) {
    const key = `${id}:${ayah}`;
    setSaved(old => old.includes(key) ? old.filter(x=>x!==key) : [...old,key]);
  }
  function openTafsir(number:string) {
    const html = tafsirs[number] || tafsirs[String(Number(number))] || "<p>এই আয়াতের তাফসির পাওয়া যায়নি।</p>";
    setTafsirItem({number,html});
  }

  const activeSura = selected ? (suraList as any[]).find(s=>s.id===selected) : null;
  const savedCount = saved.length;

  return <div className={`mq-app ${dark?"mq-dark":""}`}>
    <header className="mq-topbar">
      <button className="mq-brand" onClick={()=>{setTab("home");setSelected(null)}} aria-label="হোম">
        <span className="mq-mark">۞</span><span><b>সহজ কোরআন</b><small>AL-QURAN · বাংলা</small></span>
      </button>
      <button className="mq-icon-btn" onClick={()=>setDark(v=>!v)} aria-label="থিম">{dark?"☀":"☾"}</button>
    </header>
    {notice && <button className="mq-notice" onClick={()=>setNotice("")}>{notice}　×</button>}
    <main className="mq-main">
      {tab==="home" && <>
        <section className="mq-hero">
          <div className="mq-arabic-bism">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <p className="mq-eyebrow">আসসালামু আলাইকুম</p>
          <h1>প্রতিদিনের<br/><span>কোরআন পাঠ</span></h1>
          <p className="mq-hero-copy">আরবি আয়াত, বাংলা অনুবাদ, তাফসির ও তিলাওয়াত—একটি সহজ পাঠের অভিজ্ঞতা।</p>
          <div className="mq-hero-actions">
            <button className="mq-primary" onClick={()=>openSura(lastRead?.id||1,lastRead?.ayah)}>▶　পড়া শুরু করুন</button>
            <button className="mq-glass" onClick={()=>{setTab("quran");setSelected(null)}}>সূরা তালিকা　↗</button>
          </div><div className="mq-ornament">۞　۞　۞</div>
        </section>
        <div className="mq-stats"><div><strong>১১৪</strong><span>সূরা</span></div><div><strong>৬,২৩৬</strong><span>আয়াত*</span></div><div><strong>{savedCount}</strong><span>সংরক্ষিত</span></div></div>
        <section className="mq-section">
          <div className="mq-section-heading"><div><small>CONTINUE READING</small><h2>আবার শুরু করুন</h2></div><span className="mq-pill">শেষ পাঠ</span></div>
          <button className="mq-continue" onClick={()=>openSura(lastRead?.id||1,lastRead?.ayah)}>
            <span className="mq-surah-number">{String(lastRead?.id||1).padStart(2,"0")}</span>
            <span className="mq-continue-text"><b>{(suraList as any[]).find(s=>s.id===(lastRead?.id||1))?.nameBn||"আল-ফাতিহা"}</b><small>শেষ পড়া জায়গা থেকে চালিয়ে যান</small></span><span className="mq-arrow">→</span>
          </button>
        </section>
        <section className="mq-section"><div className="mq-section-heading"><div><small>START EXPLORING</small><h2>জনপ্রিয় সূরা</h2></div><button className="mq-text-button" onClick={()=>{setTab("quran");setSelected(null)}}>সব দেখুন →</button></div>
          <div className="mq-feature-grid">{[1,2,18,36].map(id=>{const s:any=(suraList as any[]).find(x=>x.id===id);return s?<button className="mq-feature" key={id} onClick={()=>openSura(id)}><span>{String(id).padStart(2,"0")}</span><b>{s.nameBn}</b><small>{s.nameAr}</small></button>:null})}</div>
        </section>
        <section className="mq-quote"><span>“</span><p>নিশ্চয়ই এই কোরআন এমন পথ দেখায়, যা সবচেয়ে সরল।</p><small>সূরা আল-ইসরা · ১৭:৯</small></section>
        <p className="mq-footnote">*আয়াতের গণনায় প্রচলিত গণনাপদ্ধতি অনুযায়ী পার্থক্য থাকতে পারে।</p>
      </>}

      {tab==="quran" && <>
        <section className="mq-page-title"><small>THE HOLY QURAN</small><h1>{activeSura?`সূরা ${activeSura.nameBn}`:"সূরা তালিকা"}</h1><p>{activeSura?`${activeSura.nameAr} · ${activeSura.ayahCount} আয়াত`:"সূরার নাম বা নম্বর দিয়ে খুঁজুন"}</p></section>
        {!activeSura ? <>
          <div className="mq-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="সূরার নাম বা নম্বর লিখুন..." /></div>
          <div className="mq-filter-label">{filtered.length}টি সূরা</div>
          <div className="mq-sura-list">{filtered.map((s:any)=><button className="mq-sura-row" key={s.id} onClick={()=>openSura(s.id)}><span className="mq-surah-number">{String(s.id).padStart(2,"0")}</span><span className="mq-sura-meta"><b>{s.nameBn}</b><small>{s.revelationPlace==="makki"?"মাক্কী":"মাদানী"} · {s.ayahCount} আয়াত</small></span><span className="mq-sura-ar">{s.nameAr}</span><span className="mq-chevron">›</span></button>)}</div>
        </> : <>
          <div className="mq-reader-controls"><button onClick={()=>setSelected(null)}>← সূরা তালিকা</button><div className="mq-segment">{(["both","arabic","bangla"] as const).map(m=><button className={mode===m?"active":""} key={m} onClick={()=>setMode(m)}>{m==="both"?"দুইটি":m==="arabic"?"আরবি":"বাংলা"}</button>)}</div></div>
          <div className="mq-ayah-list">{loading?<div className="mq-loading">আয়াত লোড হচ্ছে...</div>:ayahs.map(a=>{const key=`${selected}:${a.number}`;return <article className="mq-ayah-card" id={`ayah-${a.number}`} key={key}>
            <div className="mq-ayah-top"><span className="mq-ayah-number">আয়াত {a.number}</span><div className="mq-ayah-actions"><button onClick={()=>toggleSave(selected!,a.number)} aria-label="সংরক্ষণ">{saved.includes(key)?"★":"☆"}</button><button onClick={()=>openTafsir(a.number)} aria-label="তাফসির">تفسير</button></div></div>
            {(mode==="both"||mode==="arabic")&&<p className="mq-arabic" style={{fontSize:fontSize}} dir="rtl">{a.arabic}</p>}
            {(mode==="both"||mode==="bangla")&&<p className="mq-bangla">{a.bangla}</p>}
            <div className="mq-ayah-bottom">{a.audio?.ar&&<audio controls preload="none" src={audioUrl(a.audio.ar)} />}{a.audio?.bn&&<audio controls preload="none" src={audioUrl(a.audio.bn)} />}</div>
          </article>})}</div>
          <div className="mq-font-control"><span>আরবি লেখার আকার</span><button onClick={()=>setFontSize(v=>Math.max(22,v-2))}>A−</button><button onClick={()=>setFontSize(v=>Math.min(44,v+2))}>A+</button></div>
        </>}
      </>}

      {tab==="saved" && <>
        <section className="mq-page-title"><small>YOUR COLLECTION</small><h1>সংরক্ষিত আয়াত</h1><p>আপনার পছন্দের আয়াতগুলো এখানে পাবেন</p></section>
        {!saved.length?<div className="mq-empty"><span>☆</span><h3>এখনো কিছু সংরক্ষণ করেননি</h3><p>কোরআন পড়ার সময় তারকা চিহ্নে চাপ দিন।</p><button className="mq-primary" onClick={()=>setTab("quran")}>কোরআন পড়ুন</button></div>:<div className="mq-sura-list">{saved.map(key=>{const [sid,aid]=key.split(":");const s:any=(suraList as any[]).find(x=>x.id===Number(sid));return <button className="mq-sura-row" key={key} onClick={()=>openSura(Number(sid),aid)}><span className="mq-surah-number">★</span><span className="mq-sura-meta"><b>{s?.nameBn||`সূরা ${sid}`}</b><small>আয়াত {aid}</small></span><span className="mq-chevron">›</span></button>})}</div>}
      </>}

      {tab==="settings" && <>
        <section className="mq-page-title"><small>PERSONALIZE</small><h1>সেটিংস</h1><p>আপনার পড়ার অভিজ্ঞতা নিজের মতো সাজান</p></section>
        <div className="mq-settings-list">
          <div className="mq-setting-row"><span className="mq-setting-icon">☾</span><span><b>ডার্ক মোড</b><small>রাতের পড়ার জন্য</small></span><button className={`mq-switch ${dark?"on":""}`} onClick={()=>setDark(v=>!v)}><i/></button></div>
          <div className="mq-setting-row"><span className="mq-setting-icon">Aa</span><span><b>আরবি লেখার আকার</b><small>বর্তমান: {fontSize}px</small></span><div><button className="mq-mini" onClick={()=>setFontSize(v=>Math.max(22,v-2))}>−</button> <button className="mq-mini" onClick={()=>setFontSize(v=>Math.min(44,v+2))}>+</button></div></div>
          <a className="mq-setting-row" href="https://github.com/muhammedomor-studio/Al-Quran" target="_blank" rel="noreferrer"><span className="mq-setting-icon">⌘</span><span><b>Source Code</b><small>GitHub repository</small></span><span className="mq-chevron">↗</span></a>
          <div className="mq-setting-row"><span className="mq-setting-icon">ⓘ</span><span><b>অ্যাপ সম্পর্কে</b><small>সহজ কোরআন · মূল ডেটা অপরিবর্তিত</small></span></div>
        </div>
        <section className="mq-donation"><span>♥</span><h2>ভালো কাজে পাশে থাকুন</h2><p>সামর্থ্য অনুযায়ী অসহায় মানুষ, মসজিদ ও মাদরাসার কাজে সাহায্য করুন। ছোট সহায়তাও কারও জন্য বড় উপকার হতে পারে।</p><a href="https://github.com/muhammedomor-studio/Al-Quran" target="_blank" rel="noreferrer">প্রকল্পটি দেখুন ↗</a></section>
        <p className="mq-version">সহজ কোরআন · বাংলা · OFFLINE UI / ONLINE AUDIO</p>
      </>}
    </main>
    {tafsirItem&&<div className="mq-modal-backdrop" role="presentation" onClick={()=>setTafsirItem(null)}><section className="mq-tafsir-modal" role="dialog" aria-modal="true" aria-label="তাফসির" onClick={e=>e.stopPropagation()}><div className="mq-modal-head"><b>তাফসির · আয়াত {tafsirItem.number}</b><button onClick={()=>setTafsirItem(null)}>✕</button></div><div className="mq-tafsir-content" dangerouslySetInnerHTML={{__html:tafsirItem.html}}/></section></div>}
    <nav className="mq-bottom-nav">
      <button className={tab==="home"?"active":""} onClick={()=>{setTab("home");setSelected(null)}}><span>⌂</span><small>হোম</small></button>
      <button className={tab==="quran"?"active":""} onClick={()=>{setTab("quran");setSelected(null)}}><span>۞</span><small>কোরআন</small></button>
      <button className={tab==="saved"?"active":""} onClick={()=>setTab("saved")}><span>☆</span><small>সংরক্ষিত</small></button>
      <button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><span>⚙</span><small>সেটিংস</small></button>
    </nav>
  </div>;
}
