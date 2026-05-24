const mongoose = require('mongoose');
require('dotenv').config();
const Novel = require('./models/Novel');

const tuTienNovels = [
  {
    title: 'Tiên Nghịch',
    author: 'Nhĩ Căn',
    description: 'Vương Lâm là một thiếu niên bình thường, may mắn gia nhập vào một môn phái tu tiên tàn tạ của nước Triệu. Dựa vào nỗ lực bản thân và một hạt châu thần bí, hắn bước lên con đường tu tiên đầy máu và nước mắt.',
    coverImage: 'https://cdn.waka.vn/dnn/d/s/3/5/3/1/1/1/tien-nghich.jpg',
    genres: ['Tu Tiên', 'Hành Động', 'Tiên Hiệp'],
    status: 'Completed',
    rating: 4.9,
    views: 1500000,
    chaptersCount: 2088,
    isTrending: true,
    isFeatured: true
  },
  {
    title: 'Quang Âm Chi Ngoại',
    author: 'Nhĩ Căn',
    description: 'Thiên địa là vạn vật chi khách sạn, thời gian là bách đại chi khách qua đường. Tử vong, không phải là kết thúc, mà là một sự bắt đầu mới.',
    coverImage: 'https://static.cdnno.com/poster/quang-am-chi-ngoai/300.jpg?1654877395',
    genres: ['Tu Tiên', 'Huyền Huyễn'],
    status: 'Ongoing',
    rating: 4.8,
    views: 850000,
    chaptersCount: 1250,
    isTrending: true,
    isEditorPick: true
  },
  {
    title: 'Phàm Nhân Tu Tiên',
    author: 'Vong Ngữ',
    description: 'Hàn Lập, một thiếu niên bình thường bỗng nhiên bước vào giang hồ, ngẫu nhiên có được bình nhỏ thần bí trợ giúp hắn trồng linh thảo, từ đó bước lên con đường tu tiên gian nan.',
    coverImage: 'https://static.cdnno.com/poster/pham-nhan-tu-tien/300.jpg',
    genres: ['Tu Tiên', 'Tiên Hiệp'],
    status: 'Completed',
    rating: 4.9,
    views: 2000000,
    chaptersCount: 2446,
    isFeatured: true
  },
  {
    title: 'Ngã Dục Phong Thiên',
    author: 'Nhĩ Căn',
    description: 'Nếu ta muốn có, thiên không thể không. Nếu ta muốn không, thiên không được có!',
    coverImage: 'https://static.cdnno.com/poster/nga-duc-phong-thien/300.jpg',
    genres: ['Tu Tiên', 'Hài Hước', 'Tiên Hiệp'],
    status: 'Completed',
    rating: 4.7,
    views: 1200000,
    chaptersCount: 1614,
    isEditorPick: true
  },
  {
    title: 'Cầu Ma',
    author: 'Nhĩ Căn',
    description: 'Ma tiền nhất khấu tam thiên niên, hồi thủ phàm trần bất tố tiên. Một câu chuyện bi tráng về Tô Minh và hành trình tìm kiếm sự thật.',
    coverImage: 'https://static.cdnno.com/poster/cau-ma/300.jpg',
    genres: ['Tu Tiên', 'Bi Kịch', 'Huyền Huyễn'],
    status: 'Completed',
    rating: 4.8,
    views: 950000,
    chaptersCount: 1484,
    isTrending: true
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Inserting Tu Tien novels...');
    for (const novel of tuTienNovels) {
      const existing = await Novel.findOne({ title: novel.title });
      if (!existing) {
        await Novel.create(novel);
        console.log('Inserted:', novel.title);
      } else {
        console.log('Already exists:', novel.title);
      }
    }
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
