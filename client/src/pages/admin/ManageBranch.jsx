import { useEffect, useState } from "react";
import api from "../../services/api";

const ManageBranch = () => {
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [msg, setMsg] = useState("");

  // Branch management states
  const [branchName, setBranchName] = useState("");
  const [branchEditId, setBranchEditId] = useState(null);
  const [branchEditName, setBranchEditName] = useState("");

  // =============================
  // INITIAL LOAD
  // =============================
  useEffect(() => {
    fetchBranches();
    fetchBatches();
  }, []);

  const fetchBranches = async () => {
    const res = await api.get("/branches");
    setBranches(res.data);
  };

  const fetchBatches = async () => {
    const res = await api.get("/students/batches");
    setBatches(res.data);
  };


  const fetchStudents = async () => {
    if (selectedBranch && selectedBatch) {
      const res = await api.get(
        `/students?batch_id=${selectedBatch}&branch_id=${selectedBranch}`
      );
      // Only show students (not admins) in the selected batch, branch, and year
      let filtered = res.data.filter(s => s.role === 'student');
      if (selectedYear) {
        filtered = filtered.filter(s => String(s.year) === String(selectedYear));
      }
      setStudents(filtered);
    } else {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBranch, selectedBatch, selectedYear]);

  // =============================
  // BRANCH CRUD
  // =============================

  const addBranch = async (e) => {
    e.preventDefault();
    if (!branchName) return;

    await api.post("/branches", { name: branchName });
    setMsg("Branch added successfully");
    setBranchName("");
    fetchBranches();
  };

  const startBranchEdit = (branch) => {
    setBranchEditId(branch.id);
    setBranchEditName(branch.name);
  };

  const cancelBranchEdit = () => {
    setBranchEditId(null);
    setBranchEditName("");
  };

  const saveBranchEdit = async () => {
    if (!branchEditName) return;

    await api.patch(`/branches/${branchEditId}`, {
      name: branchEditName,
    });

    setMsg("Branch updated successfully");
    setBranchEditId(null);
    setBranchEditName("");
    fetchBranches();
  };

  const removeBranch = async (id) => {
    await api.delete(`/branches/${id}`);
    setMsg("Branch deleted successfully");
    fetchBranches();
  };

  // =============================
  // STUDENT EDIT
  // =============================

  const startEdit = (student) => {
    setEditId(student.id);
    setEditForm({ ...student });
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const saveEdit = async () => {
    await api.patch(`/students/${editId}`, editForm);
    setMsg("Student updated successfully");
    setEditId(null);
    fetchStudents();
  };

  const removeStudent = async (id) => {
    await api.delete(`/students/${id}`);
    setMsg("Student deleted successfully");
    fetchStudents();
  };

  // =============================
  // UI
  // =============================

  return (
    <div className="space-y-6 p-6">

      {/* Add Branch */}
      <form
        className="bg-white p-4 rounded shadow max-w-xl space-y-3"
        onSubmit={addBranch}
      >
        <h2 className="font-semibold text-lg">Add Branch</h2>
        <input
          className="w-full border p-2 rounded"
          placeholder="Branch Name (e.g. CSE)"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
        />
        <button className="bg-slate-900 text-white px-4 py-2 rounded">
          Add Branch
        </button>
      </form>

      {/* Manage Branch Table */}
      <div className="bg-white p-4 rounded shadow max-w-xl">
        <h3 className="font-semibold mb-2">Manage Branches</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-slate-50">
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr className="border-b" key={branch.id}>
                <td className="py-2 px-2">{branch.id}</td>
                <td className="py-2 px-2">
                  {branchEditId === branch.id ? (
                    <input
                      className="border p-1 rounded"
                      value={branchEditName}
                      onChange={(e) =>
                        setBranchEditName(e.target.value)
                      }
                    />
                  ) : (
                    branch.name
                  )}
                </td>
                <td className="py-2 px-2 space-x-2">
                  {branchEditId === branch.id ? (
                    <>
                      <button
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                        onClick={saveBranchEdit}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-gray-400 text-white rounded"
                        onClick={cancelBranchEdit}
                        type="button"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                        onClick={() => startBranchEdit(branch)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                        onClick={() => removeBranch(branch.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Batch, Branch & Year Filter */}
      <div className="bg-white p-4 rounded shadow max-w-xl space-y-3">
        <h2 className="font-semibold text-lg">
          Batch, Branch & Year Wise Students
        </h2>

        <select
          className="w-full border p-2 rounded"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="w-full border p-2 rounded"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="w-full border p-2 rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {[1, 2, 3, 4].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Students</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-slate-50">
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Student ID</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Batch</th>
              <th className="py-2 px-2">Branch</th>
              <th className="py-2 px-2">Year</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr className="border-b" key={s.id}>
                <td className="py-2 px-2">{s.id}</td>
                <td className="py-2 px-2">
                  {editId === s.id ? (
                    <input
                      className="border p-1 rounded"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    s.name
                  )}
                </td>
                <td className="py-2 px-2">
                  {editId === s.id ? (
                    <input
                      className="border p-1 rounded"
                      value={editForm.student_id || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          student_id: e.target.value,
                        })
                      }
                    />
                  ) : (
                    s.student_id || s.id
                  )}
                </td>
                <td className="py-2 px-2">
                  {editId === s.id ? (
                    <input
                      className="border p-1 rounded"
                      value={editForm.email || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    s.email
                  )}
                </td>
                <td className="py-2 px-2">{batches.find(b => b.id == s.batch_id)?.name || s.batch_id}</td>
                <td className="py-2 px-2">{branches.find(b => b.id == s.branch_id)?.name || s.branch_id}</td>
                <td className="py-2 px-2">
                  {editId === s.id ? (
                    <input
                      className="border p-1 rounded"
                      value={editForm.year}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          year: e.target.value,
                        })
                      }
                    />
                  ) : (
                    s.year
                  )}
                </td>
                <td className="py-2 px-2 space-x-2">
                  {editId === s.id ? (
                    <>
                      <button
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                        onClick={saveEdit}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-gray-400 text-white rounded"
                        onClick={cancelEdit}
                        type="button"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                        onClick={() => startEdit(s)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                        onClick={() => removeStudent(s.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {msg && <p className="text-green-600">{msg}</p>}
    </div>
  );
};

export default ManageBranch;
