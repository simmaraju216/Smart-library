import { useEffect, useState } from 'react';
import api from '../../services/api';

const ViewRatings = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/feedback/ratings').then((res) => setItems(res.data));
  }, []);
  return <div className="bg-white p-4 rounded shadow">{items.map((x) => <div key={x.id}>{x.student_name}: {x.rating}⭐</div>)}</div>;
};

export default ViewRatings;