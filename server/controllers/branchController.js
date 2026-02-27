import {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch
} from '../models/branchModel.js';

export const listBranches = async (req, res) => {
  const branches = await getAllBranches();
  res.json(branches);
};

export const addBranch = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const branch = await createBranch(name);
  res.status(201).json(branch);
};

export const editBranch = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const branch = await updateBranch(id, name);
  res.json(branch);
};

export const removeBranch = async (req, res) => {
  const { id } = req.params;
  await deleteBranch(id);
  res.json({ id });
};
