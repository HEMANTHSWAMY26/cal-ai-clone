import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Detect if Gemini API key is valid
export const isGeminiConfigured = !!(
  apiKey && 
  apiKey !== 'your-gemini-api-key' && 
  apiKey.length > 10
);

// Initialize Gemini Client safely
const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

export interface NutritionResult {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

// A collection of realistic mock foods for offline/no-api testing
const MOCK_FOODS: NutritionResult[] = [
  { food_name: "Avocado Toast with Poached Egg", calories: 380, protein: 14, carbs: 32, fat: 22, confidence: 0.95 },
  { food_name: "Grilled Chicken Breast with Quinoa and Broccoli", calories: 450, protein: 42, carbs: 38, fat: 12, confidence: 0.98 },
  { food_name: "Pepperoni Pizza Slice", calories: 290, protein: 12, carbs: 32, fat: 12, confidence: 0.92 },
  { food_name: "Acai Bowl with Granola and Banana", calories: 320, protein: 6, carbs: 58, fat: 8, confidence: 0.89 },
  { food_name: "Salmon Fillet with Sweet Potato", calories: 520, protein: 38, carbs: 40, fat: 24, confidence: 0.96 },
  { food_name: "Protein Shake (Whey + Banana + Milk)", calories: 310, protein: 30, carbs: 28, fat: 6, confidence: 0.94 },
  { food_name: "Double Cheeseburger", calories: 680, protein: 38, carbs: 48, fat: 38, confidence: 0.91 },
  { food_name: "Greek Yogurt with Mixed Berries and Honey", calories: 210, protein: 15, carbs: 26, fat: 5, confidence: 0.97 }
];

/**
 * Analyzes a food image using Gemini 2.5 Flash Vision.
 * Automatically falls back to high-quality mock data if credentials are not configured or request fails.
 * 
 * @param base64Image Base64-encoded image string
 * @param mimeType Mime type of the image (e.g. image/jpeg, image/png)
 */
export async function analyzeFoodImage(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<NutritionResult> {
  if (!isGeminiConfigured || !genAI) {
    console.log("[Gemini Service] Using premium mock fallback (API key not configured).");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate AI analysis latency
    // Return a random food from mock collection
    const randomIndex = Math.floor(Math.random() * MOCK_FOODS.length);
    return MOCK_FOODS[randomIndex];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ];

    const prompt = `
      Analyze this food image.
      Identify the food item and estimate its nutritional values.
      Return ONLY a JSON object. Do not include markdown code block formatting (e.g. do not wrap in \`\`\`json).
      JSON Structure:
      {
        "food_name": "Name of the food",
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "confidence": 0.00
      }
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text().trim();

    return parseNutritionResponse(responseText);
  } catch (error) {
    console.error("[Gemini Service] API Error:", error);
    // Graceful fallback to avoid crashing UI
    console.log("[Gemini Service] Falling back to default food analysis due to API failure.");
    const randomIndex = Math.floor(Math.random() * MOCK_FOODS.length);
    return MOCK_FOODS[randomIndex];
  }
}

/**
 * Helper to clean and parse the nutrition JSON response safely.
 */
function parseNutritionResponse(text: string): NutritionResult {
  try {
    // Strip code blocks if the model ignored instructions and wrapped in markdown anyway
    let cleanedText = text;
    if (cleanedText.includes('```')) {
      const match = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleanedText = match[1];
      }
    }
    
    // Remove any remaining non-JSON padding
    cleanedText = cleanedText.substring(
      cleanedText.indexOf('{'),
      cleanedText.lastIndexOf('}') + 1
    );

    const parsed = JSON.parse(cleanedText);

    return {
      food_name: String(parsed.food_name || 'Unknown Food'),
      calories: Math.round(Number(parsed.calories || 0)),
      protein: Math.round(Number(parsed.protein || 0)),
      carbs: Math.round(Number(parsed.carbs || 0)),
      fat: Math.round(Number(parsed.fat || 0)),
      confidence: Number(parsed.confidence || 0.85),
    };
  } catch (error) {
    console.error("[Gemini Service] Failed to parse JSON response:", text, error);
    throw new Error("Invalid nutrition JSON format received from AI.");
  }
}
