import React, { useEffect, useState } from 'react';

// A modern-classic card layout for each registered case
const PublicCasesList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/publiccases')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch cases');
        return res.json();
      })
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="centered">Loading cases...</div>;
  if (error) return <div className="centered error">Error: {error}</div>;
  if (cases.length === 0) return <div className="centered">No cases registered.</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Public Sightings</h2>
      <div style={styles.grid}>
        {cases.map((c) => (
          <div key={c.id} style={styles.card} className="case-card">
            <div style={styles.cardHeader}>
              <span style={styles.avatar}>{c.name?.charAt(0) || "?"}</span>
              <div>
                <div style={styles.caseName}>{c.name}</div>
                <div style={styles.caseId}>Case ID: <span style={{fontWeight: 600}}>{c.id}</span></div>
              </div>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Submitted By: </span> {c.submitted_by}
            </div>
            {/* <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Status:</span> <span style={{
                ...styles.status,
                // Optionally color-emphasize status
                background: c.status?.toLowerCase() === "missing" ? "#fae1e1" : "#e7f7ee",
                color: c.status?.toLowerCase() === "missing" ? "#d70000" : "#15695a"
              }}>{c.status}</span>
            </div> */}
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Last Seen:</span> {c.location || 'N/A'}
            </div>
          </div>
        ))}
      </div>
      {/* Styled with vanilla CSS for hover effect */}
      <style>
        {`
          .case-card {
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .case-card:hover {
            box-shadow: 0 6px 24px rgba(45,60,98,0.18);
            transform: translateY(-3px) scale(1.015);
          }
          .centered {
            display:flex; align-items:center; justify-content:center; font-size:1.25rem; min-height:40vh;
          }
          .error {
            color: #d70000;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '24px',
    borderRadius: "16px",
    boxShadow: "0 6px 32px rgba(45,60,98,0.09)",
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '2rem',
    color: '',
    letterSpacing: "0.5px",
    textAlign: 'center',
    fontFamily: "serif, Georgia, Times, 'Times New Roman'"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: '1.75rem',
  },
  card: {
    
    padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(45,60,98,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: ".5rem"
  },
  avatar: {
    color: "#435acb",
    fontWeight: 700,
    borderRadius: "100%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.55rem",
    marginRight: "0.5rem",
    border: "1px solid #e6eaff",
  },
  caseName: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "",
    letterSpacing: "0.2px"
  },
  caseId: {
    fontSize: ".94rem",
    color: "#7a869a"
  },
  infoRow: {
    fontSize: "1rem",
    display: "flex",
    gap: ".5rem",
    alignItems: "center",
  },
  infoLabel: {
    fontWeight: 700,
    minWidth: 72,
    color: ""
  },
  status: {
    padding: "2px 12px",
    borderRadius: "10px",
    fontWeight: 700,
    letterSpacing: "0.2px"
  },
};


export default PublicCasesList;