# Al-Quran Android APK + UI Fix (Bangla)

এই ZIP-টি আপনার `muhammedomor-studio/Al-Quran` repository-র জন্য **replacement patch**। মূল `lib/data/ayahs/`, `lib/data/tafsirs/` এবং বাকি Quran data JSON পরিবর্তন করা হয় না।

## কেন আগেরটা কাজ করেনি
- পুরোনো GitHub Actions Node 8/10/12 ব্যবহার করছিল, অথচ Next.js 14-এর জন্য আধুনিক Node প্রয়োজন।
- পুরোনো workflow APK বানাত না; `npm test` চালাত অথচ package-এ test script নেই।
- মোবাইল UI-তে আয়াত/তাফসির `/lib/data/...` URL দিয়ে fetch করা হচ্ছিল; `lib` ফোল্ডার public web directory নয়, তাই browser-এ 404 হতে পারে।
- আগের mobile UI তাফসিরকে array হিসেবে ধরেছিল; repository-র tafsir JSON আসলে আয়াত নম্বরের key-সহ object।
- নাম/আইকন বদলাতে Next metadata, manifest এবং Android app icon—সব জায়গা আলাদা করে সেট করতে হয়।

## কী আছে
- `components/mobile-quran-app.tsx` — corrected mobile UI; JSON data সরাসরি import করে, tafsir object থেকে দেখায়, saved ayah, dark mode, font sizing, audio streaming.
- `components/mobile-app.css` — mobile-first UI styling.
- `app/page.tsx`, `app/layout.tsx`, `app/manifest.ts`, `lib/seo.ts` — app branding/metadata.
- `next.config.mjs` — static export settings.
- `capacitor.config.ts`, `package.json` — Android packaging.
- `.github/workflows/android-apk.yml` — GitHub Actions-এ APK build ও artifact upload.
- `.github/workflows/js.yml` — পুরোনো incompatible Node matrix সরিয়ে Node 20 build validation.
- `assets/icon.png`, `assets/splash.png`, `public/quran.png` — নতুন app icon/branding.

## ইনস্টল করার নিয়ম
1. Repository-র আগে backup/branch তৈরি করুন।
2. ZIP-এর ফাইলগুলো **repository root-এ একই path ধরে** upload/replace করুন; `assets/` এবং `capacitor.config.ts` নতুন ফাইল হিসেবে যোগ হবে।
3. `lib/data/`-এর কোনো JSON ফাইল replace বা delete করবেন না। `public/audio/`-ও repository-তে অক্ষত থাকবে।
4. GitHub → Actions → **Build Android APK** → Run workflow চাপুন, অথবা master branch-এ commit/push করুন।
5. Workflow সবুজ হলে run-এর নিচে **Artifacts → sohoj-quran-debug-apk** থেকে APK ZIP ডাউনলোড করে extract করুন। এর ভিতরে `app-debug.apk` থাকবে।

## অডিও ও ডেটা
APK হালকা রাখার জন্য Android workflow checkout-এর সময় বড় `public/audio/` ফাইলগুলো বাদ দেয়। অ্যাপের আয়াত/তাফসির JSON source থেকে bundle হয়; অডিও GitHub raw URL থেকে stream হয়, তাই অডিও চালাতে ইন্টারনেট লাগবে। মূল GitHub repository-র অডিও ফাইলগুলো মুছে ফেলা হয় না।

## গুরুত্বপূর্ণ সীমা
এই পরিবেশে GitHub Actions বাস্তবে চালিয়ে APK build সফল হয়েছে বলে যাচাই করা সম্ভব হয়নি। তাই প্রথম workflow run-এর ফলাফল দেখে নিশ্চিত হতে হবে। কোনো build error হলে Actions-এর failed step/log দিলে নির্দিষ্ট error ঠিক করা যাবে। এটি debug APK; Play Store release-এর জন্য আলাদা signed release build দরকার।
