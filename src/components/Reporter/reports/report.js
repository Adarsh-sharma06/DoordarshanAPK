import React, { useState, useEffect } from "react";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import { Tabs, Tab } from "@mui/material";
import { db, collection, getDocs, query, where, doc, getDoc } from "../../../service/firebase";
import { FaPrint, FaCarAlt, FaCalendarAlt } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function RReport() {
    const [activeTab, setActiveTab] = useState("all");
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchReports(user);
            } else {
                setCurrentUser(null);
                setReports([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchReports = async (user) => {
        if (!user) return;
        setLoading(true);
        try {
            const reportsQuery = query(
                collection(db, "bookings"),
                where("email", "==", user.email) // Ensure Firestore has `email` field
            );
    
            const snapshot = await getDocs(reportsQuery);
            const data = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const report = { id: docSnap.id, ...docSnap.data(), startDate: docSnap.data().startDate?.toDate() };
                    
                    // Fetch driver name from users collection using allotedDriver email
                    if (report.allotedDriver) {
                        const driverRef = doc(db, "users", report.allotedDriver);
                        const driverSnap = await getDoc(driverRef);
                        report.driverName = driverSnap.exists() ? driverSnap.data().name || "Unknown Driver" : "Driver Not Found";
                    } else {
                        report.driverName = "Not Assigned";
                    }
    
                    return report;
                })
            );
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };
    

    const filteredReports = reports.filter((report) => {
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "local" && report.bookingType?.toLowerCase() === "local") ||
            (activeTab === "outstation" && report.bookingType?.toLowerCase() === "outstation");

        const matchesSearch =
            searchTerm === "" ||
            report.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.driverName?.toLowerCase().includes(searchTerm.toLowerCase());

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

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">Reports</h4>

                        <div className="d-flex align-items-center">
                            <input
                                type="text"
                                className="form-control filter-select"
                                placeholder="Search"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn print-btn ms-2" onClick={handlePrint}>
                                <FaPrint /> Print Report
                            </button>
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
                                                    <td>{report.driverName || "N/A"}</td>
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
