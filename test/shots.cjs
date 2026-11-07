const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://127.0.0.1:8777/', { waitUntil: 'networkidle' });
  await p.waitForSelector('#boot.done');
  await p.screenshot({ path: '/tmp/shot-home.png' });

  await p.click('[data-go="edukasi"]');
  await p.waitForSelector('[data-topic]');
  await p.screenshot({ path: '/tmp/shot-edukasi.png' });

  await p.click('[data-topic="kenali"]');
  await p.waitForSelector('.prose');
  await p.screenshot({ path: '/tmp/shot-topik.png', fullPage: true });

  await p.goto('http://127.0.0.1:8777/', { waitUntil: 'networkidle' });
  await p.waitForSelector('#boot.done');
  await p.click('[data-go="cerita"]');
  await p.click('[data-story="julukan"]');
  await p.waitForSelector('.opt');
  await p.screenshot({ path: '/tmp/shot-cerita.png', fullPage: true });

  await p.goto('http://127.0.0.1:8777/', { waitUntil: 'networkidle' });
  await p.waitForSelector('#boot.done');
  await p.click('[data-go="latihan"]');
  await p.click('[data-go="perasaan"]');
  await p.waitForSelector('[data-feel]');
  await p.screenshot({ path: '/tmp/shot-perasaan.png', fullPage: true });

  await b.close();
  console.log('screenshot selesai');
})();
