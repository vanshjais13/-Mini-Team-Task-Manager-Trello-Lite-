import express from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

const router = express.Router();

const taskSchema = z.object({
  title: z.string().min(2, "Task title is required"),
  description: z.string().optional().default(""),
  projectId: z.string().min(1, "Project is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["To Do", "In Progress", "Done"]).optional().default("To Do")
});

const statusSchema = z.object({
  status: z.enum(["To Do", "In Progress", "Done"])
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const query =
      req.user.role === "Admin"
        ? { createdBy: req.user._id }
        : { assignedTo: req.user._id };

    const tasks = await Task.find(query)
      .populate("projectId", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ deadline: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = taskSchema.parse(req.body);
    const project = await Project.findOne({
      _id: data.projectId,
      createdBy: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isProjectMember = project.members.some(
      (memberId) => memberId.toString() === data.assignedTo
    );

    if (!isProjectMember) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }

    const task = await Task.create({
      ...data,
      createdBy: req.user._id,
      deadline: new Date(data.deadline)
    });

    const populatedTask = await Task.findById(task._id)
      .populate("projectId", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const data = statusSchema.parse(req.body);
    const query =
      req.user.role === "Admin"
        ? { _id: req.params.id, createdBy: req.user._id }
        : { _id: req.params.id, assignedTo: req.user._id };

    const task = await Task.findOneAndUpdate(query, data, { new: true })
      .populate("projectId", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

export default router;
