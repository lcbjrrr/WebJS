// REST API for Papers & Authors (many-to-many) with categorical domain validation.
// Run with: npm run api   (listens on http://localhost:3000 by default)
// Data is persisted to src/api/data.json.

import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Domains (valid values for categorical fields)
// ---------------------------------------------------------------------------
const PAPER_ENTRY_IDS = ['CSC', 'Econ', 'Bus', 'Bio', 'Law', 'Eng'];
const AUTHOR_RANKS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Researcher',
  'PhD Student',
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Persistence (simple JSON file)
// ---------------------------------------------------------------------------
const seed = () => ({
  nextAuthorId: 3,
  nextPaperId: 4,
  authors: [
    { authorId: 1, name: 'Ada Lovelace', email: 'ada@example.com', rank: 'Professor' },
    { authorId: 2, name: 'Alan Turing', email: 'alan@example.com', rank: 'Researcher' },
  ],
  papers: [
    { paperId: 1, entryId: 'CSC', title: 'Deep Learning Fundamentals', abstract: 'An overview of deep learning techniques.' },
    { paperId: 2, entryId: 'Eng', title: 'Quantum Computing Advances', abstract: 'Recent progress in quantum hardware and algorithms.' },
    { paperId: 3, entryId: 'Bio', title: 'Climate Modeling with Neural Nets', abstract: 'Applying ML to climate prediction models.' },
  ],
  links: [
    { authorId: 1, paperId: 1 },
    { authorId: 2, paperId: 1 },
    { authorId: 2, paperId: 2 },
  ],
});

const load = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    const data = seed();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return data;
  }
};

let db = load();
const save = () => fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const findAuthor = (id) => db.authors.find((a) => a.authorId === Number(id));
const findPaper = (id) => db.papers.find((p) => p.paperId === Number(id));
const papersOf = (authorId) =>
  db.links.filter((l) => l.authorId === authorId).map((l) => findPaper(l.paperId)).filter(Boolean);
const authorsOf = (paperId) =>
  db.links.filter((l) => l.paperId === paperId).map((l) => findAuthor(l.authorId)).filter(Boolean);

const isBlank = (v) => typeof v !== 'string' || v.trim() === '';

// Returns an error message, or null if the author payload is valid.
const validateAuthor = ({ name, email, rank } = {}) => {
  if (isBlank(name)) return 'Name is required.';
  if (isBlank(email) || !EMAIL_REGEX.test(email.trim())) return `Invalid email: '${email ?? ''}'.`;
  if (!AUTHOR_RANKS.includes(rank)) return `Invalid rank '${rank ?? ''}'. Allowed values: ${AUTHOR_RANKS.join(', ')}.`;
  return null;
};

const validatePaper = ({ entryId, title } = {}) => {
  if (!PAPER_ENTRY_IDS.includes(entryId)) return `Invalid entryId '${entryId ?? ''}'. Allowed values: ${PAPER_ENTRY_IDS.join(', ')}.`;
  if (isBlank(title)) return 'Title is required.';
  return null;
};

const addLink = (authorId, paperId) => {
  if (!db.links.some((l) => l.authorId === authorId && l.paperId === paperId)) {
    db.links.push({ authorId, paperId });
    save();
  }
};
const removeLink = (authorId, paperId) => {
  db.links = db.links.filter((l) => !(l.authorId === authorId && l.paperId === paperId));
  save();
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// --- Domain endpoints (must be registered before the /:id routes) ---------
app.get('/papers/entry-ids', (req, res) => res.json(PAPER_ENTRY_IDS));
app.get('/authors/ranks', (req, res) => res.json(AUTHOR_RANKS));

// --- Authors CRUD ----------------------------------------------------------
app.get('/authors', (req, res) => res.json(db.authors));

app.get('/authors/:authorId', (req, res) => {
  const author = findAuthor(req.params.authorId);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  res.json({ ...author, papers: papersOf(author.authorId) });
});

app.post('/authors', (req, res) => {
  const err = validateAuthor(req.body);
  if (err) return res.status(400).json({ error: err });
  const { name, email, rank } = req.body;
  const author = { authorId: db.nextAuthorId++, name: name.trim(), email: email.trim(), rank };
  db.authors.push(author);
  save();
  res.status(201).json(author);
});

app.put('/authors/:authorId', (req, res) => {
  const author = findAuthor(req.params.authorId);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  const err = validateAuthor(req.body);
  if (err) return res.status(400).json({ error: err });
  const { name, email, rank } = req.body;
  Object.assign(author, { name: name.trim(), email: email.trim(), rank });
  save();
  res.json(author);
});

app.delete('/authors/:authorId', (req, res) => {
  const author = findAuthor(req.params.authorId);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  db.authors = db.authors.filter((a) => a !== author);
  db.links = db.links.filter((l) => l.authorId !== author.authorId);
  save();
  res.json({ message: 'Author deleted.' });
});

// --- Papers CRUD -----------------------------------------------------------
app.get('/papers', (req, res) => res.json(db.papers));

app.get('/papers/:paperId', (req, res) => {
  const paper = findPaper(req.params.paperId);
  if (!paper) return res.status(404).json({ error: 'Paper not found.' });
  res.json({ ...paper, authors: authorsOf(paper.paperId) });
});

app.post('/papers', (req, res) => {
  const err = validatePaper(req.body);
  if (err) return res.status(400).json({ error: err });
  const { entryId, title, abstract = '' } = req.body;
  const paper = { paperId: db.nextPaperId++, entryId, title: title.trim(), abstract };
  db.papers.push(paper);
  save();
  res.status(201).json(paper);
});

app.put('/papers/:paperId', (req, res) => {
  const paper = findPaper(req.params.paperId);
  if (!paper) return res.status(404).json({ error: 'Paper not found.' });
  const err = validatePaper(req.body);
  if (err) return res.status(400).json({ error: err });
  const { entryId, title, abstract = '' } = req.body;
  Object.assign(paper, { entryId, title: title.trim(), abstract });
  save();
  res.json(paper);
});

app.delete('/papers/:paperId', (req, res) => {
  const paper = findPaper(req.params.paperId);
  if (!paper) return res.status(404).json({ error: 'Paper not found.' });
  db.papers = db.papers.filter((p) => p !== paper);
  db.links = db.links.filter((l) => l.paperId !== paper.paperId);
  save();
  res.json({ message: 'Paper deleted.' });
});

// --- Relationship management (from either side) ---------------------------
const linkHandler = (action) => (req, res) => {
  const author = findAuthor(req.params.authorId);
  const paper = findPaper(req.params.paperId);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  if (!paper) return res.status(404).json({ error: 'Paper not found.' });
  action(author.authorId, paper.paperId);
  res.json({ message: action === addLink ? 'Linked.' : 'Unlinked.' });
};

app.put('/authors/:authorId/papers/:paperId', linkHandler(addLink));
app.delete('/authors/:authorId/papers/:paperId', linkHandler(removeLink));
app.put('/papers/:paperId/authors/:authorId', linkHandler(addLink));
app.delete('/papers/:paperId/authors/:authorId', linkHandler(removeLink));

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
