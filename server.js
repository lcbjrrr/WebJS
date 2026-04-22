// npm install express sqlite3 swagger-ui-express swagger-jsdoc express-validator cors

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==========================================
//   SQLITE CONNECTION (acme.db)
// ==========================================
const db = new sqlite3.Database('./acme.db', (err) => {
  if (err) console.error('Could not connect to SQLite', err);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS authors (
    authorId INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS papers (
    paperId INTEGER PRIMARY KEY AUTOINCREMENT,
    entryId TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS author_papers (
    authorId INTEGER NOT NULL,
    paperId INTEGER NOT NULL,
    PRIMARY KEY (authorId, paperId),
    FOREIGN KEY (authorId) REFERENCES authors(authorId) ON DELETE CASCADE,
    FOREIGN KEY (paperId) REFERENCES papers(paperId) ON DELETE CASCADE
  )`);
});

// ==========================================
//           SWAGGER SETUP
// ==========================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ACME Author/Paper API',
      version: '1.0.0',
      description: 'Express + SQLite version of the ACME REST API'
    },
    servers: [{ url: 'https://papers-knol.onrender.com' }, { url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Author: {
          type: 'object',
          properties: {
            authorId: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            papers: { type: 'array', items: { $ref: '#/components/schemas/Paper' } }
          }
        },
        Paper: {
          type: 'object',
          properties: {
            paperId: { type: 'integer' },
            entryId: { type: 'string' },
            title: { type: 'string' },
            abstract: { type: 'string' },
            authors: { type: 'array', items: { $ref: '#/components/schemas/Author' } }
          }
        }
      }
    }
  },
  apis: [__filename]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
//           AUTHOR ENDPOINTS
// ==========================================

/**
 * @swagger
 * /authors:
 * post:
 * summary: Add a new Author
 * tags: [Authors]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Author'
 * responses:
 * 201:
 * description: Author created
 * get:
 * summary: Get all Authors ordered by name
 * tags: [Authors]
 * responses:
 * 200:
 * description: List of authors
 */
app.post('/authors', (req, res) => {
  const { name, email } = req.body;
  db.run('INSERT INTO authors (name, email) VALUES (?, ?)', [name, email], function(err) {
    if (err) return res.status(400).send(err.message);
    res.status(201).end();
  });
});

app.get('/authors', (req, res) => {
  db.all('SELECT * FROM authors ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.status(200).json(rows);
  });
});

/**
 * @swagger
 * /authors/{authorId}:
 * get:
 * summary: Get Author by ID with Papers
 * tags: [Authors]
 * parameters:
 * - in: path
 * name: authorId
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Author found
 * delete:
 * summary: Delete an Author
 * tags: [Authors]
 * parameters:
 * - in: path
 * name: authorId
 * required: true
 * schema:
 * type: integer
 * responses:
 * 204:
 * description: Deleted
 */
app.get('/authors/:authorId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  db.get('SELECT * FROM authors WHERE authorId = ?', [authorId], (err, author) => {
    if (err) return res.status(500).send(err.message);
    if (!author) return res.status(404).end();

    db.all(`SELECT p.* FROM papers p JOIN author_papers ap ON p.paperId = ap.paperId WHERE ap.authorId = ?`, [authorId], (err2, papers) => {
      author.papers = papers || [];
      res.status(200).json(author);
    });
  });
});

app.delete('/authors/:authorId', (req, res) => {
  db.run('DELETE FROM authors WHERE authorId = ?', [req.params.authorId], () => res.status(204).end());
});

// ==========================================
//           PAPER ENDPOINTS
// ==========================================

/**
 * @swagger
 * /papers:
 * post:
 * summary: Add a new Paper
 * tags: [Papers]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Paper'
 * responses:
 * 201:
 * description: Paper created
 * get:
 * summary: Get all Papers
 * tags: [Papers]
 * responses:
 * 200:
 * description: List of papers
 */
app.post('/papers', (req, res) => {
  const { entryId, title, abstract } = req.body;
  db.run('INSERT INTO papers (entryId, title, abstract) VALUES (?, ?, ?)', [entryId, title, abstract], function(err) {
    if (err) return res.status(400).send(err.message);
    res.status(201).end();
  });
});

app.get('/papers', (req, res) => {
  db.all('SELECT * FROM papers ORDER BY title', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.status(200).json(rows);
  });
});

/**
 * @swagger
 * /papers/{paperId}:
 * get:
 * summary: Get Paper by ID with Authors
 * tags: [Papers]
 * parameters:
 * - in: path
 * name: paperId
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Paper found
 */
app.get('/papers/:paperId', (req, res) => {
  const paperId = parseInt(req.params.paperId, 10);
  db.get('SELECT * FROM papers WHERE paperId = ?', [paperId], (err, paper) => {
    if (err) return res.status(500).send(err.message);
    if (!paper) return res.status(404).end();

    db.all(`SELECT a.* FROM authors a JOIN author_papers ap ON a.authorId = ap.authorId WHERE ap.paperId = ?`, [paperId], (err2, authors) => {
      paper.authors = authors || [];
      res.status(200).json(paper);
    });
  });
});

// ==========================================
//           LINKING ENDPOINTS
// ==========================================

/**
 * @swagger
 * /papers/{paperId}/authors/{authorId}:
 * put:
 * summary: Link Author to Paper
 * tags: [Links]
 * parameters:
 * - in: path
 * name: paperId
 * required: true
 * - in: path
 * name: authorId
 * required: true
 * responses:
 * 204:
 * description: Linked
 */
app.put('/papers/:paperId/authors/:authorId', (req, res) => {
  db.run('INSERT OR IGNORE INTO author_papers (authorId, paperId) VALUES (?, ?)', [req.params.authorId, req.params.paperId], () => res.status(204).end());
});

app.put('/authors/:authorId/papers/:paperId', (req, res) => {
  db.run('INSERT OR IGNORE INTO author_papers (authorId, paperId) VALUES (?, ?)', [req.params.authorId, req.params.paperId], () => res.status(204).end());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
