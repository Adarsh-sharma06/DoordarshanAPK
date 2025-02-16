import twilio from "twilio";

const accountSid = "your_account_sid";
const authToken = "your_auth_token";
const client = twilio(accountSid, authToken);

export const sendWhatsAppAlert = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
    });
  } catch (error) {
    console.error("Error sending WhatsApp alert: ", error);
  }
};