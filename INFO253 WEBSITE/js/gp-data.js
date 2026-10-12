/* =========================================================
   GP directory — fictional doctors for the prototype.
   Teammates can reuse this file on the booking page:
   look up a GP with  GPS.find(g => g.id === "aroha-tane")
   ---------------------------------------------------------
   hours: [startHour, endHour] the GP works each day (24h)
   days:  days of the week they work (0 = Sun ... 6 = Sat)
   Keep hours and languages in line with the About and FAQ pages.
   ========================================================= */

const GPS = [
  {
    id: "aroha-tane", name: "Dr Aroha Tane", gender: "Female",
    quals: "MBChB, FRNZCGP", years: 14, colour: "#F2B632",
    languages: ["English", "te reo Māori"],
    interests: ["Children's health", "Women's health", "Chronic conditions"],
    bio: "Aroha has worked in rural general practice in Northland and Canterbury. She enjoys caring for whole whānau and helping families manage long-term conditions.",
    hours: [7, 14], days: [1, 2, 3, 4, 5],
  },
  {
    id: "wei-chen", name: "Dr Wei Chen", gender: "Male",
    quals: "MBChB, FRNZCGP", years: 9, colour: "#9FD3C1",
    languages: ["English", "Mandarin", "Cantonese"],
    interests: ["Mental health", "Men's health", "Skin conditions"],
    bio: "Wei trained in Auckland and has a special interest in mental health for students and young professionals. He often helps patients who are new to the New Zealand health system.",
    hours: [15, 22], days: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: "priya-nair", name: "Dr Priya Nair", gender: "Female",
    quals: "MBBS, FRNZCGP, DipObs", years: 11, colour: "#F6C1B0",
    languages: ["English", "Hindi"],
    interests: ["Women's health", "Sexual health", "Pregnancy"],
    bio: "Priya holds a diploma in obstetrics and has a strong interest in contraception, pregnancy care and menopause.",
    hours: [9, 17], days: [1, 2, 4, 5, 6],
  },
  {
    id: "sione-fifita", name: "Dr Sione Fifita", gender: "Male",
    quals: "MBChB, FRNZCGP", years: 7, colour: "#B9C8F0",
    languages: ["English", "Samoan", "Tongan"],
    interests: ["Diabetes", "Chronic conditions", "Men's health"],
    bio: "Sione grew up in South Auckland and focuses on diabetes prevention and heart health for Pacific families.",
    hours: [7, 13], days: [0, 1, 3, 5, 6],
  },
  {
    id: "emma-wilson", name: "Dr Emma Wilson", gender: "Female",
    quals: "MBChB, FRNZCGP", years: 22, colour: "#D7C4EC",
    languages: ["English"],
    interests: ["Older adults", "Chronic conditions", "Skin conditions"],
    bio: "Emma has been a Christchurch GP for over 20 years. She has a calm, practical approach and a particular interest in caring for older people at home.",
    hours: [8, 16], days: [1, 2, 3, 4],
  },
  {
    id: "james-okafor", name: "Dr James Okafor", gender: "Male",
    quals: "MBBS, FRNZCGP, PGDipSportMed", years: 12, colour: "#C7E3A5",
    languages: ["English"],
    interests: ["Sports injuries", "Men's health", "Mental health"],
    bio: "James has a postgraduate diploma in sports medicine and works with athletes and weekend warriors on injuries and recovery.",
    hours: [16, 22], days: [1, 2, 3, 4, 5],
  },
  {
    id: "mei-lin-zhao", name: "Dr Mei Lin Zhao", gender: "Female",
    quals: "MBChB, FRNZCGP", years: 5, colour: "#FBD38D",
    languages: ["English", "Mandarin"],
    interests: ["Children's health", "Mental health", "Skin conditions"],
    bio: "Mei Lin is a newer GP with a warm, unhurried style. She works evenings and weekends, which suits busy parents and students.",
    hours: [14, 22], days: [0, 3, 4, 5, 6],
  },
  {
    id: "tom-harris", name: "Dr Tom Harris", gender: "Male",
    quals: "MBChB, FRNZCGP", years: 18, colour: "#A8D5E2",
    languages: ["English"],
    interests: ["Travel health", "Chronic conditions", "Older adults"],
    bio: "Tom spent several years as a doctor with rural and remote communities. He gives clear, practical advice for travel and ongoing conditions.",
    hours: [10, 18], days: [0, 2, 4, 6],
  },
];

/* ---------------------------------------------------------
   Fake availability generator.
   Gives each GP a stable set of free 15-min slots for the
   next few days, so the prototype always looks "live".
   --------------------------------------------------------- */
function seededRandom(seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SLOT_DAYS_AHEAD = 7; // shared by Find a GP and the booking page

function getSlots(gp, daysAhead = SLOT_DAYS_AHEAD) {
  const now = new Date();
  const earliest = new Date(now.getTime() + 20 * 60000); // must be 20+ min away
  const out = [];
  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    if (!gp.days.includes(day.getDay())) continue;
    const rand = seededRandom(gp.id + day.toDateString());
    for (let h = gp.hours[0]; h < gp.hours[1]; h++) {
      for (const m of [0, 15, 30, 45]) {
        const t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
        // draw for every slot so the pattern doesn't shift during the day
        const free = rand() < 0.3; // roughly 30% of slots free
        if (free && t > earliest) out.push(t);
      }
    }
  }
  return out;
}

// For the booking page: is the time from the URL still free?
function isSlotFree(gp, iso) {
  const t = new Date(iso).getTime();
  return getSlots(gp).some((s) => s.getTime() === t);
}
