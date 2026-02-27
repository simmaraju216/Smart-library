import { useEffect, useState } from 'react';
import { addStudent, deleteStudent, getStudents, setStudentRole } from '../../services/studentService';
import { getBatches } from '../../services/batchService';
import api from '../../services/api';

const AddStudent = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', batch_id: '', branch_id: '', year: 1 });
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [msg, setMsg] = useState('');
  const [students, setStudents] = useState([]);

  const loadStudents = async () => {
    const data = await getStudents();
    setStudents(data);
  };

  // Helper to reload batches and branches
  const loadBatchesAndBranches = async () => {
    getBatches().then(setBatches);
    api.get('/branches').then(res => setBranches(res.data));
  };

  useEffect(() => {
    loadStudents();
    loadBatchesAndBranches();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const data = await addStudent(form);
    setMsg(data.message);
    setForm({ name: '', email: '', phone: '', batch_id: '', branch_id: '', year: 1 });
    await loadStudents();
    await loadBatchesAndBranches(); // In case a new batch/branch was just added in another tab
  };

  const toggleRole = async (student) => {
    const nextRole = student.role === 'admin' ? 'student' : 'admin';
    const data = await setStudentRole(student.id, nextRole);
    setMsg(data.message);
    await loadStudents();
  };

  const remove = async (id) => {
    const data = await deleteStudent(id);
    setMsg(data.message);
    await loadStudents();
  };

  return (
    <div className="space-y-4">
      <form className="bg-white p-4 rounded shadow space-y-2 max-w-xl" onSubmit={submit}>
        <h2 className="font-semibold">Manage Students</h2>
        <input
          className="w-full border p-2 rounded"
          placeholder="Student ID (e.g. 22991A0501)"
          type="text"
          value={form.student_id || ''}
          onChange={e => setForm({ ...form, student_id: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <select
          className="w-full border p-2 rounded"
          value={form.batch_id}
          onChange={e => setForm({ ...form, batch_id: e.target.value })}
          required
        >
          <option value="">Select Batch</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>{batch.name}</option>
          ))}
        </select>
        <select
          className="w-full border p-2 rounded"
          value={form.branch_id}
          onChange={e => setForm({ ...form, branch_id: e.target.value })}
          required
        >
          <option value="">Select Branch</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
        <input
          className="w-full border p-2 rounded"
          placeholder="Year (e.g. 1, 2, 3, 4)"
          type="number"
          value={form.year}
          onChange={e => setForm({ ...form, year: e.target.value })}
          required
        />
        <button className="bg-slate-900 text-white px-4 py-2 rounded">Create Student</button>
        <p className="text-sm text-slate-600">Default password for new students: Welcome@123</p>
        {msg && <p className="text-green-600">{msg}</p>}
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Students</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-slate-50">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Student ID</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Email</th>
                <th className="py-2 px-2">Batch</th>
                <th className="py-2 px-2">Branch</th>
                <th className="py-2 px-2">Year</th>
                <th className="py-2 px-2">Role</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr className="border-b hover:bg-slate-50" key={student.id}>
                  <td className="py-2 px-2 font-semibold text-slate-600">{student.id}</td>
                  <td className="py-2 px-2">{student.student_id || '-'}</td>
                  <td className="py-2 px-2">{student.name}</td>
                  <td className="py-2 px-2">{student.email}</td>
                  <td className="py-2 px-2 text-slate-600">{student.batch_id || '-'}</td>
                  <td className="py-2 px-2 text-slate-600">{student.branch_id || '-'}</td>
                  <td className="py-2 px-2 text-center text-slate-600">{student.year || '-'}</td>
                  <td className="py-2 px-2 capitalize">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${student.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {student.role}
                    </span>
                  </td>
                  <td className="py-2 px-2 space-x-1">
                    <button
                      className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-100"
                      onClick={() => toggleRole(student)}
                      type="button"
                    >
                      {student.role === 'admin' ? 'Student' : 'Admin'}
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => remove(student.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;