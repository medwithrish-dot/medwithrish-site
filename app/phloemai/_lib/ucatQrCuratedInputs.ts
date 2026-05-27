import type {
  UCATChartVisual,
  UCATQuestion,
  UCATQuestionTag,
  UCATSubtypeId,
} from "./ucatQuestionBank";

export type QrCuratedInput =
  | {
      kind: "single";
      subtype:
        | "qr-graphs"
        | "qr-percentages"
        | "qr-rates-ratios"
        | "qr-averages"
        | "qr-units-geometry"
        | "qr-estimation";
      tags?: UCATQuestionTag[];
      leftTitle?: string;
      stimulus: string[];
      visual?: UCATChartVisual;
      question: string;
      correct: string;
      distractors: [string, string, string];
      explanation: string;
    }
  | {
      kind: "set";
      setId: string;
      stimulus: string[];
      visual: UCATChartVisual;
      questions: Array<{
        subtype:
          | "qr-graphs"
          | "qr-percentages"
          | "qr-rates-ratios"
          | "qr-averages"
          | "qr-units-geometry"
          | "qr-estimation";
        tags?: UCATQuestionTag[];
        question: string;
        correct: string;
        distractors: [string, string, string];
        explanation: string;
      }>;
    };

export const USER_CURATED_QR_INPUTS: QrCuratedInput[] = [
  // ===== PASTE NEW QR QUESTIONS BELOW THIS LINE =====

  // Each object is either:
  //   kind: "single"  — one standalone question (no shared table)
  //   kind: "set"     — 3-4 questions sharing one table/visual (recommended)
  //
  // Verify every answer with arithmetic before writing.
  // Distractors must be plausible errors, not random numbers.
  // Explanations must show the calculation with actual numbers.

  {
    kind: "set",
    setId: "gp-blood-test-age-groups",
    stimulus: [
      "A GP practice recorded blood test results for all patients seen during a two-week health screening programme. Results were classified as Normal, Borderline, or Abnormal, and are shown by age group in the table below.",
    ],
    visual: {
      type: "table",
      title: "Blood Test Results by Age Group",
      headers: ["Age Group", "Normal", "Borderline", "Abnormal", "Total"],
      rows: [
        ["18–39", "240", "60", "20", "320"],
        ["40–59", "180", "90", "30", "300"],
        ["60–79", "120", "80", "50", "250"],
        ["80+", "60", "40", "30", "130"],
        ["Total", "600", "270", "130", "1000"],
      ],
    },
    questions: [
      {
        subtype: "qr-percentages",
        question: "What percentage of all patients had a Normal blood test result?",
        correct: "60%",
        distractors: ["54%", "27%", "87%"],
        explanation:
          "Normal total = 600; grand total = 1000. 600 ÷ 1000 × 100 = 60%. Distractor 54%: omits the 80+ row (240+180+120=540, 540/1000=54%). Distractor 27%: uses the Borderline column total instead (270/1000=27%). Distractor 87%: combines Normal + Borderline (870/1000=87%).",
      },
      {
        subtype: "qr-rates-ratios",
        question:
          "What is the ratio of Abnormal results in the 40–59 age group to Abnormal results in the 60–79 age group?",
        correct: "3:5",
        distractors: ["5:3", "3:4", "9:8"],
        explanation:
          "40–59 Abnormal = 30; 60–79 Abnormal = 50. Ratio = 30:50 = 3:5. Distractor 5:3: ratio reversed. Distractor 3:4: reads 40 (the 80+ Abnormal) instead of 50 for the 60–79 row. Distractor 9:8: uses the Borderline column for the same two groups (90:80=9:8).",
      },
      {
        subtype: "qr-averages",
        question: "What is the mean number of Abnormal results per age group?",
        correct: "32.5",
        distractors: ["26.0", "43.3", "33.0"],
        explanation:
          "Total Abnormal = 20+30+50+30 = 130; number of age groups = 4. Mean = 130 ÷ 4 = 32.5. Distractor 26.0: divides by 5 instead of 4 (130/5=26). Distractor 43.3: divides by 3 instead of 4 (130/3≈43.3). Distractor 33.0: incorrectly rounds 32.5 up to 33.",
      },
      {
        subtype: "qr-percentages",
        question: "What percentage of patients aged 60–79 had an Abnormal result?",
        correct: "20%",
        distractors: ["32%", "5%", "25%"],
        explanation:
          "60–79 Abnormal = 50; 60–79 Total = 250. 50 ÷ 250 × 100 = 20%. Distractor 32%: uses the Borderline count (80) instead of Abnormal (80/250=32%). Distractor 5%: divides by the grand total instead of the age-group total (50/1000=5%). Distractor 25%: uses only Normal+Borderline as denominator (50/(120+80)=50/200=25%).",
      },
    ],
  },

  {
    kind: "set",
    setId: "retail-park-quarterly-sales",
    stimulus: [
      "City Retail Park recorded its monthly sales revenue (in £'000) broken down by product category for Q1 2024. The data is shown in the table below.",
    ],
    visual: {
      type: "table",
      title: "Monthly Sales Revenue by Category, Q1 2024 (£'000)",
      headers: ["Category", "Jan", "Feb", "Mar", "Total"],
      rows: [
        ["Electronics", "240", "240", "320", "800"],
        ["Clothing", "180", "180", "240", "600"],
        ["Food", "120", "140", "140", "400"],
        ["Homeware", "60", "60", "80", "200"],
        ["Total", "600", "620", "780", "2000"],
      ],
    },
    questions: [
      {
        subtype: "qr-percentages",
        question:
          "What percentage of Q1 total sales revenue was generated by the Electronics category?",
        correct: "40%",
        distractors: ["30%", "38.7%", "20%"],
        explanation:
          "Electronics Q1 total = 800; Q1 grand total = 2000. 800 ÷ 2000 × 100 = 40%. Distractor 30%: reads Clothing total instead (600/2000=30%). Distractor 38.7%: divides Feb Electronics by Feb total only (240/620≈38.7%). Distractor 20%: reads Food total (400/2000=20%).",
      },
      {
        subtype: "qr-averages",
        question:
          "What was the average monthly revenue (£'000) for the Clothing category in Q1?",
        correct: "£200,000",
        distractors: ["£180,000", "£240,000", "£150,000"],
        explanation:
          "Clothing Q1 total = £600,000 (600 in £'000); 3 months. 600 ÷ 3 = 200 (£'000) = £200,000. Distractor £180,000: reads the January value only. Distractor £240,000: reads the March value only. Distractor £150,000: divides by 4 (categories) instead of 3 (months): 600/4=150.",
      },
      {
        subtype: "qr-percentages",
        question:
          "In January, what percentage of that month's total revenue came from Electronics and Clothing combined?",
        correct: "70%",
        distractors: ["40%", "30%", "67.7%"],
        explanation:
          "Jan Electronics + Clothing = 240 + 180 = 420; Jan total = 600. 420 ÷ 600 × 100 = 70%. Distractor 40%: uses Electronics alone (240/600=40%). Distractor 30%: uses Clothing alone (180/600=30%). Distractor 67.7%: uses the February grand total as denominator instead of January's (420/620≈67.7%).",
      },
      {
        subtype: "qr-rates-ratios",
        question: "What is the ratio of March total revenue to January total revenue?",
        correct: "13:10",
        distractors: ["4:3", "31:30", "5:4"],
        explanation:
          "March total = 780; January total = 600. GCD(780,600)=60, so 780:600 = 13:10. Distractor 4:3: uses the Electronics row only (320:240=4:3). Distractor 31:30: compares Feb to Jan instead of Mar to Jan (620:600=31:30). Distractor 5:4: estimation error — rounds 780 down to 750, giving 750:600=5:4.",
      },
    ],
  },

  {
    kind: "set",
    setId: "city-bus-route-passengers",
    stimulus: [
      "A city transport authority recorded the average daily passenger numbers across four bus routes, broken down by time period: Morning Peak (07:00–09:00), Daytime (09:00–17:00), and Evening Peak (17:00–19:00). The data for a typical weekday is shown below.",
    ],
    visual: {
      type: "table",
      title: "Average Daily Passenger Numbers by Route and Time Period",
      headers: ["Route", "Morning Peak", "Daytime", "Evening Peak", "Total"],
      rows: [
        ["Route 12", "480", "320", "200", "1000"],
        ["Route 24", "300", "150", "150", "600"],
        ["Route 35", "280", "160", "160", "600"],
        ["Route 47", "140", "80", "80", "300"],
        ["Total", "1200", "710", "590", "2500"],
      ],
    },
    questions: [
      {
        subtype: "qr-percentages",
        question:
          "What percentage of Route 12 passengers travel during the Morning Peak?",
        correct: "48%",
        distractors: ["50%", "32%", "20%"],
        explanation:
          "Route 12 Morning Peak = 480; Route 12 Total = 1000. 480 ÷ 1000 × 100 = 48%. Distractor 50%: rounds 480 up to 500 (500/1000=50%). Distractor 32%: uses the Daytime column instead (320/1000=32%). Distractor 20%: uses the Evening Peak column instead (200/1000=20%).",
      },
      {
        subtype: "qr-averages",
        question:
          "What is the mean Morning Peak passenger count across all four routes?",
        correct: "300",
        distractors: ["480", "140", "240"],
        explanation:
          "Total Morning Peak = 480+300+280+140 = 1200; 4 routes. Mean = 1200 ÷ 4 = 300. Distractor 480: reads Route 12's Morning Peak value only (the highest). Distractor 140: reads Route 47's Morning Peak value only (the lowest). Distractor 240: divides by 5 instead of 4 (1200/5=240).",
      },
      {
        subtype: "qr-rates-ratios",
        question:
          "What is the ratio of Morning Peak to Daytime passengers on Route 12?",
        correct: "3:2",
        distractors: ["2:1", "7:4", "5:3"],
        explanation:
          "Route 12 Morning Peak = 480; Daytime = 320. GCD(480,320)=160, so 480:320 = 3:2. Distractor 2:1: reads Route 24 instead (300:150=2:1) — off-by-one row. Distractor 7:4: reads Route 35 instead (280:160=7:4) — off-by-one row. Distractor 5:3: approximation error, confusing 3:2 with 5:3 (≈1.67 vs 1.50).",
      },
      {
        subtype: "qr-estimation",
        question:
          "Approximately what percentage of total daily passengers travel on Routes 35 and 47 combined?",
        correct: "36%",
        distractors: ["40%", "24%", "48%"],
        explanation:
          "Route 35 + Route 47 total = 600+300 = 900; grand total = 2500. 900 ÷ 2500 × 100 = 36%. Distractor 40%: overestimates by rounding 900 to 1000 (1000/2500=40%). Distractor 24%: uses Route 35 alone (600/2500=24%) — forgets Route 47. Distractor 48%: uses Routes 24+35 instead (600+600=1200, 1200/2500=48%) — off-by-one route selection.",
      },
    ],
  },

  {
    kind: "set",
    setId: "air-quality-monitoring-stations",
    stimulus: [
      "An environmental agency monitors PM2.5 pollutant concentrations (µg/m³) at four stations across a city from Monday to Friday. The readings are shown in the table below. The safe threshold is 35 µg/m³.",
    ],
    visual: {
      type: "table",
      title: "Daily PM2.5 Concentration (µg/m³) by Station",
      headers: ["Station", "Mon", "Tue", "Wed", "Thu", "Fri"],
      rows: [
        ["North (urban)", "42", "38", "45", "50", "35"],
        ["East (suburban)", "28", "25", "30", "32", "20"],
        ["South (rural)", "15", "12", "18", "20", "10"],
        ["West (industrial)", "65", "60", "70", "75", "50"],
      ],
      note: "Safe threshold: 35 µg/m³",
    },
    questions: [
      {
        subtype: "qr-averages",
        question:
          "What was the mean daily PM2.5 concentration at the South (rural) station over the five days?",
        correct: "15 µg/m³",
        distractors: ["12.5 µg/m³", "10 µg/m³", "20 µg/m³"],
        explanation:
          "South readings: 15+12+18+20+10 = 75; 5 days. Mean = 75 ÷ 5 = 15 µg/m³. Distractor 12.5 µg/m³: divides by 6 instead of 5 (75/6=12.5). Distractor 10 µg/m³: reads Friday's value only (the lowest). Distractor 20 µg/m³: reads Thursday's value only (the highest).",
      },
      {
        subtype: "qr-percentages",
        question:
          "On Thursday, by what percentage was the North (urban) reading higher than the South (rural) reading?",
        correct: "150%",
        distractors: ["250%", "30%", "60%"],
        explanation:
          "North Thursday = 50; South Thursday = 20. % increase = (50−20) ÷ 20 × 100 = 30 ÷ 20 × 100 = 150%. Distractor 250%: treats it as a simple ratio (50/20×100=250%) rather than a percentage increase. Distractor 30%: computes the absolute difference only (50−20=30) without dividing by the base. Distractor 60%: uses North as the denominator instead of South (30/50×100=60%).",
      },
      {
        subtype: "qr-rates-ratios",
        question:
          "What is the ratio of the West (industrial) reading to the South (rural) reading on Monday?",
        correct: "13:3",
        distractors: ["5:1", "4:1", "15:4"],
        explanation:
          "West Monday = 65; South Monday = 15. GCD(65,15)=5, so 65:15 = 13:3. Distractor 5:1: uses Friday readings instead (50:10=5:1) — off by one day. Distractor 4:1: approximation error (65÷15≈4.33, rounded down to 4:1). Distractor 15:4: uses Thursday readings (75:20; GCD=5, giving 15:4) — off by one day.",
      },
      {
        subtype: "qr-estimation",
        question:
          "On how many days did the North (urban) station reading strictly exceed the safe threshold of 35 µg/m³?",
        correct: "4",
        distractors: ["5", "3", "2"],
        explanation:
          "North readings: Mon=42, Tue=38, Wed=45, Thu=50, Fri=35. Days strictly above 35: Mon(42), Tue(38), Wed(45), Thu(50) = 4 days. Fri=35 equals the threshold — it does not exceed it. Distractor 5: incorrectly includes Friday (reads ≥35 rather than >35). Distractor 3: counts only values above 40 — Mon(42), Wed(45), Thu(50). Distractor 2: counts only values ≥45 — Wed(45), Thu(50).",
      },
    ],
  },

  // ===== PASTE NEW QR QUESTIONS ABOVE THIS LINE =====
];
