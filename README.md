# CAL.AI Clone - AI Calorie Tracker

A production-ready, premium dark mode AI-powered calorie tracking mobile application inspired by Cal AI. Built for the 8x Social coding challenge.

## Features

1. **Branded Splash Screen**: Animated brand entry with routing logic.
2. **Interactive Onboarding**: Goal target setup flow (Calories, Protein, Carbs, Fat) with sliding steps.
3. **Flexible Authentication**: Integrated Supabase Auth with smart offline fallbacks.
4. **Intuitive Home Dashboard**: Circular remaining calorie rings, macro targets (protein, carbs, fat) and active streak logging.
5. **AI Food Scanner**: Snap food photos or import from gallery to instantly parse nutrition via Gemini 2.5 Flash Vision.
6. **Editable Analysis Detail**: Tweak AI estimates and macronutrients before saving.
7. **Comprehensive Diary**: Categorize food chronologically into Breakfast, Lunch, Dinner, or Snacks with CRUD actions (editing and removal).
8. **Nutrition Trends**: Weekly tracking charts for calorie history and macro ratios.
9. **Streak Progress**: Habit trackers, calendar compliance grids, and level badges.

---

## Tech Stack

- **Frontend**: React Native Expo (SDK 56), TypeScript, Expo Router.
- **Styling**: NativeWind (Tailwind CSS v4) via `react-native-css`.
- **Database/Auth**: Supabase.
- **AI Core**: Gemini 2.5 Flash Vision API.
- **Charts**: react-native-chart-kit, react-native-svg.
- **State/Caching**: Zustand, AsyncStorage.

---

## Installation & Setup

### 1. Clone & Install Dependencies
Ensure you have Node.js and Git installed. In your terminal run:
```bash
git clone https://github.com/HEMANTHSWAMY26/cal-ai-clone.git
cd cal-ai-clone
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory (based on `.env` template):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```
*Note: If these values are not supplied, the app automatically switches to **Mock Mode** allowing full local test runs.*

---

## Integration Setup Guides

### Supabase Setup Guide
1. Create a project at [Supabase](https://supabase.com).
2. Go to your **SQL Editor** tab in the dashboard.
3. Paste the contents of `supabase/schema.sql` and run it. This will:
   - Create tables for `users`, `daily_goals`, `meals`, and `streaks`.
   - Setup RLS (Row Level Security) and read/write policies.
   - Configure a trigger function to create initial stats whenever a new user registers.
4. Go to **Storage**, create a new public bucket named `meal-images`.

### Gemini API Setup Guide
1. Obtain an API Key from Google AI Studio at [aistudio.google.com](https://aistudio.google.com).
2. Copy the key into your `.env` as `EXPO_PUBLIC_GEMINI_API_KEY`.
3. The app connects to the `gemini-2.5-flash` model for lightweight and fast visual analysis.

---

## Submission Checklist

### Screenshot Checklist
- [ ] Onboarding goal sliders.
- [ ] Active Dashboard with macronutrient circles and active streak zap.
- [ ] Live Camera Scan view or image selector.
- [ ] AI Analysis screen showing Gemini confidence score and breakdown.
- [ ] Daily Food Diary with editable logs.
- [ ] Weekly analytics line and bar chart graphs.

### Loom Walkthrough Outline
- [ ] **Onboarding & Goals**: Show setting goals.
- [ ] **Dashboard Overview**: Explain current intake, progress rings, and streaks.
- [ ] **AI Scanning Flow**: Snap a food item, display Gemini processing modal, show the confidence level, edit variables, and save.
- [ ] **Diary Logs**: Filter meals (Breakfast/Lunch) and edit/delete a logged food.
- [ ] **Analytics**: Navigate trends and weight curves.
