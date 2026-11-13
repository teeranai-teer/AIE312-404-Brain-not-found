import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { pool } from './db.js';

const app = express();
app.use(cors({ origin: process.env.Frontend_URL || true}));
app.use(express.json());

const portfolioData = JSON.parse(fs.readFileSync('./portfolio.json', 'utf-8'));
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = process.env.GEMINI_MODEL;


app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});