const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const PrepItem = require('../models/PrepItem');
const Application = require('../models/Application');

/**
 * MongoDB Feature Demonstrated:
 * 1. Transactional demo data setup
 * 2. Cross-collection relationships using referenced ObjectIds
 * 3. Seed data generation with realistic date distributions for analytics testing
 */
const seedDemoUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preptrack';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for Demo User setup: ${mongoose.connection.host}`);

    const demoEmail = 'demo@preptrack.com';

    // 1. Clean up existing demo user and linked data
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      console.log(`Cleaning previous data for ${demoEmail}...`);
      await Promise.all([
        TestAttempt.deleteMany({ userId: existingUser._id }),
        PrepItem.deleteMany({ userId: existingUser._id }),
        Application.deleteMany({ userId: existingUser._id }),
        User.deleteOne({ _id: existingUser._id })
      ]);
    }

    // 2. Create fresh demo user
    // Password will be hashed by pre('save') hook in User model
    const demoUser = await User.create({
      name: 'Aditya Sharma',
      email: demoEmail,
      password: 'Demo@123',
      streak: {
        current: 4,
        lastActiveDate: new Date()
      }
    });

    console.log(`Created Demo User: ${demoUser.email} (ID: ${demoUser._id})`);

    // 3. Create Sample Prep Items
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const prepItemsData = [
      {
        userId: demoUser._id,
        category: 'DSA',
        title: 'Floyd Cycle Detection & Starting Point',
        topic: 'Linked Lists',
        difficulty: 'Medium',
        status: 'Done',
        link: 'https://leetcode.com/problems/linked-list-cycle-ii/',
        notes: 'Slow 1 step, fast 2 steps. When they meet, reset slow to head, move both 1 step to find loop start.',
        nextRevisionDate: new Date(now - 2 * 60 * 60 * 1000), // Due 2 hours ago (Revise Today!)
        revisionCount: 2
      },
      {
        userId: demoUser._id,
        category: 'CS Core',
        title: 'Virtual Memory, TLB and Page Replacement (LRU)',
        topic: 'Operating Systems',
        difficulty: 'Hard',
        status: 'Done',
        link: 'https://www.geeksforgeeks.org/virtual-memory-in-operating-system/',
        notes: 'Page hit vs miss. TLB acts as hardware cache for page table entries. Belady anomaly in FIFO.',
        nextRevisionDate: new Date(now - 5 * 60 * 1000), // Due 5 mins ago (Revise Today!)
        revisionCount: 1
      },
      {
        userId: demoUser._id,
        category: 'Development',
        title: 'MongoDB Aggregation Pipeline Optimization',
        topic: 'MongoDB',
        difficulty: 'Medium',
        status: 'Todo',
        link: 'https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/',
        notes: 'Always place $match and $project early in pipeline to utilize indexes and trim BSON document stream.',
        nextRevisionDate: null,
        revisionCount: 0
      },
      {
        userId: demoUser._id,
        category: 'Aptitude',
        title: 'Time & Work - Work Equivalence and Pipes',
        topic: 'Quantitative - Time and Work',
        difficulty: 'Easy',
        status: 'Revise',
        link: '',
        notes: 'Total work as LCM of individual times. Efficiency ratio = inverse of time taken.',
        nextRevisionDate: new Date(now + 2 * day),
        revisionCount: 1
      },
      {
        userId: demoUser._id,
        category: 'HR',
        title: 'STAR Method: Handling Technical Disagreements',
        topic: 'Behavioral',
        difficulty: 'Medium',
        status: 'Todo',
        link: '',
        notes: 'Situation, Task, Action taken with empathy and metrics, Result achieved.',
        nextRevisionDate: null,
        revisionCount: 0
      },
      {
        userId: demoUser._id,
        category: 'Projects & Resume',
        title: 'System Design Diagram for PrepTrack Monorepo',
        topic: 'System Architecture',
        difficulty: 'Hard',
        status: 'Done',
        link: 'https://github.com/',
        notes: 'Documented Mongoose schema validation, compound indexes, and microservice data flow.',
        nextRevisionDate: new Date(now + 4 * day),
        revisionCount: 3
      }
    ];

    await PrepItem.insertMany(prepItemsData);
    console.log(`Seeded ${prepItemsData.length} prep tracker items.`);

    // 4. Create Sample Applications (including one within 3-day deadline)
    const applicationsData = [
      {
        userId: demoUser._id,
        company: 'Google',
        role: 'Software Engineer - University Graduate',
        status: 'Interview',
        deadline: new Date(now + 2 * day), // In 2 days! Trigger for dashboard plan upcoming alerts!
        appliedDate: new Date(now - 14 * day),
        notes: 'Round 2 DSA interview scheduled on Google Meet. Focus on Graphs & BST.'
      },
      {
        userId: demoUser._id,
        company: 'Microsoft',
        role: 'SDE 1',
        status: 'Test',
        deadline: new Date(now + 5 * day),
        appliedDate: new Date(now - 7 * day),
        notes: 'Codility online assessment link received. 3 algorithmic coding challenges.'
      },
      {
        userId: demoUser._id,
        company: 'Amazon',
        role: 'Software Development Engineer Intern',
        status: 'Applied',
        deadline: new Date(now + 12 * day),
        appliedDate: new Date(now - 3 * day),
        notes: 'Applied via employee referral on Amazon Jobs portal.'
      },
      {
        userId: demoUser._id,
        company: 'Atlassian',
        role: 'Associate Software Engineer',
        status: 'Offer',
        deadline: null,
        appliedDate: new Date(now - 30 * day),
        notes: 'Official Offer letter received! Base: 18 LPA + Equity.'
      },
      {
        userId: demoUser._id,
        company: 'Uber',
        role: 'Frontend Engineer',
        status: 'Rejected',
        deadline: null,
        appliedDate: new Date(now - 25 * day),
        notes: 'Rejected after hiring freeze on university intake.'
      }
    ];

    await Application.insertMany(applicationsData);
    console.log(`Seeded ${applicationsData.length} job applications.`);

    // 5. Create 3 Sample Test Attempts with real questions from Question collection
    const allQuestions = await Question.find();
    if (allQuestions.length === 0) {
      console.warn('Questions collection is empty. Run npm run seed first to enable test attempts.');
    } else {
      const dsaQuestions = allQuestions.filter((q) => q.category === 'DSA').slice(0, 5);
      const csQuestions = allQuestions.filter((q) => q.category === 'CS Core').slice(0, 5);
      const devQuestions = allQuestions.filter((q) => q.category === 'Development').slice(0, 5);

      // Attempt 1 (DSA - 2 days ago, Score 4/5 = 80%)
      if (dsaQuestions.length >= 3) {
        const answers1 = dsaQuestions.map((q, idx) => ({
          questionId: q._id,
          selectedIndex: idx === 1 ? (q.correctIndex + 1) % 4 : q.correctIndex, // 1 intentional wrong
          isCorrect: idx !== 1
        }));
        const score1 = answers1.filter((a) => a.isCorrect).length;

        await TestAttempt.create({
          userId: demoUser._id,
          category: 'DSA',
          topic: 'Data Structures Mix',
          difficulty: 'Medium',
          answers: answers1,
          score: score1,
          total: answers1.length,
          timeTakenSec: 210,
          createdAt: new Date(now - 2 * day)
        });
      }

      // Attempt 2 (Development - 1 day ago, Score 4/5 = 80%)
      if (devQuestions.length >= 3) {
        const answers2 = devQuestions.map((q, idx) => ({
          questionId: q._id,
          selectedIndex: idx === 2 ? (q.correctIndex + 1) % 4 : q.correctIndex,
          isCorrect: idx !== 2
        }));
        const score2 = answers2.filter((a) => a.isCorrect).length;

        await TestAttempt.create({
          userId: demoUser._id,
          category: 'Development',
          topic: 'Fullstack Mix',
          difficulty: 'Medium',
          answers: answers2,
          score: score2,
          total: answers2.length,
          timeTakenSec: 180,
          createdAt: new Date(now - 1 * day)
        });
      }

      // Attempt 3 (CS Core - Today, Score 2/5 = 40% -> creates weak topic for dashboard!)
      if (csQuestions.length >= 3) {
        const answers3 = csQuestions.map((q, idx) => ({
          questionId: q._id,
          selectedIndex: idx < 2 ? q.correctIndex : (q.correctIndex + 1) % 4, // 3 wrong answers
          isCorrect: idx < 2
        }));
        const score3 = answers3.filter((a) => a.isCorrect).length;

        await TestAttempt.create({
          userId: demoUser._id,
          category: 'CS Core',
          topic: csQuestions[0].topic,
          difficulty: 'Hard',
          answers: answers3,
          score: score3,
          total: answers3.length,
          timeTakenSec: 250,
          createdAt: new Date(now - 30 * 60 * 1000)
        });
      }

      console.log('Seeded 3 past test attempts with accuracy and question links.');
    }

    console.log('\n=============================================');
    console.log(' DEMO USER SEED COMPLETED SUCCESSFULLY! ');
    console.log('=============================================');
    console.log(` Email   : ${demoEmail}`);
    console.log(` Password: Demo@123`);
    console.log(' All dashboard charts, alerts, and prep plans are now fully populated!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during demo user seeding:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedDemoUser();
