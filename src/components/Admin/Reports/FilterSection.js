// FilterSection.js
import React from "react";
import { FaPrint } from "react-icons/fa";

const FilterSection = ({
  users,
  reporterFilter,
  setReporterFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  searchTerm,
  setSearchTerm,
  handlePrint,
}) => {
  return (
    <div className="mb-4 d-flex justify-content-between filter-wrapper">
      {/* Reporter Dropdown */}
      <div className="filter-dropdown">
        <select
          className="form-control filter-select"
          value={reporterFilter}
          onChange={(e) => setReporterFilter(e.target.value)}
        >
          <option value="">Reporter</option>
          {users.map((user) => (
            <option key={user.id} value={user.email}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Month Dropdown */}
      <div className="filter-dropdown">
        <select
          className="form-control filter-select"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="">Month</option>
          {[...Array(12).keys()].map((month) => (
            <option key={month} value={month}>
              {new Date(0, month).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {/* Year Dropdown */}
      <div className="filter-dropdown">
        <select
          className="form-control filter-select"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">Year</option>
          {[...Array(5).keys()].map((yearOffset) => {
            const currentYear = new Date().getFullYear();
            return (
              <option key={yearOffset} value={currentYear - yearOffset}>
                {currentYear - yearOffset}
              </option>
            );
          })}
        </select>
      </div>

      {/* Search Bar */}
      <div className="filter-dropdown">
        <input
          type="text"
          className="form-control filter-select"
          placeholder="Search"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Print Button */}
      <div className="text-end">
        <button className="btn print-btn" onClick={handlePrint}>
          <FaPrint /> Print Report
        </button>
      </div>
    </div>
  );
};

export default FilterSection;