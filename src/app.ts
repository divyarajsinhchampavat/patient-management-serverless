import express from 'express';
import serverless from 'serverless-http';
import patientRoutes from './routes/patientRoutes';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(express.json());

// Your routes
app.use('/patients', patientRoutes);


app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(404).send();
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500).send();
});
app.listen(3000, () => {
  console.log("App is running on port 3000");
}
)

export const handler = serverless(app);