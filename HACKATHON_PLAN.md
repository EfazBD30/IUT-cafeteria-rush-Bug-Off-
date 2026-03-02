# Hackathon Action Plan — DevSprint 2026
# 24 Hour Hour-by-Hour Plan

---

## Hour 0-1: Setup Everything

কাজ:
- GitHub এ account বানাও যদি না থাকে: https://github.com
- New Repository বানাও নাম দাও: iut-cafeteria-rush
- Public রাখো
- README initialize করো না — আমাদের নিজেরটা আছে
- VS Code এ terminal খোলো
- এই commands দাও:
  cd Desktop
  git init iut-cafeteria-rush
  cd iut-cafeteria-rush
  git remote add origin https://github.com/YOUR_USERNAME/iut-cafeteria-rush.git
- সব folder আর file structure বানাও (Part 1 এর commands)
- First commit করো:
  git add .
  git commit -m "initial project structure"
  git push -u origin main

চেক করো:
- GitHub এ গিয়ে দেখো folder গুলো upload হয়েছে কিনা

---

## Hour 1-2: Identity Provider Service

কাজ:
- services/identity-provider/ এর সব file এ code paste করো
- package.json
- .env.example
- middleware/rateLimiter.js
- routes/auth.js
- index.js
- Dockerfile

Commit করো:
git add .
git commit -m "add identity provider service with jwt login and rate limiting"
git push origin main

---

## Hour 2-3: Order Gateway Service

কাজ:
- services/order-gateway/ এর সব file এ code paste করো
- package.json
- .env.example
- middleware/authCheck.js
- middleware/cacheCheck.js
- routes/order.js
- index.js
- Dockerfile

Commit করো:
git add .
git commit -m "add order gateway with jwt auth and redis cache check"
git push origin main

---

## Hour 3-4: Stock Service

কাজ:
- services/stock-service/ এর সব file এ code paste করো
- package.json
- .env.example
- db/postgres.js
- routes/stock.js
- index.js
- Dockerfile

Commit করো:
git add .
git commit -m "add stock service with postgresql and optimistic locking"
git push origin main

---

## Hour 4-5: Kitchen Queue Service

কাজ:
- services/kitchen-queue/ এর সব file এ code paste করো
- package.json
- .env.example
- queue/rabbitmq.js
- routes/kitchen.js
- index.js
- Dockerfile

Commit করো:
git add .
git commit -m "add kitchen queue service with rabbitmq integration"
git push origin main

---

## Hour 5-6: Notification Hub Service

কাজ:
- services/notification-hub/ এর সব file এ code paste করো
- package.json
- .env.example
- websocket/notifier.js
- queue/listener.js
- index.js
- Dockerfile

Commit করো:
git add .
git commit -m "add notification hub with websocket and rabbitmq listener"
git push origin main

---

## Hour 6-7: Docker Compose + Database

কাজ:
- database/init.sql এ code paste করো
- docker-compose.yml এ code paste করো
- Docker Desktop open করো
- Terminal এ এই command দাও:
  docker compose up
- সব service চালু হওয়া দেখো
- Error আসলে নিচে দেখো কোন service এ সমস্যা

চেক করো:
- Browser এ যাও: http://localhost:3001/health
- এরকম দেখাবে: status ok
- তারপর: http://localhost:3002/health
- তারপর: http://localhost:3003/health
- তারপর: http://localhost:3004/health
- তারপর: http://localhost:3005/health
- সব এ ok দেখালে সব ঠিক আছে

Commit করো:
git add .
git commit -m "add docker compose and database init with seed data"
git push origin main

---

## Hour 7-8: খাও এবং একটু বিশ্রাম নাও

এই সময়টা জরুরি।
মাথা ঠান্ডা না থাকলে bug ধরা যায় না।
হালকা খাবার খাও।
10-15 মিনিট চোখ বন্ধ করো।
পানি খাও।

---

## Hour 8-9: Frontend — student.html

কাজ:
- frontend/student.html এ code paste করো
- Browser এ file টা খোলো
- Login করো:
  Student ID: 210041101
  Password: password123
- Food cards দেখা যাচ্ছে কিনা চেক করো
- Order Now button click করো
- Status bar এ steps light হচ্ছে কিনা দেখো

সমস্যা হলে:
- Browser এ F12 দাও
- Console tab এ error দেখো
- docker compose up চালু আছে কিনা চেক করো

Commit করো:
git add .
git commit -m "add student ordering frontend with websocket status tracking"
git push origin main

---

## Hour 9-10: Frontend — admin.html

কাজ:
- frontend/admin.html এ code paste করো
- Browser এ file টা খোলো
- 5টা service এর health card দেখা যাচ্ছে কিনা চেক করো
- সব green dot দেখাচ্ছে কিনা চেক করো
- Metrics section এ numbers আসছে কিনা চেক করো
- Chaos Toggle test করো — Kill Identity Provider click করো
- 5 seconds পরে Recovered দেখাচ্ছে কিনা চেক করো

Commit করো:
git add .
git commit -m "add admin dashboard with health monitoring and chaos toggle"
git push origin main

---

## Hour 10-11: Tests লেখো

কাজ:
- root এর package.json এ code paste করো
- tests/orderValidation.test.js এ code paste করো
- tests/stockDeduction.test.js এ code paste করো
- Terminal এ এই commands দাও:
  npm install
  npm install jsonwebtoken
  npm test
- সব test pass হচ্ছে কিনা দেখো

এরকম দেখাবে:
PASS tests/orderValidation.test.js
PASS tests/stockDeduction.test.js
Tests: 6 passed, 6 total

Commit করো:
git add .
git commit -m "add jest tests for order validation and stock deduction"
git push origin main

---

## Hour 11-12: CI/CD Setup

কাজ:
- .github/workflows/ci.yml এ code paste করো
- GitHub এ push করো:
  git add .
  git commit -m "add github actions ci cd pipeline"
  git push origin main
- GitHub এ যাও
- Repository তে Actions tab click করো
- Pipeline চলছে দেখবে
- সব green হলে CI/CD কাজ করছে

---

## Hour 12-13: ঘুমাও

এই সময়টা waste না — এটা investment।
কমপক্ষে 45 মিনিট ঘুমানোর চেষ্টা করো।
alarm দিয়ে রাখো।
ঘুম না আসলেও চোখ বন্ধ করে শুয়ে থাকো।
পরের কাজগুলো অনেক ভালো হবে।

---

## Hour 13-15: পুরো System একসাথে Test করো

কাজ:
- docker compose down দাও
- docker compose up দাও
- student.html খোলো
- পুরো flow test করো:
  Login করো
  Order করো
  Status bar দেখো
  Ready দেখা পর্যন্ত অপেক্ষা করো
- admin.html খোলো
- Chaos Toggle test করো
- সব service kill করো একটা একটা করে
- সব recover হচ্ছে কিনা দেখো

যদি কোনো bug পাও:
- কোন service এ সমস্যা সেটা বের করো
- docker compose logs service-name দাও
- Error message পড়ো
- Fix করো
- docker compose up --build দাও

---

## Hour 15-16: README এবং Documentation চেক করো

কাজ:
- README.md একবার পড়ো
- SETUP_GUIDE.md একবার পড়ো
- QA_PREP.md এর সব 15টা answer মুখস্থ করো
- কোনো spelling mistake থাকলে fix করো

Commit করো:
git add .
git commit -m "update documentation and fix any issues"
git push origin main

---

## Hour 16-18: Demo Video Record করো

কাজ:
- Screen recording software খোলো
  Windows এ built-in আছে: Windows + G দাও
  অথবা OBS Studio download করো: https://obsproject.com
- এই flow record করো:

  Part 1 — Architecture বোঝাও (1 মিনিট)
  কথায় বলো: আমাদের 5টা service আছে, এভাবে কাজ করে

  Part 2 — Student Flow দেখাও (2 মিনিট)
  student.html খোলো
  Login করো
  Order করো
  Status bar এ steps light হতে দেখাও
  Ready পর্যন্ত দেখাও

  Part 3 — Admin Dashboard দেখাও (1 মিনিট)
  admin.html খোলো
  Health cards দেখাও
  Metrics দেখাও
  Chaos Toggle দেখাও — একটা service kill করো
  Recover হতে দেখাও

  Part 4 — Tests দেখাও (30 সেকেন্ড)
  Terminal এ npm test দাও
  সব pass দেখাও

  Part 5 — GitHub Actions দেখাও (30 সেকেন্ড)
  GitHub এ Actions tab খোলো
  Green pipeline দেখাও

মোট video: 5 থেকে 6 মিনিট

---

## Hour 18-20: Buffer Time — Bug Fix

এই সময়টা রাখা আছে যদি কোনো সমস্যা থাকে।
সব ঠিক থাকলে একটু relax করো।
QA_PREP.md এর answers আরেকবার পড়ো।
Team এর সাথে কে কোন প্রশ্নের উত্তর দিবে ঠিক করো।

---

## Hour 20-22: Final Polish

কাজ:
- student.html এ কোনো design issue আছে কিনা দেখো
- admin.html এ সব number সঠিক আসছে কিনা দেখো
- সব file এ Ctrl+S দাও
- Final commit করো:
  git add .
  git commit -m "final polish before submission"
  git push origin main
- GitHub এ গিয়ে সব file আছে কিনা চেক করো

---

## Hour 22-23: খাও এবং Present এর জন্য প্রস্তুত হও

ভালো করে খাও।
পানি খাও।
কাপড় পরিষ্কার রাখো।
মাথা ঠান্ডা রাখো।
Nervous হওয়া স্বাভাবিক — সবাই nervous থাকে।

---

## Hour 23-24: Submission এর আগের শেষ 1 ঘন্টা

এই সময়ে নতুন কোনো code লিখবে না।
যা আছে তাই submit করবে।

করার কাজ:
- docker compose up চালু আছে কিনা দেখো
- student.html browser এ খোলা রাখো
- admin.html browser এ খোলা রাখো
- GitHub repo link copy করো
- Demo video ready আছে কিনা চেক করো
- Submission form এ সব তথ্য দাও
- Submit করো

Submit করার পরে:
- একটু deep breath নাও
- তুমি সারারাত কাজ করে একটা পুরো system বানিয়েছো
- এটা কম কথা না

---

## AI থেকে Code নেওয়ার পরে ঠিক কী করবে

Step 1:
AI যে file এর code দিয়েছে সেই file VS Code এ খোলো

Step 2:
File এর ভেতরে সব কিছু Ctrl+A দিয়ে select করো

Step 3:
AI এর code copy করো এবং paste করো

Step 4:
Ctrl+S দিয়ে save করো

Step 5:
কাজ হয়েছে কিনা বুঝতে:
- Backend service হলে: docker compose up দাও
  তারপর browser এ http://localhost:PORT/health এ যাও
  ok দেখালে কাজ হয়েছে
- Frontend file হলে: browser এ directly open করো
  দেখতে ঠিক লাগলে কাজ হয়েছে
- Test file হলে: npm test দাও
  PASS দেখালে কাজ হয়েছে

Step 6:
কিছু ভাঙলে বুঝবে কিভাবে:
- Terminal এ লাল রঙের text মানে error
- Error message টা copy করো
- AI কে দেখাও — সে fix করে দিবে