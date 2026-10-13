import http from 'node:http';

let retryAttempts = 0;

const citation = {
  id: 'cornell-dog-diet',
  title: 'Re-evaluating your dog’s diet',
  publisher: 'Cornell University College of Veterinary Medicine — Riney Canine Health Center',
  url: 'https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-information/re-evaluating-your-dog-s-diet',
  topic: 'dog nutrition',
  passageId: 'cornell-dog-diet#p1',
};

function send(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }
  if (req.method !== 'POST' || req.url !== '/api/chat') {
    send(res, 404, { error: { message: 'Not found' } });
    return;
  }

  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    const parsed = JSON.parse(body);
    const latest = parsed.messages?.at(-1)?.content || '';
    if (/retry/i.test(latest) && retryAttempts++ === 0) {
      send(res, 503, { error: { message: 'Temporary local test error.' } });
      return;
    }
    send(res, 200, {
      data: {
        message: 'Choose a complete and balanced food appropriate for your dog’s life stage.',
        urgent: false,
        promptVersion: 'petpal-pet-care-rag-v1',
        citations: [citation],
      },
    });
  });
});

server.listen(4000, '127.0.0.1', () => {
  console.log('Local chat stub listening on http://127.0.0.1:4000');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
