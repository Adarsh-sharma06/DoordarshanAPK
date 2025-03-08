import React from "react";

const StatusCards = ({ tabsData }) => {
  return (
    <div className="status-cards-container">
      {tabsData.map((tab, index) => (
        <div key={index} className="status-card" style={{ backgroundColor: tab.color }}>
          {tab.icon}
          <h5>{tab.heading}</h5>
          <p>{tab.content}</p>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;