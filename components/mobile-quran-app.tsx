"use client";

import { useEffect, useMemo, useState } from "react";
import { suraList, padSuraId } from "@/lib/data/suras";
import "./mobile-app.css";

type Ayah = { number: string; arabic: string; arabic1?: string; bangla: string; audio?: { ar?: string; bn?: string } };

export default function MobileQuranApp() {
  const [tab, setTab] = useState<"home"|"quran"|"saved"|"settings">("home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"both"|"arabic"|"bangla">("both");
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [saved, setSaved] = useState<string[]>([]);
  const [lastRead, setLastRead] = useState<{id:number; ayah:string} | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem("alquran-saved") || "[]"));
      setLastRead(JSON.parse(localStorage.getItem("alquran-last-read") || "null"));
      setDark(localStorage.getItem("alquran-dark") === "1");
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem("alquran-dark", dark ? "1" : "0"); }, [dark]);
  useEffect(() => { localStorage.setItem("alquran-saved", JSON.stringify(saved)); }, [saved]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return suraList;
    return suraList.filter((s: any) =>
      `${s.id} ${s.nameBn} ${s.nameAr} ${s.slug} ${(s.keywords || []).join(" ")}`.toLocaleLowerCase().includes(q)
    );
  }, [query]);

  async function openSura(id: number) {
    setSelected(id); setTab("quran"); setLoading(true); setAyahs([]);
    try {
      const res = await fetch(`/lib/data/ayahs/${padSuraId(id)}.json`);
      if (!res.ok) throw new Error("data");
      const data = await res.json();
      setAyahs(data);
      const next = { id, ayah: "1" };
      setLastRead(next); localStorage.setItem("alquran-last-read", JSON.stringify(next));
    } catch {
      setNotice("আয়াতের ডেটা লোড করা যায়নি। নিশ্চিত করুন lib/data/ayahs ফোল্ডারটি আগের মতো আছে।");
    } finally { setLoading(false); }
  }

  function toggleSave(id: number, ayah: string) {
    const key = `${id}:${ayah}`;
    setSaved(old => old.includes(key) ? old.filter(x => x !== key) : [...old, key]);
  }

  async function showTafsir(id: number, ayah: string) {
    try {
      const res = await fetch(`/lib/data/tafsirs/${padSuraId(id)}.json`);
      if (!res.ok) throw new Error("data");
      const data = await res.json();
      const item = Array.isArray(data) ? data.find((x:any) => String(x.number) === String(ayah)) : null;
      const content = item?.tafsir || item?.bangla || item?.text || "এই আয়াতের জন্য তাফসিরের লেখা পাওয়া যায়নি।";
      window.alert(`তাফসির — আয়াত ${ayah}\n\n${content}`);
    } catch { window.alert("তাফসির ডেটা লোড করা যায়নি।"); }
  }

  const activeSura = selected ? (suraList as any[]).find(s => s.id === selected) : null;
  const savedCount = saved.length;

  return <div className={`mq-app ${dark ? "mq-dark" : ""}`}>
    <header className="mq-topbar">
      <button className="mq-brand" onClick={() => {setTab("home"); setSelected(null);}} aria-label="Home">
        <span className="mq-mark">۞</span><span><b>সহজ কোরআন</b><small>AL-QURAN · বাংলা</small></span>
      </button>
      <button className="mq-icon-btn" onClick={() => setDark(!dark)} aria-label="Theme">{dark ? "☀" : "☾"}</button>
    </header>

    {notice && <button className="mq-notice" onClick={() => setNotice("")}>{notice}　×</button>}

    <main className="mq-main">
      {tab === "home" && <>
        <section className="mq-hero">
          <div className="mq-arabic-bism">بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ</div>
          <p className="mq-eyebrow">আসসালামু আলাইকুম</p>
          <h1>আপনার প্রতিদিনের<br/><span>কোরআন পাঠ</span></h1>
          <p className="mq-hero-copy">আরবি আয়াত, বাংলা অনুবাদ ও তাফসির—একটি শান্ত, সহজ পাঠের অভিজ্ঞতা।</p>
          <div className="mq-hero-actions">
            <button className="mq-primary" onClick={() => openSura(lastRead?.id || 1)}>▶　পড়া শুরু করুন</button>
            <button className="mq-glass" onClick={() => setTab("quran")}>সূরা তালিকা　↗</button>
          </div>
          <div className="mq-ornament">۞　۞　۞</div>
        </section>
        <div className="mq-stats">
          <div><strong>১১৪</strong><span>সূরা</span></div><div><strong>৬,০০০+</strong><span>আয়াত</span></div><div><strong>{savedCount}</strong><span>সংরক্ষিত</span></div>
        </div>
        <section className="mq-section">
          <div className="mq-section-heading"><div><small>CONTINUE READING</small><h2>আবার শুরু করুন</h2></div><span className="mq-pill">শেষ পাঠ</span></div>
          <button className="mq-continue" onClick={() => openSura(lastRead?.id || 1)}>
            <span className="mq-surah-number">{String(lastRead?.id || 1).padStart(2,"0")}</span>
            <span className="mq-continue-text"><b>{(suraList as any[]).find(s=>s.id===(lastRead?.id||1))?.nameBn || "আল ফাতিহা"}</b><small>শেষ পড়া সূরা থেকে চালিয়ে যান</small></span>
            <span className="mq-arrow">→</span>
          </button>
        </section>
        <section className="mq-section">
          <div className="mq-section-heading"><div><small>START EXPLORING</small><h2>জনপ্রিয় সূরা</h2></div><button className="mq-text-button" onClick={() => setTab("quran")}>সব দেখুন →</button></div>
          <div className="mq-feature-grid">
            {[1,2,18,36].map(id => { const s:any=(suraList as any[]).find(x=>x.id===id); return s ? <button className="mq-feature" key={id} onClick={()=>openSura(id)}><span>{String(id).padStart(2,"0")}</span><b>{s.nameBn}</b><small>{s.nameAr}</small></button> : null; })}
          </div>
        </section>
        <section className="mq-quote"><span>“</span><p>নিশ্চয়ই এই কোরআন এমন পথ দেখায়, যা সবচেয়ে সরল।</p><small>সূরা আল-ইসরা · ১৭:৯</small></section>
      </>}

      {tab === "quran" && <>
        <section className="mq-page-title"><small>THE HOLY QURAN</small><h1>{activeSura ? `সূরা ${activeSura.nameBn}` : "সূরা তালিকা"}</h1><p>{activeSura ? `${activeSura.nameAr} · ${activeSura.ayahCount} আয়াত` : "আপনার পছন্দের সূরা খুঁজে পড়ুন"}</p></section>
        {!activeSura ? <>
          <div className="mq-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="সূরার নাম বা নম্বর লিখুন..." /></div>
          <div className="mq-filter-label">{filtered.length}টি সূরা</div>
          <div className="mq-sura-list">{filtered.map((s:any)=><button className="mq-sura-row" key={s.id} onClick={()=>openSura(s.id)}><span className="mq-surah-number">{String(s.id).padStart(2,"0")}</span><span className="mq-sura-meta"><b>{s.nameBn}</b><small>{s.revelationPlace==="makki"?"মাক্কী":"মাদানী"} · {s.ayahCount} আয়াত</small></span><span className="mq-sura-ar">{s.nameAr}</span><span className="mq-chevron">›</span></button>)}</div>
        </> : <>
          <div className="mq-reader-controls"><button onClick={()=>setSelected(null)}>← সূরা তালিকা</button><div className="mq-segment">{(["both","arabic","bangla"] as const).map(m=><button className={mode===m?"active":""} key={m} onClick={()=>setMode(m)}>{m==="both"?"দুইটি":m==="arabic"?"আরবি":"বাংলা"}</button>)}</div></div>
          <div className="mq-ayah-list">{loading ? <div className="mq-loading">আয়াত লোড হচ্ছে...</div> : ayahs.map((a,i)=> {
            const key=`${selected}:${a.number}`;
            return <article className="mq-ayah-card" key={key}>
              <div className="mq-ayah-top"><span className="mq-ayah-number">{a.number==="0"?"بِسْمِ اللَّهِ":`আয়াত ${a.number}`}</span><div className="mq-ayah-actions"><button onClick={()=>toggleSave(selected!,a.number)} aria-label="Bookmark">{saved.includes(key)?"★":"☆"}</button><button onClick={()=>showTafsir(selected!,a.number)} aria-label="Tafsir">تفسير</button></div></div>
              {(mode==="both"||mode==="arabic") && <p className="mq-arabic" style={{fontSize:fontSize}} dir="rtl">{a.arabic}</p>}
              {(mode==="both"||mode==="bangla") && <p className="mq-bangla">{a.bangla}</p>}
              <div className="mq-ayah-bottom">{a.audio?.ar && <audio controls preload="none" src={a.audio.ar.startsWith("/")?a.audio.ar:`/${a.audio.ar}`} />}{a.audio?.bn && <audio controls preload="none" src={a.audio.bn.startsWith("/")?a.audio.bn:`/${a.audio.bn}`} />}</div>
            </article>
          })}</div>
          <div className="mq-font-control"><span>আরবি লেখার আকার</span><button onClick={()=>setFontSize(v=>Math.max(22,v-2))}>A−</button><button onClick={()=>setFontSize(v=>Math.min(44,v+2))}>A+</button></div>
        </>}
      </>}

      {tab === "saved" && <>
        <section className="mq-page-title"><small>YOUR COLLECTION</small><h1>সংরক্ষিত আয়াত</h1><p>আপনার পছন্দের আয়াতগুলো এখানে পাবেন</p></section>
        {saved.length===0 ? <div className="mq-empty"><span>☆</span><h3>এখনো কিছু সংরক্ষণ করেননি</h3><p>কোরআন পড়ার সময় তারকা চিহ্নে চাপ দিন।</p><button className="mq-primary" onClick={()=>setTab("quran")}>কোরআন পড়ুন</button></div> : <div className="mq-sura-list">{saved.map(key=>{const [sid,aid]=key.split(":"); const s:any=(suraList as any[]).find(x=>x.id===Number(sid)); return <button className="mq-sura-row" key={key} onClick={()=>openSura(Number(sid))}><span className="mq-surah-number">★</span><span className="mq-sura-meta"><b>{s?.nameBn || `সূরা ${sid}`}</b><small>আয়াত {aid}</small></span><span className="mq-chevron">›</span></button>})}</div>}
      </>}

      {tab === "settings" && <>
        <section className="mq-page-title"><small>PERSONALIZE</small><h1>সেটিংস</h1><p>আপনার পড়ার অভিজ্ঞতা নিজের মতো সাজান</p></section>
        <div className="mq-settings-list">
          <div className="mq-setting-row"><span className="mq-setting-icon">☾</span><span><b>ডার্ক মোড</b><small>রাতের পড়ার জন্য</small></span><button className={`mq-switch ${dark?"on":""}`} onClick={()=>setDark(!dark)}><i/></button></div>
          <div className="mq-setting-row"><span className="mq-setting-icon">Aa</span><span><b>আরবি লেখার আকার</b><small>বর্তমান: {fontSize}px</small></span><div><button className="mq-mini" onClick={()=>setFontSize(v=>Math.max(22,v-2))}>−</button> <button className="mq-mini" onClick={()=>setFontSize(v=>Math.min(44,v+2))}>+</button></div></div>
          <a className="mq-setting-row" href="https://github.com/muhammedomor-studio/Al-Quran" target="_blank" rel="noreferrer"><span className="mq-setting-icon">⌘</span><span><b>Source Code</b><small>GitHub repository</small></span><span className="mq-chevron">↗</span></a>
          <button className="mq-setting-row" onClick={()=>setNotice("ডেটা আপনার ডিভাইসের local storage-এ সংরক্ষিত হয়।") }><span className="mq-setting-icon">ⓘ</span><span><b>অ্যাপ সম্পর্কে</b><small>সহজ কোরআন · বাংলা</small></span><span className="mq-chevron">›</span></button>
        </div>
        <section className="mq-donation"><span>♥</span><h2>ভালো কাজে পাশে থাকুন</h2><p>সামর্থ্য অনুযায়ী অসহায় মানুষের সাহায্য করুন, অথবা মসজিদ-মাদরাসার কাজে দান করুন। ছোট সহায়তাও কারও জন্য বড় উপকার হতে পারে।</p><button onClick={()=>window.open("https://github.com/muhammedomor-studio/Al-Quran","_blank")}>প্রকল্পটি দেখুন ↗</button></section>
        <p className="mq-version">AL-QURAN · MADE FOR EVERYDAY READING</p>
      </>}
    </main>

    <nav className="mq-bottom-nav">
      <button className={tab==="home"?"active":""} onClick={()=>{setTab("home");setSelected(null)}}><span>⌂</span><small>হোম</small></button>
      <button className={tab==="quran"?"active":""} onClick={()=>{setTab("quran");setSelected(null)}}><span>۞</span><small>কোরআন</small></button>
      <button className={tab==="saved"?"active":""} onClick={()=>setTab("saved")}><span>☆</span><small>সংরক্ষিত</small></button>
      <button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><span>⚙</span><small>সেটিংস</small></button>
    </nav>
  </div>;
}
