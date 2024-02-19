import express from 'express'
import setupServer  from './src/routes/index.js';


const app = express();

setupServer(app);

