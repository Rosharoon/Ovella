import { addISODays, daysBetween, toISODate } from '../utils/dates';

export interface WeekGuide {
  week: number;
  trimester: 1 | 2 | 3;
  size: string;
  length: string;
  weight: string;
  title: string;
  baby: string;
  body: string;
  tip: string;
}

export const pregnancyWeeks: WeekGuide[] = [
  {
    week: 1,
    trimester: 1,
    size: 'a wish',
    length: '—',
    weight: '—',
    title: 'A quiet beginning',
    baby: 'Pregnancy dating starts from the first day of your last period, so baby is not conceived just yet.',
    body: 'Your body is preparing for ovulation. Think of this week as the prologue.',
    tip: 'Start a prenatal vitamin with folic acid if you have not already.',
  },
  {
    week: 2,
    trimester: 1,
    size: 'a spark',
    length: '—',
    weight: '—',
    title: 'Fertile window',
    baby: 'Ovulation is near. If sperm meets egg, conception can happen at the end of this week.',
    body: 'Cervical mucus may become clearer and stretchier. Energy often lifts.',
    tip: 'Track intimacy and rest well — both support conception.',
  },
  {
    week: 3,
    trimester: 1,
    size: 'a poppy seed',
    length: '0.1 cm',
    weight: '—',
    title: 'Conception week',
    baby: 'A tiny cluster of cells is traveling toward the uterus and beginning to divide rapidly.',
    body: 'You will not feel pregnant yet. Some people notice a slightly higher basal temperature.',
    tip: 'Skip alcohol and skip the hot tub. Early cells are sensitive.',
  },
  {
    week: 4,
    trimester: 1,
    size: 'a sesame seed',
    length: '0.2 cm',
    weight: '—',
    title: 'Implantation',
    baby: 'The blastocyst nestles into the uterine lining. The placenta begins its first work.',
    body: 'A home test may turn positive. Light spotting can be implantation, not a period.',
    tip: 'Book a first prenatal visit and keep taking folic acid.',
  },
  {
    week: 5,
    trimester: 1,
    size: 'an apple seed',
    length: '0.3 cm',
    weight: '—',
    title: 'Heart begins',
    baby: 'A neural tube is forming and a tiny heart tube may start to flutter.',
    body: 'Sore breasts, fatigue, or a metallic taste can appear. Tender is normal.',
    tip: 'Eat small, frequent meals if smells suddenly feel too strong.',
  },
  {
    week: 6,
    trimester: 1,
    size: 'a sweet pea',
    length: '0.6 cm',
    weight: '—',
    title: 'Tiny features',
    baby: 'Buds for arms and legs appear. Facial features are sketched in miniature.',
    body: 'Nausea can start. Rest is not lazy — your body is building a whole circulatory system.',
    tip: 'Keep crackers by the bed and sit up slowly in the morning.',
  },
  {
    week: 7,
    trimester: 1,
    size: 'a blueberry',
    length: '1 cm',
    weight: '—',
    title: 'Brain growing fast',
    baby: 'Brain and face are developing quickly. Little hands and feet are paddle-shaped.',
    body: 'Frequent bathroom trips and stronger smells are common now.',
    tip: 'Sip water all day. Dehydration can make nausea feel worse.',
  },
  {
    week: 8,
    trimester: 1,
    size: 'a raspberry',
    length: '1.6 cm',
    weight: '1 g',
    title: 'Everything in motion',
    baby: 'Fingers, toes, and eyelids are forming. Baby can make tiny unfelt movements.',
    body: 'Emotions may swing. Hormones are high and so is the work happening inside.',
    tip: 'Tell someone you trust if you want support through the first trimester.',
  },
  {
    week: 9,
    trimester: 1,
    size: 'a cherry',
    length: '2.3 cm',
    weight: '2 g',
    title: 'Essential organs',
    baby: 'Basic organs are in place. The tail is disappearing and baby looks more human.',
    body: 'A thicker waist or tighter waistband can appear before a visible bump.',
    tip: 'Soft waistbands and a short afternoon rest can change the whole day.',
  },
  {
    week: 10,
    trimester: 1,
    size: 'a strawberry',
    length: '3.1 cm',
    weight: '4 g',
    title: 'Officially a fetus',
    baby: 'Vital organs are working. Tiny nails and tooth buds are forming.',
    body: 'Energy may still be low. That is the placenta growing, not a lack of willpower.',
    tip: 'Gentle walks after meals can ease bloating and lift your mood.',
  },
  {
    week: 11,
    trimester: 1,
    size: 'a fig',
    length: '4.1 cm',
    weight: '7 g',
    title: 'Stretching out',
    baby: 'Head is still large, but the body is catching up. Bones are beginning to harden.',
    body: 'Hunger can return. Some people feel a little more like themselves.',
    tip: 'Add a protein snack between meals to steady energy.',
  },
  {
    week: 12,
    trimester: 1,
    size: 'a lime',
    length: '5.4 cm',
    weight: '14 g',
    title: 'End of first trimester',
    baby: 'Reflexes are appearing. Kidneys are producing urine and the face is more defined.',
    body: 'The uterus is rising out of the pelvis. Risk of miscarriage drops after this week.',
    tip: 'Celebrate this milestone in a small, kind way — a bath, a letter, a rest.',
  },
  {
    week: 13,
    trimester: 2,
    size: 'a pea pod',
    length: '7.4 cm',
    weight: '23 g',
    title: 'Second trimester begins',
    baby: 'Vocal cords are forming. Unique fingerprints are already in place.',
    body: 'Many people feel a lift here. Nausea often eases and appetite returns.',
    tip: 'Start noticing posture. A pillow behind your lower back helps already.',
  },
  {
    week: 14,
    trimester: 2,
    size: 'a lemon',
    length: '8.7 cm',
    weight: '43 g',
    title: 'Expressive face',
    baby: 'Baby can squint, frown, and practice breathing motions.',
    body: 'A soft roundness may appear. Libido and skin glow can both surprise you.',
    tip: 'A supportive bra now is a gift to future you.',
  },
  {
    week: 15,
    trimester: 2,
    size: 'an apple',
    length: '10.1 cm',
    weight: '70 g',
    title: 'Bones strengthening',
    baby: 'Legs are growing longer than arms. Taste buds are developing.',
    body: 'Nasal congestion and a little nosebleed can happen from extra blood flow.',
    tip: 'A humidifier and saline spray are kinder than meds you have not checked.',
  },
  {
    week: 16,
    trimester: 2,
    size: 'an avocado',
    length: '11.6 cm',
    weight: '100 g',
    title: 'First flutters?',
    baby: 'The neck is longer and the head is more upright. Hearing is beginning.',
    body: 'Some people feel butterfly flutters, especially if this is not a first pregnancy.',
    tip: 'Talk or sing — baby is starting to live in a world of sound.',
  },
  {
    week: 17,
    trimester: 2,
    size: 'a pear',
    length: '13 cm',
    weight: '140 g',
    title: 'Brown fat stores',
    baby: 'A layer of brown fat will help with temperature after birth.',
    body: 'Appetite can be strong. Heartburn may visit after spicy or late meals.',
    tip: 'Eat dinner earlier and keep the head of the bed slightly raised.',
  },
  {
    week: 18,
    trimester: 2,
    size: 'a sweet potato',
    length: '14.2 cm',
    weight: '190 g',
    title: 'Anatomy week',
    baby: 'Ears sit in their final place. Myelin is beginning to wrap nerves.',
    body: 'An anatomy scan is often offered around now. The bump is getting harder to hide.',
    tip: 'Write questions for your scan so the appointment feels unrushed.',
  },
  {
    week: 19,
    trimester: 2,
    size: 'a mango',
    length: '15.3 cm',
    weight: '240 g',
    title: 'Lanugo coat',
    baby: 'Fine lanugo hair covers the skin. A creamy vernix will protect it next.',
    body: 'Round ligament twinges on the sides of the bump are common when you stand.',
    tip: 'Stand up slowly and support the belly with your hands if a twinge hits.',
  },
  {
    week: 20,
    trimester: 2,
    size: 'a banana',
    length: '16.4 cm',
    weight: '300 g',
    title: 'Halfway there',
    baby: 'Baby swallows, and the digestive system is practicing. Hair and nails keep growing.',
    body: 'You are at the midpoint. Movements may feel like pops or rolls.',
    tip: 'Take a bump photo today. Future you will love this exact week.',
  },
  {
    week: 21,
    trimester: 2,
    size: 'a carrot',
    length: '26.7 cm',
    weight: '360 g',
    title: 'Eyebrows arriving',
    baby: 'Eyebrows and lids are more defined. Bone marrow starts making blood cells.',
    body: 'Stretch marks can appear even with perfect lotion. They are a sign of growth.',
    tip: 'Massage oil can feel lovely even if it cannot erase marks.',
  },
  {
    week: 22,
    trimester: 2,
    size: 'a papaya',
    length: '27.8 cm',
    weight: '430 g',
    title: 'Senses waking',
    baby: 'Lips, eyelids, and eyebrows are distinct. The sense of touch is developing.',
    body: 'Backaches and heavier breasts are normal. Shoes may feel tighter.',
    tip: 'Side-sleep with a pillow between the knees if your hips ache.',
  },
  {
    week: 23,
    trimester: 2,
    size: 'a grapefruit',
    length: '28.9 cm',
    weight: '500 g',
    title: 'Rapid brain growth',
    baby: 'Lungs are developing airways. Baby may hiccup — a rhythmic little tap.',
    body: 'You may feel those hiccups. Swelling in ankles can start after long days.',
    tip: 'Put your feet up and drink water. Call your clinician if swelling is sudden.',
  },
  {
    week: 24,
    trimester: 2,
    size: 'an ear of corn',
    length: '30 cm',
    weight: '600 g',
    title: 'Viability milestone',
    baby: 'Inner ear is mature, so baby can tell which way is up. Lungs still have work to do.',
    body: 'Glucose screening is often discussed now. Braxton Hicks may begin.',
    tip: 'Practice a slow exhale when a practice contraction appears.',
  },
  {
    week: 25,
    trimester: 2,
    size: 'a cauliflower',
    length: '34.6 cm',
    weight: '660 g',
    title: 'Skin filling in',
    baby: 'Skin is less translucent as fat is laid down. Hands can make a fist.',
    body: 'Constipation and hemorrhoids can show up. Fiber and water are your friends.',
    tip: 'A short walk after lunch helps digestion more than another coffee.',
  },
  {
    week: 26,
    trimester: 2,
    size: 'a bunch of scallions',
    length: '35.6 cm',
    weight: '760 g',
    title: 'Eyes opening soon',
    baby: 'Eyes begin to open. Inhaling and exhaling amniotic fluid practices breathing.',
    body: 'You may feel short of breath as the uterus rises. Sleep can get lighter.',
    tip: 'Propped pillows and a cooler room often help more than extra blankets.',
  },
  {
    week: 27,
    trimester: 2,
    size: 'a head of lettuce',
    length: '36.6 cm',
    weight: '875 g',
    title: 'Last week of second trimester',
    baby: 'Brain tissue is growing quickly. Baby responds to light and familiar voices.',
    body: 'Restless legs or cramps at night can appear. Stretch calves before bed.',
    tip: 'A banana or yogurt snack can ease nighttime cramps for some people.',
  },
  {
    week: 28,
    trimester: 3,
    size: 'an eggplant',
    length: '37.6 cm',
    weight: '1 kg',
    title: 'Third trimester',
    baby: 'Eyelashes are in. Brain can have sleep and wake cycles.',
    body: 'The home stretch. Heartburn, pelvic pressure, and vivid dreams are common.',
    tip: 'Kick-count on a quiet evening so you learn baby’s usual pattern.',
  },
  {
    week: 29,
    trimester: 3,
    size: 'a butternut squash',
    length: '38.6 cm',
    weight: '1.2 kg',
    title: 'Stronger kicks',
    baby: 'Muscles and lungs keep maturing. The head is growing to hold that busy brain.',
    body: 'You may feel jabs under the ribs. Sitting tall after meals can help.',
    tip: 'Pack a water bottle and snack whenever you leave the house.',
  },
  {
    week: 30,
    trimester: 3,
    size: 'a cabbage',
    length: '39.9 cm',
    weight: '1.3 kg',
    title: 'Bone marrow online',
    baby: 'Bone marrow is a main blood producer now. Lanugo begins to fade.',
    body: 'Shortness of breath and hip ache can share the same afternoon. Slow down.',
    tip: 'A prenatal class or birth preference list can make the unknown feel kinder.',
  },
  {
    week: 31,
    trimester: 3,
    size: 'a coconut',
    length: '41.1 cm',
    weight: '1.5 kg',
    title: 'All five senses',
    baby: 'All five senses are developing. Your baby can respond to light, sound and your voice.',
    body: 'You may feel more breathless as your baby grows. Take things gently and make time to rest.',
    tip: 'Get to know your baby’s usual movement pattern. If it slows or changes, contact your care team right away.',
  },
  {
    week: 32,
    trimester: 3,
    size: 'a jicama',
    length: '42.4 cm',
    weight: '1.7 kg',
    title: 'Practicing breathing',
    baby: 'Toenails are in. Baby is practicing breathing and sucking.',
    body: 'Sleep may come in chapters. A body pillow is worth the space it takes.',
    tip: 'Wash a few newborn onesies now so the last weeks feel lighter.',
  },
  {
    week: 33,
    trimester: 3,
    size: 'a pineapple',
    length: '43.7 cm',
    weight: '1.9 kg',
    title: 'Immune gifts',
    baby: 'Antibodies are passing from you to baby. The skull stays soft for birth.',
    body: 'Pelvic pressure can increase. Stairs may feel like a mountain.',
    tip: 'Ask for help with bags, pets, and anything that requires lifting.',
  },
  {
    week: 34,
    trimester: 3,
    size: 'a cantaloupe',
    length: '45 cm',
    weight: '2.1 kg',
    title: 'Fingernails ready',
    baby: 'Fingernails reach the fingertips. Central nervous system is more mature.',
    body: 'Leaking colostrum is possible. Fatigue is real — honor it.',
    tip: 'Tour your birth place or confirm your home-birth kit this week.',
  },
  {
    week: 35,
    trimester: 3,
    size: 'a honeydew',
    length: '46.2 cm',
    weight: '2.4 kg',
    title: 'Kidneys mature',
    baby: 'Kidneys are fully developed. Most babies turn head-down around now.',
    body: 'Frequent urination returns as baby drops. Pack your hospital bag.',
    tip: 'Put phone chargers, snacks, and a soft robe in the bag first.',
  },
  {
    week: 36,
    trimester: 3,
    size: 'a romaine lettuce',
    length: '47.4 cm',
    weight: '2.6 kg',
    title: 'Early term approaches',
    baby: 'Cheeks are plump. Baby is shedding vernix and drinking amniotic fluid.',
    body: 'You may feel lighter to breathe if baby drops, and heavier in the pelvis.',
    tip: 'Know the signs of labor and when to call — regular contractions, fluid, bleeding.',
  },
  {
    week: 37,
    trimester: 3,
    size: 'a bunch of Swiss chard',
    length: '48.6 cm',
    weight: '2.9 kg',
    title: 'Early term',
    baby: 'Baby is considered early term. Fat is filling the arms and legs.',
    body: 'Nesting energy can arrive in a rush. Do not empty every closet in one day.',
    tip: 'Rest is still the most useful preparation you can do.',
  },
  {
    week: 38,
    trimester: 3,
    size: 'a leek',
    length: '49.8 cm',
    weight: '3.1 kg',
    title: 'Waiting, beautifully',
    baby: 'Organs are ready. Baby may have a full head of hair — or none at all.',
    body: 'Every twinge can feel like the start. That watchfulness is love, not worry alone.',
    tip: 'A slow walk and a warm shower can ease the last stretch of waiting.',
  },
  {
    week: 39,
    trimester: 3,
    size: 'a mini watermelon',
    length: '50.7 cm',
    weight: '3.3 kg',
    title: 'Full term',
    baby: 'Baby is full term. The chest is becoming more prominent and the brain keeps folding.',
    body: 'Sleep when you can. A bag by the door and a charged phone are enough.',
    tip: 'Trust your instincts. If something feels off, call — you are not being dramatic.',
  },
  {
    week: 40,
    trimester: 3,
    size: 'a small pumpkin',
    length: '51.2 cm',
    weight: '3.5 kg',
    title: 'Due week',
    baby: 'Baby is ready. Only about 5% arrive on the due date — most come within two weeks.',
    body: 'You made it to due week. Whether labor is today or later, you are so close.',
    tip: 'If you go past your date, keep appointments and keep counting those kicks.',
  },
];

export function getWeekGuide(week: number): WeekGuide {
  const clamped = Math.min(40, Math.max(1, week));
  return pregnancyWeeks[clamped - 1];
}

export const GESTATION_DAYS = 280;
export const EARLIEST_ARRIVAL_WEEK = 22;

export function dueFromLastPeriod(lastPeriodStart: string): string {
  return addISODays(lastPeriodStart, GESTATION_DAYS);
}

export function lastPeriodFromDue(dueDate: string): string {
  return addISODays(dueDate, -GESTATION_DAYS);
}

export function resolvedLastPeriod(pregnancy: { dueDate: string; lastPeriodStart?: string }): string {
  return pregnancy.lastPeriodStart || lastPeriodFromDue(pregnancy.dueDate);
}

export function resolvedDueDate(pregnancy: { dueDate: string; lastPeriodStart?: string }): string {
  return pregnancy.lastPeriodStart ? dueFromLastPeriod(pregnancy.lastPeriodStart) : pregnancy.dueDate;
}

export function pregnancyWeek(
  pregnancy: { dueDate: string; lastPeriodStart?: string },
  today = new Date(),
): number {
  const days = daysBetween(resolvedLastPeriod(pregnancy), toISODate(today));
  return Math.min(42, Math.max(1, Math.floor(days / 7) + 1));
}

export function pregnancyDatesFromSelection(selected: string, recorded: string[], loggedStarts: string[] = []) {
  const today = toISODate(new Date());
  const earlier = recorded.filter((date) => date && date < today).sort();
  const lastPeriodStart =
    selected === today && !loggedStarts.includes(today) && earlier.length ? earlier[earlier.length - 1] : selected;
  return { lastPeriodStart, dueDate: dueFromLastPeriod(lastPeriodStart) };
}

export function lastPeriodForWeek(week: number, today = new Date()): string {
  const clamped = Math.min(42, Math.max(1, Math.round(week)));
  return addISODays(toISODate(today), -((clamped - 1) * 7));
}

export function getPregnancyWeek(dueDateISO: string, today = new Date()): number {
  return pregnancyWeek({ dueDate: dueDateISO, lastPeriodStart: lastPeriodFromDue(dueDateISO) }, today);
}

export function daysUntilDue(dueDateISO: string, today = new Date()): number {
  const due = new Date(dueDateISO + 'T00:00:00');
  return Math.ceil((due.getTime() - new Date(today.toDateString()).getTime()) / 86400000);
}
