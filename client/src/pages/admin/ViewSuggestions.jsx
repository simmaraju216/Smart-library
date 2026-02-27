import { useEffect, useState } from 'react';
import api from '../../services/api';

const ViewSuggestions = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/feedback/suggestions').then((res) => setItems(res.data));
  }, []);
  return <div className="bg-white p-4 rounded shadow">{items.map((x) => <div key={x.id}>{x.student_name}: {x.suggestion}</div>)}</div>;
};

export default ViewSuggestions;