import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const verifyAuth = async (token: string | null) => {
  try {
    const response = await api.get('/api/auth/verify', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('verifyAuth error:', error);
    throw new Error('Authentication failed');
  }
};

export const sendChatMessage = async (
  messages: { role: string; content: string }[],
  userId: string | null,
  sessionId: string | null,
  token: string | null
) => {
  try {
    const response = await api.post(
      '/api/chatbot/chat',
      { messages, user_id: userId, session_id: sessionId },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data as ChatResponse;
  } catch (error) {
    console.error('sendChatMessage error:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

export const filterColleges = async (
  filter: FilterRequest,
  token: string | null
) => {
  try {
    const response = await api.post(
      '/api/filters/filter',
      filter,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data.results as CollegeEntry[];
  } catch (error) {
    console.error('filterColleges error:', error);
    throw new Error('Failed to filter colleges');
  }
};

export const getSessions = async (
  userId: string,
  token: string | null
) => {
  try {
    const response = await api.get(
      `/api/chatbot/sessions/${userId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data as SessionsResponse;
  } catch (error) {
    console.error('getSessions error:', error);
    throw new Error('Failed to fetch sessions');
  }
};

export const getSessionMessages = async (
  userId: string,
  sessionId: string,
  token: string | null
) => {
  try {
    const response = await api.get(
      `/api/chatbot/messages/${userId}/${sessionId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data as MessagesResponse;
  } catch (error) {
    console.error('getSessionMessages error:', error);
    throw new Error('Failed to fetch session messages');
  }
};

export default api;