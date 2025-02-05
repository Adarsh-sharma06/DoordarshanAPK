// StatusCard.js
import React from "react";

const StatusCard = ({ heading, content, color, icon, isPending }) => {
  return (
    <div
      className={`status-card text-center p-3 ${isPending ? "btn-primary" : ""}`}
      style={{ backgroundColor: isPending ? "blue" : color }}
    >
      {icon}
      <h5 className="mt-3">{heading}</h5>
      <p>{content}</p>
    </div>
  );
};

export default StatusCard;