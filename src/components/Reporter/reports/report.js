import React, { useState, useEffect } from "react";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import { Tabs, Tab } from "@mui/material";
import { db, collection, getDocs, query } from "../../../service/firebase";
import { FaPrint, FaSearch, FaCarAlt, FaCalendarAlt } from "react-icons/fa";
import { getAuth } from "firebase/auth";

function RReport() {
    const [activeTab, setActiveTab] = useState("all");
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch the current user from Firebase Auth
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const reportsQuery = query(collection(db, "bookings"));
                const snapshot = await getDocs(reportsQuery);
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    startDate: doc.data().startDate?.toDate(),
                }));
                setReports(data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter((report) => {
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "local" && report.bookingType?.toLowerCase() === "local") ||
            (activeTab === "outstation" && report.bookingType?.toLowerCase() === "outstation");
        const matchesSearch =
            searchTerm === "" ||
            report.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.driver?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handlePrint = () => {
        const content = document.getElementById("report-content");
        const printWindow = window.open("", "", "height=500,width=800");
        printWindow.document.write("<html><head><title>Report</title></head><body>");
        printWindow.document.write(content.innerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="dashboard-container">
            <Sidebar
                menuSections={[
                    {
                        heading: null,
                        items: [
                            { name: "Dashboard", link: "/Reporter/ReporterDashboard", icon: "bi bi-house-door" },
                            { name: "Reports", link: "/Reporter/reports", icon: "bi bi-file-earmark-text" },
                            // { name: "History", link: "/Reporter/History", icon: "bi bi-clock" },
                            { name: "Car Request", link: "/Reporter/CarRequest", icon: "bi bi-car-front" },
                        ],
                    },
                    { heading: "Settings", items: [{ name: "Profile", link: "/Profile", icon: "bi bi-person" }] },
                ]}
                showLogout={true}
            />
            <div className="content-container">
                <Navbar title="Reports" userEmail={currentUser?.email || "Guest"} />

                <div className="container-fluid mt-4">
                    <Tabs
                        value={activeTab}
                        onChange={(e, val) => setActiveTab(val)}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        className="mb-3"
                    >
                        <Tab label="All Stations" value="all" />
                        <Tab label="Local Trips" value="local" />
                        <Tab label="Outstation Trips" value="outstation" />
                    </Tabs>

                    {/* Flexbox Layout for Heading, Search and Print Button */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
  <h4 className="mb-0">Reports</h4>

  <div className="d-flex align-items-center">
  <div className="filter-dropdown">
              <input
                type="text"
                className="form-control filter-select"
                placeholder="Search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
     
    {/* <button className="btn btn-primary d-flex align-items-center">
      <FaPrint className="me-2" /> Print Report
    </button> */}
    <div className="text-end">
                  <button className="btn print-btn" onClick={handlePrint}>
                    <FaPrint /> Print Report
                  </button>
                </div>
  </div>
</div>


                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Loading...</p>
                        </div>
                    ) : (
                        <div id="report-content" className="mt-4">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Destination</th>
                                            <th>Driver</th>
                                            <th>Type</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.length > 0 ? (
                                            filteredReports.map((report, index) => (
                                                <tr key={report.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <FaCarAlt className="me-2" />
                                                        {report.destination || "N/A"}
                                                    </td>
                                                    <td>{report.driver || "N/A"}</td>
                                                    <td>{report.bookingType || "N/A"}</td>
                                                    <td>
                                                        <FaCalendarAlt className="me-2" />
                                                        {report.startDate?.toLocaleDateString() || "N/A"}
                                                    </td>
                                                    <td>{report.status || "N/A"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    No reports found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RReport;
