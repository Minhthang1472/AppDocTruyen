const http = require('http');
http.get('http://localhost:5000/assets/Solo_Leveling_Webtoon.png', (res) => {
    console.log('Status:', res.statusCode);
    process.exit(0);
}).on('error', (e) => {
    console.error(e);
    process.exit(1);
});
