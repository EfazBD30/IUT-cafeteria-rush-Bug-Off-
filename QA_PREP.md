# Q&A Preparation Sheet — DevSprint 2026
# 15 Questions Judges Will Likely Ask

---

## Question 1: Why did you use microservices instead of one big application?

Answer:
Because one big application crashes when too many people use it at the same time.
In our case during Ramadan Iftar, hundreds of students order food together.
With microservices, each part works independently.
If the Kitchen Queue gets overloaded, the Login system still works fine.
No single point of failure means the whole system does not go down together.

---

## Question 2: What is JWT and why did you use it?

Answer:
JWT stands for JSON Web Token.
When a student logs in, we create a special encrypted string called a token.
This token contains the student's ID and an expiry time of 1 hour.
For every order request, the student sends this token.
We verify the token without touching the database every time.
This makes authentication very fast and stateless.
If the token is fake or expired, we reject the request with 401 error.

---

## Question 3: Why did you use Redis cache?

Answer:
Redis is an in-memory database — it stores data in RAM, not on disk.
Reading from RAM is 100 times faster than reading from PostgreSQL.
During Iftar rush, thousands of students might check the same food item stock.
Instead of hitting PostgreSQL every time, we check Redis first.
If Redis says stock is 0, we reject the order immediately without touching the database.
This saves the database from getting overwhelmed.

---

## Question 4: What is optimistic locking and why did you use it?

Answer:
Optimistic locking solves the overselling problem.
Imagine 2 students order the last Beef Tehari at the exact same moment.
Without locking, both orders might succeed and stock goes to -1.
We add a version number to every row in the database.
When we update stock, we check if the version is still the same as when we read it.
If two orders come at the same time, only one will find the version matching.
The other one gets a conflict error and fails safely.
So we never sell more than we have.

---

## Question 5: What happens if the Notification Hub crashes?

Answer:
The other services keep working completely fine.
Students can still login, place orders, and food gets cooked.
The only thing that stops is the real-time WebSocket updates on screen.
RabbitMQ holds all the messages in its queue safely.
When Notification Hub comes back up, it reads all the pending messages from the queue.
Docker's restart policy also automatically restarts the crashed container.
So recovery is automatic without any manual work.

---

## Question 6: What is RabbitMQ and why did you use it?

Answer:
RabbitMQ is a message queue — like a post office for services.
Kitchen Queue drops a message in RabbitMQ when food is ready.
Notification Hub picks up that message and sends it to the student.
Without RabbitMQ, Kitchen Queue would need to directly call Notification Hub.
If Notification Hub is down at that moment, the update would be lost forever.
With RabbitMQ, the message waits safely in the queue until Notification Hub is back.
This is called decoupling — services do not depend directly on each other.

---

## Question 7: How does your CI/CD pipeline work?

Answer:
CI/CD stands for Continuous Integration and Continuous Deployment.
We use GitHub Actions for this.
Every time we push code to the main branch, GitHub automatically:
  - Checks out our code
  - Installs Node.js
  - Installs dependencies
  - Runs all Jest tests
If even one test fails, the whole pipeline fails and shows which test broke.
This means broken code can never silently enter the main branch.
It is like an automatic quality check on every commit.

---

## Question 8: What is WebSocket and how is it different from normal HTTP?

Answer:
Normal HTTP works like this: student asks, server answers, connection closes.
To get updates, student would have to keep asking again and again — this is called polling.
WebSocket keeps the connection open permanently between browser and server.
When order status changes, server pushes the update instantly to the student.
No asking needed — the update just arrives like a notification.
This is why our status bar updates in real time without page refresh.

---

## Question 9: How does your rate limiting work?

Answer:
We track how many times each student tried to login within one minute.
We store this in memory — key is the student ID, value is count and first attempt time.
If a student tries more than 3 times within one minute, we return 429 error.
The error message says: Too many attempts, wait 1 minute.
After one minute passes, the counter resets automatically.
This prevents brute force attacks where someone tries thousands of passwords.

---

## Question 10: What happens when two students order the same last item simultaneously?

Answer:
This is exactly the problem optimistic locking solves.
Both students send their order at the same time.
Both orders reach the Stock Service at almost the same millisecond.
Both read the stock as 1 and version as 5 for example.
First order updates: stock becomes 0, version becomes 6. Success.
Second order tries to update where version is still 5.
But version in database is now 6, so the WHERE clause matches 0 rows.
Second order gets a 409 conflict error.
Student sees: Order conflict, please try again.
Stock never goes below 0.

---

## Question 11: Why did you choose Node.js for all services?

Answer:
Node.js is event-driven and non-blocking by nature.
This means it can handle many requests at the same time without waiting.
Perfect for our use case where hundreds of students order simultaneously.
Also the whole team knows JavaScript, so we could move fast.
Using the same language across all services also means we share knowledge easily.

---

## Question 12: How does Docker help your project?

Answer:
Docker packages each service with all its dependencies into a container.
A container runs the same way on any machine — no more it works on my laptop problem.
Docker Compose lets us define all 5 services plus Redis, RabbitMQ, PostgreSQL in one file.
One command — docker compose up — starts everything together.
Docker also has restart policy — if a service crashes, Docker restarts it automatically.
This is what makes our Chaos Toggle recover after killing a service.

---

## Question 13: What is the Order Gateway's role exactly?

Answer:
Order Gateway is the single entry point for all orders.
No student talks directly to Stock Service or Kitchen Queue.
Gateway first checks the JWT token — if invalid, rejected immediately.
Then it checks Redis cache — if stock is 0, rejected immediately.
Only valid requests with available stock reach the Stock Service.
This protects backend services from bad or unauthenticated requests.
It also makes the system easier to monitor since all orders go through one place.

---

## Question 14: How would you scale this system if IUT had 10000 students?

Answer:
Because we used microservices, scaling is straightforward.
We can run multiple instances of Order Gateway behind a load balancer.
Stock Service would need careful scaling since it touches the database.
We would add database connection pooling and read replicas.
Redis can be scaled with Redis Cluster.
RabbitMQ supports clustering out of the box.
Each service scales independently based on which part is under most load.
This is the main advantage over a monolithic system where you have to scale everything together.

---

## Question 15: What would you improve if you had more time?

Answer:
First, we would add a real student database instead of hardcoded credentials.
Second, we would add HTTPS so tokens cannot be intercepted.
Third, we would add a proper load testing setup to simulate Iftar rush traffic.
Fourth, we would add an order history page so students can see past orders.
Fifth, we would add payment integration.
Sixth, we would add proper logging with a tool like Winston so we can debug issues faster.
The foundation is solid — all these improvements can be added on top without breaking anything.