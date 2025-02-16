import React from "react";
import { FaClipboardList, FaCheck, FaTimes } from "react-icons/fa";

const StatusCards = ({ tabsData }) => {
  return (
    <div className="status-cards-container mt-4">
      {tabsData.map((tab, index) => (
        <div key={index} className="col-12 col-md-3 mb-3">
          <div
            className={`status-card text-center p-3 ${tab.isPending ? "btn-primary" : ""}`}
            style={{ backgroundColor: tab.isPending ? "blue" : tab.color }}
          >
            {tab.icon}
            <h5 className="mt-3">{tab.heading}</h5>
            <p>{tab.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;