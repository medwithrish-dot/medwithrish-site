import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const ai = new GoogleGenAI({});

// =========================================================================
// PREMIUM UCAT VR GENERATION PROMPT (JSON FORMATTED)
// =========================================================================
const PROMPT_INSTRUCTIONS = `
Generate exactly ONE JSON object matching the target schema based on a completely unique, highly complex academic topic.

CRITICAL CONSTRAINTS:
1. OUTPUT FORMAT: Output ONLY a valid JSON object starting with "{" and ending with "}". Do NOT wrap it in markdown code fences. Do not include any introductory or concluding text. 
2. JSON VALIDITY: Ensure all keys and string values are wrapped in standard double quotes. Use single quotes inside the text if needed, or properly escape internal characters so it is 100% valid JSON parseable text.
3. PASSAGE STRUCTURAL VARIATION & COPYRIGHT SANITIZATION: 
   - 100% original prose synthesized from scratch. Zero copyright restrictions.
   - Total word count varies dynamically between 200 and 400 words.
   - Format the 'stimulus' array to contain either 1, 2, 3, or 4 string elements (paragraphs).
   - Use dense academic prose, complex conditional sentences, and subtle qualifiers. Banish civic clichés.
4. RIGOROUS UCAT LOGIC RULES:
   - 'tfc': Statement hinges on semantic precision (True/False/Can't Tell).
   - 'detail': Direct retrieval where distractors distort causal timelines using exact passage words.
   - 'inference': Multi-step deduction across different parts of the passage.
   - 'fourth': Randomly choose a type: "summary" | "author" | "negative".
5. EXPLANATIONS: Quote the exact lines from the stimulus proving the answer.

THE TARGET SCHEMA TO MATCH EXACTLY:
{
  "stimulus": [
    "Paragraph 1...",
    "Paragraph 2..."
  ],
  "tfc": {
    "statement": "...",
    "answer": "Can't Tell",
    "explanation": "..."
  },
  "detail": {
    "question": "...",
    "correct": "...",
    "distractors": ["...", "...", "..."],
    "explanation": "..."
  },
  "inference": {
    "question": "...",
    "correct": "...",
    "distractors": ["...", "...", "..."],
    "explanation": "..."
  },
  "fourth": {
    "type": "negative",
    "question": "...",
    "correct": "...",
    "distractors": ["...", "...", "..."],
    "explanation": "..."
  }
}
`;

const SYSTEM_INSTRUCTION = `
You are an expert UCAT Verbal Reasoning item writer. Your task is to generate highly accurate, exam-grade Verbal Reasoning passages and questions based on a strict JSON schema.
`;

// =========================================================================
// GYM-SAFE AUTOMATION ENGINE (EXPONENTIAL BACKOFF + BATCH LOCKDOWN)
// =========================================================================
async function startInfiniteAutomation() {
  const outputPath = path.join(__dirname, 'USER_CURATED_VR_PASSAGES.json');
  const TARGET_TOTAL = 1000;
  const BATCH_SIZE = 5;

  let currentItems: any[] = [];

  // Load existing data to maintain absolute persistence
  if (fs.existsSync(outputPath)) {
    try {
      const fileData = fs.readFileSync(outputPath, 'utf8');
      if (fileData.trim()) {
        currentItems = JSON.parse(fileData);
      }
    } catch (e) {
      console.log("Creating fresh dataset file...");
    }
  }

  let currentTotalCount = currentItems.length;
  console.log(`🚀 System Online. Current progress: ${currentTotalCount} / ${TARGET_TOTAL} items saved.`);

  while (currentTotalCount < TARGET_TOTAL) {
    console.log(`\n--- Starting a new batch of ${BATCH_SIZE} items ---`);
    
    for (let i = 0; i < BATCH_SIZE; i++) {
      const nextItemNumber = currentTotalCount + 1;
      let success = false;
      let retryDelay = 15000; // Starts at 15 seconds if an error hits

      // LOCKDOWN LOOP: This item WILL NOT be skipped until it succeeds
      while (!success) {
        console.log(`Generating item ${nextItemNumber} of ${TARGET_TOTAL}...`);
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: PROMPT_INSTRUCTIONS,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.3,
            },
          });

          const cleanText = response.text?.trim();
          if (cleanText) {
            const jsonObject = JSON.parse(cleanText);
            currentItems.push(jsonObject);
            
            // Atomic save to file instantly
            fs.writeFileSync(outputPath, JSON.stringify(currentItems, null, 2));
            console.log(`✓ Saved item ${nextItemNumber}.`);
            
            currentTotalCount++; // Advance overall counter
            success = true;      // Break lockdown loop for this item
          }
        } catch (error) {
          console.error(`⚠️ Server busy or Error on item ${nextItemNumber}. Entering backoff...`);
          console.log(`Waiting for ${retryDelay / 1000} seconds before attempting a self-healing retry...`);
          
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          
          // Double the wait time for the next attempt, capping at 5 minutes (300,000 ms)
          retryDelay = Math.min(retryDelay * 2, 300000); 
        }
      }

      // Safe, standard 4-second pacing cooldown between successful items
      if (currentTotalCount < TARGET_TOTAL) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    console.log(`\n✅ Batch complete. Current collection total: ${currentTotalCount}`);
    console.log(`Taking a 3-second breather before launching the next batch...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(`\n🏆 MISSION ACCOMPLISHED! 1,000 flawless items saved to: ${outputPath}`);
}

startInfiniteAutomation();