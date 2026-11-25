const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Question = require('../models/Question');

/**
 * MongoDB Feature Demonstrated:
 * 1. Database Connection Lifecycle (connect & disconnect)
 * 2. Collection Flush (deleteMany({}))
 * 3. Bulk Insert Optimization (insertMany with { ordered: false })
 * 4. Aggregation Pipeline ($group, $sum) for seed audit report
 */
const seedQuestions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preptrack';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for seeding: ${mongoose.connection.host}`);

    const isReset = process.argv.includes('--reset');

    if (isReset) {
      // MongoDB Feature Demonstrated: deleteMany removes all documents matching query
      const deleteResult = await Question.deleteMany({});
      console.log(`Cleared existing questions collection (${deleteResult.deletedCount} removed).`);
    }

    // Read seed file
    const filePath = path.join(__dirname, 'questions.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(rawData);

    console.log(`Found ${questions.length} questions in seed dataset.`);

    // MongoDB Feature Demonstrated: Bulk Document Insertion with insertMany
    // ordered: false allows all valid documents to insert even if some fail duplicate key checks
    try {
      const inserted = await Question.insertMany(questions, { ordered: false });
      console.log(`Successfully seeded ${inserted.length} questions into MongoDB!`);
    } catch (insertError) {
      if (insertError.writeErrors) {
        console.warn(`Inserted documents with ${insertError.writeErrors.length} duplicates skipped.`);
      } else {
        throw insertError;
      }
    }

    // MongoDB Feature Demonstrated: Aggregation Pipeline to count distribution
    const categoryCounts = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('\n--- Question Counts Per Category ---');
    categoryCounts.forEach((cat) => {
      console.log(`  * ${cat._id.padEnd(15)} : ${cat.count} questions`);
    });

    const totalCount = await Question.countDocuments();
    console.log(`------------------------------------`);
    console.log(`Total questions in database: ${totalCount}\n`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during question seeding:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedQuestions();
