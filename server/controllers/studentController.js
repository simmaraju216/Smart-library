import bcrypt from 'bcryptjs';
import { createStudent, deleteStudentById, getAllStudents, updateStudentRoleById, updateStudentById } from '../models/studentModel.js';
// Update student details (name, year, student_id)
export const updateStudent = async (req, res) => {
  const studentId = Number(req.params.id);
  const allowedFields = ['name', 'year', 'student_id', 'email'];
  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  const affectedRows = await updateStudentById(studentId, data);
  if (!affectedRows) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json({ message: 'Student updated' });
};

export const listStudents = async (req, res) => {
  let rows = await getAllStudents();
  const { batch_id, branch_id } = req.query;
  if (batch_id) {
    rows = rows.filter(s => String(s.batch_id) === String(batch_id));
  }
  if (branch_id) {
    rows = rows.filter(s => String(s.branch_id) === String(branch_id));
  }
  res.json(rows);
};

export const addStudent = async (req, res) => {
  const { student_id, name, email, phone, batch_id, branch_id, year } = req.body;
  const passwordHash = await bcrypt.hash('Welcome@123', 10);
  const id = await createStudent({ student_id, name, email, phone, passwordHash, batch_id, branch_id, year });
  res.status(201).json({ id, message: 'Student created' });
};

export const setStudentRole = async (req, res) => {
  const studentId = Number(req.params.id);
  const { role } = req.body;

  if (!['admin', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const affectedRows = await updateStudentRoleById(studentId, role);
  if (!affectedRows) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json({ message: `Role updated to ${role}` });
};

export const removeStudent = async (req, res) => {
  const studentId = Number(req.params.id);
  const affectedRows = await deleteStudentById(studentId);

  if (!affectedRows) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json({ message: 'Student removed' });
};