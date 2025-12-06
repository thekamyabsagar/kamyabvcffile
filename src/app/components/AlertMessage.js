"use client";

const AlertMessage = ({ type = "error", message }) => {
  const styles = {
    error: "p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200",
    success: "p-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200"
  };

  if (!message) return null;

  return (
    <div className={styles[type]}>
      {message}
    </div>
  );
};

export default AlertMessage;
