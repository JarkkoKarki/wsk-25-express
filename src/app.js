import express from 'express';
import api from './api/index.js';
const app = express();

app.use('/public', express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1', api);

export default app;
