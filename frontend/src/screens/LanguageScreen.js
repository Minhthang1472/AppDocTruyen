import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LanguageContext } from '../context/LanguageContext';

const LANGUAGES = [
  { id: 'vn', code: 'VN', name: 'Tiếng Việt', original: 'Vietnamese' },
  { id: 'en', code: 'EN', name: 'Tiếng Anh', original: 'English' },
  { id: 'cn', code: 'CN', name: 'Tiếng Trung (Giản thể)', original: 'Simplified Chinese' },
  { id: 'jp', code: 'JP', name: 'Tiếng Nhật', original: 'Japanese' },
];

export default function LanguageScreen({ navigation }) {
  const { language, setLanguage, t } = React.useContext(LanguageContext);

  const handleSelectLanguage = (langId) => {
    if (langId === 'cn' || langId === 'jp') {
      Alert.alert('Thông báo', 'Hiện tại ngôn ngữ này đang trong quá trình cập nhật. Vui lòng quay lại sau!');
      return;
    }
    setLanguage(langId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('languageTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>{t('languageSubtitle')}</Text>
        
        <View style={styles.list}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity 
              key={lang.id} 
              style={[styles.langItem, language === lang.id && styles.langItemActive]}
              onPress={() => handleSelectLanguage(lang.id)}
            >
              <View style={styles.langLeft}>
                 <Text style={styles.langCode}>{lang.code}</Text>
                 <View>
                   <Text style={[styles.langName, language === lang.id && styles.textActive]}>{lang.name}</Text>
                   <Text style={styles.langOriginal}>{lang.original}</Text>
                 </View>
              </View>
              {language === lang.id && (
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#000" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1816',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2521',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 20,
  },
  list: {
    backgroundColor: '#231E1B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2521',
  },
  langItemActive: {
    backgroundColor: '#302620',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langCode: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
    width: 30,
  },
  langName: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 2,
  },
  textActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  langOriginal: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
