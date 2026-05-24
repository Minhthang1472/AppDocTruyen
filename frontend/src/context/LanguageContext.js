import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en';
import vi from '../locales/vi';

export const LanguageContext = createContext();

const translations = { en, vi };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('vi'); // Default to Vietnamese

  useEffect(() => {
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem('userLanguage');
      if (savedLang && translations[savedLang]) {
        setLanguageState(savedLang);
      } else {
        setLanguageState('vi');
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('userLanguage', lang);
  };

  const t = (key) => {
    const dict = translations[language] || translations['vi'];
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
