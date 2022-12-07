import express, { Express } from 'express';
import dotenv from 'dotenv';
import { recordResults } from "./app/job";
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
const hostname = process.env.HOSTNAME || '0.0.0.0'

app.use(cors());
app.use(express.json());
app.post('/job/results/', recordResults);

// @ts-ignore
app.listen(port, () => {
  console.log(`⚡️[Recording Oracle]: Server is running at https://${hostname}:${port}`);
});