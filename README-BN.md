# Al-Quran Mobile UI — replacement patch

এই ZIP-টি `muhammedomor-studio/Al-Quran` রিপোজিটরির জন্য **UI replacement patch**। কোরআনের ডেটা ফাইল অপরিবর্তিত রাখতে পুরো ডেটাসেট কপি করা হয়নি; আপনার বর্তমান repository-তে `lib/data/ayahs`, `lib/data/tafsirs`, `lib/data/suras.json` এবং `public/audio`-এর মতো ডেটা/অডিও ফোল্ডারগুলো আগের মতো রাখুন।

## ব্যবহার
1. আগে repository-র একটি backup/branch রাখুন।
2. ZIP extract করে এর `app/page.tsx`, `components/mobile-app.css`, `components/mobile-quran-app.tsx` ফাইলগুলো repository-র একই path-এ upload/replace করুন।
3. `package.json`, `lib/data/`, `public/` বা audio/data files মুছবেন না—এগুলোই আপনার মূল ডেটা।
4. Next.js project হলে `npm install` তারপর `npm run build` দিয়ে পরীক্ষা করুন।

## অন্তর্ভুক্ত UI
- Mobile-first Home, Quran, Saved Ayahs, Settings bottom navigation
- Surah search, Arabic/Bangla/both reading modes
- Existing ayah JSON ও audio paths ব্যবহার
- Local saved bookmarks, last-read, dark mode, font sizing
- Tafsir JSON পড়ার চেষ্টা এবং source-code link
- Donation guidance page section

## গুরুত্বপূর্ণ
এটি সম্পূর্ণ repository archive নয়, কারণ মূল repository-তে বড় ডেটা/অডিও ফাইল রয়েছে। এটি ইচ্ছাকৃতভাবে শুধু replacement files রাখে, যাতে Quran data অপরিবর্তিত থাকে। Existing tafsir JSON-এর field structure ভিন্ন হলে tafsir dialog-এ fallback message দেখাতে পারে; audio file paths existing repository-র মতোই থাকতে হবে।
