import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {fetchJobResults} from "./app/job";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8081;
const hostname = process.env.HOSTNAME || '0.0.0.0';

app.use(express.json());
app.use(cors());
app.post('/job/results/', fetchJobResults);

// @ts-ignore
app.listen(port, () => {
  console.log(`⚡️[Reputation Oracle]: Server is running at https://${hostname}:${port}`);
});
