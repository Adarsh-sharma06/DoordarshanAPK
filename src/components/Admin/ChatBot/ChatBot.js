import React, { useState, useEffect, useRef } from "react";
import { db, collection, getDocs, query, where } from "../../../service/firebase";
import "./ChatBot.css";

const ChatBot = ({ userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Typing indicator
  const [context, setContext] = useState(null); // Track conversation context
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Greet the user based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Initial greeting when the chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = `${getGreeting()}${userData?.name ? `, ${userData.name}` : ""}! How can I assist you today?`;
      setMessages([{ text: greeting, sender: "bot" }]);
    }
  }, [isOpen, userData]);

  // Focus on input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle keydown events (Esc to close, Enter to send)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false); // Close chat on Esc
      } else if (event.key === "Enter" && isOpen) {
        handleSendMessage(); // Send message on Enter
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, inputText]);

  // Rule-based responses for general questions
  const getRuleBasedResponse = (inputText) => {
    const lowerCaseInput = inputText.toLowerCase();

    if (lowerCaseInput.includes("hello") || lowerCaseInput.includes("hi")) {
      return "Hello! How can I help you today?";
    } else if (lowerCaseInput.includes("how are you")) {
      return "I'm just a bot, but I'm here to help you!";
    } else if (lowerCaseInput.includes("thank you")) {
      return "You're welcome!";
    } else if (lowerCaseInput.includes("bye")) {
      return "Goodbye! Have a great day!";
    } else {
      return "I'm sorry, I don't understand that. Can you please rephrase?";
    }
  };

  // Parse user query to identify intent
  const parseQuery = (inputText) => {
    const lowerCaseInput = inputText.toLowerCase();

    // Synonyms and context-aware parsing
    const bookingSynonyms = ["booking", "reservation", "appointment"];
    const carSynonyms = ["car", "vehicle", "automobile"];
    const userSynonyms = ["user", "person", "profile"];
    const reportSynonyms = ["report", "summary", "status"];

    if (bookingSynonyms.some((word) => lowerCaseInput.includes(word))) {
      if (lowerCaseInput.includes("pending")) {
        return { type: "bookings", status: "Pending" };
      } else if (lowerCaseInput.includes("approved")) {
        return { type: "bookings", status: "Approved" };
      } else if (lowerCaseInput.includes("conflict")) {
        return { type: "bookings", status: "Conflict" };
      } else if (lowerCaseInput.includes("today")) {
        return { type: "bookings", status: "Today" };
      } else if (lowerCaseInput.includes("reporter")) {
        return { type: "bookings", query: "reporter" };
      } else if (lowerCaseInput.includes("driver")) {
        return { type: "bookings", query: "driver" };
      } else {
        return { type: "bookings", status: "All" };
      }
    } else if (carSynonyms.some((word) => lowerCaseInput.includes(word))) {
      if (lowerCaseInput.includes("availability")) {
        return { type: "cars", query: "availability" };
      } else if (lowerCaseInput.includes("details")) {
        return { type: "cars", query: "details" };
      }
    } else if (userSynonyms.some((word) => lowerCaseInput.includes(word))) {
      if (lowerCaseInput.includes("details")) {
        return { type: "users", query: "details" };
      }
    } else if (reportSynonyms.some((word) => lowerCaseInput.includes(word))) {
      if (lowerCaseInput.includes("past")) {
        return { type: "report", query: "past" };
      } else {
        return { type: "report" };
      }
    }

    return { type: "unknown" };
  };

  // Simulate typing delay for bot responses
  const simulateTyping = async (response) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate typing delay
    setIsTyping(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");

    let botMessage = { text: "", sender: "bot" };

    // Parse the user query
    const queryIntent = parseQuery(inputText);

    // Handle database-related queries
    if (queryIntent.type === "bookings") {
      setContext("bookings"); // Set context for follow-up questions
      if (queryIntent.status === "Today") {
        const bookingsToday = await fetchBookingsForToday();
        if (bookingsToday.length > 0) {
          botMessage.text = await simulateTyping(
            `There are ${bookingsToday.length} bookings today:\n${bookingsToday
              .map(
                (booking) =>
                  `- ${booking.aim} (${booking.destination}) [Status: ${booking.status}] [User: ${booking.email}]`
              )
              .join("\n")}`
          );
        } else {
          botMessage.text = await simulateTyping("There are no bookings today.");
        }
      } else if (queryIntent.status === "Pending") {
        const pendingBookings = await fetchBookingsByStatus("Pending");
        botMessage.text = await simulateTyping(
          `There are ${pendingBookings.length} pending bookings:\n${pendingBookings
            .map(
              (booking) =>
                `- ${booking.aim} (${booking.destination}) [User: ${booking.email}]`
            )
            .join("\n")}`
        );
      } else if (queryIntent.status === "Approved") {
        const approvedBookings = await fetchBookingsByStatus("Approved");
        botMessage.text = await simulateTyping(
          `There are ${approvedBookings.length} approved bookings:\n${approvedBookings
            .map(
              (booking) =>
                `- ${booking.aim} (${booking.destination}) [Car: ${booking.allotedDriver}]`
            )
            .join("\n")}`
        );
      } else if (queryIntent.status === "Conflict") {
        const conflictMessage = await checkBookingConflicts();
        botMessage.text = await simulateTyping(conflictMessage);
      } else if (queryIntent.query === "reporter") {
        const reporterDetails = await fetchReporterForToday();
        botMessage.text = await simulateTyping(reporterDetails);
      } else if (queryIntent.query === "driver") {
        const driverDetails = await fetchDriverDetails();
        botMessage.text = await simulateTyping(driverDetails);
      } else {
        const allBookings = await fetchAllBookings();
        botMessage.text = await simulateTyping(
          `All bookings:\n${allBookings
            .map(
              (booking) =>
                `- ${booking.aim} (${booking.destination}) [Status: ${booking.status}]`
            )
            .join("\n")}`
        );
      }
    } else if (queryIntent.type === "cars") {
      setContext("cars"); // Set context for follow-up questions
      if (queryIntent.query === "availability") {
        const carAvailability = await checkCarAvailability();
        botMessage.text = await simulateTyping(carAvailability);
      } else if (queryIntent.query === "details") {
        const carDetails = await fetchCarDetails();
        botMessage.text = await simulateTyping(
          `Car Details:\n${carDetails
            .map((car) => `- ${car.model} (ID: ${car.id}) [Status: ${car.status}]`)
            .join("\n")}`
        );
      }
    } else if (queryIntent.type === "users") {
      setContext("users"); // Set context for follow-up questions
      if (queryIntent.query === "details") {
        const userDetails = await fetchUserDetails();
        botMessage.text = await simulateTyping(
          `User Details:\n${userDetails
            .map(
              (user) =>
                `- ${user.name} (Email: ${user.email}) [Role: ${user.role}]`
            )
            .join("\n")}`
        );
      }
    } else if (queryIntent.type === "report") {
      setContext("report"); // Set context for follow-up questions
      if (queryIntent.query === "past") {
        const pastDate = extractDateFromQuery(inputText);
        if (pastDate) {
          const pastBookings = await fetchBookingsForDate(pastDate);
          botMessage.text = await simulateTyping(
            `Bookings on ${pastDate}:\n${pastBookings
              .map(
                (booking) =>
                  `- ${booking.aim} (${booking.destination}) [Status: ${booking.status}]`
              )
              .join("\n")}`
          );
        } else {
          botMessage.text = await simulateTyping("Please specify a valid date (e.g., 06/02/2025).");
        }
      } else {
        const report = await generateReport();
        botMessage.text = await simulateTyping(
          `Here's the report:\n- Pending: ${report.pending}\n- Approved: ${report.approved}\n- Rejected: ${report.rejected}`
        );
      }
    } else {
      // Use rule-based responses for general questions
      botMessage.text = await simulateTyping(getRuleBasedResponse(inputText));
    }

    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  // Fetch all bookings
  const fetchAllBookings = async () => {
    const bookingsQuery = query(collection(db, "bookings"));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    return bookingsSnapshot.docs.map((doc) => doc.data());
  };

  // Fetch bookings for today
  const fetchBookingsForToday = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("startDate", ">=", startOfDay),
      where("startDate", "<=", endOfDay)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    return bookingsSnapshot.docs.map((doc) => doc.data());
  };

  // Fetch bookings by status
  const fetchBookingsByStatus = async (status) => {
    const bookingsQuery = query(collection(db, "bookings"), where("status", "==", status));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    return bookingsSnapshot.docs.map((doc) => doc.data());
  };

  // Fetch bookings for a specific date
  const fetchBookingsForDate = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("startDate", ">=", startOfDay),
      where("startDate", "<=", endOfDay)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    return bookingsSnapshot.docs.map((doc) => doc.data());
  };

  // Extract date from query (e.g., "check on 06/02/2025")
  const extractDateFromQuery = (inputText) => {
    const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
    const match = inputText.match(dateRegex);
    if (match) {
      const [_, day, month, year] = match;
      return new Date(`${year}-${month}-${day}`);
    }
    return null;
  };

  // Fetch reporter for today's bookings
  const fetchReporterForToday = async () => {
    const bookingsToday = await fetchBookingsForToday();
    if (bookingsToday.length > 0) {
      const reporters = bookingsToday.map((booking) => booking.email);
      return `Reporters for today's bookings:\n${reporters.join("\n")}`;
    } else {
      return "There are no bookings today.";
    }
  };

  // Fetch driver details
  const fetchDriverDetails = async () => {
    const bookingsToday = await fetchBookingsForToday();
    if (bookingsToday.length > 0) {
      const drivers = bookingsToday.map((booking) => booking.allotedDriver);
      return `Drivers allotted for today's bookings:\n${drivers.join("\n")}`;
    } else {
      return "There are no bookings today.";
    }
  };

  // Generate a report
  const generateReport = async () => {
    const bookingsQuery = query(collection(db, "bookings"));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookingsData = bookingsSnapshot.docs.map((doc) => doc.data());

    const pending = bookingsData.filter((b) => b.status === "Pending").length;
    const approved = bookingsData.filter((b) => b.status === "Approved").length;
    const rejected = bookingsData.filter((b) => b.status === "Rejected").length;

    return { pending, approved, rejected };
  };

  // Check car availability
  const checkCarAvailability = async () => {
    const bookingsQuery = query(collection(db, "bookings"));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookingsData = bookingsSnapshot.docs.map((doc) => doc.data());

    const availableCars = 5; // Total cars available (example)
    const bookedCars = bookingsData.filter((b) => b.status === "Approved").length;

    if (bookedCars < availableCars) {
      return `There are ${availableCars - bookedCars} cars available for booking.`;
    } else {
      return "All cars are currently booked. Please check back later.";
    }
  };

  // Fetch car details
  const fetchCarDetails = async () => {
    const carsQuery = query(collection(db, "cars"));
    const carsSnapshot = await getDocs(carsQuery);
    return carsSnapshot.docs.map((doc) => doc.data());
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    const usersQuery = query(collection(db, "users"));
    const usersSnapshot = await getDocs(usersQuery);
    return usersSnapshot.docs.map((doc) => doc.data());
  };

  // Check booking conflicts
  const checkBookingConflicts = async () => {
    const bookingsQuery = query(collection(db, "bookings"));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookingsData = bookingsSnapshot.docs.map((doc) => doc.data());

    const conflicts = bookingsData.filter((b) => b.status === "Pending" || b.status === "On Hold");

    if (conflicts.length > 0) {
      return `There are ${conflicts.length} bookings with conflicts (Pending or On Hold):\n${conflicts
        .map(
          (booking) =>
            `- ${booking.aim} (${booking.destination}) [User: ${booking.email}]`
        )
        .join("\n")}`;
    } else {
      return "No booking conflicts found.";
    }
  };

  return (
    <div className={`chatbot ${isOpen ? "open" : ""}`}>
      <div className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
        💬
      </div>
      {isOpen && (
        <div className="chatbot-dialog">
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="typing-indicator">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              ref={inputRef}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;