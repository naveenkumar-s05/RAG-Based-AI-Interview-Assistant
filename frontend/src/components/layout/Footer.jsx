function Footer({ loading }) {
  if (loading) {
    return null;
  }

  return (
    <footer className="app-footer">
      <p>Powered by RAG retrieval, voice AI, and an XGBoost readiness model.</p>
    </footer>
  );
}

export default Footer;