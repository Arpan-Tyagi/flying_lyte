
import { publicApi } from "../../services/api";

// 1. Customized Package Lead
export const submitChatbotLead = async (data) => {
  const response = await publicApi.post(
    "/api/package/packages/chatbot/lead/",
    {
      name: data.name,
      destination: data.destination,
      phone: data.phone,
      message: data.message,
    }
  );

  return response.data;
};

// 2. Search Packages by Destination
export const searchChatbotPackages = async (
  message,
  packageId = null
) => {
  const payload = { message };

  if (packageId) {
    payload.package_id = packageId;
  }

  const response = await publicApi.post(
    "/api/package/packages/chatbot/",
    payload
  );

  return response.data;
};

// 3. Any Query or Message
export const submitChatbotMessage = async (message) => {
  const response = await publicApi.post(
    "/api/package/messages/submit/",
    { message }
  );

  return response.data;
};

// 4. Popular Destinations
export const getPopularDestinations = async () => {
  const response = await publicApi.get(
    "/api/package/popular-destinations/"
  );

  return response.data;
};

// FlyingLyte Support Number
export const FLYINGLYTE_PHONE = "+919667455591";
