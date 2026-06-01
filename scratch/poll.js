import https from 'https';

function check() {
  https.get('https://weissv.github.io/enigma/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.includes('assets/index')) {
        console.log('DEPLOYMENT FINISHED!');
        process.exit(0);
      } else {
        console.log('Still waiting... retrying in 10s');
        setTimeout(check, 10000);
      }
    });
  }).on('error', (e) => {
    console.error(e);
    setTimeout(check, 10000);
  });
}

check();
