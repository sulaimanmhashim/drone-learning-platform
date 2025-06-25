export default function Loader({ message = "Loading..." }) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '30vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '5px solid #ccc',
    borderTop: '5px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    marginTop: '1rem',
    color: '#333'
  }
};
