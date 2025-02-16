import { db, collection, getDocs, query, where, doc, updateDoc } from "../../../service/firebase";
import { sendWhatsAppAlert } from "./whatsAppService";

export const checkCarAvailability = async (booking) => {
  const carId = booking.carId;
  const startDate = booking.startDate;
  const endDate = booking.endDate;

  const bookingsQuery = query(
    collection(db, "bookings"),
    where("carId", "==", carId),
    where("status", "==", "Approved")
  );

  const bookingsSnapshot = await getDocs(bookingsQuery);
  const overlappingBookings = bookingsSnapshot.docs.filter((doc) => {
    const bookingData = doc.data();
    return (
      (bookingData.startDate <= startDate && bookingData.endDate >= startDate) ||
      (bookingData.startDate <= endDate && bookingData.endDate >= endDate)
    );
  });

  if (overlappingBookings.length > 0) {
    sendWhatsAppAlert("Admin", "There is an overlapping booking for the same car.");
    return false;
  }

  return true;
};

export const autoApproveBooking = async (bookingId) => {
  const bookingRef = doc(db, "bookings", bookingId);
  await updateDoc(bookingRef, { status: "Approved" });
};