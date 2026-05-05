import express from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";

const router = express.Router();

const projectSchema = z.object({
  title: z.string().min(2, "Project title is required"),
  description: z.string().optional().default(""),
  members: z.array(z.string()).optional().default([])
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const query =
      req.user.role === "Admin"
        ? { createdBy: req.user._id }
        : { members: req.user._id };

    const projects = await Project.find(query)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = projectSchema.parse(req.body);
    const validMembers = await User.find({ _id: { $in: data.members } }).select("_id");
    const memberIds = validMembers.map((member) => member._id);

    const project = await Project.create({
      title: data.title,
      description: data.description,
      createdBy: req.user._id,
      members: memberIds
    });

    const populatedProject = await Project.findById(project._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    res.status(201).json(populatedProject);
  } catch (error) {
    next(error);
  }
});

export default router;
