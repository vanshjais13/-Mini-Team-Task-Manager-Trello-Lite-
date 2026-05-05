import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Task } from "../models/Task.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const query =
      req.user.role === "Admin"
        ? { createdBy: req.user._id }
        : { assignedTo: req.user._id };

    const tasks = await Task.find(query);
    const now = new Date();
    const completed = tasks.filter((task) => task.status === "Done").length;
    const overdue = tasks.filter(
      (task) => task.status !== "Done" && task.deadline < now
    ).length;

    res.json({
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      overdue
    });
  } catch (error) {
    next(error);
  }
});

export default router;
