import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyze } from './api/analyze.ts';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const result = await analyze(req.body);
    res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Server listening on http://localhost:${PORT}`);
  console.log(`   POST /api/analyze endpoint ready`);
});
