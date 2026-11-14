// 빌드된 React 앱을 서빙한다. 기록은 URL에만 담기므로 저장 API·DB는 없다.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'dist');

const app = express();

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

const port = Number(process.env.PORT) || 3000;
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`화장실 허가증 → http://localhost:${port}`));
}

export default app;
