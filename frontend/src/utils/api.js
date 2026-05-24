import axios from 'axios';
import { Platform } from 'react-native';

// NOTE: Thay đổi địa chỉ IP này thành IP máy tính của bạn nếu bạn chạy trên điện thoại (Expo Go)
// VD: const API_URL = 'http://192.168.1.5:5000/api';
// Nếu chạy máy ảo Android (Emulator), dùng 'http://10.0.2.2:5000/api'
// Nếu chạy máy ảo iOS (Simulator), dùng 'http://localhost:5000/api'

const getApiUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api'; // Android Emulator
    }
    return 'http://localhost:5000/api'; // iOS Simulator & Web
};

const API_URL = getApiUrl();

import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchNovels = async (category, search = '', status = 'All', sort = 'views') => {
    try {
        let url = '/novels?';
        if (category) url += `category=${category}&`;
        if (search) url += `search=${search}&`;
        if (status) url += `status=${status}&`;
        if (sort) url += `sort=${sort}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching novels:', error);
        return [];
    }
};

export const fetchComments = async (novelId) => {
    try {
        const response = await api.get(`/novels/${novelId}/comments`);
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
};

export const postComment = async (novelId, content) => {
    try {
        const response = await api.post(`/novels/${novelId}/comments`, { content });
        return response.data;
    } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
};

export const fetchPopularNovels = async () => {
    try {
        const response = await api.get('/novels/popular/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching popular novels:', error);
        return [];
    }
};

export const fetchNovelDetails = async (id) => {
    try {
        const response = await api.get(`/novels/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching novel details:', error);
        return null;
    }
};

export const fetchChapters = async (novelId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/chapters/novel/${novelId}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return { chapters: [], totalPages: 1, currentPage: 1 };
    }
};
