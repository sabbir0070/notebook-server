const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Account = require('./models/Account');
const User = require('./models/User');

dotenv.config();

const initialAccounts = [
  { name: 'sonjoy kaka', baseAmount: 120000 },
  { name: 'bulbul vai gor-22k+hawlad 10k+rashid vai 17k', baseAmount: 49000 },
  { name: 'uddinpon rubina', baseAmount: 45000 },
  { name: 'uddipon hafsa', baseAmount: 82000 },
  { name: 'popi jahanara', baseAmount: 44000 },
  { name: 'sopno rubina', baseAmount: 88000 },
  { name: 'narshindi bulbul', baseAmount: 73000 },
  { name: 'taslima apa', baseAmount: 6000 },
  { name: 'islam kaka', baseAmount: 5000 },
  { name: 'sonju munshi', baseAmount: 1800 },
  { name: 'sohag', baseAmount: 4500 },
  { name: 'abdur roub', baseAmount: 6000 },
  { name: 'kokon chowrasta', baseAmount: 2000 },
  { name: 'nandail bettery', baseAmount: 32000 },
  { name: 'mujibur kanda para', baseAmount: 10000 },
  { name: 'harun kaka', baseAmount: 100000 },
  { name: 'oli comishonar', baseAmount: 300000 },
  { name: 'abdur roshid', baseAmount: 3500 },
  { name: 'anayet mama osud', baseAmount: 3900 },
  { name: 'shimul pabe', baseAmount: 15000 },
  { name: 'hafsa frnd', baseAmount: 15000 },
  { name: 'opu', baseAmount: 6000 },
  { name: 'rasel', baseAmount: 5000 },
  { name: 'bashati kat', baseAmount: 1000 },
  { name: 'dukan security helim', baseAmount: 15000 },
  { name: 'kishoregang aunty', baseAmount: 70000 },
  { name: 'toma', baseAmount: 30000 }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected For Seeding...');

    // Find or create the dummy user
    let dummyUser = await User.findOne({ email: 'test@dummy.com' });
    if (!dummyUser) {
      dummyUser = await User.create({
        name: 'Dummy User',
        email: 'test@dummy.com',
        password: 'password123'
      });
      console.log('Created Dummy User for testing.');
    }

    // Check if data already exists to prevent duplication
    const existing = await Account.countDocuments({ userId: dummyUser._id });
    if (existing > 0) {
      console.log('Accounts already seeded.');
      process.exit();
    }

    // Inject user ID
    const accountsWithUser = initialAccounts.map(acc => ({
      ...acc,
      userId: dummyUser._id
    }));

    await Account.insertMany(accountsWithUser);
    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
