import { useEffect, useMemo, useState } from 'react'
import './ThemeStudy.css'

const lengths = [1, 2, 3, 4]
const BIBLE_API = 'https://bible.helloao.org/api'

function teachingFor(theme, day, total, verses) {
  const quotes = verses.map((verse) => {
    const words = verse.text.trim().split(/\s+/)
    return `“${words.slice(0, 16).join(' ')}${words.length > 16 ? '…' : ''}” (${verse.reference})`
  })
  return [
    `Today’s study of ${theme.toLowerCase()} begins with this word: ${quotes[0]} Read the verse in its chapter and notice who is speaking, what has happened, and what response is invited. The promise or instruction here meets real life, not an idealized one. Bring the circumstances you are carrying into the reading. Let the verse name what is true, and make room for an honest response before you decide what you should do.`,
    `The second witness says, ${quotes[1]} Consider how this verse deepens or challenges the first. Scripture teaches through more than a slogan: its words belong to a story, a prayer, a letter, and a community learning to trust God. Ask what this verse reveals about God’s character and what it exposes in your own habits. If it offers comfort, receive that comfort. If it corrects you, let the correction lead toward restoration rather than shame.`,
    `Now hold the theme alongside this final verse: ${quotes[2]} Together, these three verses invite a response that is both inward and practical. What would ${theme.toLowerCase()} look like in one conversation, decision, or act of care today? Choose a small step you can actually take, and ask God for the grace to follow through. This is day ${day} of ${total}; steady attention matters more than speed. Return to these words when the day becomes busy, and let them shape how you treat yourself and others.`,
  ].join('\n\n')
}

function readChosenLength(planId) {
  try {
    const value = Number(localStorage.getItem(`renewing-scriptures-theme-length-${planId}`))
    return lengths.includes(value) ? value : null
  } catch { return null }
}

export default function ThemeStudy({ plan, completedDays, onToggleDay, onNavigate, categoryLabel, translation, bibleBooks }) {
  const [weeks, setWeeks] = useState(() => readChosenLength(plan.id))
  const [day, setDay] = useState(() => {
    const total = (readChosenLength(plan.id) || 1) * 7
    const next = completedDays.findIndex((complete, index) => index < total && !complete)
    return next < 0 ? total : next + 1
  })
  const [verseResult, setVerseResult] = useState({ key: '', verses: [], error: '' })
  const totalDays = (weeks || 0) * 7
  const readings = useMemo(() => {
    const pool = plan.days.flat()
    if (!weeks || !pool.length) return []
    return Array.from({ length: totalDays }, (_, index) => Array.from({ length: 3 }, (__, slot) => pool[(index * 3 + slot) % pool.length]))
  }, [plan, totalDays, weeks])
  const passages = useMemo(() => readings[day - 1] ?? [], [readings, day])
  const passageKey = passages.join('|')
  const currentVerseKey = `${translation}/${day}/${passageKey}`
  const verses = verseResult.key === currentVerseKey ? verseResult.verses : []
  const verseError = verseResult.key === currentVerseKey ? verseResult.error : ''
  const verseLoading = Boolean(passages.length && translation && bibleBooks?.length && verseResult.key !== currentVerseKey && !verseError)
  const focus = ['Notice what Scripture says', 'Practice what you are learning', 'Grow in faithfulness', 'Carry hope into daily life'][Math.floor((day - 1) / 7) % 4]
  const complete = Boolean(completedDays[day - 1])

  useEffect(() => {
    if (!passages.length || !translation || !bibleBooks?.length) return undefined
    let cancelled = false
    const requests = passages.map(async (reference, index) => {
      const match = reference.match(/^(.+?)\s+(\d+)$/)
      if (!match) throw new Error(`Could not read ${reference}`)
      const [, title, chapter] = match
      const book = bibleBooks.find((item) => {
        const common = item.commonName?.toLowerCase()
        const name = item.name?.toLowerCase()
        const wanted = title.toLowerCase()
        return common === wanted || name === wanted || (wanted === 'psalm' && (common === 'psalms' || item.id === 'PSA'))
      })
      if (!book) throw new Error(`Could not find ${title} in this Bible edition`)
      const response = await fetch(`${BIBLE_API}/${translation}/${book.id}/${chapter}.simple.json`)
      if (!response.ok) throw new Error(`Could not load ${reference}`)
      const data = await response.json()
      const chapterVerses = (data.chapter?.content ?? []).filter((part) => part.type === 'verse' && part.text)
      if (!chapterVerses.length) throw new Error(`No verse text is available for ${reference}`)
      const chosen = chapterVerses[(day + index * 4 - 1) % chapterVerses.length]
      return { reference: `${title} ${chapter}:${chosen.number}`, text: chosen.text }
    })
    Promise.all(requests).then((items) => { if (!cancelled) setVerseResult({ key: currentVerseKey, verses: items, error: '' }) }).catch((error) => { if (!cancelled) setVerseResult({ key: currentVerseKey, verses: [], error: error.message || 'Verse text could not be loaded. Check your connection and try again.' }) })
    return () => { cancelled = true }
  }, [day, passages, currentVerseKey, translation, bibleBooks])

  const selectLength = (count) => {
    if (weeks) return
    try { localStorage.setItem(`renewing-scriptures-theme-length-${plan.id}`, String(count)) } catch { /* The selected plan remains available for this visit. */ }
    setWeeks(count)
    const next = completedDays.findIndex((completeDay, index) => index < count * 7 && !completeDay)
    setDay(next < 0 ? count * 7 : next + 1)
  }

  const completeDay = () => {
    if (complete || verses.length !== 3) return
    onToggleDay(day - 1)
    if (day < totalDays) setDay(day + 1)
  }

  const teaching = verses.length === 3 ? teachingFor(plan.name, day, totalDays, verses) : ''
  return <div className="plans-page theme-study-page">
    <div className="plans-breadcrumb"><button onClick={() => onNavigate({ section: 'home' })}>Reading plans</button><span>/</span><button onClick={() => onNavigate({ section: 'category', category: 'themes' })}>{categoryLabel}</button><span>/</span><strong>{plan.name}</strong></div>
    <section className="theme-study-hero"><p className="plans-kicker">A PERSONAL SCRIPTURE STUDY</p><h1>{plan.name}<br/><em>for everyday life.</em></h1><p>{plan.description}. Choose a pace that gives you room to read, reflect, and respond.</p></section>
    <section className="study-length" aria-label="Choose study length"><div><p className="plans-kicker">{weeks ? 'YOUR COMMITTED RHYTHM' : 'CHOOSE YOUR RHYTHM'}</p><h2>{weeks ? `Your ${weeks}-week ${plan.name.toLowerCase()} study` : 'How long would you like to study?'}</h2><p className="study-length-note">{weeks ? 'Your plan is saved on this device and its duration is now committed.' : 'Choose once to begin. Your chosen study length will stay in place.'}</p></div><div className="length-options">{lengths.map((count) => <button key={count} className={weeks === count ? 'active' : ''} disabled={Boolean(weeks)} aria-pressed={weeks === count} onClick={() => selectLength(count)}><strong>{count}</strong><span>{count === 1 ? 'week' : 'weeks'}</span></button>)}</div>{weeks && <p className="study-length-note">{totalDays} days · three verses and a guided devotion each day</p>}</section>
    {weeks && <>
      <div className="study-day-picker"><label htmlFor="study-day">Study day</label><select id="study-day" value={day} onChange={(event) => setDay(Number(event.target.value))}>{Array.from({ length: totalDays }, (_, index) => <option key={index + 1} value={index + 1}>Day {index + 1}{completedDays[index] ? ' · Completed' : ''}</option>)}</select><span>{completedDays.filter(Boolean).length} of {totalDays} days complete</span></div>
      <section className="study-readings"><div><p className="plans-kicker">DAY {String(day).padStart(2, '0')} · {focus.toUpperCase()}</p><h2>Three verses for today</h2><p>Read the verse texts below, then consider how each one speaks to {plan.name.toLowerCase()}.</p></div><div className="study-passage-list">{verseLoading && <p className="verse-loading">Loading today’s verses…</p>}{verseError && <p className="verse-loading" role="alert">{verseError}</p>}{verses.map((verse, index) => <article key={`${day}-${verse.reference}`}><span>0{index + 1}</span><strong>{verse.reference}</strong><blockquote>“{verse.text}”</blockquote></article>)}</div></section>
      <section className="study-devotion"><p className="plans-kicker">ADMONITION · DEVOTION · TUTORING</p><h2>A word to carry with you</h2>{teaching ? <><p className="devotion-length">{teaching.trim().split(/\s+/).length} words</p><div className="devotion-copy">{teaching.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="reflection-question"><span>PAUSE AND CONSIDER</span><strong>What is one faithful response to {plan.name.toLowerCase()} that you can practice today?</strong></div></> : <p className="verse-loading">The teaching will appear when today’s three verse texts are ready.</p>}</section>
      <section className="study-prayer"><p className="plans-kicker">PRAY WITH INTENTION</p><h2>Prayer points</h2><ol><li>God, help me understand {plan.name.toLowerCase()} through these verses, and give me a willing heart to receive their wisdom.</li><li>Give me strength to practice what I have read today, especially in the places where change feels difficult.</li><li>Teach me to carry this truth with compassion, and make my life a source of hope and encouragement to others. Amen.</li></ol><button className={`amen-button ${complete ? 'is-complete' : ''}`} disabled={complete || verses.length !== 3} onClick={completeDay} aria-pressed={complete}>{complete ? '✓ Study completed' : 'Amen · Complete today’s study'}</button>{complete && <p className="amen-confirmation">Day {day} is complete. {day < totalDays ? `You’re ready for day ${day + 1}.` : 'You have completed this plan. What a meaningful commitment.'}</p>}</section>
    </>}
  </div>
}
