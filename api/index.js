import express from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let routesRegistered = false;
let routesPromise = null;

export default async function handler(req, res) {
  if (!routesRegistered) {
    if (!routesPromise) {
      routesPromise = registerRoutes(app);
    }
    await routesPromise;
    routesRegistered = true;
  }

  return app(req, res);
}
