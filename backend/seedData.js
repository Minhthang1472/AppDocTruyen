const mongoose = require('mongoose');
require('dotenv').config();
const Novel = require('./models/Novel');
const Chapter = require('./models/Chapter');

const novelsData = [
  {
    title: 'Solo Leveling',
    author: 'Chugong',
    description: '10 năm trước, "Cổng" (Gate) - thứ kết nối giữa thế giới thực và thế giới ma thuật - mở ra. Sung Jin-Woo, một thợ săn hạng E yếu đuối bất ngờ có được khả năng "Thăng Cấp" và trở thành thợ săn mạnh nhất.',
    coverImage: '/assets/Solo_Leveling_Webtoon.png',
    genres: ['Truyện Tranh (Manga/Comic)', 'Hành Động', 'Huyền Huyễn'],
    status: 'Completed',
    rating: 4.9,
    views: 3500000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: true,
    isEditorPick: false
  },
  {
    title: 'Đấu Phá Thương Khung',
    author: 'Thiên Tàm Thổ Đậu',
    description: 'Tiêu Viêm, một thiên tài tu luyện bất ngờ mất hết đấu khí, trở thành phế vật bị mọi người chê cười. Cùng với linh hồn Dược Lão trong chiếc nhẫn, hắn từng bước lấy lại vinh quang.',
    coverImage: '/assets/dau-pha-thuong-khung-phan-5-scaled.webp',
    genres: ['Huyền Huyễn', 'Hành Động', 'Tu Tiên'],
    status: 'Completed',
    rating: 4.8,
    views: 2800000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: false,
    isEditorPick: true
  },
  {
    title: 'One Piece',
    author: 'Eiichiro Oda',
    description: 'Cuộc hành trình của Monkey D. Luffy và băng hải tặc Mũ Rơm để tìm kiếm kho báu vĩ đại nhất thế giới "One Piece" và trở thành Vua Hải Tặc.',
    coverImage: '/assets/do-yall-honestly-think-elbaf-is-the-longest-one-piece-v0-224x2v5sop4g1.webp',
    genres: ['Truyện Tranh (Manga/Comic)', 'Hành Động', 'Shounen'],
    status: 'Ongoing',
    rating: 5.0,
    views: 9900000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: true,
    isEditorPick: true
  },
  {
    title: 'Phàm Nhân Tu Tiên',
    author: 'Vong Ngữ',
    description: 'Hàn Lập, một thiếu niên bình thường bỗng nhiên bước vào giang hồ, ngẫu nhiên có được bình nhỏ thần bí trợ giúp hắn trồng linh thảo, từ đó bước lên con đường tu tiên gian nan.',
    coverImage: '/assets/pham-nhan-tu-tien-vong-ngu.jpg',
    genres: ['Tu Tiên', 'Tiên Hiệp'],
    status: 'Completed',
    rating: 4.7,
    views: 2200000,
    chaptersCount: 10,
    isTrending: false,
    isFeatured: true,
    isEditorPick: false
  },
  {
    title: 'Quang Âm Chi Ngoại',
    author: 'Nhĩ Căn',
    description: 'Thiên địa là vạn vật chi khách sạn, thời gian là bách đại chi khách qua đường. Tử vong, không phải là kết thúc, mà là một sự bắt đầu mới.',
    coverImage: '/assets/quang am chi ngoai.jpg',
    genres: ['Tu Tiên', 'Huyền Huyễn'],
    status: 'Ongoing',
    rating: 4.8,
    views: 1500000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: false,
    isEditorPick: true
  },
  {
    title: 'Re:Zero',
    author: 'Tappei Nagatsuki',
    description: 'Natsuki Subaru, một học sinh trung học bình thường, bị triệu hồi đến một thế giới dị mạng. Anh phát hiện ra mình có khả năng "Trở về từ cõi chết" mỗi khi mất mạng.',
    coverImage: '/assets/re zero.jpg',
    genres: ['Xuyên Không', 'Hành Động', 'Lãng Mạn'],
    status: 'Ongoing',
    rating: 4.6,
    views: 1200000,
    chaptersCount: 10,
    isTrending: false,
    isFeatured: false,
    isEditorPick: true
  },
  {
    title: 'Classroom of the Elite',
    author: 'Shougo Kinugasa',
    description: 'Tại trường trung học phổ thông Koudo Ikusei danh tiếng, học sinh được tận hưởng sự tự do tuyệt đối. Tuy nhiên, sự thật là chỉ những học sinh xuất sắc nhất mới được hưởng những đặc quyền đó.',
    coverImage: '/assets/Yōkoso_Jitsuryoku_Shijō_Shugi_no_Kyōshitsu_e,_Volume_1.jpg',
    genres: ['Truyện Tranh (Manga/Comic)', 'Đô Thị', 'Trinh Thám'],
    status: 'Ongoing',
    rating: 4.7,
    views: 1800000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: false,
    isEditorPick: false
  },
  {
    title: 'Sword Art Online',
    author: 'Reki Kawahara',
    description: 'Vào năm 2022, trò chơi Virtual Reality Massively Multiplayer Online Role-Playing Game (VRMMORPG) đầu tiên, Sword Art Online (SAO), được ra mắt. Nhưng người chơi sớm nhận ra họ không thể đăng xuất, và cái chết trong game đồng nghĩa với cái chết ngoài đời thực.',
    coverImage: '/assets/SAO.webp',
    genres: ['Võng Du', 'Hành Động', 'Lãng Mạn', 'Khoa Huyễn'],
    status: 'Completed',
    rating: 4.8,
    views: 8500000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: true,
    isEditorPick: false
  },
  {
    title: 'Shangri-La Frontier',
    author: 'Katarina',
    description: 'Rakuro Hizutome, một game thủ chuyên chinh phục các "game rác" (kusoge). Giờ đây, cậu quyết định thử thách với Shangri-La Frontier, một siêu phẩm VR với 30 triệu người chơi để tìm kiếm cảm giác mạnh mới.',
    coverImage: '/assets/Shangri-La Frontier.jpg',
    genres: ['Võng Du', 'Hành Động', 'Hài Hước', 'Shounen'],
    status: 'Ongoing',
    rating: 4.9,
    views: 4200000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: false,
    isEditorPick: true
  },
  {
    title: 'Tiên Nghịch',
    author: 'Nhĩ Căn',
    description: 'Vương Lâm là một thiếu niên bình thường, may mắn gia nhập vào một môn phái tu tiên tàn tạ của nước Triệu. Dựa vào nỗ lực bản thân và một hạt châu thần bí, hắn bước lên con đường tu tiên đầy máu và nước mắt.',
    coverImage: '/assets/tien-nghich-nhi-can-pdf-epub-azw3-mobi.jpg',
    genres: ['Tu Tiên', 'Hành Động', 'Tiên Hiệp'],
    status: 'Completed',
    rating: 4.9,
    views: 6500000,
    chaptersCount: 10,
    isTrending: true,
    isFeatured: true,
    isEditorPick: false
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novelportal')
  .then(async () => {
    console.log('Connected to MongoDB. Wiping existing Novels and Chapters...');
    await Novel.deleteMany({});
    await Chapter.deleteMany({});
    console.log('Database wiped.');

    console.log('Inserting Manga & Tu Tien novels...');
    for (const novelData of novelsData) {
      const novel = await Novel.create(novelData);
      console.log(`Inserted Novel: ${novel.title}`);

      const chaptersToInsert = [];
      for (let i = 1; i <= 10; i++) {
        chaptersToInsert.push({
          novel: novel._id,
          chapterNumber: i,
          title: `Chương ${i}: ${novel.title} - Khởi Nguồn`,
          content: `Đây là nội dung của chương ${i} thuộc bộ truyện ${novel.title}. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nKết thúc chương ${i}.`,
          isPremium: i > 5 // Chương 6 trở đi là premium
        });
      }
      
      await Chapter.insertMany(chaptersToInsert);
      console.log(`Inserted 10 Chapters for: ${novel.title}`);
    }
    
    console.log('All done! Seeded 7 novels with 10 chapters each.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
