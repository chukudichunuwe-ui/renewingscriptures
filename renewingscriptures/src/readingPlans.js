const chapterCount = {
  Genesis:50, Exodus:40, Leviticus:27, Numbers:36, Deuteronomy:34, Joshua:24, Judges:21, Ruth:4,
  '1 Samuel':31, '2 Samuel':24, '1 Kings':22, '2 Kings':25, '1 Chronicles':29, '2 Chronicles':36,
  Ezra:10, Nehemiah:13, Esther:10, Job:42, Psalms:150, Proverbs:31, Ecclesiastes:12, 'Song of Solomon':8,
  Isaiah:66, Jeremiah:52, Lamentations:5, Ezekiel:48, Daniel:12, Hosea:14, Joel:3, Amos:9, Obadiah:1,
  Jonah:4, Micah:7, Nahum:3, Habakkuk:3, Zephaniah:3, Haggai:2, Zechariah:14, Malachi:4,
  Matthew:28, Mark:16, Luke:24, John:21, Acts:28, Romans:16, '1 Corinthians':16, '2 Corinthians':13,
  Galatians:6, Ephesians:6, Philippians:4, Colossians:4, '1 Thessalonians':5, '2 Thessalonians':3,
  '1 Timothy':6, '2 Timothy':4, Titus:3, Philemon:1, Hebrews:13, James:5, '1 Peter':5, '2 Peter':3,
  '1 John':5, '2 John':1, '3 John':1, Jude:1, Revelation:22,
}

const chronologicalOrder = [
  'Genesis','Job','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel',
  'Psalms','1 Kings','Proverbs','Ecclesiastes','Song of Solomon','2 Kings','1 Chronicles','2 Chronicles',
  'Obadiah','Joel','Jonah','Amos','Hosea','Isaiah','Micah','Nahum','Zephaniah','Jeremiah','Habakkuk',
  'Lamentations','Ezekiel','Daniel','Ezra','Haggai','Zechariah','Esther','Nehemiah','Malachi',
  'Matthew','Mark','Luke','John','Acts','James','Galatians','1 Thessalonians','2 Thessalonians',
  '1 Corinthians','2 Corinthians','Romans','Colossians','Philemon','Ephesians','Philippians','1 Timothy',
  'Titus','1 Peter','Hebrews','2 Timothy','2 Peter','Jude','1 John','2 John','3 John','Revelation',
]

function makeDays(anchors, count) {
  return anchors.slice(0, count).map((anchor) => {
    const match = anchor.match(/^(.+)\s+(\d+)$/)
    const title = match?.[1] ?? anchor
    const start = Number(match?.[2] ?? 1)
    const max = chapterCount[title] ?? 150
    const firstChapter = Math.max(1, Math.min(start, max - 2))
    return Array.from({ length: 3 }, (_, index) => `${title} ${firstChapter + index}`)
  })
}

const characterRows = [
  ['Aaron','A calling shaped by service, leadership, and intercession',['Exodus 4','Exodus 7','Exodus 12','Exodus 28','Leviticus 8']],
  ['Abigail','Wisdom and courage in a moment of conflict',['1 Samuel 24','1 Samuel 25','1 Samuel 26','1 Samuel 27','2 Samuel 2']],
  ['Abraham','Faith, promise, and a life of trusting God',['Genesis 11','Genesis 12','Genesis 15','Genesis 17','Genesis 22']],
  ['Adam','Human beginnings, responsibility, and the promise of restoration',['Genesis 1','Genesis 2','Genesis 3','Genesis 4','Romans 5']],
  ['Daniel','Steadfast faith through exile, pressure, and hope',['Daniel 1','Daniel 2','Daniel 3','Daniel 5','Daniel 6']],
  ['David','A shepherd, king, poet, and person after God’s heart',['1 Samuel 16','1 Samuel 17','1 Samuel 24','2 Samuel 5','2 Samuel 7']],
  ['Deborah','Courageous leadership and deliverance in Israel',['Judges 4','Judges 5','Judges 6','Judges 7','Judges 8']],
  ['Elijah','Bold witness, discouragement, and renewed purpose',['1 Kings 17','1 Kings 18','1 Kings 19','1 Kings 21','2 Kings 2']],
  ['Elisha','A prophetic ministry marked by compassion and wonder',['1 Kings 19','2 Kings 2','2 Kings 4','2 Kings 5','2 Kings 6']],
  ['Esther','Courage, providence, and speaking up for others',['Esther 1','Esther 2','Esther 3','Esther 4','Esther 5']],
  ['Eve','Creation, choice, consequence, and hope',['Genesis 1','Genesis 2','Genesis 3','Genesis 4','2 Corinthians 11']],
  ['Ezra','Returning to Scripture and rebuilding a community',['Ezra 1','Ezra 3','Ezra 7','Ezra 8','Ezra 9']],
  ['Gideon','From fear to faithfulness in an unlikely calling',['Judges 6','Judges 7','Judges 8','Judges 6','Hebrews 11']],
  ['Hannah','Honest prayer, patient hope, and gratitude',['1 Samuel 1','1 Samuel 2','1 Samuel 3','1 Samuel 12','Luke 1']],
  ['Hezekiah','Trust and prayer in a season of national crisis',['2 Kings 18','2 Kings 19','2 Kings 20','Isaiah 36','Isaiah 37']],
  ['Isaac','Promise carried forward through an imperfect family',['Genesis 21','Genesis 22','Genesis 24','Genesis 25','Genesis 26']],
  ['Isaiah','A prophet’s vision of holiness, justice, and comfort',['Isaiah 6','Isaiah 9','Isaiah 40','Isaiah 52','Isaiah 53']],
  ['Jacob','Struggle, transformation, and a family shaped by promise',['Genesis 25','Genesis 27','Genesis 28','Genesis 31','Genesis 32']],
  ['James','Practical faith, wisdom, and care for the vulnerable',['Matthew 13','Mark 3','Acts 12','James 1','James 2']],
  ['Jeremiah','Faithful witness through grief, resistance, and hope',['Jeremiah 1','Jeremiah 7','Jeremiah 18','Jeremiah 29','Jeremiah 32']],
  ['Jesus','The life, teaching, death, and resurrection of Jesus',['Mark 1','Matthew 5','Luke 8','John 13','John 20']],
  ['Job','Suffering, honest questions, and the mystery of God',['Job 1','Job 2','Job 3','Job 19','Job 38']],
  ['John the Apostle','Following Jesus and bearing witness to his love',['Mark 3','John 13','John 19','John 20','John 21']],
  ['John the Baptist','A prophetic voice preparing the way for Jesus',['Matthew 3','Matthew 11','Matthew 14','Mark 1','John 1']],
  ['Joseph','Integrity, forgiveness, and providence in a family story',['Genesis 37','Genesis 39','Genesis 40','Genesis 41','Genesis 45']],
  ['Joshua','Courage, leadership, and entering the promised land',['Joshua 1','Joshua 3','Joshua 6','Joshua 23','Joshua 24']],
  ['Judas Iscariot','Choices, betrayal, and the final days of Jesus',['Matthew 26','John 12','John 13','Matthew 27','Acts 1']],
  ['Lazarus','Friendship, grief, and the sign of resurrection',['John 11','John 12','Luke 10','Luke 16','John 1']],
  ['Leah','A complicated family story and the God who sees',['Genesis 29','Genesis 30','Genesis 31','Genesis 33','Genesis 49']],
  ['Lydia','Hospitality, faith, and the beginnings of a church',['Acts 16','Philippians 1','Philippians 4','Acts 17','1 Thessalonians 1']],
  ['Mary Magdalene','Devotion, grief, and the first resurrection witness',['Luke 8','John 19','John 20','Mark 15','Matthew 28']],
  ['Mary Mother of Jesus','Faith and courage across the life of Jesus',['Luke 1','Luke 2','Matthew 1','John 2','Acts 1']],
  ['Matthew','A tax collector called to follow and tell the good news',['Matthew 9','Matthew 10','Matthew 13','Matthew 28','Acts 1']],
  ['Moses','Calling, liberation, covenant, and faithful leadership',['Exodus 2','Exodus 3','Exodus 12','Exodus 19','Deuteronomy 34']],
  ['Nehemiah','Prayerful leadership and the work of rebuilding',['Nehemiah 1','Nehemiah 2','Nehemiah 4','Nehemiah 6','Nehemiah 8']],
  ['Noah','Judgment, obedience, and a covenant of new beginnings',['Genesis 5','Genesis 6','Genesis 7','Genesis 8','Genesis 9']],
  ['Paul','Conversion, mission, and a life devoted to the gospel',['Acts 9','Acts 13','Acts 16','Romans 8','2 Timothy 4']],
  ['Peter','A bold disciple learning humility, courage, and care',['Luke 5','Matthew 16','John 21','Acts 2','1 Peter 1']],
  ['Philip','From following Jesus to sharing good news widely',['John 1','John 6','Acts 6','Acts 8','Acts 21']],
  ['Priscilla','Hospitality, teaching, and partnership in ministry',['Acts 18','Romans 16','1 Corinthians 16','Acts 19','Titus 2']],
  ['Rachel','Love, longing, and the story of Jacob’s family',['Genesis 29','Genesis 30','Genesis 31','Genesis 35','Genesis 46']],
  ['Rebekah','A decisive role in the family line of promise',['Genesis 24','Genesis 25','Genesis 26','Genesis 27','Genesis 28']],
  ['Ruth','Loyalty, courage, and belonging in a new family',['Ruth 1','Ruth 2','Ruth 3','Ruth 4','Matthew 1']],
  ['Samson','Strength, weakness, and the consequences of choices',['Judges 13','Judges 14','Judges 15','Judges 16','Hebrews 11']],
  ['Samuel','A listening heart and leadership through change',['1 Samuel 1','1 Samuel 2','1 Samuel 3','1 Samuel 7','1 Samuel 8']],
  ['Sarah','Waiting, laughter, and the fulfillment of a promise',['Genesis 11','Genesis 12','Genesis 16','Genesis 18','Genesis 21']],
  ['Saul','Israel’s first king and the cost of disobedience',['1 Samuel 9','1 Samuel 10','1 Samuel 13','1 Samuel 15','1 Samuel 28']],
  ['Solomon','Wisdom, worship, achievement, and divided loyalties',['1 Kings 1','1 Kings 3','1 Kings 4','1 Kings 8','1 Kings 10']],
  ['Stephen','Courageous witness and costly faithfulness',['Acts 6','Acts 7','Acts 8','Acts 22','Acts 26']],
  ['Timothy','Growing in faith and serving across generations',['Acts 16','1 Timothy 1','1 Timothy 4','2 Timothy 1','2 Timothy 4']],
]

export const characterPlans = characterRows.map(([name, description, anchors]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, description, duration: 5,
  days: makeDays(anchors, 5),
})).sort((a, b) => a.name.localeCompare(b.name))

const themeRows = [
  ['Anxiety','Bring anxious thoughts honestly to God and receive steady peace',['Matthew 6','Psalm 55','Philippians 4']],
  ['Compassion','See people with mercy and respond with practical care',['Luke 10','Matthew 9','Colossians 3']],
  ['Contentment','Practice gratitude and freedom from comparison',['Philippians 4','1 Timothy 6','Hebrews 13']],
  ['Courage','Find strength to act faithfully when the next step feels hard',['Joshua 1','Psalm 27','2 Timothy 1']],
  ['Faith','Explore trust, promise, and a faith that becomes action',['Hebrews 11','Romans 4','James 2']],
  ['Forgiveness','Receive mercy and learn to extend it to others',['Matthew 18','Luke 15','Colossians 3']],
  ['Friendship','Study loyalty, honest counsel, and friendship in Christ',['1 Samuel 18','Proverbs 17','John 15']],
  ['Generosity','Let grace shape how you share what you have',['2 Corinthians 8','2 Corinthians 9','Proverbs 11']],
  ['Gratitude','Notice God’s goodness and practice thanksgiving',['Psalm 100','Colossians 3','1 Thessalonians 5']],
  ['Grief','Make room for lament, comfort, and the promise of hope',['John 11','Psalm 34','Revelation 21']],
  ['Guidance','Seek wisdom and learn to walk the next step in trust',['Proverbs 3','Psalm 25','James 1']],
  ['Healing','Read about restoration, prayer, and the care of the suffering',['Isaiah 53','James 5','Luke 8']],
  ['Hope','Hold to God’s promises through waiting and uncertainty',['Romans 5','1 Peter 1','Psalm 42']],
  ['Humility','Follow the way of Jesus through service and teachability',['Philippians 2','John 13','James 4']],
  ['Joy','Discover a joy rooted in God and resilient through hardship',['John 15','Philippians 4','Psalm 16']],
  ['Justice','Learn the biblical call to fairness, mercy, and right action',['Amos 5','Micah 6','Isaiah 1']],
  ['Kindness','Practice the generous, attentive kindness of God',['Ephesians 4','Luke 6','Ruth 2']],
  ['Love','Explore love as covenant, action, and the heart of Christian life',['1 Corinthians 13','John 15','1 John 4']],
  ['Mercy','See God’s compassion and the invitation to show mercy',['Luke 10','Psalm 103','Micah 7']],
  ['Obedience','Connect listening to God with faithful, loving action',['Deuteronomy 6','John 14','James 1']],
  ['Patience','Learn to wait with endurance, hope, and gentleness',['James 5','Romans 5','Hebrews 10']],
  ['Peace','Receive Christ’s peace and become a peacemaker',['John 14','Philippians 4','Isaiah 26']],
  ['Perseverance','Keep going through difficulty with eyes fixed on hope',['Hebrews 12','Romans 8','James 1']],
  ['Prayer','Grow a prayer life shaped by honesty, persistence, and trust',['Matthew 6','Luke 11','Philippians 1']],
  ['Purpose','Consider calling, good work, and a life shaped by God',['Ephesians 2','Romans 8','Jeremiah 29']],
  ['Reconciliation','Explore restored relationships and the ministry of peace',['2 Corinthians 5','Matthew 5','Colossians 1']],
  ['Renewal','Make space for a changed mind and a fresh start',['Romans 12','Ephesians 4','Titus 3']],
  ['Rest','Receive rest as gift, trust, and a way of life',['Matthew 11','Psalm 23','Hebrews 4']],
  ['Salvation','Trace grace, rescue, and new life through the New Testament',['Romans 3','Ephesians 2','Titus 2']],
  ['Service','Follow Jesus in humble service to neighbors and community',['Mark 10','John 13','Romans 12']],
  ['Strength','Find strength in God’s presence when your own feels small',['Isaiah 40','Psalm 46','2 Corinthians 12']],
  ['Suffering','Read with care about suffering, solidarity, and enduring hope',['1 Peter 4','Romans 8','Job 1']],
  ['Trust','Practice relying on God through uncertainty and change',['Proverbs 3','Psalm 37','Jeremiah 17']],
  ['Wisdom','Seek discernment for choices, words, and everyday life',['Proverbs 1','James 3','Ecclesiastes 3']],
  ['Worship','Explore worship through praise, spirit, and daily life',['Psalm 95','John 4','Romans 12']],
]

export const themePlans = themeRows.map(([name, description, anchors]) => ({
  id: name.toLowerCase(), name, description, duration: 3, days: makeDays(anchors, 3),
})).sort((a, b) => a.name.localeCompare(b.name))

function chronologicalDays() {
  const allChapters = chronologicalOrder.flatMap((book) => Array.from({ length: chapterCount[book] }, (_, index) => `${book} ${index + 1}`))
  while (allChapters.length % 3) allChapters.push('Psalm 1')
  return Array.from({ length: allChapters.length / 3 }, (_, day) => allChapters.slice(day * 3, day * 3 + 3))
}

export const chronologicalPlan = {
  id: 'whole-bible-chronological', name: 'The Bible in chronological order',
  description: 'Read the whole Bible in a timeline-shaped sequence, moving through the story of Scripture from creation to the early church and new creation.',
  duration: 397, days: chronologicalDays(),
}

export const planCategories = [
  { id: 'chronological', label: 'Chronological', description: 'Follow the broad timeline of Scripture, with three chapters for each day.', count: '397 days' },
  { id: 'characters', label: 'Character-based', description: 'Walk through the choices, faith, failures, and growth of 50 people in the Bible.', count: '50 plans' },
  { id: 'themes', label: 'Themes', description: 'Explore 35 biblical themes through guided studies lasting one to four weeks.', count: '35 plans' },
]
