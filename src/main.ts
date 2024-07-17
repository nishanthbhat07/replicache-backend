import 'dotenv/config';
import path from 'path';
import {mutators} from './mutators.js';
import {fileURLToPath} from 'url';
import express from 'express';
import type Express from 'express';
import {handleRequest} from './endpoints/handle-request.js';

import fs from 'fs';
import {handlePoke} from './endpoints/handle-poke.js';
import morgan from 'morgan'
import { handleReadRequest } from './endpoints/handle-read-request.js';
import { handleSyncIusses } from './github-issues.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portEnv = parseInt(process.env.PORT || '');
const port = Number.isInteger(portEnv) ? portEnv : 8080;
const options = {
  mutators,
  port,
  host: process.env.HOST || '127.0.0.1',
};

const default_dist = path.join(__dirname, '../dist/dist');

const app = express();

const errorHandler = (
  err: Error,
  _req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) => {
  res.status(500).send(err.message);
  next(err);
};

app.use(morgan("dev"))
app.use(express.urlencoded({extended: true}), express.json(), errorHandler);

app.post(
  '/api/replicache/:op',
  async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ) => {
    await handleRequest(req, res, next, mutators);
  },
);
app.get(
  '/api/replicache/poke',
  async (req: Express.Request, res: Express.Response) => {
    await handlePoke(req, res);
  },
);

app.get('/api/replicache/createSpace',async (  _req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,)=>{
    await handleReadRequest(res,next);
  })

app.post("/sync-issues", async (req: Express.Request,
  res: Express.Response,
  _next: Express.NextFunction)=>{
    await handleSyncIusses(req,res)
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(default_dist));
  app.get('/health', (_req, res) => {
    res.send('ok');
  });
  app.use('*', (_req, res) => {
    const index = path.join(default_dist, 'index.html');
    const html = fs.readFileSync(index, 'utf8');
    res.status(200).set({'Content-Type': 'text/html'}).end(html);
  });
}

app.listen(options.port, options.host, () => {
  console.log(`Server listening on ${options.host}:${options.port}`);
});
