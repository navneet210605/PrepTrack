# MongoDB Aggregation Pipelines — Step-by-Step Viva Guide

This document breaks down every **MongoDB Aggregation Pipeline** implemented in **PrepTrack**. Each pipeline is explained stage-by-stage in simple, student-friendly terms with small input/output JSON transformations that you can draw or explain on a blackboard or in a viva.

---

## 📑 Table of Pipelines

1. [Pipeline 1: Randomized Adaptive Test Generator (`/api/tests/start`)](#pipeline-1-randomized-adaptive-test-generator)
2. [Pipeline 2: Category Accuracy Breakdown (`/api/stats/accuracy-by-category`)](#pipeline-2-category-accuracy-breakdown)
3. [Pipeline 3: Weak Topics Remediation (`/api/stats/weak-topics`)](#pipeline-3-weak-topics-remediation)
4. [Pipeline 4: Chronological Score Trend (`/api/stats/score-trend`)](#pipeline-4-chronological-score-trend)
5. [Pipeline 5: Recruitment Applications Funnel (`/api/stats/applications-funnel`)](#pipeline-5-recruitment-applications-funnel)

---

## Pipeline 1: Randomized Adaptive Test Generator
**Location:** `server/controllers/testController.js` &rarr; `startTest`  
**Purpose:** Randomly samples $N$ questions matching category and difficulty while hiding the answer key from the client to prevent cheating.

### Pipeline Stages

```
Collection [questions]
  ├── Stage 1: $match   (filters category and difficulty)
  ├── Stage 2: $sample  (randomly picks N documents)
  └── Stage 3: $project (security projection: excludes correctIndex & explanation)
```

### Stage-by-Stage Explanation

#### Stage 1: `$match`
- **What it does:** Filters candidate questions matching the user's selected category (e.g. `"DSA"`) and difficulty (e.g. `"Medium"`).
- **Viva Point:** Placed first to leverage compound index `(category, topic, difficulty)`.

#### Stage 2: `$sample: { size: 10 }`
- **What it does:** Uses MongoDB's internal pseudo-random sampling algorithm to pick 10 documents from the matched pool.
- **Viva Point:** Running `$sample` inside MongoDB avoids fetching thousands of records into Node.js RAM just to shuffle them.

#### Stage 3: `$project`
- **What it does:** Excludes `correctIndex` and `explanation` so the student cannot inspect network packets to view the answer.
- **Syntax:** `{ correctIndex: 0, explanation: 0 }` (or explicitly whitelisting safe fields).

### Small Input / Output Example

**Input Document from Collection:**
```json
{
  "_id": "601",
  "category": "DSA",
  "topic": "Binary Search Trees",
  "difficulty": "Medium",
  "text": "Inorder traversal of BST gives?",
  "options": ["Preorder", "Sorted Ascending", "Postorder", "Random"],
  "correctIndex": 1,
  "explanation": "Inorder visits Left-Root-Right which produces sorted keys."
}
```

**Output to Client (Sanitized):**
```json
{
  "_id": "601",
  "category": "DSA",
  "topic": "Binary Search Trees",
  "difficulty": "Medium",
  "text": "Inorder traversal of BST gives?",
  "options": ["Preorder", "Sorted Ascending", "Postorder", "Random"]
}
```

---

## Pipeline 2: Category Accuracy Breakdown
**Location:** `server/controllers/statsController.js` &rarr; `getAccuracyByCategory`  
**Purpose:** Calculates overall question accuracy percentage grouped by question category for the logged-in user.

### Pipeline Stages

```
Collection [testattempts]
  ├── Stage 1: $match   (userId: req.user._id)
  ├── Stage 2: $unwind  (deconstructs answers array)
  ├── Stage 3: $lookup  (joins with questions collection)
  ├── Stage 4: $unwind  (flattens joined question document)
  ├── Stage 5: $group   (groups by question.category, counts total & correct)
  ├── Stage 6: $project (computes accuracy percentage)
  └── Stage 7: $sort    (alphabetical order)
```

### Stage-by-Stage Explanation

#### Stage 1: `$match: { userId: ObjectId("...") }`
- Filters only the test attempts completed by the authenticated user.

#### Stage 2: `$unwind: "$answers"`
- The `TestAttempt` document contains an embedded `answers` array with 5 to 15 answer subdocuments.
- `$unwind` splits the document into individual stream records, one for every answer.

#### Stage 3: `$lookup`
- Joins each answer's `questionId` with the `_id` in the `questions` collection to fetch the category.
- **Syntax:**
  ```javascript
  {
    $lookup: {
      from: 'questions',
      localField: 'answers.questionId',
      foreignField: '_id',
      as: 'question'
    }
  }
  ```

#### Stage 4: `$unwind: "$question"`
- `$lookup` always outputs an array `question: [{ ... }]`. This stage flattens the 1-element array into a single object `question: { ... }`.

#### Stage 5: `$group`
- Groups all answers across all tests by `question.category`.
- Calculates total answers and correct answers using conditional `$sum`:
  ```javascript
  {
    $group: {
      _id: '$question.category',
      total: { $sum: 1 },
      correct: {
        $sum: { $cond: [{ $eq: ['$answers.isCorrect', true] }, 1, 0] }
      }
    }
  }
  ```

#### Stage 6: `$project`
- Computes `accuracy` percentage: `round((correct / total) * 100, 1)`.

### Small Input / Output Example

**Intermediate stream after `$unwind` & `$lookup`:**
```json
[
  { "answers": { "isCorrect": true }, "question": { "category": "DSA" } },
  { "answers": { "isCorrect": false }, "question": { "category": "DSA" } },
  { "answers": { "isCorrect": true }, "question": { "category": "CS Core" } }
]
```

**Final Output:**
```json
[
  { "category": "CS Core", "total": 1, "correct": 1, "accuracy": 100 },
  { "category": "DSA", "total": 2, "correct": 1, "accuracy": 50 }
]
```

---

## Pipeline 3: Weak Topics Remediation
**Location:** `server/controllers/statsController.js` &rarr; `getWeakTopics`  
**Purpose:** Identifies specific subtopics where student accuracy is below 60%, ordered worst-first, limited to top 5.

### Pipeline Stages

```
Collection [testattempts]
  ├── Stage 1: $match   (userId)
  ├── Stage 2: $unwind  (answers)
  ├── Stage 3: $lookup  (questions)
  ├── Stage 4: $unwind  (question)
  ├── Stage 5: $group   (_id: "$question.topic", accumulates total & correct)
  ├── Stage 6: $project (topic: "$_id", category, total, correct, accuracy)
  ├── Stage 7: $match   (accuracy < 60)  <-- Post-aggregation filter ("HAVING" clause)
  ├── Stage 8: $sort    (accuracy: 1)    <-- Lowest accuracy first
  └── Stage 9: $limit   (5)              <-- Top 5 weakest
```

### Stage-by-Stage Explanation

- **Stage 7 (`$match: { accuracy: { $lt: 60 } }`):**
  - **Viva Question:** How is Stage 7 different from Stage 1?
  - **Answer:** Stage 1 filters raw input documents before grouping (like SQL `WHERE`). Stage 7 filters computed aggregate results after grouping (like SQL `HAVING`).
- **Stage 8 (`$sort: { accuracy: 1 }`):**
  - `1` represents ascending sort so the student's worst performing topic (e.g. 20%) appears at the top.
- **Stage 9 (`$limit: 5`):**
  - Keeps the dashboard clean and actionable by presenting only the 5 most critical problem areas.

### Small Input / Output Example

**Output:**
```json
[
  { "topic": "Dynamic Programming", "category": "DSA", "total": 4, "correct": 1, "accuracy": 25 },
  { "topic": "Operating Systems - Paging", "category": "CS Core", "total": 5, "correct": 2, "accuracy": 40 }
]
```

---

## Pipeline 4: Chronological Score Trend
**Location:** `server/controllers/statsController.js` &rarr; `getScoreTrend`  
**Purpose:** Renders the line chart showing accuracy progression over the user's latest 10 test attempts.

### Pipeline Stages

```
Collection [testattempts]
  ├── Stage 1: $match  (userId)
  ├── Stage 2: $sort   (createdAt: -1)  <-- Newest attempts first
  ├── Stage 3: $limit  (10)             <-- Slice latest 10 attempts
  ├── Stage 4: $sort   (createdAt: 1)   <-- Reorder chronologically for chart (left to right)
  └── Stage 5: $project (formats date with $dateToString and computes accuracy)
```

### Stage-by-Stage Explanation

- **Why two `$sort` stages?**
  1. First `$sort: { createdAt: -1 }` with `$limit: 10` isolates the **most recent** 10 attempts.
  2. Second `$sort: { createdAt: 1 }` flips the 10 attempts back into chronological order so the line chart reads naturally from left (past) to right (present).
- **Stage 5 (`$dateToString`):**
  ```javascript
  date: {
    $dateToString: {
      format: "%b %d, %H:%M",
      date: "$createdAt"
    }
  }
  ```
  Converts BSON Date `2026-11-01T02:30:00.000Z` to human-readable `"Nov 01, 02:30"`.

### Small Input / Output Example

**Output:**
```json
[
  { "date": "Oct 29, 14:20", "category": "DSA", "score": 3, "total": 5, "accuracy": 60 },
  { "date": "Oct 30, 18:10", "category": "Development", "score": 4, "total": 5, "accuracy": 80 },
  { "date": "Nov 01, 03:07", "category": "CS Core", "score": 2, "total": 5, "accuracy": 40 }
]
```

---

## Pipeline 5: Recruitment Applications Funnel
**Location:** `server/controllers/statsController.js` &rarr; `getApplicationsFunnel`  
**Purpose:** Computes the volume of recruitment applications at each pipeline stage (`Applied`, `Test`, `Interview`, `Offer`, `Rejected`).

### Pipeline Stages

```
Collection [applications]
  ├── Stage 1: $match   (userId: req.user._id)
  ├── Stage 2: $group   (_id: "$status", count: { $sum: 1 })
  └── Stage 3: $project (status: "$_id", count: 1, _id: 0)
```

### Stage-by-Stage Explanation

- **Stage 1 (`$match`):** Scopes the query to the authenticated student.
- **Stage 2 (`$group`):** Categorizes applications by their `status` enum string and counts instances with `$sum: 1`.
- **Stage 3 (`$project`):** Cleans up `_id` into a named field `status` for direct consumption by Recharts `BarChart`.

### Small Input / Output Example

**Output:**
```json
[
  { "status": "Applied", "count": 1 },
  { "status": "Test", "count": 2 },
  { "status": "Interview", "count": 1 },
  { "status": "Offer", "count": 1 },
  { "status": "Rejected", "count": 1 }
]
```

---

## 🎯 Summary Viva Tips for MongoDB Aggregations

1. **What is an Aggregation Pipeline in MongoDB?**  
   *Answer:* It is a framework for data processing modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.
2. **What is the difference between Aggregation and Map-Reduce in MongoDB?**  
   *Answer:* Aggregation pipeline provides better performance, is implemented in native C++ within the database kernel, and is preferred over Map-Reduce (which is deprecated in modern MongoDB).
3. **Does order of stages matter?**  
   *Answer:* Absolutely. Each stage transforms the document stream and feeds its output into the next stage. For example, placing `$match` before `$lookup` drastically reduces the number of documents that need to be joined.
