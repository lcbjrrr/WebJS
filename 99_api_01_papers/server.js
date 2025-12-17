
//npm install express sqlite3 swagger-ui-express swagger-jsdoc express-validator cors

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');


const cors = require('cors'); // <-- add this

const app = express();

// enable CORS for all origins (you can restrict later)
app.use(cors());              // <-- add this

app.use(bodyParser.json());

// ==========================================
//   SQLITE CONNECTION (acme.db)
// ==========================================
const db = new sqlite3.Database('./acme.db', (err) => {
  if (err) {
    console.error('Could not connect to SQLite', err);
  } else {
    console.log('Connected to SQLite acme.db');
  }
});

// Minimal schema (adjust to your actual schema)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS authors (
      authorId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS papers (
      paperId INTEGER PRIMARY KEY AUTOINCREMENT,
      entryId TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      abstract TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS author_papers (
      authorId INTEGER NOT NULL,
      paperId INTEGER NOT NULL,
      PRIMARY KEY (authorId, paperId),
      FOREIGN KEY (authorId) REFERENCES authors(authorId),
      FOREIGN KEY (paperId) REFERENCES papers(paperId)
    )
  `);
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
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Author: {
          type: 'object',
          properties: {
            authorId: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        },
        Paper: {
          type: 'object',
          properties: {
            paperId: { type: 'integer' },
            entryId: { type: 'string' },
            title: { type: 'string' },
            abstract: { type: 'string' }
          }
        }
      }
    }
  },
  // IMPORTANT: same file, so swagger-jsdoc will definitely see comments
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
 *   post:
 *     summary: Add a new Author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       201:
 *         description: Author created
 *       400:
 *         description: Author already registered
 */
app.post('/authors', (req, res) => {
  const { name, email } = req.body;

  db.get('SELECT * FROM authors WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (row) {
      return res
        .status(400)
        .send(`Author with email ${email} is already registered.`);
    }

    db.run(
      'INSERT INTO authors (name, email) VALUES (?, ?)',
      [name, email],
      function (err2) {
        if (err2) return res.status(500).send(err2.message);
        return res.status(201).end();
      }
    );
  });
});

/**
 * @swagger
 * /authors/{authorId}:
 *   put:
 *     summary: Update an existing Author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       200:
 *         description: Author updated
 *       400:
 *         description: Bad request
 */
app.put('/authors/:authorId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  const { authorId: bodyId, name, email } = req.body;

  if (bodyId !== authorId) {
    return res.status(400).send('Path ID and Body ID do not match.');
  }

  db.get(
    'SELECT * FROM authors WHERE email = ? AND authorId <> ?',
    [email, authorId],
    (err, existing) => {
      if (err) return res.status(500).send(err.message);
      if (existing) {
        return res
          .status(400)
          .send('Email already in use by another author.');
      }

      db.run(
        'UPDATE authors SET name = ?, email = ? WHERE authorId = ?',
        [name, email, authorId],
        function (err2) {
          if (err2) return res.status(500).send(err2.message);
          if (this.changes === 0) {
            return res.status(400).send('Author ID not found.');
          }
          return res.status(200).end();
        }
      );
    }
  );
});

/**
 * @swagger
 * /authors/{authorId}:
 *   delete:
 *     summary: Delete an Author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No content
 */
app.delete('/authors/:authorId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  db.run('DELETE FROM authors WHERE authorId = ?', [authorId], function (err) {
    if (err) return res.status(500).send(err.message);
    return res.status(204).end();
  });
});

/**
 * @swagger
 * /authors/{authorId}:
 *   get:
 *     summary: Get an Author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Author found
 *       404:
 *         description: Author not found
 */
app.get('/authors/:authorId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  db.get(
    'SELECT * FROM authors WHERE authorId = ?',
    [authorId],
    (err, row) => {
      if (err) return res.status(500).send(err.message);
      if (!row) return res.status(404).end();
      return res.status(200).json(row);
    }
  );
});

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all Authors ordered by name
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of authors
 */
app.get('/authors', (req, res) => {
  db.all('SELECT * FROM authors ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    return res.status(200).json(rows);
  });
});

/**
 * @swagger
 * /authors/count:
 *   get:
 *     summary: Count Authors
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: Number of authors
 */
app.get('/authors/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM authors', [], (err, row) => {
    if (err) return res.status(500).send(err.message);
    return res.status(200).json(row.count);
  });
});

/**
 * @swagger
 * /authors/is-registered:
 *   get:
 *     summary: Check if Author email is registered
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Boolean result
 */
app.get('/authors/is-registered', (req, res) => {
  const { email } = req.query;
  db.get('SELECT 1 FROM authors WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).send(err.message);
    return res.status(200).json(!!row);
  });
});

// ==========================================
//           PAPER ENDPOINTS
// ==========================================

/**
 * @swagger
 * /papers:
 *   post:
 *     summary: Add a new Paper
 *     tags: [Papers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paper'
 *     responses:
 *       201:
 *         description: Paper created
 *       400:
 *         description: Paper already exists
 */
app.post('/papers', (req, res) => {
  const { entryId, title, abstract } = req.body;

  db.get('SELECT * FROM papers WHERE entryId = ?', [entryId], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (row) {
      return res
        .status(400)
        .send(`Paper with entryId ${entryId} already exists.`);
    }

    db.run(
      'INSERT INTO papers (entryId, title, abstract) VALUES (?, ?, ?)',
      [entryId, title, abstract],
      function (err2) {
        if (err2) return res.status(500).send(err2.message);
        return res.status(201).end();
      }
    );
  });
});

/**
 * @swagger
 * /papers/{paperId}:
 *   put:
 *     summary: Update an existing Paper
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paper'
 *     responses:
 *       200:
 *         description: Paper updated
 *       400:
 *         description: Bad request
 */
app.put('/papers/:paperId', (req, res) => {
  const paperId = parseInt(req.params.paperId, 10);
  const { paperId: bodyId, entryId, title, abstract } = req.body;

  if (bodyId !== paperId) {
    return res.status(400).send('Path ID and Body ID do not match.');
  }

  db.get(
    'SELECT * FROM papers WHERE entryId = ? AND paperId <> ?',
    [entryId, paperId],
    (err, existing) => {
      if (err) return res.status(500).send(err.message);
      if (existing) {
        return res
          .status(400)
          .send('EntryID already in use by another paper.');
      }
      db.run(
        'UPDATE papers SET entryId = ?, title = ?, abstract = ? WHERE paperId = ?',
        [entryId, title, abstract, paperId],
        function (err2) {
          if (err2) return res.status(500).send(err2.message);
          if (this.changes === 0) {
            return res.status(400).send('Paper ID not found.');
          }
          return res.status(200).end();
        }
      );
    }
  );
});

/**
 * @swagger
 * /papers/{paperId}:
 *   delete:
 *     summary: Delete a Paper
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No content
 */
app.delete('/papers/:paperId', (req, res) => {
  const paperId = parseInt(req.params.paperId, 10);
  db.run('DELETE FROM papers WHERE paperId = ?', [paperId], function (err) {
    if (err) return res.status(500).send(err.message);
    return res.status(204).end();
  });
});

/**
 * @swagger
 * /papers/{paperId}:
 *   get:
 *     summary: Get a Paper by ID
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paper found
 *       404:
 *         description: Paper not found
 */
app.get('/papers/:paperId', (req, res) => {
  const paperId = parseInt(req.params.paperId, 10);
  db.get('SELECT * FROM papers WHERE paperId = ?', [paperId], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).end();
    return res.status(200).json(row);
  });
});

/**
 * @swagger
 * /papers:
 *   get:
 *     summary: Get all Papers ordered by title
 *     tags: [Papers]
 *     responses:
 *       200:
 *         description: List of papers
 */
app.get('/papers', (req, res) => {
  db.all('SELECT * FROM papers ORDER BY title', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    return res.status(200).json(rows);
  });
});

/**
 * @swagger
 * /papers/count:
 *   get:
 *     summary: Count Papers
 *     tags: [Papers]
 *     responses:
 *       200:
 *         description: Number of papers
 */
app.get('/papers/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM papers', [], (err, row) => {
    if (err) return res.status(500).send(err.message);
    return res.status(200).json(row.count);
  });
});

/**
 * @swagger
 * /papers/is-existing:
 *   get:
 *     summary: Check if Paper entryId exists
 *     tags: [Papers]
 *     parameters:
 *       - in: query
 *         name: entryId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Boolean result
 */
app.get('/papers/is-existing', (req, res) => {
  const { entryId } = req.query;
  db.get('SELECT 1 FROM papers WHERE entryId = ?', [entryId], (err, row) => {
    if (err) return res.status(500).send(err.message);
    return res.status(200).json(!!row);
  });
});

/**
 * @swagger
 * /keywords:
 *   get:
 *     summary: Extract keywords from abstracts (stub)
 *     tags: [Papers]
 *     responses:
 *       200:
 *         description: DONE
 */
app.get('/keywords', (req, res) => {
  // TODO: implement real logic
  res.status(200).send('DONE!');
});

/**
 * @swagger
 * /pdf/{paperId}:
 *   get:
 *     summary: Download Paper PDF (stub)
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Email sent
 */
app.get('/pdf/:paperId', (req, res) => {
  const paperId = parseInt(req.params.paperId, 10);
  const pdfName = `paper-${paperId}.pdf`; // stub
  res.status(200).send(`Check your email for PDF ${pdfName}`);
});

// ==========================================
//   LINK / UNLINK AUTHOR <-> PAPER
// ==========================================

/**
 * @swagger
 * /authors/{authorId}/papers/{paperId}:
 *   put:
 *     summary: Link Paper to Author
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Linked
 */
app.put('/authors/:authorId/papers/:paperId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  const paperId = parseInt(req.params.paperId, 10);
  db.run(
    'INSERT OR IGNORE INTO author_papers (authorId, paperId) VALUES (?, ?)',
    [authorId, paperId],
    function (err) {
      if (err) return res.status(500).send(err.message);
      return res.status(204).end();
    }
  );
});

/**
 * @swagger
 * /authors/{authorId}/papers/{paperId}:
 *   delete:
 *     summary: Unlink Paper from Author
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Unlinked
 */
app.delete('/authors/:authorId/papers/:paperId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  const paperId = parseInt(req.params.paperId, 10);
  db.run(
    'DELETE FROM author_papers WHERE authorId = ? AND paperId = ?',
    [authorId, paperId],
    function (err) {
      if (err) return res.status(500).send(err.message);
      return res.status(204).end();
    }
  );
});

/**
 * @swagger
 * /papers/{paperId}/authors/{authorId}:
 *   put:
 *     summary: Link Author to Paper
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Linked
 */
app.put('/papers/:paperId/authors/:authorId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  const paperId = parseInt(req.params.paperId, 10);
  db.run(
    'INSERT OR IGNORE INTO author_papers (authorId, paperId) VALUES (?, ?)',
    [authorId, paperId],
    function (err) {
      if (err) return res.status(500).send(err.message);
      return res.status(204).end();
    }
  );
});

/**
 * @swagger
 * /papers/{paperId}/authors/{authorId}:
 *   delete:
 *     summary: Unlink Author from Paper
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Unlinked
 */
app.delete('/papers/:paperId/authors/:authorId', (req, res) => {
  const authorId = parseInt(req.params.authorId, 10);
  const paperId = parseInt(req.params.paperId, 10);
  db.run(
    'DELETE FROM author_papers WHERE authorId = ? AND paperId = ?',
    [authorId, paperId],
    function (err) {
      if (err) return res.status(500).send(err.message);
      return res.status(204).end();
    }
  );
});

// ==========================================
//             START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ACME API listening at http://localhost:${PORT}`);
  console.log(`Swagger UI at http://localhost:${PORT}/api-docs`);
});
