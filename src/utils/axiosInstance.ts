import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// Lấy API URL từ environment variables
 const API_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || "http://localhost:3000/api";
// const API_URL = Constants.expoConfig?.extra?.apiGatewayUrl || "https://api-gateway-6n1e.onrender.com/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm token tự động vào mỗi request nếu có
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token"); // Lấy token từ AsyncStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            await AsyncStorage.removeItem("token");
            // Có thể dispatch logout action ở đây nếu cần
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
