const fs = require('fs');
const path = require('path');
const https = require('https');

const images = [
  {
    name: 'samosa.jpg',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'biryani.jpg',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'chips_bowl.jpg',
    url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'lays_packet.jpg',
    url: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'shop_canteen.jpg',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'shop_royal.jpg',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'shop_chai.jpg',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'shop_yat.jpg',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'
  }
];

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(__dirname, '../public/images', item.name);
    const file = fs.createWriteStream(dest);

    const get = (url) => {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${item.name}`);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        console.error(`Error downloading ${item.name}:`, err.message);
        reject(err);
      });
    };
    get(item.url);
  });
}

async function run() {
  for (const img of images) {
    try {
      await download(img);
    } catch (e) {
      console.error(e);
    }
  }
}
run();
