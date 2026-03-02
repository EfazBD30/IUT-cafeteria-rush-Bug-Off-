# Beginner Setup Guide — IUT Cafeteria Rush
# This guide assumes you have never coded before. Follow every step carefully.

---

## Step 1: Install Docker Desktop

Docker হলো এমন একটা software যেটা আমাদের সব 5টা service একসাথে চালায়।
Docker ছাড়া project চালানো সম্ভব না।

1. এই link এ যাও: https://www.docker.com/products/docker-desktop
2. "Download for Windows" button এ click করো
3. Download শেষ হলে installer open করো
4. সব কিছু default রেখে Next Next করে install করো
5. Install শেষে PC restart দাও
6. Restart এর পরে Docker Desktop automatically খুলবে
7. Taskbar এ নিচে একটা whale icon দেখবে — সেটা green হলে Docker ready

মনে রেখো: Docker Desktop always open রাখতে হবে project চালানোর সময়

---

## Step 2: Install Git

Git হলো code version control system।
আমরা এটা দিয়ে GitHub এ code upload করবো।

1. এই link এ যাও: https://git-scm.com/download/win
2. Automatically download শুরু হবে
3. Installer open করো
4. সব কিছু default রেখে Next Next করে install করো
5. Install শেষে VS Code restart দাও
6. VS Code terminal এ এই command দাও যাচাই করতে:
   git --version
7. এরকম দেখাবে: git version 2.43.0 — মানে install সফল

---

## Step 3: Install VS Code

VS Code হলো আমাদের code editor — যেখানে সব code লিখবো।

1. এই link এ যাও: https://code.visualstudio.com
2. "Download for Windows" button এ click করো
3. Installer open করো
4. Install করার সময় এই option গুলো tick দাও:
   - Add "Open with Code" action to Windows Explorer file context menu
   - Add "Open with Code" action to Windows Explorer directory context menu
   - Register Code as an editor for supported file types
5. Install শেষ করো

---

## Step 4: Clone the Repo and Open in VS Code

Clone মানে GitHub থেকে project টা তোমার PC তে copy করা।

1. VS Code open করো
2. Terminal menu থেকে New Terminal click করো
3. এই command দাও:
   cd Desktop
4. তারপর এই command দাও:
   git clone https://github.com/YOUR_USERNAME/iut-cafeteria-rush.git
5. তারপর এই command দাও:
   cd iut-cafeteria-rush
6. তারপর এই command দাও:
   code .
7. VS Code এ project টা খুলে যাবে
8. Left side এ সব folder আর file দেখতে পাবে

---

## Step 5: Run docker compose up and What to Expect

1. VS Code এ Terminal open করো
2. নিশ্চিত হও যে তুমি iut-cafeteria-rush folder এ আছো
   pwd command দিলে path দেখাবে
3. এই command দাও:
   docker compose up
4. Docker সব service build করা শুরু করবে
   প্রথমবার 3 থেকে 5 মিনিট লাগতে পারে
5. এরকম logs দেখবে:
   cafeteria-identity   | Identity Provider running on port 3001
   cafeteria-gateway    | Order Gateway running on port 3002
   cafeteria-stock      | Stock Service running on port 3003
   cafeteria-kitchen    | Kitchen Queue running on port 3004
   cafeteria-notification | Notification Hub running on port 3005
6. সব service চালু হলে terminal আর নতুন কিছু দেখাবে না
   এই অবস্থায় project চলছে — terminal বন্ধ করবে না

---

## Step 6: Open student.html and Test the Full Flow

1. VS Code এ left side থেকে frontend folder খোলো
2. student.html file এ right click করো
3. Reveal in File Explorer click করো
4. File Explorer এ student.html এ double click করো
   Browser এ খুলে যাবে
5. Login form দেখবে
6. Student ID দাও: 210041101
7. Password দাও: password123
8. Login button click করো
9. Welcome message আর food cards দেখবে
10. যেকোনো food item এর Order Now button click করো
11. নিচে status bar এ দেখবে:
    Pending — Stock Verified — In Kitchen — Ready
    একটার পর একটা light হবে

---

## Step 7: Open admin.html and Test Chaos Toggle

1. frontend folder থেকে admin.html browser এ খোলো
2. 5টা service এর health card দেখবে
   সব green dot মানে সব service চালু আছে
3. নিচে Chaos Testing Panel দেখবে
4. Kill Identity Provider button click করো
5. Button লাল হয়ে Killing... দেখাবে
6. কিছুক্ষণ পরে Restarting... দেখাবে
7. Docker automatically service restart করবে
8. 5 seconds পরে Recovered দেখাবে

---

## Step 8: How to Make Commits During Hackathon

Commit মানে code এর একটা checkpoint save করা।
প্রতি 30 থেকে 45 মিনিটে একবার commit করা উচিত।

VS Code terminal এ এই তিনটা command দাও:

প্রথমে সব changes stage করো:
git add .

তারপর commit করো:
git commit -m "তোমার message এখানে"

তারপর GitHub এ push করো:
git push origin main

Commit message কেমন হবে তার উদাহরণ:
git commit -m "add identity provider service with login and rate limiting"
git commit -m "add order gateway with jwt auth and redis cache check"
git commit -m "add stock service with optimistic locking"
git commit -m "add kitchen queue with rabbitmq integration"
git commit -m "add notification hub with websocket"
git commit -m "add student and admin frontend pages"
git commit -m "add docker compose and database init file"
git commit -m "add jest tests and github actions ci cd"
git commit -m "add readme and setup guide"

---

## Common Errors and How to Fix Them

---

Error 1: Port already in use

দেখাবে এরকম:
Error: listen EADDRINUSE: address already in use 0.0.0.0:3001

Fix:
docker compose down
তারপর আবার:
docker compose up

---

Error 2: Docker not starting

দেখাবে এরকম:
Cannot connect to the Docker daemon

Fix:
Docker Desktop open আছে কিনা দেখো
Taskbar এ whale icon দেখো
না থাকলে Start menu থেকে Docker Desktop open করো
Green হওয়া পর্যন্ত অপেক্ষা করো

---

Error 3: Permission denied on Windows

দেখাবে এরকম:
permission denied while trying to connect to the Docker daemon socket

Fix:
Docker Desktop এ right click করো
Run as administrator দিয়ে open করো

---

Error 4: student.html এ login হচ্ছে না

Fix:
docker compose up চালু আছে কিনা দেখো
terminal বন্ধ করে থাকলে আবার চালু করো
Browser এ F12 দিয়ে console এ error দেখো

---

Error 5: Changes করার পরে docker এ reflect হচ্ছে না

Fix:
docker compose down
docker compose up --build
--build flag দিলে সব image নতুন করে build হবে