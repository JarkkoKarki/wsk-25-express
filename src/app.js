/* eslint-disable no-undef */
import express from 'express';
import api from './api/index.js';
const app = express();
import cors from 'cors';
import path from 'path';
app.use(cors());

app.use('/public', express.static('public'));

app.use(express.json());

app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static(path.join('uploads')));
app.use('/api/v1', api);
export default app;
