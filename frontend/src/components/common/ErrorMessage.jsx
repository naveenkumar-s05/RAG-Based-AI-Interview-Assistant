import Icon from "./Icon";

function ErrorMessage({ error, className = "" }) {
  if (!error) {
    return null;
  }

  return (
    <div className={`error-banner${className ? ` ${className}` : ""}`} role="alert">
      <Icon name="alert" size={17} className="error-banner-icon" />
      <span>{error}</span>
    </div>
  );
}

export default ErrorMessage;