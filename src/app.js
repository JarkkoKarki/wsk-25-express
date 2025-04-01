import express from 'express';
import api from './api/index.js';
import path from 'path';
const app = express();

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  const filePath = path.join(path.resolve(), 'src', 'frontpage', 'hello.html'); // Construct absolute path
  res.sendFile(filePath);
});

app.use(
  '/frontpage',
  express.static(path.join(path.resolve(), 'src', 'frontpage'))
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1', api);

export default app;
