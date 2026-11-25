const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ChatMessage = require('../models/ChatMessage');
const Question = require('../models/Question');

/**
 * Intelligent Placement & Technical Query Assistant Engine
 * Provides comprehensive, structured interview answers across DSA, CS Core,
 * Web Dev, MongoDB, HR Behavioral queries, and general greetings.
 *
 * Each check uses multiple synonyms/keywords so the bot can understand
 * natural language questions — not just exact keyword matches.
 */
const generateKnowledgeResponse = (userPrompt, userName = 'Student') => {
  const query = userPrompt.toLowerCase().trim();

  /* ─────────────────────────────────────────────
     HELPER: checks if ANY keyword in list is in query
  ───────────────────────────────────────────── */
  const has = (...words) => words.some(w => query.includes(w));

  /* ── 0. GREETINGS & HI PROMPT ── */
  if (query === 'hi' || query === 'hi!' || query === 'hi bot' || query === 'hi there' || query.startsWith('hi ') || query === 'hey' || query === 'hello' || has('good morning', 'good evening', 'namaste')) {
    return `### 👋 Hi, ${userName}!

Hi! Great to see you. How is your placement preparation going today?

Here is what I can help you with right now:
- 💼 **Job & Career Suggestions** — Ask me *"suggest jobs for me"* or *"how to get a job as a fresher"*
- 📘 **MongoDB Viva & Queries** — Aggregation pipelines (\`$lookup\`, \`$unwind\`, \`$group\`), compound indexes, schema design
- 🧠 **DSA Coding Practice** — Arrays, linked lists, trees, graphs, dynamic programming patterns
- 💻 **CS Fundamentals** — Operating Systems (Deadlocks, Paging), DBMS (ACID, Normalization), Networks (OSI, TCP/UDP)
- 📝 **Resume & HR Interview Prep** — STAR technique, behavioral questions, project explanation

Feel free to ask me any question or choose one of the suggestion prompts below! 🚀`;
  }

  /* ── 0.1 JOB SUGGESTIONS & PLACEMENT CAREER GUIDANCE ── */
  if (
    has(
      'job suggestion',
      'suggest job',
      'suggest jobs',
      'job suggestions',
      'how to get a job',
      'jobs to get',
      'job to get',
      'which job',
      'career suggestion',
      'career guidance',
      'jobs for me',
      'job recommendation',
      'job recommendations',
      'jobs to apply',
      'suggest me a job',
      'get a job',
      'job advice',
      'placement advice'
    ) || (query.includes('job') && (query.includes('suggest') || query.includes('get') || query.includes('recommend') || query.includes('which') || query.includes('apply')))
  ) {
    return `### 🎯 Career & Job Suggestions for Campus Placements & Freshers

Hello **${userName}**! Based on current software industry hiring patterns and your MERN + MongoDB preparation, here is your customized career roadmap to secure a top tech job:

---

#### 💼 1. Top In-Demand Roles For You
* **1. MERN / Full-Stack Developer:**
  - **Why it fits:** High hiring volume across product startups and tech consulting firms.
  - **Key Showcase:** Highlight **PrepTrack**! Mention multi-stage MongoDB aggregations (\`$lookup\`, \`$unwind\`), JWT auth, and React state management.
* **2. SDE 1 / Junior Software Engineer (Backend Focus):**
  - **Why it fits:** Primary entry-level title at tech product companies (Swiggy, Zomato, Flipkart, Microsoft, Amazon).
  - **Key Showcase:** Data Structures & Algorithms (DSA), clean REST API design, database indexing, and system design basics.
* **3. Frontend Web Developer (React.js):**
  - **Why it fits:** Rapidly growing requirement for responsive SPA interfaces and design systems.
  - **Key Showcase:** Modern React hooks, responsive layouts, and interactive data visualization (Recharts).
* **4. Database / Cloud Associate Engineer:**
  - **Why it fits:** Ideal if you love database indexing, aggregation optimization, and cloud deployments.

---

#### 🌐 2. Top Platforms with the Highest Fresher Response Rates
1. **Instahyre & Cutshort:** Direct recruiter outreach without agency spam (best response rates for freshers).
2. **Wellfound (AngelList):** Best for remote and VC-backed tech startups hiring freshers.
3. **LinkedIn Jobs:** Filter by *"Past 24 Hours"* and set alerts for *"Associate Software Engineer"* and *"Graduate Trainee"*.
4. **Unstop (Dare2Compete):** National hiring hackathons by Flipkart (GRiD), Walmart (CodeHers), Tata, etc.
5. **Naukri.com:** Ensure 100% profile score with resume headline: *"Full-Stack MERN Developer | Node.js | React | MongoDB"*.

---

#### 🚀 3. 5-Step Action Formula to Get Hired
1. **Polish 2 Star Projects:** Make sure your PrepTrack repository has a live demo link, architecture diagram, and clear setup guide.
2. **ATS-Optimized Resume:** 1 single page with quantifiable bullet points (e.g. *"Optimized analytics queries with MongoDB compound indexes"*).
3. **Daily DSA (2 Problems/Day):** Focus on LeetCode 75 (Arrays, Two Pointers, Trees, Hash Maps, BFS/DFS).
4. **Use PrepTrack's Job Tracker:** Apply to at least 5-10 tailored jobs every day and log deadlines under the **Applications** tab.
5. **Cold Outreach on LinkedIn:** Send 3 polite messages daily to college alumni working at target companies asking for referrals.

💡 *Pro-Tip: Ask me next: "How to explain PrepTrack in an interview?", "What are common MERN viva questions?", or "How does JWT work?"*`;
  }

  if (has('thank', 'thanks', 'tysm')) {
    return `### 😊 You're Welcome, ${userName}!

Keep practising — consistency is what separates great candidates from the rest!

💡 **Tip:** Use PrepTrack's Quiz section daily to reinforce what you learn here.`;
  }

  if (has('who are you', 'what are you', 'your name', 'about you')) {
    return `### 🤖 About PrepTrack AI

I am **PrepTrack AI**, an intelligent placement assistant built into your PrepTrack platform.

I answer questions about:
- MongoDB & MERN stack
- DSA concepts and patterns
- CS fundamentals (OS, DBMS, CN, OOP)
- Campus placement strategy and HR interviews`;
  }

  if (has('help', 'what can you do', 'topics', 'what do you know')) {
    return `### 📚 Topics I Can Help With

**MongoDB & Database**
- Aggregation stages: $lookup, $unwind, $group, $match, $project, $sort, $limit
- Indexes: compound, text, unique, sparse
- Embedding vs Referencing, CRUD, Schema design, Virtuals, Middleware hooks

**DSA**
- Big-O Notation & Complexity
- Arrays (two-pointer, sliding window), Linked Lists, Stacks, Queues
- Trees (BST, traversals), Heaps, Graphs (BFS/DFS), Dijkstra, DP, Sorting

**CS Core**
- OS: Deadlock, CPU Scheduling, Paging, Process vs Thread
- DBMS: ACID, Normalization, SQL Joins
- Networks: OSI Model, TCP vs UDP, HTTP, DNS
- OOP: 4 Pillars, SOLID Principles

**Web Dev & Security**
- React hooks & Context API, Node.js event loop, Express middleware
- JWT authentication, bcrypt hashing, REST API design, Git`;
  }

  /* ── 1. MONGODB: AGGREGATION STAGES ── */
  if (has('$lookup', 'lookup', 'join in mongo', 'mongo join')) {
    return `### 🔍 MongoDB \`$lookup\` — Left Outer Join

**Purpose:** Perform a SQL-style join between two collections in the *same* database.

\`\`\`javascript
db.testAttempts.aggregate([
  {
    $lookup: {
      from: "questions",              // Target collection
      localField: "answers.questionId", // Field in current collection
      foreignField: "_id",            // Field in target collection
      as: "questionDetails"           // Output array name
    }
  }
]);
\`\`\`

**Key Points:**
1. Output is always an **array** — use \`$unwind\` right after to flatten it.
2. SQL equivalent: \`LEFT JOIN questions ON answers.questionId = questions._id\`
3. MongoDB 3.6+ supports **pipeline-based $lookup** for complex conditions.

**In PrepTrack:** Used in the stats route to join test attempts with question metadata for per-category accuracy.`;
  }

  if (has('$unwind', 'unwind', 'flatten array', 'deconstruct array')) {
    return `### 🌀 MongoDB \`$unwind\` — Deconstruct Arrays

**Purpose:** Splits each array element into its own separate document.

\`\`\`javascript
// Input:  { _id: 1, tags: ["DSA", "OS", "CN"] }
// After $unwind:
// { _id: 1, tags: "DSA" }
// { _id: 1, tags: "OS" }
// { _id: 1, tags: "CN" }

{ $unwind: "$tags" }
// With null preservation:
{ $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } }
\`\`\`

**In PrepTrack:** Used in \`/api/stats/accuracy-by-category\` to flatten each submitted answer so individual questions can be grouped and scored by category.`;
  }

  if (has('$group', 'group by', 'group stage', 'mongo aggregate group')) {
    return `### 📊 MongoDB \`$group\` — Grouping & Aggregation

\`\`\`javascript
db.testAttempts.aggregate([
  { $group: {
      _id: "$userId",           // Group key (like SQL GROUP BY)
      totalTests: { $sum: 1 },  // Count documents
      avgScore:   { $avg: "$score" },
      maxScore:   { $max: "$score" }
  }}
]);
\`\`\`

**Common Accumulators:**
| Accumulator | Description |
|-------------|-------------|
| \`$sum\`  | Add all values |
| \`$avg\`  | Arithmetic mean |
| \`$max\`  | Maximum value |
| \`$min\`  | Minimum value |
| \`$push\` | Collect into array |
| \`$first\`| First value in group |`;
  }

  if (has('$match', 'match stage', 'filter in aggregation', 'aggregation filter')) {
    return `### 🎯 MongoDB \`$match\` — Filter Documents

**Purpose:** Filters the document stream — like the WHERE clause in SQL.

\`\`\`javascript
db.questions.aggregate([
  // Only include DSA questions with difficulty Hard
  { $match: { category: "DSA", difficulty: "Hard" } },
  { $group: { _id: "$topic", count: { $sum: 1 } } }
]);
\`\`\`

**Pro Tip:** Place \`$match\` **as early as possible** in the pipeline.
If \`$match\` uses an indexed field, MongoDB uses the index — much faster!`;
  }

  if (has('$project', 'project stage', 'projection', 'select fields')) {
    return `### 📋 MongoDB \`$project\` — Shape Output Documents

\`\`\`javascript
db.users.aggregate([
  {
    $project: {
      name: 1,                    // Include field
      email: 1,
      password: 0,                // Exclude field
      fullTitle: { $concat: ["$name", " — Student"] } // Computed field
    }
  }
]);
\`\`\`

**Note:** You cannot mix inclusions and exclusions (except for \`_id\`).`;
  }

  if (has('aggregation', 'aggregation pipeline', 'pipeline')) {
    return `### ⚙️ MongoDB Aggregation Pipeline

A pipeline is a sequence of stages that transform documents step by step:

\`\`\`
Docs → [$match] → [$lookup] → [$unwind] → [$group] → [$project] → [$sort] → Output
\`\`\`

**Example — average score per category:**
\`\`\`javascript
db.testAttempts.aggregate([
  { $match: { userId: req.user._id } },
  { $unwind: "$answers" },
  { $lookup: { from:"questions", localField:"answers.questionId",
               foreignField:"_id", as:"qInfo" }},
  { $unwind: "$qInfo" },
  { $group: { _id: "$qInfo.category",
              avgScore: { $avg: { $cond: ["$answers.isCorrect",1,0] } },
              total: { $sum: 1 } }}
]);
\`\`\`

**In PrepTrack:** The \`/api/stats\` routes use aggregation pipelines extensively.`;
  }

  /* ── 2. MONGODB: INDEXES ── */
  if (has('index', 'indexes', 'compound index', 'text index', 'sparse index', 'unique index')) {
    return `### ⚡ MongoDB Indexes — Complete Guide

**1. Single Field Index**
\`\`\`javascript
userSchema.index({ email: 1 }); // Ascending
\`\`\`

**2. Unique Index** — prevents duplicate values
\`\`\`javascript
email: { type: String, unique: true } // User.js
\`\`\`

**3. Compound Index** — multiple fields together
\`\`\`javascript
questionSchema.index({ category: 1, topic: 1, difficulty: 1 });
// Prefix Rule: Queries must use fields left → right
\`\`\`

**4. Text Index** — full-text keyword search
\`\`\`javascript
prepItemSchema.index({ title: 'text', notes: 'text' });
// Query: { $text: { $search: "binary tree" } }
\`\`\`

**5. Sparse Index** — only indexes docs where field exists
\`\`\`javascript
schema.index({ optionalField: 1 }, { sparse: true });
\`\`\`

**In PrepTrack:** All 5 models demonstrate different index types!`;
  }

  /* ── 3. MONGODB: SCHEMA & DESIGN ── */
  if (has('embed', 'embedding', 'referenc', 'embed vs ref', 'denormali', 'normali')) {
    return `### 📂 Embedding vs. Referencing in MongoDB

| Feature | Embedding | Referencing |
|---------|-----------|-------------|
| **Structure** | Subdocuments inside parent | Stores ObjectId pointing elsewhere |
| **Read Speed** | Single query (fast) | Requires $lookup or 2nd query |
| **Use When** | Always accessed together, bounded size | Shared across entities or grows unboundedly |
| **BSON Limit** | Max **16 MB per document** | No limit — docs are separate |
| **In PrepTrack** | options[] in Question, answers[] in TestAttempt | userId ref in PrepItem, Application |

**Viva Tip:** *"Embed when data is accessed together and bounded. Reference when data is shared or grows unboundedly."*`;
  }

  if (has('schema', 'mongoose schema', 'define schema', 'model definition')) {
    return `### 🏗️ Mongoose Schema Design

\`\`\`javascript
const questionSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  category:   { type: String, enum: ['DSA','OS','DBMS','CN','OOP'], required: true },
  difficulty: { type: String, enum: ['Easy','Medium','Hard'], default: 'Medium' },
  options:    [{ type: String }],        // Embedded array
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference
}, { timestamps: true }); // Auto-adds createdAt & updatedAt

questionSchema.index({ category: 1, difficulty: 1 }); // Compound index
module.exports = mongoose.model('Question', questionSchema);
\`\`\`

**MongoDB Features:** Schema Validation, Enum Constraints, Embedded Arrays, Document Referencing, Compound Index.`;
  }

  if (has('crud', 'find', 'findone', 'findbyid', 'create document', 'insert', 'updateone', 'deletemany')) {
    return `### 📝 MongoDB CRUD Operations

\`\`\`javascript
// CREATE
const user = await User.create({ name: "Alex", email: "alex@test.com" });

// READ
User.find({ email: "alex@test.com" });        // Multiple docs
User.findOne({ email: "alex@test.com" });     // First match
User.findById(id);                            // By ObjectId
User.find({}).select('name email').limit(10).sort({ createdAt: -1 });

// UPDATE
User.findByIdAndUpdate(id, { name: "Bob" }, { new: true, runValidators: true });
User.updateMany({ category: "DSA" }, { $set: { active: true } });

// DELETE
User.findByIdAndDelete(id);
User.deleteMany({ userId: req.user._id }); // Used in chat history clear
\`\`\`

**In PrepTrack:** Every feature uses these patterns!`;
  }

  if (has('virtual', 'mongoose virtual', 'computed field')) {
    return `### 🔮 Mongoose Virtuals — Computed Fields

Virtuals are NOT stored in MongoDB — computed on the fly.

\`\`\`javascript
// In TestAttempt.js
testAttemptSchema.virtual('accuracy').get(function () {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.score / this.totalQuestions) * 100);
});
testAttemptSchema.set('toJSON', { virtuals: true }); // Include in API responses
\`\`\`

**In PrepTrack:** TestAttempt has a virtual \`accuracy\` field — saves storage and keeps data consistent!`;
  }

  if (has('middleware', 'pre save', 'post save', 'hook', 'mongoose hook')) {
    return `### ⚓ Mongoose Middleware (Hooks)

\`\`\`javascript
// User.js — Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// PrepItem.js — Auto-set revision date when status → Done
prepItemSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Done' && !this.nextRevisionDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.nextRevisionDate = tomorrow; // Spaced repetition!
  }
  next();
});
\`\`\`

**In PrepTrack:** User.js hashes passwords, PrepItem.js auto-schedules revisions!`;
  }

  /* ── 4. AUTHENTICATION ── */
  if (has('jwt', 'json web token', 'token', 'authentication', 'auth flow')) {
    return `### 🔐 JWT Authentication — How It Works

**Flow in PrepTrack:**
\`\`\`
User Login → Verify password → Sign JWT → Client stores token
Next Request → Send token in Authorization header → Middleware verifies → Access granted
\`\`\`

**Creating a Token:**
\`\`\`javascript
const token = jwt.sign(
  { id: user._id },          // Payload (keep small!)
  process.env.JWT_SECRET,    // Secret key
  { expiresIn: '7d' }        // Expiry
);
\`\`\`

**Verifying (Middleware):**
\`\`\`javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.id);
req.user = user;
\`\`\`

**Token Structure:** header.payload.signature (Base64 — NOT encrypted!)
**Viva Tip:** JWT is *stateless* — the server stores no sessions. The signature proves authenticity.`;
  }

  if (has('bcrypt', 'hash password', 'password hashing', 'salt', 'encrypt password')) {
    return `### 🔒 Password Hashing with bcrypt

\`\`\`javascript
const bcrypt = require('bcryptjs');

// HASHING (in User.js pre-save hook)
const saltRounds = 12; // Higher = slower = more secure
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// VERIFICATION (in login controller)
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
// Returns true if passwords match
\`\`\`

**Key Concepts:**
- **Salt:** Random data added before hashing — same password → different hash each time
- **Cost Factor (12):** Balances security and performance (10-12 recommended)
- **One-way:** Cannot reverse a bcrypt hash — you can only compare

**In PrepTrack:** User.js pre-save hook hashes every password automatically.`;
  }

  /* ── 5. DSA ── */
  if (has('big o', 'big-o', 'time complexity', 'space complexity', 'o(n)', 'o(log n)', 'complexity notation')) {
    return `### ⏱️ Time & Space Complexity — Big-O

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array index, HashMap lookup |
| O(log N) | Logarithmic | Binary Search, Balanced BST |
| O(N) | Linear | Linear Search, single loop |
| O(N log N) | Linearithmic | Merge Sort, Heap Sort |
| O(N²) | Quadratic | Bubble Sort, nested loops |
| O(2ⁿ) | Exponential | Recursive Fibonacci (no memo) |

**Quick Reference:**
- Binary Search: O(log N) time, O(1) space
- Merge Sort: O(N log N) time, O(N) space
- BFS/DFS: O(V + E) — V=vertices, E=edges
- HashMap: O(1) avg for insert/search/delete`;
  }

  if (has('two pointer', 'sliding window', 'subarray sum')) {
    return `### 📊 Array Patterns — Two Pointer & Sliding Window

**Two Pointer — Find pair with target sum in sorted array:**
\`\`\`javascript
function twoSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [];
} // Time: O(N), Space: O(1)
\`\`\`

**Sliding Window — Max sum subarray of size K:**
\`\`\`javascript
function maxSum(arr, k) {
  let sum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let max = sum;
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k]; // Slide window
    max = Math.max(max, sum);
  }
  return max;
} // Time: O(N), Space: O(1)
\`\`\``;
  }

  if (has('linked list', 'linkedlist', 'singly linked', 'doubly linked')) {
    return `### 🔗 Linked Lists

**Structure:** \`[data|next] → [data|next] → null\`

| Operation | Time |
|-----------|------|
| Access by index | O(N) |
| Insert at head | O(1) |
| Insert at tail | O(N) |
| Search | O(N) |

**Common Interview Problems:**
1. **Reverse** — Use 3 pointers (prev, curr, next)
2. **Detect Cycle** — Floyd's Tortoise & Hare
3. **Find Middle** — Fast/slow pointer (fast moves 2x)
4. **Merge Two Sorted Lists** — Iterative with dummy head
5. **Nth from end** — Two pointers N apart

**vs Arrays:** Linked lists O(1) insert at known node; Arrays O(1) random access.`;
  }

  if (has('stack', 'lifo', 'push pop', 'call stack', 'balanced parentheses')) {
    return `### 📚 Stack — LIFO

\`\`\`javascript
const stack = [];
stack.push(10);                  // O(1)
stack.pop();                     // O(1)
stack[stack.length - 1];         // Peek
\`\`\`

**Applications:** Balanced brackets, undo/redo, DFS iterative, function call stack.

**Balancing Parentheses:**
\`\`\`javascript
function isBalanced(s) {
  const stack = [], map = { ')':'(', '}':'{', ']':'[' };
  for (const ch of s) {
    if ('({['.includes(ch)) stack.push(ch);
    else if (stack.pop() !== map[ch]) return false;
  }
  return stack.length === 0;
}
\`\`\``;
  }

  if (has('queue', 'fifo', 'enqueue', 'dequeue')) {
    return `### 🚶 Queue — FIFO

\`\`\`javascript
const queue = [];
queue.push(1);   // Enqueue rear
queue.shift();   // Dequeue front — returns 1
\`\`\`

**Applications:** BFS, CPU scheduling (Round Robin), printer spooler.
**Priority Queue (Heap):** Dequeued by priority, not order. Used in Dijkstra's.`;
  }

  if (has('cycle', 'floyd', 'tortoise', 'hare', 'detect loop')) {
    return `### 🐢 Floyd's Cycle Detection — Tortoise & Hare

\`\`\`javascript
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // Cycle!
  }
  return false;
} // Time: O(N), Space: O(1)
\`\`\`

**Finding the Cycle Entry Node:**
\`\`\`javascript
// After meeting point inside cycle:
slow = head;
while (slow !== fast) { slow = slow.next; fast = fast.next; }
return slow; // Entry node!
\`\`\`

**Why it works:** Mathematical proof — distance from head to entry = distance from meeting point to entry (mod cycle length).`;
  }

  if (has('bst', 'binary search tree', 'inorder', 'preorder', 'postorder', 'tree traversal')) {
    return `### 🌳 Binary Search Tree (BST)

**Property:** Left subtree < Node < Right subtree

\`\`\`javascript
function inorder(node) {   // LEFT → ROOT → RIGHT → gives SORTED order!
  if (!node) return;
  inorder(node.left);
  console.log(node.val);
  inorder(node.right);
}
function preorder(node) {  // ROOT → LEFT → RIGHT → serialize tree
  if (!node) return;
  console.log(node.val);
  preorder(node.left); preorder(node.right);
}
function postorder(node) { // LEFT → RIGHT → ROOT → delete tree
  if (!node) return;
  postorder(node.left); postorder(node.right);
  console.log(node.val);
}
\`\`\`

| Operation | Balanced | Skewed |
|-----------|----------|--------|
| Search/Insert/Delete | O(log N) | O(N) |`;
  }

  if (has('heap', 'priority queue', 'min heap', 'max heap', 'heapify')) {
    return `### 🏔️ Heap & Priority Queue

**Min-Heap:** Root is the minimum. **Max-Heap:** Root is the maximum.

| Operation | Time |
|-----------|------|
| Insert | O(log N) |
| Extract min/max | O(log N) |
| Peek min/max | O(1) |
| Build heap | O(N) |

**Interview Applications:**
- Top K elements — Min-heap of size K
- Kth largest — Min-heap of size K
- Merge K sorted arrays — Min-heap
- Dijkstra's — Min-heap (Priority Queue)
- Heap Sort — O(N log N), in-place`;
  }

  if (has('graph', 'bfs', 'dfs', 'breadth first', 'depth first', 'adjacency list')) {
    return `### 🕸️ Graphs — BFS & DFS

**BFS (uses Queue) — shortest path in unweighted graph:**
\`\`\`javascript
function bfs(graph, start) {
  const visited = new Set([start]), queue = [start];
  while (queue.length) {
    const node = queue.shift();
    for (const nb of graph[node])
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
  }
} // Time: O(V+E), Space: O(V)
\`\`\`

**DFS (uses Recursion/Stack) — cycle detection, topological sort:**
\`\`\`javascript
function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  for (const nb of graph[node])
    if (!visited.has(nb)) dfs(graph, nb, visited);
} // Time: O(V+E), Space: O(V)
\`\`\``;
  }

  if (has('dijkstra', 'shortest path', 'weighted graph')) {
    return `### 🛣️ Dijkstra's Shortest Path

Find shortest path from source in a **weighted, non-negative** graph.

**Algorithm:**
1. Set dist[source] = 0, all others = ∞
2. Use Min-Heap — always process node with smallest distance
3. For each neighbor: \`dist[nb] = min(dist[nb], dist[curr] + weight)\`

**Complexity:** O((V + E) log V)
**Limitation:** Does NOT work with negative weights → use **Bellman-Ford**.
**Applications:** GPS navigation, network routing (OSPF protocol).`;
  }

  if (has('dynamic programming', 'dp problem', 'memoization', 'tabulation', 'overlapping subproblem')) {
    return `### 🧩 Dynamic Programming

**When to use:**
1. **Optimal Substructure** — build solution from optimal sub-solutions
2. **Overlapping Subproblems** — same subproblems repeat

\`\`\`javascript
// Memoization (Top-Down)
const memo = {};
function fib(n) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  return memo[n] = fib(n-1) + fib(n-2);
} // Time: O(N), Space: O(N)

// Tabulation (Bottom-Up)
function fib(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
} // Time: O(N), Space: O(N)
\`\`\`

**Classic Problems:** 0/1 Knapsack, LCS, LIS, Coin Change, Edit Distance.`;
  }

  if (has('sorting', 'merge sort', 'quick sort', 'bubble sort', 'sort algorithm')) {
    return `### 🔀 Sorting Algorithms

| Algorithm | Best | Average | Worst | Space | Stable? |
|-----------|------|---------|-------|-------|---------|
| Bubble Sort | O(N) | O(N²) | O(N²) | O(1) | ✅ |
| Merge Sort | O(N logN) | O(N logN) | O(N logN) | O(N) | ✅ |
| Quick Sort | O(N logN) | O(N logN) | O(N²) | O(logN) | ❌ |
| Heap Sort | O(N logN) | O(N logN) | O(N logN) | O(1) | ❌ |

**Merge Sort** — preferred when stability or worst-case guarantee is needed.
**Quick Sort** — fastest in practice (cache friendly) with random pivot.
**JS built-in \`Array.sort()\`** — uses Timsort (hybrid Merge + Insertion).`;
  }

  if (has('binary search', 'search sorted', 'bisect')) {
    return `### 🔎 Binary Search

**Requirement:** Array must be **SORTED**.

\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
} // Time: O(log N), Space: O(1)
\`\`\`

**Variants:** First/Last occurrence, Search in rotated sorted array, Find peak element.`;
  }

  /* ── 6. OPERATING SYSTEMS ── */
  if (has('deadlock', 'coffman', 'mutual exclusion', 'hold and wait', 'circular wait')) {
    return `### 🛑 Deadlock & The 4 Coffman Conditions

A **deadlock** occurs when processes are permanently blocked waiting for each other.

**4 Conditions (ALL must hold):**
1. **Mutual Exclusion** — Only one process can use a resource at a time
2. **Hold and Wait** — Process holds resources while waiting for more
3. **No Preemption** — Resources cannot be forcibly taken
4. **Circular Wait** — P1 waits for P2 waits for P3 ... waits for P1

**Breaking Deadlock:** Break ANY ONE condition:
- Preemption — OS forcefully takes resources
- Resource Ordering — fixed ordering breaks circular wait
- Banker's Algorithm — avoid unsafe states

**Viva Tip:** Breaking *any single* Coffman condition prevents deadlock!`;
  }

  if (has('process', 'thread', 'multithreading', 'concurrency', 'race condition')) {
    return `### ⚙️ Process vs. Thread

| Attribute | Process | Thread |
|-----------|---------|--------|
| **Memory** | Isolated address space | Shares heap & globals |
| **Creation** | Heavy (fork syscall) | Light (pthread_create) |
| **Context Switch** | Slow | Fast |
| **Communication** | IPC (Pipes, Sockets) | Direct memory access |
| **Crash Impact** | Isolated | Can crash parent process |

**Concurrency vs Parallelism:**
- **Concurrency:** Multiple tasks make progress (time-slicing, 1 core)
- **Parallelism:** Multiple tasks run simultaneously (multiple cores)

**Race Condition:** Output depends on unpredictable thread order → use **Mutex** or **Semaphore**.`;
  }

  if (has('paging', 'virtual memory', 'page fault', 'memory management')) {
    return `### 💾 Virtual Memory & Paging

**Paging:** Divides memory into fixed-size blocks:
- **Page** = fixed-size block of virtual memory (e.g., 4KB)
- **Frame** = fixed-size block of physical RAM
- **Page Table** = maps virtual page number → physical frame

**Page Fault:** Process accesses a page not in RAM → OS loads it from disk (swap).

**Page Replacement Algorithms:**
- **FIFO** — Replace oldest page
- **LRU** (Least Recently Used) — Replace least recently accessed *(most common in interviews)*
- **Optimal** — Replace page used furthest in future (theoretical baseline)`;
  }

  if (has('cpu scheduling', 'fcfs', 'round robin', 'sjf', 'priority scheduling')) {
    return `### 🕐 CPU Scheduling Algorithms

| Algorithm | Type | Starvation? | Key Feature |
|-----------|------|-------------|-------------|
| FCFS | Non-preemptive | No | Simple, convoy effect |
| SJF | Non-preemptive | Yes | Min avg waiting time |
| Round Robin | Preemptive | No | Fixed time quantum, fair |
| Priority | Both | Yes | Higher priority first |

**Turnaround Time** = Completion − Arrival
**Waiting Time** = Turnaround − Burst Time`;
  }

  /* ── 7. DBMS ── */
  if (has('acid', 'atomicity', 'consistency', 'isolation', 'durability', 'transaction')) {
    return `### 🛡️ ACID Properties

**A — Atomicity:** All operations succeed or ALL are rolled back ("All or Nothing")
**C — Consistency:** DB moves from one valid state to another
**I — Isolation:** Concurrent transactions execute as if sequential. Levels: Read Uncommitted → Read Committed → Repeatable Read → Serializable
**D — Durability:** Once committed, changes survive crashes

**In MongoDB:** ACID transactions supported for multi-document operations since v4.0.
**SQL vs NoSQL:** SQL databases are ACID by default. MongoDB traditionally follows BASE (Eventually Consistent) but now supports full ACID transactions.`;
  }

  if (has('normalization', 'normal form', '1nf', '2nf', '3nf', 'bcnf', 'functional dependency')) {
    return `### 📐 Database Normalization

| Normal Form | Rule |
|-------------|------|
| **1NF** | Atomic values only — no repeating groups |
| **2NF** | 1NF + No partial dependency (non-key depends on entire PK) |
| **3NF** | 2NF + No transitive dependency (non-key → non-key) |
| **BCNF** | Every determinant is a candidate key (stronger than 3NF) |

**Anomalies eliminated:**
- Insertion Anomaly — can't insert without unrelated data
- Update Anomaly — same data stored in multiple places
- Deletion Anomaly — deleting one fact deletes another

**Viva Tip:** Normalization prevents redundancy, but over-normalization hurts performance (too many JOINs).`;
  }

  if (has('sql', 'inner join', 'left join', 'right join', 'select query', 'group by sql')) {
    return `### 🗃️ SQL Joins & Queries

\`\`\`sql
-- INNER JOIN: Only matching rows from both tables
SELECT u.name, a.company FROM users u
INNER JOIN applications a ON u.id = a.userId;

-- LEFT JOIN: All rows from left, NULLs where no right match
SELECT u.name, a.company FROM users u
LEFT JOIN applications a ON u.id = a.userId;

-- GROUP BY + HAVING (HAVING filters after grouping)
SELECT department, COUNT(*) as headcount
FROM employees GROUP BY department HAVING COUNT(*) > 5;
\`\`\`

**Execution Order:** FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`;
  }

  /* ── 8. COMPUTER NETWORKS ── */
  if (has('osi', 'osi model', 'seven layer', '7 layer', 'network layer')) {
    return `### 🌐 OSI Model — 7 Layers

| Layer | Name | Protocols | Function |
|-------|------|-----------|---------|
| 7 | Application | HTTP, DNS, FTP | User-facing services |
| 6 | Presentation | SSL/TLS, JPEG | Encryption, formatting |
| 5 | Session | NetBIOS | Session management |
| 4 | Transport | TCP, UDP | End-to-end, ports |
| 3 | Network | IP, ICMP | Routing, IP addressing |
| 2 | Data Link | Ethernet, MAC | Frame delivery in LAN |
| 1 | Physical | Cables, Fiber | Bit transmission |

**Mnemonic (top→bottom):** *All People Seem To Need Data Processing*
**TCP/IP Model (4 layers):** Application → Transport → Internet → Network Access`;
  }

  if (has('tcp', 'udp', 'tcp vs udp', 'three way handshake', '3-way handshake', 'syn ack')) {
    return `### 🤝 TCP vs UDP & Three-Way Handshake

| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Required | Not required |
| Reliability | Guaranteed | No guarantee |
| Speed | Slower | Faster |
| Use Case | HTTP, Email, SSH | DNS, Streaming, Gaming |

**TCP Three-Way Handshake:**
\`\`\`
Client ──── SYN ────────► Server  (I want to connect)
Client ◄─── SYN-ACK ──── Server  (OK, I'm ready)
Client ──── ACK ────────► Server  (Got it, let's talk!)
          Connection Established!
\`\`\``;
  }

  if (has('http', 'https', 'rest api', 'status code', 'get post put delete', 'http method')) {
    return `### 🌍 HTTP & REST API Design

**HTTP Methods:**
| Method | Purpose | Idempotent? |
|--------|---------|-------------|
| GET | Read resource | ✅ |
| POST | Create new | ❌ |
| PUT | Replace entire | ✅ |
| PATCH | Partial update | ✅ |
| DELETE | Remove | ✅ |

**Common Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (logged in but no permission) |
| 404 | Not Found |
| 500 | Internal Server Error |

**In PrepTrack:** All API routes follow REST — \`/api/questions\`, \`/api/prep-items\`, etc.`;
  }

  if (has('dns', 'domain name', 'ip address', 'url resolution')) {
    return `### 🔍 How DNS Works

DNS translates domain names (google.com) → IP addresses (142.250.80.46).

**Resolution Steps:**
1. Browser checks **local cache**
2. OS checks \`/etc/hosts\`
3. Query → **Recursive Resolver** (ISP / 8.8.8.8)
4. Resolver → **Root Name Server**
5. Root → **TLD Server** (.com, .in, etc.)
6. TLD → **Authoritative Name Server** (knows your domain)
7. IP returned and **cached** with TTL

**Common Records:** A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification)`;
  }

  /* ── 9. OOP ── */
  if (has('oop', 'object oriented', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'solid')) {
    return `### 🏛️ OOP — 4 Pillars

**1. Encapsulation** — Bundle data + methods; hide internal details
\`\`\`javascript
class User {
  #password; // Private field
  checkPassword(pwd) { return this.#password === pwd; } // Controlled access
}
\`\`\`

**2. Inheritance** — Child acquires parent's properties
\`\`\`javascript
class Animal { speak() { return "..."; } }
class Dog extends Animal { speak() { return "Woof!"; } } // Override
\`\`\`

**3. Polymorphism** — Same interface, different implementations
- Method Overriding (Runtime) — subclass redefines parent method
- Method Overloading (Compile-time) — same name, different params

**4. Abstraction** — Hide complexity, expose only essentials

**SOLID:** Single Responsibility · Open/Closed · Liskov Substitution · Interface Segregation · Dependency Inversion`;
  }

  /* ── 10. WEB DEV ── */
  if (has('react', 'jsx', 'virtual dom', 'usestate', 'useeffect', 'useref', 'context api', 'component')) {
    return `### ⚛️ React — Key Concepts

**Virtual DOM:** React diffs old vs new Virtual DOM and updates only changed parts (reconciliation).

**Hooks:**
\`\`\`javascript
const [count, setCount] = useState(0);         // State

useEffect(() => {                               // Side effects
  fetch('/api/data').then(r => r.json()).then(setData);
  return () => { /* cleanup on unmount */ };
}, [dependency]);

const { user } = useContext(AuthContext);       // Consume context
const inputRef = useRef(null);                 // Persist without re-render
\`\`\`

**Context API (used in PrepTrack):**
\`\`\`javascript
const AuthContext = createContext();
// <AuthContext.Provider value={{ user, login, logout }}>
// Any child: const { user } = useContext(AuthContext)
\`\`\`

**In PrepTrack:** AuthContext manages user auth state globally.`;
  }

  if (has('node', 'nodejs', 'express middleware', 'event loop', 'non-blocking')) {
    return `### 🟢 Node.js & Express

**Event Loop:** Node is single-threaded but non-blocking. I/O operations are offloaded; callbacks run when they complete.

\`\`\`
Call Stack → [Microtasks: Promises] → [Macrotasks: setTimeout, I/O] → Loop
\`\`\`

**Express Middleware Chain:**
\`\`\`javascript
app.use(cors());                    // 1. CORS headers
app.use(express.json());           // 2. Parse body
app.use('/api/auth', authRoutes);  // 3. Route handlers
app.use(errorHandler);             // 4. Catch errors (last!)
\`\`\`

**In PrepTrack:** app.js chains: cors → json parser → routes → error handler.`;
  }

  if (has('git', 'github', 'version control', 'commit', 'branch', 'merge', 'pull request')) {
    return `### 🌿 Git Essentials

\`\`\`bash
git init                        # Initialize repo
git add .                       # Stage all changes
git commit -m "feat: add login" # Commit
git push origin main            # Push to remote
git checkout -b feature/login   # Create & switch branch
git merge feature/login         # Merge branch
git log --oneline               # Compact history
\`\`\`

**Conventional Commits:** \`feat:\` · \`fix:\` · \`docs:\` · \`refactor:\` · \`test:\`

**merge vs rebase:** merge creates a merge commit; rebase rewrites history (cleaner — avoid on shared branches).`;
  }

  /* ── 11. HR & PLACEMENT ── */
  if (has('star', 'behavioral', 'tell me about yourself', 'strengths', 'weakness', 'hr interview')) {
    return `### ⭐ HR Interview — STAR Method

Structure every behavioral answer:

1. **S — Situation:** Context (project, college, challenge)
2. **T — Task:** Your specific responsibility
3. **A — Action:** What YOU specifically did (use "I", not "we")
4. **R — Result:** Measurable outcome (%, time saved, features built)

**Example for PrepTrack:**
> *"I built PrepTrack — a MERN placement platform. I designed MongoDB compound indexes and aggregation pipelines for real-time quiz analytics. The platform demonstrates 10+ MongoDB features including $lookup, $unwind, virtuals, and pre-save hooks."*

**Common HR Questions:**
- "Where in 5 years?" → Growth-oriented, aligned with company
- "Biggest weakness?" → Real weakness + how you're actively improving`;
  }

  if (has('resume', 'cv', 'portfolio')) {
    return `### 📄 Resume Tips for Campus Placements

**Structure (1 page max for freshers):**
1. Header — Name, Email, Phone, LinkedIn, GitHub
2. Education — College, Degree, CGPA
3. Skills — Languages, frameworks, databases, tools
4. Projects *(most important!)* — 2-3 with impact metrics
5. Achievements — CP ratings, hackathon wins

**Project Description Template:**
\`\`\`
PrepTrack | MERN Stack, MongoDB, JWT, Recharts
• Full-stack placement prep platform with quiz engine & spaced repetition
• Aggregation pipelines for real-time analytics across 5 categories
• Compound indexes for sub-200ms API response
\`\`\`

**Tip:** Every line is a potential viva question — only add what you can explain!`;
  }

  if (has('placement', 'prepare', 'roadmap', 'study plan', 'placement preparation')) {
    return `### 🚀 Campus Placement Roadmap

**Phase 1 — DSA (2-3 months)**
- Arrays, Strings, Two Pointers, Sliding Window
- Linked Lists, Stacks, Queues
- Trees (BST), Heaps, Graphs (BFS/DFS, Dijkstra)
- Dynamic Programming patterns
- Practice: LeetCode Easy ×50, Medium ×80

**Phase 2 — CS Fundamentals (1-2 months)**
- OS: Deadlocks, Scheduling, Virtual Memory, Threads
- DBMS: ACID, Normalization, SQL
- CN: OSI Model, TCP/IP, HTTP, DNS
- OOP: 4 Pillars, SOLID Principles

**Phase 3 — Projects & System Design**
- Explain PrepTrack confidently — MongoDB features, API design, JWT auth
- System Design basics (caching, load balancing, microservices)

**Use PrepTrack Daily:** Quiz → Review mistakes → Spaced repetition!`;
  }

  if (has('system design', 'scalable', 'load balance', 'cache', 'redis', 'microservice')) {
    return `### 🏗️ System Design — Basics

**Key Components:**
1. **Load Balancer** — Distributes traffic (Round Robin, Least Connections)
2. **Cache (Redis)** — In-memory store; reduces DB load dramatically
3. **CDN** — Delivers static assets from geographically close servers
4. **Database Sharding** — Horizontally partition DB across servers
5. **Message Queue (Kafka)** — Async communication between services

**URL Shortener (common interview Q):**
1. POST /shorten → returns short URL
2. GET /:code → 301 redirect to original URL
3. Storage: MongoDB { shortCode, originalUrl, clicks }
4. Cache shortCode → URL in Redis for fast lookups

**Tip for freshers:** Show you understand the concepts — deep mastery isn't expected.`;
  }

  if (has('preptrack', 'this project', 'this app', 'about the project')) {
    return `### 📱 About PrepTrack

PrepTrack is a **full-stack MERN placement prep platform** built as a MongoDB course assignment.

**MongoDB Features Demonstrated:**
| Feature | Where Used |
|---------|------------|
| Schema Validation & Enums | All 5 models |
| Unique Index | User.email |
| Compound Index | Question, TestAttempt, Application |
| Text Index + $text search | PrepItem (search title & notes) |
| Document Referencing | All models → User._id |
| Embedded Subdocuments | options[] in Question, answers[] in TestAttempt |
| Mongoose Virtuals | accuracy in TestAttempt |
| Pre-save Middleware | Password hash in User, spaced repetition in PrepItem |
| Aggregation Pipeline | Stats routes ($match, $unwind, $lookup, $group) |
| CRUD Operations | All feature controllers |

**Stack:** MongoDB + Mongoose · Express · React (Vite) · Node.js · JWT · bcrypt · Recharts`;
  }

  // DEFAULT — Smart contextual fallback
  return `### 💡 PrepTrack AI — ${userName}

I couldn't find an exact match for **"${userPrompt}"**, but here's what I can help with:

🔹 **MongoDB** — \`$lookup\`, \`$unwind\`, \`$group\`, \`$match\`, aggregation pipeline, indexes, embedding vs referencing, CRUD, schema design, virtuals, pre-save hooks

🔹 **DSA** — Arrays, Linked Lists, Stacks, Queues, BST, Heaps, Graphs (BFS/DFS), Dijkstra, Dynamic Programming, Sorting, Binary Search, Big-O complexity

🔹 **OS** — Deadlock & Coffman conditions, Process vs Thread, CPU Scheduling, Virtual Memory

🔹 **DBMS** — ACID properties, Normalization (1NF-BCNF), SQL Joins, Transactions

🔹 **Networks** — OSI Model, TCP vs UDP, HTTP methods & status codes, DNS

🔹 **Web Dev** — React hooks, Node.js, Express middleware, JWT, bcrypt, REST API, Git

🔹 **Placement** — Resume tips, STAR method, placement roadmap, system design basics

*Examples: "How does JWT work?", "Explain merge sort", "What is normalization?", "Explain OSI model"*`;
};

/**
 * @desc    Send a message to the AI placement assistant
 * @route   POST /api/chat/message
 * @access  Private
 * MongoDB Feature Demonstrated: Document Creation with User reference and chronological chat storage
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question or query'
      });
    }

    const trimmedMsg = message.trim();

    // 1. Save user's question to MongoDB ChatMessage collection
    await ChatMessage.create({
      userId: req.user._id,
      role: 'user',
      content: trimmedMsg
    });

    // 2. Generate intelligent response using Google Gemini Gen AI or local Knowledge Engine
    let botReply = '';

    const apiKey = process.env.GEMINI_API_KEY;

    // If student has GEMINI_API_KEY set in server/.env, call Google Gemini Gen AI API:
    if (apiKey) {
      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
      for (const model of candidateModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are PrepTrack AI, an encouraging and highly knowledgeable technical mentor helping a student named ${req.user.name} prepare for campus placements, coding rounds, and technical viva exams in MongoDB, DSA, OS, DBMS, Computer Networks, and Web Development. You warmly answer greetings, conversational queries, and technical placement questions in English and Hinglish. Answer clearly, accurately, with markdown formatting, code examples, and structured bullet points where appropriate. Student asks: ${trimmedMsg}`
                      }
                    ]
                  }
                ]
              })
            }
          );
          const data = await response.json();
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            botReply = data.candidates[0].content.parts[0].text;
            break; // Successfully got response from Gemini Gen AI
          } else if (data.error) {
            console.warn(`Gemini API (${model}) returned error:`, data.error.message);
          }
        } catch (geminiError) {
          console.warn(`Gemini API (${model}) call failed:`, geminiError.message);
        }
      }
    }

    // Fallback to our embedded placement intelligence engine
    if (!botReply) {
      botReply = generateKnowledgeResponse(trimmedMsg, req.user.name);
    }

    // 3. Save assistant's reply to MongoDB
    const assistantMessage = await ChatMessage.create({
      userId: req.user._id,
      role: 'assistant',
      content: botReply
    });

    res.status(200).json({
      success: true,
      data: {
        role: 'assistant',
        content: botReply,
        createdAt: assistantMessage.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's conversation history
 * @route   GET /api/chat/history
 * @access  Private
 * MongoDB Feature Demonstrated: Compound Index lookup (userId, createdAt: 1) with limit
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const history = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear conversation history
 * @route   DELETE /api/chat/history
 * @access  Private
 * MongoDB Feature Demonstrated: Scoped deleteMany({ userId: req.user._id })
 */
exports.clearChatHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
