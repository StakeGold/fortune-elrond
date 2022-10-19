import express, { Express } from 'express';
import dotenv from 'dotenv';
import { recordResults } from "./app/job";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
const hostname = process.env.HOSTNAME || '0.0.0.0'

app.use(express.json());
app.post('/job/results/', recordResults);

// @ts-ignore
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://${hostname}:${port}`);
});