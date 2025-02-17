import React from "react";

function StatusTab({ title, value, maxValue, description }) {
    return (
        <div className="status-tab">
            <h5>{title}</h5>
            <div className="progress">
                <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${(value / maxValue) * 100}%` }}
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={maxValue}
                >
                    {value}
                </div>
            </div>
            <p>{description}</p>
        </div>
    );
}

export default StatusTab;