import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const app = express();

const PORT = process.env.API_PORT_INTERNAL;

app.get("/", (request: Request, response: Response) => { 
  response.status(200).send("Hello World-42");
}); 

app.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT); 
}).on("error", (error) => {
  throw new Error(error.message);
});