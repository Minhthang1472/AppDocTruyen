require('dotenv').config();
const mongoose = require('mongoose');
const Novel = require('./models/Novel');
const Chapter = require('./models/Chapter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novelportal';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Novel.deleteMany({});
    await Chapter.deleteMany({});

    // 1. Create Novels
    const novelsData = [
      {
        title: 'The Ashen Crown',
        author: 'Unknown Author',
        coverImage: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=500&auto=format&fit=crop',
        description: 'In a world where magic is currency, a young thief discovers an artifact that...',
        genres: ['Fantasy'],
        status: 'Ongoing',
        views: 1500000,
        rating: 4.9,
        isFeatured: true,
      },
      {
        title: 'Neon Drift',
        author: 'Cyber Writer',
        coverImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=500&auto=format&fit=crop',
        description: 'A cyberpunk adventure in the neon-lit streets.',
        genres: ['Sci-Fi'],
        status: 'Ongoing',
        views: 1200000,
        rating: 4.8,
        isTrending: true,
      },
      {
        title: 'Echoes of Mana',
        author: 'Mana Master',
        coverImage: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?q=80&w=500&auto=format&fit=crop',
        description: 'Magic echoes through the ancient halls.',
        genres: ['Fantasy', 'Action'],
        status: 'Completed',
        views: 800000,
        rating: 4.7,
        isTrending: true,
      },
      {
        title: 'Iron & Blood',
        author: 'War Scribe',
        coverImage: 'https://images.unsplash.com/photo-1590845947376-2638caa89309?q=80&w=500&auto=format&fit=crop',
        description: 'A tale of knights and betrayal.',
        genres: ['Action', 'Historical'],
        status: 'Ongoing',
        views: 950000,
        rating: 4.6,
        isTrending: true,
      },
      {
        title: 'Tome of the Forgotten',
        author: 'Scholar John',
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=500&auto=format&fit=crop',
        description: 'A scholar discovers that the history he has been...',
        genres: ['Mystery', 'Sci-Fi'],
        status: 'Ongoing',
        views: 300000,
        rating: 4.5,
        isEditorPick: true,
      },
      {
        title: 'Winter\'s Howl',
        author: 'Wolf Brother',
        coverImage: 'https://images.unsplash.com/photo-1484606411516-24e5eb4cb587?q=80&w=500&auto=format&fit=crop',
        description: 'Surviving the endless winter requires more than...',
        genres: ['Action', 'Fantasy'],
        status: 'Ongoing',
        views: 450000,
        rating: 4.8,
        isEditorPick: true,
      },
      {
        title: 'The Chronicles of the Forgotten Realm',
        author: 'Elara Moon',
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop',
        description: 'As the shadows lengthened across the fractured continent, Elara discovered the...',
        genres: ['Fantasy', 'Adventure'],
        status: 'Ongoing',
        views: 2000000,
        rating: 4.9,
      }
    ];

    const insertedNovels = await Novel.insertMany(novelsData);
    console.log(`Inserted ${insertedNovels.length} novels`);

    // 2. Create Chapters for each novel
    const chaptersData = [];
    for (const novel of insertedNovels) {
      // Create 5 chapters for each novel
      for (let i = 1; i <= 5; i++) {
        chaptersData.push({
          novel: novel._id,
          chapterNumber: i,
          title: `Chapter ${i}: The Beginning of ${novel.title}`,
          content: `This is the content for chapter ${i} of ${novel.title}. The cold wind howled through the desolate canyon, carrying with it whispers of a forgotten era. Elara tightened her cloak, her eyes scanning the jagged peaks that loomed like jagged teeth against the twilight sky. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
          views: Math.floor(Math.random() * 10000),
          isVip: i > 3, // Chapter 4 and 5 are VIP
          coinsPrice: i > 3 ? 50 : 0
        });
      }
      
      // Update chaptersCount in Novel
      await Novel.findByIdAndUpdate(novel._id, { chaptersCount: 5 });
    }

    const insertedChapters = await Chapter.insertMany(chaptersData);
    console.log(`Inserted ${insertedChapters.length} chapters`);

    console.log('Seed data completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
