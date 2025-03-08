import React, { useState, useEffect } from "react";
import Sidebar from "../../ReusableComponents/Sidebar/Sidebar";
import Navbar from "../../ReusableComponents/Navbar/Navbar";
import { db, collection, getDocs, auth } from "../../../service/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaPrint, FaStar } from "react-icons/fa"; // Import FaStar for rating stars
import "./Rating.css";

function RatingReport() {
    const menuSections = [
        {
            heading: "Main Menu",
            items: [
                { name: "Dashboard", link: "/Admin/Dashboard", icon: "bi bi-speedometer2" },
                { name: "Tracker", link: "/Admin/Tracker", icon: "bi bi-map" },
                { name: "Reports", link: "/Admin/Reports/Report", icon: "bi bi-bar-chart" },
                { name: "Rating Report", link: "/Admin/Rating/RatingReport", icon: "bi bi-star" },
            ],
        },
        {
            heading: "Administration",
            items: [
                { name: "Create Users", link: "/Admin/Dashboard/CreateUser", icon: "bi bi-people" },
            ],
        },
    ];

    const [userEmail, setUserEmail] = useState("");
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [reporterNames, setReporterNames] = useState({});
    const [reporterFilter, setReporterFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [driverNames, setDriverNames] = useState({});
    const [driverRatings, setDriverRatings] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const bookingsCollection = collection(db, "bookings");
                const bookingSnapshot = await getDocs(bookingsCollection);
                const bookingList = bookingSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setBookings(bookingList);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching bookings: ", error);
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, "users");
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Create mappings for reporters and drivers
                const reporters = userList.filter((user) => user.role === "Reporter");
                const driverMapping = {};
                userList.forEach((user) => {
                    if (user.role === "Driver") {
                        driverMapping[user.email] = user.name;
                    }
                });

                // Set the users and driver names
                setUsers(reporters);
                setDriverNames(driverMapping);
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };

        fetchBookings();
        fetchUsers();
    }, []);

    useEffect(() => {
        const nameMapping = {};
        users.forEach((user) => {
            nameMapping[user.email] = user.name;
        });
        setReporterNames(nameMapping);

        // Calculate overall rating for each driver
        const driverRatingMapping = {};
        bookings.forEach((booking) => {
            const driverEmail = booking.allotedDriver;
            if (driverEmail && booking.rating != null) {
                if (!driverRatingMapping[driverEmail]) {
                    driverRatingMapping[driverEmail] = { total: 0, count: 0 };
                }
                driverRatingMapping[driverEmail].total += booking.rating;
                driverRatingMapping[driverEmail].count += 1;
            }
        });

        // Store the average ratings
        const driverAvgRatings = {};
        let totalSum = 0;
        let totalCount = 0;

        for (const driverEmail in driverRatingMapping) {
            const driverAvg = (
                driverRatingMapping[driverEmail].total / driverRatingMapping[driverEmail].count
            ).toFixed(1);
            driverAvgRatings[driverEmail] = driverAvg;

            // Calculate total sum for overall rating
            totalSum += driverRatingMapping[driverEmail].total;
            totalCount += driverRatingMapping[driverEmail].count;
        }

        setDriverRatings(driverAvgRatings);

        // Calculate overall rating across all drivers
        const overallRating = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : 3; // Default to 3 if no ratings
        setOverallRating(overallRating);
    }, [users, bookings]);

    const [overallRating, setOverallRating] = useState(0);

    const filterByDate = (date) => {
        if (!date || (!monthFilter && !yearFilter)) return true;
        const bookingDate = new Date(date.seconds * 1000);
        return (
            (monthFilter ? bookingDate.getMonth() === parseInt(monthFilter) : true) &&
            (yearFilter ? bookingDate.getFullYear() === parseInt(yearFilter) : true)
        );
    };

    const handleSearch = (booking) => {
        const searchFields = [
            booking.email ? reporterNames[booking.email] : "",
            booking.aim || "",
            booking.destination || "",
            booking.bookingType || "",
            booking.rating ? booking.rating.toString() : "",
        ];

        return searchFields.some((field) =>
            typeof field === "string" && field.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const filteredBookings = bookings.filter((booking) => {
        return (
            (reporterFilter ? booking.email === reporterFilter : true) &&
            filterByDate(booking.startDate) &&
            handleSearch(booking)
        );
    });

    const handlePrint = () => {
        const content = document.getElementById("rating-report-content");
        const printWindow = window.open("", "", "height=500,width=800");
        printWindow.document.write("<html><head><title>Ratings Report</title>");
        printWindow.document.write(
            '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">'
        );
        printWindow.document.write("</head><body>");
        printWindow.document.write(content.innerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
    };

    // Initialize Bootstrap tooltips
    useEffect(() => {
        // Initialize Bootstrap tooltips
        const tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
        tooltipElements.forEach((element) => {
            new window.bootstrap.Tooltip(element);
        });

        // Cleanup tooltips when component is unmounted
        return () => {
            tooltipElements.forEach((element) => {
                const tooltip = window.bootstrap.Tooltip.getInstance(element);
                if (tooltip) tooltip.dispose();
            });
        };
    }, [bookings]); // Re-run whenever bookings change


    return (
        <div className="Ratings-container">
            <Sidebar logoText="Doordarshan" menuSections={menuSections} showLogout={true} />
            <div className="Ratings-content">
                <Navbar title="Ratings" userEmail={userEmail} />
                <div id="rating-report-content" className="rounded-container">
                    {/* Driver Overall Ratings Card */}
                    {Object.keys(driverRatings).length > 0 && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">Overall Driver Ratings</h5>
                                {Object.keys(driverRatings).map((driverEmail) => (
                                    <div key={driverEmail} className="mb-2">
                                        <strong className="DriverName">{driverNames[driverEmail] || "Unknown Driver"}</strong>:{" "}
                                        <span className="badge badge-success">{driverRatings[driverEmail]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mergeContianer">
                        <h4 className="textSize">Ratings Report</h4>

                        <div className="filter-wrapper">
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

                            <div className="filter-dropdown">
                                <input
                                    type="text"
                                    className="form-control filter-select"
                                    placeholder="Search"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="text-end">
                                <button className="btn print-btn" onClick={handlePrint}>
                                    <FaPrint /> Print
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ratings Table */}
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="thead-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Reporter Name</th>
                                    <th>Destination</th>
                                    <th>Driver Name</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking, index) => (
                                    <tr
                                        key={booking.id}
                                        style={{
                                            backgroundColor: booking.rating < 3 ? "#ffcccc" : "transparent",
                                        }}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{reporterNames[booking.email] || "N/A"}</td>
                                        <td>
                                            <div
                                                className="description-tooltip"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title={booking.description || "No description"}
                                            >
                                                {booking.destination || "N/A"}
                                            </div>
                                        </td>
                                        <td>{driverNames[booking.allotedDriver] || "N/A"}</td>
                                        <td>
                                            <div className="rating-star-container">
                                                {booking.rating ? (
                                                    // If rating exists, display stars based on the rating
                                                    [...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={i < booking.rating ? "rating-star" : "rating-star-empty"}
                                                        />
                                                    ))
                                                ) : (
                                                    // If rating is 0 or undefined, display 3 stars as the minimum
                                                    [...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={i < 3 ? "rating-star" : "rating-star-empty"} // Always show 3 stars
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RatingReport;