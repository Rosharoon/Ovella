export interface TeenArticle {
  id: string;
  title: string;
  eyebrow: string;
  minutes: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

export const TEEN_ARTICLES: TeenArticle[] = [
  {
    id: 'basics',
    title: 'Period basics',
    eyebrow: 'Start here',
    minutes: '4 min read',
    summary: 'What a period is, flow and products.',
    sections: [
      {
        heading: 'What a period is',
        body: 'A period is the days when the lining of the uterus leaves the body as blood. It often lasts a few days. The first periods can be light, heavy, or irregular, and that can be normal.',
      },
      {
        heading: 'Flow',
        body: 'Flow can change from day to day. Light spotting and a heavier day can happen in the same period. Soaking through a product every hour, or bleeding that makes you feel faint, is a reason to get medical help.',
      },
      {
        heading: 'Products',
        body: 'Pads, period underwear, tampons, and cups are all options. Use what feels comfortable, change them regularly, and wash your hands. There is no single right product.',
      },
    ],
  },
  {
    id: 'body',
    title: 'Your changing body',
    eyebrow: 'Puberty 101',
    minutes: '5 min read',
    summary: 'Puberty, discharge and your own pace.',
    sections: [
      {
        heading: 'There’s no single timeline.',
        body: 'Everyone develops at their own pace. Changes may happen before or after your friends’ changes. You don’t need to compare your body with anyone else’s.',
      },
      {
        heading: 'What puberty can bring',
        body: 'Hormones are chemical messengers that help your body grow and change. Growth spurts, breast or chest development, body hair, oilier skin and more sweat can happen gradually. Emotions may feel stronger. Periods may begin, and can be irregular in the first few years.',
      },
      {
        heading: 'Understanding discharge',
        body: 'Vaginal discharge is fluid that helps keep the vagina clean and moist. You might notice it in your underwear, even before your first period. Clear or white discharge without a strong smell can be normal. The amount and texture can change through your cycle.',
      },
      {
        heading: 'Keep care simple',
        body: 'Gently wash the vulva (the outside area) with water. The vagina cleans itself inside, so avoid douching and scented intimate products. Change underwear daily and when damp.',
      },
      {
        heading: 'When to ask for help',
        body: 'Speak with a healthcare professional if you notice itching, pain, a strong or unusual smell, or a noticeable change in discharge. You can also ask about any body change that worries you. A way to start: “I’ve noticed a change in my body. Can you help me talk to a health professional?”',
      },
    ],
  },
  {
    id: 'symptoms',
    title: 'Managing symptoms',
    eyebrow: 'Everyday care',
    minutes: '3 min read',
    summary: 'Comfort for cramps, tiredness and moods.',
    sections: [
      {
        heading: 'Cramps and tiredness',
        body: 'A warm pack, a gentle walk, rest, and drinking water can ease cramps for some people. Tiredness around a period is common. If pain stops you from school or daily life, tell a trusted adult or a clinician.',
      },
      {
        heading: 'Moods',
        body: 'Feelings can shift before or during a period. Naming the feeling in your check-in is enough. You do not have to explain it. If sadness or worry stays most days, ask someone you trust for support.',
      },
    ],
  },
  {
    id: 'help',
    title: 'When to ask for help',
    eyebrow: 'Know your next step',
    minutes: '4 min read',
    summary: 'Signs to discuss with a health professional.',
    sections: [
      {
        heading: 'You don’t have to figure it out alone.',
        body: 'Talk with a trusted adult, school nurse, or healthcare professional if something worries you. A way to start: “I have a question about my period. Can we talk?”',
      },
      {
        heading: 'Get medical help now',
        body: 'Severe pain, very heavy bleeding, or feeling faint needs medical help. Do not wait for a check-in. These guides are for learning, not a diagnosis.',
      },
    ],
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy and support',
    eyebrow: 'If you are pregnant',
    minutes: '4 min read',
    summary: 'Tracking, privacy, and who can help.',
    sections: [
      {
        heading: 'You can track this here',
        body: 'Teen Mode can follow a pregnancy from the first day of your last period. Weeks and the due date are estimates. A healthcare professional can confirm them. You stay in Teen Mode the whole time.',
      },
      {
        heading: 'Your choices still matter',
        body: 'There is more than one way a pregnancy can go. A clinician, or a trusted adult you choose, can explain the options in private. Ovella does not decide for you. You can stop pregnancy tracking from You → Cycle & pregnancy settings.',
      },
      {
        heading: 'Privacy',
        body: 'What you log stays on this phone. You do not have to share a check-in. If you need a private conversation, a school nurse, clinic, or healthcare professional can help you find one.',
      },
      {
        heading: 'When to get help now',
        body: 'Severe pain, heavy bleeding, or fainting needs urgent medical care. Do not wait for the next appointment. These notes are for tracking and learning, not a diagnosis.',
      },
    ],
  },
  {
    id: 'pace',
    title: 'Your cycle doesn’t have to be clockwork.',
    eyebrow: 'A little reassurance',
    minutes: '3 min read',
    summary: 'Learn what can change a cycle.',
    sections: [
      {
        heading: 'Estimates, not deadlines',
        body: 'Ovella’s next-period date is an estimate from the periods you log. Cycles can vary, especially in the first few years. Being a few days early or late can still be your normal.',
      },
      {
        heading: 'What can shift the timing',
        body: 'Stress, illness, sleep, travel, and growing up can move a period. Logging the day it actually starts helps the next estimate. Cycle estimates are not birth control.',
      },
    ],
  },
];

export function teenArticle(id: string) {
  return TEEN_ARTICLES.find((item) => item.id === id) ?? TEEN_ARTICLES[0];
}
