import { Bounce, toast } from "react-toastify";

export const tostMessage = (title, message, type = "default") => {
  const backgroundColors = {
    success: "#28a745", // Green
    error: "#dc3545", // Red
    warning: "#ffc107", // Yellow
    info: "#17a2b8", // Blue
    default: "#fff", // White
  };

  toast(
    <div>
      <strong style={{ fontSize: "1.1rem", display: "block" }}>{title}</strong>
      <p style={{ fontSize: "0.9rem", opacity: 0.9, margin: 0 }}>{message}</p>
    </div>,
    {
      type: type,
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      newestOnTop: false,
      draggable: false,
      pauseOnHover: true,
      closeButton: true,
      theme: "light",
      transition: Bounce,
      icon: false,
      style: {
        // backgroundColor: backgroundColors[type],
        // color: type === "default" ? "#000" : "#fff",
        fontSize: "1rem",
        marginBottom: "5px",
      },
    }
  );
};