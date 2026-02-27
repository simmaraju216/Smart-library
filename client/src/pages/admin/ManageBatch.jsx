import { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageBatch = () => {
	const [batches, setBatches] = useState([]);
	const [students, setStudents] = useState([]);
	const [batchName, setBatchName] = useState('');
	const [selectedBatch, setSelectedBatch] = useState('');
	const [msg, setMsg] = useState('');

	const loadBatches = async () => {
		const res = await api.get('/students/batches');
		setBatches(res.data);
	};


	const loadStudents = async (batchId) => {
		if (!batchId) { setStudents([]); return; }
		const res = await api.get('/students');
		// Only show students (not admins) in the selected batch
		setStudents(res.data.filter(s => s.batch_id == batchId && s.role === 'student'));
	};

	useEffect(() => { loadBatches(); }, []);
	useEffect(() => { loadStudents(selectedBatch); }, [selectedBatch]);

	const submit = async (e) => {
		e.preventDefault();
		if (!batchName) return;
		await api.post('/students/batches', { name: batchName });
		setMsg('Batch added');
		setBatchName('');
		await loadBatches();
	};

	return (
		<div className="space-y-4">
			<form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
				<h2 className="font-semibold">Add Batch</h2>
				<input
					className="w-full border p-2 rounded"
					placeholder="Batch Name (e.g. 2022)"
					value={batchName}
					onChange={e => setBatchName(e.target.value)}
				/>
				<button className="bg-slate-900 text-white px-4 py-2 rounded">Add Batch</button>
				{msg && <p className="text-green-600">{msg}</p>}
			</form>

			<div className="bg-white p-4 rounded shadow max-w-xl">
				<h3 className="font-semibold mb-2">View Students by Batch</h3>
				<select
					className="w-full border p-2 rounded mb-2"
					value={selectedBatch}
					onChange={e => setSelectedBatch(e.target.value)}
				>
					<option value="">Select Batch</option>
					{batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
				</select>
				<div className="overflow-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left border-b bg-slate-50">
								<th className="py-2 px-2">ID</th>
								<th className="py-2 px-2">Name</th>
								<th className="py-2 px-2">Email</th>
								<th className="py-2 px-2">Year</th>
							</tr>
						</thead>
						<tbody>
							{students.map(s => (
								<tr className="border-b" key={s.id}>
									<td className="py-2 px-2">{s.id}</td>
									<td className="py-2 px-2">{s.name}</td>
									<td className="py-2 px-2">{s.email}</td>
									<td className="py-2 px-2">{s.year}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default ManageBatch;