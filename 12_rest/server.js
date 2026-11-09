const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const app = express();
const PORT = 3000;
app.use(cors());
const swaggerDocument = {
openapi: '3.0.3',
info: {
 title: 'Date API',
 version: '1.0.0',
 description: 'Returns the current server date in several formats.'},
servers: [{ url: `http://localhost:${PORT}` }],
paths: {
 '/date': {
   get: {
     summary: 'Get the current date',
     responses: {
       200: {
         description: 'Current date',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 current_date: { type: 'string', example: 'Fri Nov 06 2026' }}}}}}}}}}};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => res.json(swaggerDocument));


app.get('/date', (req, res) => {
const now = new Date();
// Returning a JSON object is standard for REST APIs
res.json({current_date: now.toDateString()});
});
app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}/date`);
});



