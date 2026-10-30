import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './versions.css'
import './planMenu.css'
import ReadingPlans from './ReadingPlans.jsx'
import './responsive.css'

const passages = [
  { ref: 'Psalm 23:1', title: 'The Shepherd’s Psalm', text: 'The LORD is my shepherd; I shall not want.', tag: 'Trust' },
  { ref: 'Isaiah 40:31', title: 'Strength for the weary', text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', tag: 'Hope' },
  { ref: 'Matthew 11:28', title: 'Rest for your soul', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', tag: 'Peace' },
  { ref: 'Romans 12:2', title: 'A renewed mind', text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind.', tag: 'Renewal' },
]

const books = ['Genesis', 'Psalms', 'Proverbs', 'Isaiah', 'Matthew', 'John', 'Romans', 'Revelation']
const BIBLE_API = 'https://bible.helloao.org/api'
const JESUS_MEMORY_VERSES = ['Matthew 11:28','John 14:27','John 8:12','Matthew 5:14','John 10:11','John 15:5','John 16:33','Matthew 7:7','Luke 6:31','Mark 10:27','John 11:25','Matthew 6:34','John 6:35','John 14:6','Matthew 5:9','John 13:34','Luke 12:32','Matthew 28:20','Matthew 5:16','John 4:14']
const localDayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const shiftLocalDay = (key, amount) => { const date = new Date(`${key}T12:00:00`); date.setDate(date.getDate() + amount); return localDayKey(date) }
const PREFERRED_VERSION_NAMES = [/^Berean Standard Bible/i, /^King James Version/i, /^World English Bible(?!.*British|.*Catholic)/i, /^American Standard Version/i, /^Young.s Literal Translation/i, /^Darby/i, /^Bible in Basic English/i, /^Webster/i, /^English Revised Version/i, /^Open English Bible/i, /^Geneva Bible/i, /^Douay.?Rheims/i, /^American King James Version/i, /^Literal Standard Version/i, /^Julia E. Smith/i]
const PINNED_VERSIONS = [
  { id: 'NIV', name: 'New International Version' },
  { id: 'NLT', name: 'New Living Translation' },
  { id: 'ESV', name: 'English Standard Version' },
  { id: 'KJV', name: 'King James Version' },
  { id: 'NKJV', name: 'New King James Version' },
  { id: 'NASB', name: 'New American Standard Bible' },
  { id: 'AMP', name: 'Amplified Bible' },
]

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4Z"/>,
    headphones: <><path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M5 14h2v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Zm14 0h-2v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [tab, setTab] = useState('Read')
  const [book, setBook] = useState('Psalms')
  const [chapter, setChapter] = useState(23)
  const [activePassage, setActivePassage] = useState(null)
  const [translation, setTranslation] = useState('KJV')
  const [translations, setTranslations] = useState([])
  const [bibleBooks, setBibleBooks] = useState([])
  const [chapterVerses, setChapterVerses] = useState([])
  const [bibleLoading, setBibleLoading] = useState(false)
  const [bibleError, setBibleError] = useState('')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinComplete, setJoinComplete] = useState(false)
  const visitRecorded = useRef(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [saved, setSaved] = useState([])
  const [dark, setDark] = useState(false)
  const [fontSize, setFontSize] = useState(19)
  const [playing, setPlaying] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [plansMenuOpen, setPlansMenuOpen] = useState(false)
  const [planView, setPlanView] = useState(null)
  const [completedDays, setCompletedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem('renewing-scriptures-plan-progress') || '{}') }
    catch { return {} }
  })
  const [dailyStats, setDailyStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('renewing-scriptures-daily-stats') || '{"visits":{},"visitDays":[],"studyDays":[]}') }
    catch { return { visits: {}, visitDays: [], studyDays: [] } }
  })
  const today = localDayKey()
  const [memoryDate, setMemoryDate] = useState(() => localDayKey())
  const [memoryResult, setMemoryResult] = useState({ key: '', text: '', error: '' })
  const memoryDayNumber = Math.floor(Date.parse(`${memoryDate}T00:00:00`) / 86400000)
  const memoryReference = JESUS_MEMORY_VERSES[memoryDayNumber % JESUS_MEMORY_VERSES.length]
  const memoryKey = `${memoryDate}/${translation}/${memoryReference}`
  const memoryVerseText = memoryResult.key === memoryKey ? memoryResult.text : ''
  const memoryVerseError = memoryResult.key === memoryKey ? memoryResult.error : ''
  const memoryBookName = memoryReference.match(/^(.+?)\s+\d+:/)?.[1]
  const memoryChapter = memoryReference.match(/\s(\d+):/)?.[1]
  const memoryVerseNumber = memoryReference.match(/:(\d+)$/)?.[1]
  const memoryBook = bibleBooks.find((item) => item.commonName?.toLowerCase() === memoryBookName?.toLowerCase() || item.name?.toLowerCase() === memoryBookName?.toLowerCase())
  const filtered = useMemo(() => passages.filter((p) => `${p.ref} ${p.title} ${p.text} ${p.tag}`.toLowerCase().includes(query.toLowerCase())), [query])
  const selectedTranslation = translations.find((item) => item.id === translation)
  const selectedBook = bibleBooks.find((item) => item.commonName?.toLowerCase() === book.toLowerCase() || item.name?.toLowerCase() === book.toLowerCase() || (book === 'Psalms' && item.id === 'PSA'))
  const openPinnedVersion = (id) => {
    if (id === 'KJV') {
      const kjv = translations.find((item) => /King James Version/i.test(item.englishName))
      if (kjv) { setTranslation(kjv.id); setActivePassage(null); return }
    }
    const reference = encodeURIComponent(`${selectedBook?.commonName ?? book} ${chapter}`)
    window.open(`https://www.biblegateway.com/passage/?search=${reference}&version=${id}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    localStorage.setItem('renewing-scriptures-plan-progress', JSON.stringify(completedDays))
  }, [completedDays])

  useEffect(() => {
    if (visitRecorded.current) return
    visitRecorded.current = true
    setDailyStats((stats) => ({
      ...stats,
      visits: { ...stats.visits, [today]: (stats.visits?.[today] ?? 0) + 1 },
      visitDays: [...new Set([...(stats.visitDays ?? []), today])],
    }))
  }, [today])

  useEffect(() => { localStorage.setItem('renewing-scriptures-daily-stats', JSON.stringify(dailyStats)) }, [dailyStats])

  useEffect(() => {
    let timer
    const scheduleMidnightRefresh = () => {
      const now = new Date()
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timer = window.setTimeout(() => { setMemoryDate(localDayKey()); scheduleMidnightRefresh() }, midnight.getTime() - now.getTime() + 50)
    }
    scheduleMidnightRefresh()
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!translation || !memoryBook || !memoryChapter || !memoryVerseNumber) return undefined
    let cancelled = false
    fetch(`${BIBLE_API}/${translation}/${memoryBook.id}/${memoryChapter}.simple.json`).then((response) => {
      if (!response.ok) throw new Error('Verse text is temporarily unavailable.')
      return response.json()
    }).then((data) => {
      const verse = (data.chapter?.content ?? []).find((part) => part.type === 'verse' && String(part.number) === memoryVerseNumber)
      if (!verse?.text) throw new Error('Verse text is temporarily unavailable.')
      if (!cancelled) setMemoryResult({ key: memoryKey, text: verse.text, error: '' })
    }).catch((error) => { if (!cancelled) setMemoryResult({ key: memoryKey, text: '', error: error.message || 'Connect to load today’s memory verse.' }) })
    return () => { cancelled = true }
  }, [translation, memoryBook, memoryChapter, memoryVerseNumber, memoryKey])

  useEffect(() => {
    let cancelled = false
    fetch(`${BIBLE_API}/available_translations.json`).then((response) => {
      if (!response.ok) throw new Error('Bible catalog is unavailable')
      return response.json()
    }).then((data) => {
      const englishComplete = (data.translations ?? []).filter((item) => item.language === 'eng' && item.numberOfBooks === 66)
      const preferred = PREFERRED_VERSION_NAMES.map((pattern) => englishComplete.find((item) => pattern.test(item.englishName))).filter(Boolean)
      const versions = [...new Map(preferred.map((item) => [item.id, item])).values()].slice(0, 10)
      if (!cancelled) {
        setTranslations(versions)
        if (versions.length) setTranslation((current) => versions.some((item) => item.id === current) ? current : versions[0].id)
      }
    }).catch(() => { if (!cancelled) setBibleError('Connect to the internet to load the Bible editions.') })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!translation) return
    let cancelled = false
    fetch(`${BIBLE_API}/${translation}/books.json`).then((response) => {
      if (!response.ok) throw new Error('Could not load the book list')
      return response.json()
    }).then((data) => { if (!cancelled) setBibleBooks(data.books ?? []) }).catch(() => { if (!cancelled) setBibleError('This edition could not be loaded. Try another version.') })
    return () => { cancelled = true }
  }, [translation])

  useEffect(() => {
    if (!translation || !selectedBook) return
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return null
      setBibleLoading(true)
      setBibleError('')
      return fetch(`${BIBLE_API}/${translation}/${selectedBook.id}/${chapter}.simple.json`)
    }).then((response) => {
      if (!response) return null
      if (!response.ok) throw new Error('Could not load this chapter')
      return response.json()
    }).then((data) => {
      if (!data) return
      const verses = (data.chapter?.content ?? []).filter((part) => part.type === 'verse').map((verse) => ({ number: verse.number, text: verse.text })).filter((verse) => verse.text)
      if (!cancelled) setChapterVerses(verses)
    }).catch(() => { if (!cancelled) { setChapterVerses([]); setBibleError('This chapter could not be loaded. Check your connection and try again.') } }).finally(() => { if (!cancelled) setBibleLoading(false) })
    return () => { cancelled = true }
  }, [translation, selectedBook, chapter])

  const selectPassage = (reference) => {
    const match = reference.match(/^(.+?)\s+(\d+):/)
    if (reference === 'Psalm 23:1') { setBook('Psalms'); setChapter(23); setActivePassage(null) }
    else if (match) { setBook(match[1] === 'Psalm' ? 'Psalms' : match[1]); setChapter(Number(match[2])); setActivePassage(passages.find((item) => item.ref === reference) ?? null) }
    setTab('Read')
    setSearchOpen(false)
    setQuery('')
  }

  const savePassage = (item) => setSaved((items) => items.some((entry) => entry.ref === item.ref) ? items.filter((entry) => entry.ref !== item.ref) : [...items, item])
  const openPlanReading = (reference) => {
    const match = reference.match(/^(.+?)\s+(\d+)$/)
    if (!match) return
    setBook(match[1] === 'Psalm' ? 'Psalms' : match[1])
    setChapter(Number(match[2]))
    setActivePassage(null)
    setPlanView(null)
    setTab('Read')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const togglePlanDay = (planId, dayIndex) => {
    const wasComplete = Boolean(completedDays[planId]?.[dayIndex])
    setCompletedDays((progress) => {
      const days = [...(progress[planId] ?? [])]
      days[dayIndex] = !days[dayIndex]
      return { ...progress, [planId]: days }
    })
    if (!wasComplete) setDailyStats((stats) => ({ ...stats, studyDays: [...new Set([...(stats.studyDays ?? []), today])] }))
  }

  const studyDays = new Set(dailyStats.studyDays ?? [])
  let streakDate = studyDays.has(today) ? today : shiftLocalDay(today, -1)
  let studyStreak = 0
  while (studyDays.has(streakDate)) { studyStreak += 1; streakDate = shiftLocalDay(streakDate, -1) }
  const completedStudyCount = Object.values(completedDays).reduce((count, days) => count + (Array.isArray(days) ? days.filter(Boolean).length : 0), 0)

  return (
    <div className={`site ${dark ? 'dark' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Renewing Scriptures home"><span className="brand-mark"><span /></span><span>renewing<span className="brand-light">scriptures</span></span></a>
        <nav className={`main-nav ${mobileMenu ? 'open' : ''}`} aria-label="Main navigation">
          {['Read', 'Study', 'Topics'].map((item) => <button key={item} className={tab === item && !planView ? 'nav-link active' : 'nav-link'} onClick={() => { setTab(item); setPlanView(null); setMobileMenu(false) }}>{item}</button>)}
          <div className={`nav-dropdown ${plansMenuOpen ? 'menu-open' : ''}`} onMouseEnter={() => setPlansMenuOpen(true)} onMouseLeave={() => setPlansMenuOpen(false)} onFocus={() => setPlansMenuOpen(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPlansMenuOpen(false) }}>
            <button className={planView ? 'nav-link active' : 'nav-link'} aria-haspopup="menu" aria-expanded={plansMenuOpen} onClick={() => setPlansMenuOpen((open) => !open)}>Reading plans <span className="nav-caret">⌄</span></button>
            <div className="plans-menu" role="menu">{[{ id: 'chronological', label: 'Chronological' }, { id: 'characters', label: 'Character-based' }, { id: 'themes', label: 'Themes' }].map((item, index) => <button key={item.id} role="menuitem" onClick={() => { setPlanView({ section: 'category', category: item.id }); setTab('Reading plans'); setPlansMenuOpen(false); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><span>0{index + 1}</span>{item.label}<b>↗</b></button>)}</div>
          </div>
        </nav>
        <div className="top-actions">
          <button className="icon-button mobile-toggle" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}><Icon name={mobileMenu ? 'close' : 'menu'} /></button>
          <button className="icon-button" aria-label="Search scripture" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
          <button className="signin" onClick={() => setTab('Saved')}>My library <span className="avatar">R</span></button>
        </div>
      </header>

      <main id="home">
        {planView ? <ReadingPlans view={planView} onNavigate={setPlanView} onOpenReading={openPlanReading} completedDays={completedDays} onToggleDay={togglePlanDay} translation={translation} bibleBooks={bibleBooks} /> : <>
        <section className="welcome">
          <div className="welcome-copy"><p className="eyebrow"><span className="eyebrow-line" /> A QUIETER PLACE IN A LOUDER WORLD</p><h1>Make room for<br/><em>what renews you.</em></h1><p className="welcome-sub">Read slowly. Find perspective. Let the words stay with you.</p><button className="join-us-button" onClick={() => { setJoinOpen(true); setJoinComplete(false) }}>Join us <Icon name="arrow" size={14}/></button></div>
          <div className="welcome-note"><span className="note-icon">DAILY MEMORY VERSE</span><p className="memory-verse-copy">{memoryVerseText ? `“${memoryVerseText}”` : memoryVerseError || 'Preparing today’s words of Jesus…'}</p><span className="note-ref">{memoryReference.toUpperCase()} <span>·</span> {selectedTranslation?.shortName ?? translation}</span></div>
          <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
        </section>

        <div className="content-wrap">
          <section className="reader-card">
            <div className="reader-toolbar">
              <div className="crumb"><span>THE BIBLE</span><Icon name="chevron" size={14}/><select aria-label="Choose Bible book" value={selectedBook?.id ?? ''} onChange={(event) => { const next = bibleBooks.find((item) => item.id === event.target.value); if (next) { setBook(next.commonName); setChapter(1); setActivePassage(null) } }}>{bibleBooks.filter((item) => !item.isApocryphal).map((item) => <option key={item.id} value={item.id}>{item.commonName}</option>)}</select><Icon name="chevron" size={14}/><select aria-label="Choose chapter" value={chapter} onChange={(event) => { setChapter(Number(event.target.value)); setActivePassage(null) }}>{Array.from({ length: selectedBook?.numberOfChapters ?? 1 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></div>
              <div className="reader-tools"><label className="select-wrap"><span className="sr-only">Translation</span><select value={translation} onChange={(e) => { setTranslation(e.target.value); setActivePassage(null) }}>{translations.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select></label><span className="tool-divider"/><button className={`icon-button small ${playing ? 'selected' : ''}`} aria-label="Listen to chapter" onClick={() => setPlaying(!playing)}><Icon name="headphones" size={17}/></button><button className={`icon-button small ${bookmarked ? 'selected' : ''}`} aria-label="Bookmark chapter" onClick={() => setBookmarked(!bookmarked)}><Icon name="bookmark" size={17}/></button><button className="icon-button small" aria-label="Decrease text size" onClick={() => setFontSize(Math.max(16, fontSize - 1))}>A−</button><button className="icon-button small" aria-label="Increase text size" onClick={() => setFontSize(Math.min(24, fontSize + 1))}>A+</button><button className="icon-button small" aria-label="Toggle dark mode" onClick={() => setDark(!dark)}><Icon name="sun" size={17}/></button></div>
            </div>
            <div className="reader-body">
              <div className="passage-heading"><div><p className="section-kicker">{activePassage ? activePassage.tag.toUpperCase() : 'READ THE SCRIPTURES'}</p><h2>{activePassage?.title ?? `${selectedBook?.commonName ?? book}, chapter ${chapter}`}</h2><p className="passage-meta">{activePassage?.ref.toUpperCase() ?? `${(selectedBook?.commonName ?? book).toUpperCase()} ${chapter}`} <span>·</span> {selectedTranslation?.englishName ?? translation}</p></div><span className="chapter-number">{chapter}</span></div>
              <div className="verse-list" style={{ '--verse-size': `${fontSize}px` }}>
                {bibleLoading && <p className="bible-status">Loading {selectedTranslation?.shortName ?? translation}…</p>}
                {!bibleLoading && bibleError && <p className="bible-status">{bibleError}</p>}
                {!bibleLoading && !bibleError && chapterVerses.map((verse) => <p className="verse" key={`${chapter}-${verse.number}`}><button className="verse-num" onClick={() => savePassage({ ref: `${selectedBook?.commonName ?? book} ${chapter}:${verse.number}`, title: `${selectedBook?.commonName ?? book} ${chapter}`, text: verse.text, tag: 'Saved verse' })} aria-label={`Save verse ${verse.number}`}>{verse.number}</button><span>{verse.text}</span></p>)}
              </div>
              <div className="reader-footer"><span><i/> You’re reading at your own pace</span><div><button className="chapter-btn" onClick={() => { setChapter(Math.max(1, chapter - 1)); setActivePassage(null) }}>← <span>Previous</span></button><button className="chapter-btn next" onClick={() => { setChapter(chapter + 1); setActivePassage(null) }}><span>Next chapter</span> →</button></div></div>
            </div>
          </section>

          <aside className="sidebar">
            <section className="versions-card"><div className="versions-heading"><span className="book-icon"><Icon name="book" size={17}/></span><div><p className="section-kicker">SCRIPTURE LIBRARY</p><h3>Bible versions</h3></div></div><p className="versions-description">Choose an edition to read the complete Bible.</p><p className="version-group-label">POPULAR VERSIONS</p><div className="version-list pinned-version-list">{PINNED_VERSIONS.map((item, index) => <button key={item.id} className={`version-option ${translation === item.id ? 'active' : ''}`} onClick={() => openPinnedVersion(item.id)}><span className="version-index">{String(index + 1).padStart(2, '0')}</span><span className="version-name"><strong>{item.id}</strong><small>{item.name}</small></span><span className="version-check">{item.id === 'KJV' && translations.some((version) => /King James Version/i.test(version.englishName)) ? '✓' : <Icon name="arrow" size={12}/>}</span></button>)}</div><p className="version-group-label other-editions-label">OTHER PUBLIC DOMAIN EDITIONS</p><div className="version-list">{translations.length ? translations.filter((item) => !/King James Version/i.test(item.englishName)).map((item, index) => <button key={item.id} className={`version-option ${translation === item.id ? 'active' : ''}`} onClick={() => { setTranslation(item.id); setActivePassage(null) }}><span className="version-index">{String(index + 1).padStart(2, '0')}</span><span className="version-name"><strong>{item.shortName}</strong><small>{item.englishName}</small></span><span className="version-check">{translation === item.id ? '✓' : ''}</span></button>) : <p className="versions-loading">{bibleError || 'Loading available versions…'}</p>}</div><a className="api-credit" href={selectedTranslation?.licenseUrl || 'https://bible.helloao.org/docs/'} target="_blank" rel="noreferrer">Edition license &amp; text details <Icon name="arrow" size={13}/></a></section>
            <section className="daily-card"><div className="card-topline"><span className="sun-symbol">✳</span><span>YOUR DAILY PAUSE</span><button aria-label="Save daily verse" className={`icon-button small ${saved.some((item) => item.ref === 'Isaiah 40:31') ? 'selected' : ''}`} onClick={() => savePassage(passages[1])}><Icon name="bookmark" size={16}/></button></div><h3>Words for<br/>the in-between.</h3><blockquote>“But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.”</blockquote><p className="daily-ref">ISAIAH 40:31 <span>·</span> KJV</p><button className="text-link" onClick={() => selectPassage('Isaiah 40:31')}>Sit with this verse <Icon name="arrow" size={14}/></button><div className="card-decoration">✳</div></section>
            <section className="continue-card"><div className="card-heading"><div><p className="section-kicker">PICK UP WHERE YOU LEFT OFF</p><h3>Your reading</h3></div><button className="more-btn" aria-label="Browse library" onClick={() => setTab('Read')}><Icon name="arrow" size={17}/></button></div><button className="continue-row" onClick={() => { setBook('John'); setChapter(1); setActivePassage(null) }}><span className="book-icon"><Icon name="book" size={17}/></span><span className="continue-text"><strong>Gospel of John</strong><small>Chapter 1 <i>·</i> 8 min left</small></span><Icon name="chevron" size={17}/></button><div className="progress-track"><span/></div><div className="progress-label"><span>YOUR JOURNEY</span><span>12% complete</span></div></section>
          </aside>
        </div>

        <section className="explore-section"><div className="explore-head"><div><p className="section-kicker">A LITTLE MORE TO EXPLORE</p><h2>Find a word for today.</h2></div><button className="view-all" onClick={() => setTab('Topics')}>Explore all topics <Icon name="arrow" size={15}/></button></div><div className="topic-grid">{passages.map((item, index) => <button key={item.ref} className={`topic-card topic-${index}`} onClick={() => selectPassage(item.ref)}><span className="topic-number">0{index + 1} <Icon name="arrow" size={13}/></span><span className="topic-tag">{item.tag}</span><strong>{item.title}</strong><span className="topic-ref">{item.ref}</span></button>)}</div></section>

        <section className="stats-section"><div className="stats-heading"><p className="section-kicker">YOUR JOURNEY, AT YOUR PACE</p><h2>Small steps are still steps.</h2><p>{studyStreak === 0 ? 'Whenever you begin, you’re welcome here. A single quiet moment can be a meaningful start.' : studyStreak === 1 ? 'You showed up for Scripture. Let today’s small step be enough, and come back when you’re ready.' : `You’ve returned ${studyStreak} days in a row. Keep going gently; consistency grows one day at a time.`}</p></div><div className="stats-grid"><article><span>VISITS TODAY</span><strong>{dailyStats.visits?.[today] ?? 0}</strong><small>Each return makes room for reflection.</small></article><article><span>STUDY STREAK</span><strong>{studyStreak}<i>{studyStreak === 1 ? ' day' : ' days'}</i></strong><small>{studyStreak ? 'A steady rhythm, built one day at a time.' : 'Your next study can begin a new rhythm.'}</small></article><article><span>STUDY DAYS COMPLETED</span><strong>{completedStudyCount}</strong><small>Every completed day is worth celebrating.</small></article></div></section>

        <section className="browse-row"><div><p className="section-kicker">OPEN THE WORD</p><h2>Where would you like to begin?</h2></div><div className="book-buttons">{books.map((item) => <button key={item} className={book === item ? 'book-pill active' : 'book-pill'} onClick={() => { setBook(item); setChapter(1); setActivePassage(null); setTab('Read') }}>{item}</button>)}</div><button className="browse-link" onClick={() => setTab('Read')}>Browse all 66 books <Icon name="arrow" size={15}/></button></section>

        {saved.length > 0 && <section className="saved-strip"><div><p className="section-kicker">YOUR LIBRARY</p><h2>Saved for later</h2></div><div className="saved-items">{saved.map((item) => <button key={item.ref} className="saved-item" onClick={() => selectPassage(item.ref)}><span>{item.ref}</span><strong>{item.text}</strong></button>)}</div></section>}
        </>}
      </main>
      <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark"><span/></span><span>renewing<span className="brand-light">scriptures</span></span></a><span>A little space for a renewed mind.</span><span>READ WITH INTENTION · LIVE WITH HOPE</span></footer>

      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search the scriptures" onClick={(event) => { if (event.target === event.currentTarget) setSearchOpen(false) }}><div className="search-dialog"><div className="search-title"><div><p className="section-kicker">FIND YOUR WAY TO A VERSE</p><h2>What are you looking for?</h2></div><button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><Icon name="close"/></button></div><div className="search-input"><Icon name="search"/><input autoFocus placeholder="Try “peace”, “Psalm 23”, or a passage…" value={query} onChange={(event) => setQuery(event.target.value)}/><kbd>ESC</kbd></div><p className="search-caption">{query ? `${filtered.length} passage${filtered.length === 1 ? '' : 's'} found` : 'SUGGESTED PASSAGES'}</p><div className="search-results">{(query ? filtered : passages).map((item) => <button key={item.ref} className="search-result" onClick={() => selectPassage(item.ref)}><span className="result-icon"><Icon name="book" size={16}/></span><span><strong>{item.ref}</strong><small>{item.text}</small></span><Icon name="chevron" size={16}/></button>)}{query && filtered.length === 0 && <p className="no-results">No passages found. Try a theme like hope, rest, or trust.</p>}</div><div className="search-foot">SEARCH THE SCRIPTURES <span>Enter to open</span></div></div></div>}
      {joinOpen && <div className="join-overlay" role="dialog" aria-modal="true" aria-labelledby="join-title" onClick={(event) => { if (event.target === event.currentTarget) setJoinOpen(false) }}><section className="join-dialog"><button className="icon-button join-close" aria-label="Close sign up" onClick={() => setJoinOpen(false)}><Icon name="close"/></button>{joinComplete ? <div className="join-success"><span>✳</span><p className="section-kicker">WELCOME IN</p><h2 id="join-title">We’re glad you’re here.</h2><p>Your sign-up is saved in this browser. You can begin reading or choose a study plan anytime.</p><button className="join-submit" onClick={() => setJoinOpen(false)}>Start exploring</button></div> : <><p className="section-kicker">A PLACE TO GROW, TOGETHER</p><h2 id="join-title">Join Renewing Scriptures.</h2><p className="join-intro">Create a little space for Scripture, reflection, and a steady rhythm of faith.</p><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const member = { name: data.get('name'), email: data.get('email'), joinedAt: new Date().toISOString() }; const previous = JSON.parse(localStorage.getItem('renewing-scriptures-signups') || '[]'); localStorage.setItem('renewing-scriptures-signups', JSON.stringify([...previous.filter((item) => item.email !== member.email), member])); setJoinComplete(true) }}><label>Your name<input name="name" autoComplete="name" required placeholder="Name"/></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label><button className="join-submit" type="submit">Join us <Icon name="arrow" size={14}/></button></form><p className="join-storage-note">Sign-up details are saved in this browser on this device.</p></>}</section></div>}
    </div>
  )
}

export default App
