import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CoordinatorReport() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('weekly');

  const fetchReports = async () => {
    setLoading(true);
    const now = new Date();
    const start = new Date(now);

    if (reportType === 'weekly') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setMonth(now.getMonth() - 1);
    }

    const q = query(
      collection(db, 'projectProposals'),
      where('createdAt', '>=', Timestamp.fromDate(start))
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProposals(data);
    setLoading(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const title =
      reportType === 'weekly' ? 'Weekly Project Report' : 'Monthly Project Report';
    doc.text(title, 14, 16);

    const rows = proposals.map(p => [
      p.title,
      p.status,
      p.groupId,
      p.progress || 'N/A',
      p.createdAt?.toDate().toLocaleDateString() || '-'
    ]);

    doc.autoTable({
      head: [['Title', 'Status', 'Group', 'Progress', 'Date']],
      body: rows,
      startY: 20
    });

    const filename =
      reportType === 'weekly' ? 'weekly_project_report.pdf' : 'monthly_project_report.pdf';
    doc.save(filename);
  };

  useEffect(() => {
    fetchReports();
  }, [reportType]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Generate Project Report</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="reportType"><strong>Report Type:</strong></label>
        <select
          id="reportType"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={{ marginLeft: '1rem' }}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {loading ? (
        <p>Loading proposals...</p>
      ) : (
        <>
          <button onClick={generatePDF}>Download Report (PDF)</button>
          <p>{proposals.length} proposals included.</p>
        </>
      )}
    </div>
  );
}
