# Project Reflection - Cal AI Clone

A review of technical decisions, challenges overcome, and future considerations during development.

## Architectural Decisions

1. **Expo SDK 56 + Expo Router**: File-based routing organizes pages into clean tab elements and modal presentation contexts. This matches the native feel of the iOS Cal AI app.
2. **NativeWind v5 (Tailwind v4) + react-native-css**: Choosing a CSS-first approach using `@tailwindcss/postcss` keeps styling consistent across platforms (iOS/Android/Web) without relying on heavy Babel configurations.
3. **Zustand + AsyncStorage Offline Caching**: Building state management with an offline fallback mechanism ensures that the app never crashes when credentials are not configured, providing immediate responsiveness.
4. **Supabase Postgres Triggers**: Moving user initialization logic to a database trigger (`handle_new_user()`) ensures that default goals and streak counters are atomically initialized on register.
5. **Lightweight SVG Progress Rings**: Building circular progress indicators with `react-native-svg` avoided heavy chart libraries and allowed precise styling of target rings.

## Challenges Overcome

1. **Large Image Base64 Payloads**: Passing parsed food image payloads via Router search parameters can exceed url lengths and trigger crashes. Resolved by introducing `activeAnalysis` state fields inside the Zustand store to share image URIs and AI results between screens.
2. **API/Database Credential Failover**: Coding competitions require reviewers to run projects easily. Standardizing database models with an `isSupabaseConfigured` boolean flag enabled smart mock failovers for auth, CRUD, and Gemini Vision requests.
3. **Regex JSON Cleaning**: AI models occasionally include markdown wraps (like ` ```json ` blocks). Adding a robust substring extraction utility cleaned responses before JSON parsing.

## Future Enhancements

1. **Local Object Detection**: Integrate a lightweight TensorFlow Lite model locally to detect food bounding boxes before invoking cloud Gemini APIs to optimize token usage.
2. **Multi-image analysis**: Allow uploading multiple angles of a single dish to improve calorie estimation accuracy.
3. **Barcode Scanning**: Add barcode integrations to log packaged foods with nutrition databases.
