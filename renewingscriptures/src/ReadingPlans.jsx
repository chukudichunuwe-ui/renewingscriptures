import { useMemo, useState } from 'react'
import { characterPlans, chronologicalPlan, planCategories, themePlans } from './readingPlans.js'
import ThemeStudy from './ThemeStudy.jsx'
import './ReadingPlans.css'

const directories = { characters: characterPlans, themes: themePlans }

function BookIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"/></svg>
}

export default function ReadingPlans({ view, onNavigate, onOpenReading, completedDays, onToggleDay, translation, bibleBooks }) {
  const [search, setSearch] = useState('')
  const [visibleDays, setVisibleDays] = useState(15)
  const category = planCategories.find((item) => item.id === view.category)
  const plan = view.category === 'chronological'
    ? chronologicalPlan
    : directories[view.category]?.find((item) => item.id === view.planId)
  const results = useMemo(() => {
    const source = directories[view.category] ?? []
    return source.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase()))
  }, [search, view.category])

  const goCategory = (id) => { setSearch(''); setVisibleDays(15); onNavigate({ section: 'category', category: id }) }
  const openPlan = (item) => { setVisibleDays(15); onNavigate({ section: 'detail', category: view.category, planId: item.id }) }

  if (view.section === 'detail' && plan) {
    if (view.category === 'themes') return <ThemeStudy key={plan.id} plan={plan} completedDays={completedDays[plan.id] ?? []} onToggleDay={(dayIndex) => onToggleDay(plan.id, dayIndex)} onNavigate={onNavigate} categoryLabel={category.label} translation={translation} bibleBooks={bibleBooks} />
    const done = completedDays[plan.id] ?? []
    const completeCount = done.filter(Boolean).length
    return <div className="plans-page">
      <div className="plans-breadcrumb"><button onClick={() => onNavigate({ section: 'home' })}>Reading plans</button><span>/</span><button onClick={() => goCategory(view.category)}>{category.label}</button><span>/</span><strong>{plan.name}</strong></div>
      <section className="plan-detail-hero"><div className="plan-detail-copy"><p className="plans-kicker">{category.label.toUpperCase()} READING PLAN</p><h1>{plan.name}</h1><p>{plan.description}</p><div className="plan-stats"><span><strong>{plan.days.length}</strong> days</span><i/><span><strong>3</strong> chapters a day</span><i/><span><strong>{completeCount}</strong> days complete</span></div></div><div className="plan-detail-art"><span className="art-ring ring-a"/><span className="art-ring ring-b"/><BookIcon/><span className="art-star">✳</span></div></section>
      <div className="plan-schedule-head"><div><p className="plans-kicker">YOUR READING PATH</p><h2>A little, every day.</h2></div><span className="schedule-note">Open a chapter in the reader, or mark a day complete when you’re done.</span></div>
      <div className="day-list">{plan.days.slice(0, visibleDays).map((readings, index) => {
        const isDone = Boolean(done[index])
        return <article className={`day-card ${isDone ? 'is-done' : ''}`} key={`${plan.id}-day-${index}`}><div className="day-index"><span>{String(index + 1).padStart(2, '0')}</span><i/></div><div className="day-content"><div className="day-heading"><div><p>DAY {index + 1}</p><h3>{index === 0 ? 'Begin with intention' : index === plan.days.length - 1 ? 'Carry the story with you' : 'Keep the story moving'}</h3></div><button className={`complete-day ${isDone ? 'completed' : ''}`} onClick={() => onToggleDay(plan.id, index)}>{isDone ? '✓ Completed' : 'Mark complete'}</button></div><div className="chapter-links">{readings.map((reference) => <button key={`${index}-${reference}`} onClick={() => onOpenReading(reference)}><BookIcon/><span>{reference}</span><span className="chapter-arrow">↗</span></button>)}</div></div></article>
      })}</div>
      {visibleDays < plan.days.length && <button className="show-more-days" onClick={() => setVisibleDays((count) => Math.min(count + 15, plan.days.length))}>Show next {Math.min(15, plan.days.length - visibleDays)} days <span>↓</span></button>}
      <button className="back-to-category" onClick={() => goCategory(view.category)}>← Back to {category.label.toLowerCase()} plans</button>
    </div>
  }

  if (view.section === 'category' && category) {
    if (view.category === 'chronological') return <div className="plans-page">
      <div className="plans-breadcrumb"><button onClick={() => onNavigate({ section: 'home' })}>Reading plans</button><span>/</span><strong>{category.label}</strong></div>
      <section className="directory-intro"><p className="plans-kicker">A STORY THAT UNFOLDS</p><h1>Read Scripture in<br/><em>chronological order.</em></h1><p>{category.description} The sequence follows the broad biblical timeline, grouping the historical story with the prophets and the New Testament writings.</p></section>
      <button className="chron-plan-card" onClick={() => openPlan(chronologicalPlan)}><div className="chron-card-icon"><BookIcon/></div><div><p className="plans-kicker">ONE GUIDED JOURNEY · 397 DAYS</p><h2>{chronologicalPlan.name}</h2><p>Three chapters each day, from the creation story to the early church and Revelation.</p></div><span className="plan-open-arrow">↗</span></button>
      <p className="chron-note">The chronological sequence is an approximate reading order; dates and placement of some books are debated.</p>
    </div>

    const noun = view.category === 'characters' ? 'people' : 'themes'
    return <div className="plans-page">
      <div className="plans-breadcrumb"><button onClick={() => onNavigate({ section: 'home' })}>Reading plans</button><span>/</span><strong>{category.label}</strong></div>
      <section className="directory-intro compact"><p className="plans-kicker">{view.category === 'characters' ? 'PEOPLE OF SCRIPTURE' : 'WORDS TO LIVE BY'}</p><h1>{view.category === 'characters' ? <>Meet the people<br/><em>behind the story.</em></> : <>Explore a theme.<br/><em>Carry it with you.</em></>}</h1><p>{category.description} {view.category === 'characters' ? 'Each character plan is arranged alphabetically, with three chapters for each day.' : 'Choose a one, two, three, or four week devotional plan for any theme.'}</p></section>
      <div className="directory-toolbar"><div><p className="plans-kicker">{results.length} {noun.toUpperCase()} · A TO Z</p><h2>{view.category === 'characters' ? 'Choose a character' : 'Choose a theme'}</h2></div><label className="directory-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Find ${view.category === 'characters' ? 'a person' : 'a theme'}…`}/></label></div>
      <div className="directory-grid">{results.map((item, index) => <button className="directory-card" key={item.id} onClick={() => openPlan(item)}><span className="directory-card-top"><span>{String(index + 1).padStart(2, '0')}</span><span className="directory-card-arrow">↗</span></span><strong>{item.name}</strong><p>{item.description}</p><span className="directory-card-meta">{item.days.length} days <i>·</i> 3 chapters a day</span></button>)}</div>
      {results.length === 0 && <div className="empty-directory">No {noun} match “{search}”. Try another search.</div>}
    </div>
  }

  return <div className="plans-page">
    <section className="plans-hero"><div><p className="plans-kicker">MAKE A LITTLE ROOM, EVERY DAY</p><h1>Choose a path.<br/><em>Stay with the Word.</em></h1><p>Small, thoughtful readings that help Scripture take root in everyday life.</p></div><div className="plans-hero-art"><span className="hero-book"><BookIcon/></span><span className="hero-orbit orbit-1"/><span className="hero-orbit orbit-2"/><span className="hero-leaf">✳</span></div></section>
    <div className="plans-section-title"><div><p className="plans-kicker">THREE WAYS TO BEGIN</p><h2>Find the rhythm that fits.</h2></div><span>Choose a gentle daily rhythm</span></div>
    <div className="category-grid">{planCategories.map((item, index) => <button key={item.id} className={`category-card category-${index}`} onClick={() => goCategory(item.id)}><span className="category-number">0{index + 1} <span>↗</span></span><div className="category-icon"><BookIcon/></div><h3>{item.label}</h3><p>{item.description}</p><span className="category-count">{item.count}</span></button>)}</div>
    <section className="plans-prompt"><span className="prompt-spark">✳</span><div><p className="plans-kicker">A GENTLE INVITATION</p><h2>Consistency grows one day at a time.</h2></div><p>Pick one plan, read three chapters, and return tomorrow. Your progress stays here on this device.</p></section>
  </div>
}
