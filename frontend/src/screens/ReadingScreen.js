import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../utils/api';
import Slider from '@react-native-community/slider';
import * as Brightness from 'expo-brightness';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function ReadingScreen({ route, navigation }) {
  const chapterId = route.params?.chapterId;
  const novelId = route.params?.novelId;
  const defaultTitle = route.params?.title || 'Chapter';

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Serif');
  const [bgColor, setBgColor] = useState('#1A1816'); // Dark by default
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [brightness, setBrightness] = useState(0.5);
  const [readingMode, setReadingMode] = useState('scroll'); // 'scroll' or 'page'

  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        const currentBrightness = await Brightness.getBrightnessAsync();
        setBrightness(currentBrightness);
      }
    })();
  }, []);

  const handleBrightnessChange = async (val) => {
    setBrightness(val);
    await Brightness.setBrightnessAsync(val);
  };

  useEffect(() => {
     loadSettings();
     loadChapterContent();
  }, []);

  const loadSettings = async () => {
     try {
        const savedSettings = await AsyncStorage.getItem('readingSettings');
        if (savedSettings) {
           const parsed = JSON.parse(savedSettings);
           if (parsed.fontSize) setFontSize(parsed.fontSize);
           if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
           if (parsed.bgColor) setBgColor(parsed.bgColor);
           if (parsed.textColor) setTextColor(parsed.textColor);
        }
     } catch (e) {
        console.log(e);
     }
  };

  const saveSettings = async (newSettings) => {
     try {
        const currentSettings = { fontSize, fontFamily, bgColor, textColor, ...newSettings };
        await AsyncStorage.setItem('readingSettings', JSON.stringify(currentSettings));
     } catch (e) {
        console.log(e);
     }
  };

  const loadChapterContent = async () => {
     try {
        const res = await api.get(`/chapters/${chapterId}`);
        setChapter(res.data);
        // Lưu lịch sử
        if (novelId) {
           await api.post('/users/history/add', { novelId, chapterId });
        }
     } catch (err) {
        console.log(err);
     }
     setLoading(false);
  };

  // Simple toggle for the modal
  const toggleSettings = () => {
    setSettingsVisible(!settingsVisible);
  };

  const handleBgChange = (bg, text) => {
    setBgColor(bg);
    setTextColor(text);
    saveSettings({ bgColor: bg, textColor: text });
  };

  const changeFontSize = (delta) => {
    const newSize = Math.max(12, Math.min(30, fontSize + delta));
    setFontSize(newSize);
    saveSettings({ fontSize: newSize });
  };

  const handleFontFamilyChange = (font) => {
    setFontFamily(font);
    saveSettings({ fontFamily: font });
  };

  if (loading) {
     return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center' }]}>
           <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
     );
  }

  const chapterTitle = chapter?.title || defaultTitle;
  const chapterContent = chapter?.content || 'Nội dung đang được cập nhật...';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Feather name="arrow-left" size={24} color={textColor} />
         </TouchableOpacity>
      </View>
      <ScrollView 
         contentContainerStyle={styles.scrollContent} 
         showsVerticalScrollIndicator={false}
         pagingEnabled={readingMode === 'page'}
         snapToInterval={readingMode === 'page' ? height - 100 : null}
      >
        <Text style={[styles.title, { color: textColor, fontSize: fontSize + 6, fontFamily: fontFamily === 'Serif' ? 'serif' : fontFamily === 'Mono' ? 'monospace' : 'sans-serif' }]}>
          {chapterTitle}
        </Text>
        <Text style={[styles.content, { color: textColor, fontSize: fontSize, fontFamily: fontFamily === 'Serif' ? 'serif' : fontFamily === 'Mono' ? 'monospace' : 'sans-serif' }]}>
          {chapterContent}
        </Text>
      </ScrollView>

      {/* Nút Cài đặt Nổi (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={toggleSettings}>
         <Feather name="settings" size={24} color="#000" />
      </TouchableOpacity>

      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleSettings}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleSettings}>
          <TouchableOpacity activeOpacity={1} style={styles.settingsContainer}>
            <View style={styles.dragHandle} />
            
            {/* Brightness / Font Size Sliders (Real UI) */}
            <View style={styles.settingRow}>
               <Feather name="sun" size={18} color={colors.text} />
               <Slider
                 style={{ flex: 1, marginHorizontal: 15, height: 40 }}
                 minimumValue={0}
                 maximumValue={1}
                 value={brightness}
                 onValueChange={handleBrightnessChange}
                 minimumTrackTintColor={colors.primary}
                 maximumTrackTintColor={colors.border}
                 thumbTintColor={colors.primary}
               />
               <Feather name="sun" size={24} color={colors.text} />
            </View>
            
            <View style={styles.settingRow}>
               <Text style={{color: colors.text, fontSize: 14}}>A</Text>
               <Slider
                 style={{ flex: 1, marginHorizontal: 15, height: 40 }}
                 minimumValue={12}
                 maximumValue={30}
                 step={1}
                 value={fontSize}
                 onValueChange={(val) => {
                   setFontSize(val);
                   saveSettings({ fontSize: val });
                 }}
                 minimumTrackTintColor={colors.primary}
                 maximumTrackTintColor={colors.border}
                 thumbTintColor={colors.primary}
               />
               <Text style={{color: colors.text, fontSize: 20}}>A</Text>
               <Text style={styles.fontSizeLabel}>{fontSize}px</Text>
            </View>

            {/* Font Family */}
            <Text style={styles.sectionTitle}>Kiểu chữ</Text>
            <View style={styles.optionsRow}>
               <TouchableOpacity 
                  style={[styles.optionBox, fontFamily === 'Sans' && styles.optionActive]}
                  onPress={() => handleFontFamilyChange('Sans')}
               >
                 <Text style={[styles.optionText, { fontFamily: 'sans-serif' }]}>Aa</Text>
                 <Text style={styles.optionSubText}>Sans</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                  style={[styles.optionBox, fontFamily === 'Serif' && styles.optionActive]}
                  onPress={() => handleFontFamilyChange('Serif')}
               >
                 <Text style={[styles.optionText, { fontFamily: 'serif' }]}>Aa</Text>
                 <Text style={styles.optionSubText}>Serif</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                  style={[styles.optionBox, fontFamily === 'Mono' && styles.optionActive]}
                  onPress={() => handleFontFamilyChange('Mono')}
               >
                 <Text style={[styles.optionText, { fontFamily: 'monospace' }]}>Aa</Text>
                 <Text style={styles.optionSubText}>Mono</Text>
               </TouchableOpacity>
            </View>

            {/* Background Color */}
            <Text style={styles.sectionTitle}>Màu nền</Text>
            <View style={styles.bgColorsRow}>
               <TouchableOpacity 
                  style={[styles.bgColorCircle, { backgroundColor: '#FFFFFF' }]} 
                  onPress={() => handleBgChange('#FFFFFF', '#000000')}
               >
                 {bgColor === '#FFFFFF' && <Feather name="check" size={20} color="#000" />}
               </TouchableOpacity>
               <TouchableOpacity 
                  style={[styles.bgColorCircle, { backgroundColor: '#FDF5E6' }]} // Sepia
                  onPress={() => handleBgChange('#FDF5E6', '#3E2723')}
               >
                 {bgColor === '#FDF5E6' && <Feather name="check" size={20} color="#000" />}
               </TouchableOpacity>
               <TouchableOpacity 
                  style={[styles.bgColorCircle, { backgroundColor: '#1A1816', borderWidth: 1, borderColor: colors.primary }]} 
                  onPress={() => handleBgChange('#1A1816', '#FFFFFF')}
               >
                 {bgColor === '#1A1816' && <Feather name="check" size={20} color={colors.primary} />}
               </TouchableOpacity>
            </View>

            {/* Reading Mode */}
            <Text style={styles.sectionTitle}>Chế độ đọc</Text>
            <View style={styles.optionsRow}>
               <TouchableOpacity 
                  style={[styles.modeBox, readingMode === 'scroll' && styles.modeBoxActive]}
                  onPress={() => setReadingMode('scroll')}
               >
                  <Feather name="arrow-down" size={16} color={readingMode === 'scroll' ? colors.primary : colors.textSecondary} style={{ marginRight: 5 }} />
                  <Text style={readingMode === 'scroll' ? styles.modeTextActive : styles.modeText}>Cuộn dọc</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                  style={[styles.modeBox, readingMode === 'page' && styles.modeBoxActive]}
                  onPress={() => setReadingMode('page')}
               >
                  <Feather name="book-open" size={16} color={readingMode === 'page' ? colors.primary : colors.textSecondary} style={{ marginRight: 5 }} />
                  <Text style={readingMode === 'page' ? styles.modeTextActive : styles.modeText}>Lật trang</Text>
               </TouchableOpacity>
            </View>

            {/* Save Settings Button */}
            <TouchableOpacity style={styles.saveButton} onPress={toggleSettings}>
               <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  content: {
    lineHeight: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  settingsContainer: {
    backgroundColor: '#1E1A18',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  sliderTrack: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 15,
    justifyContent: 'center',
  },
  sliderThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    position: 'absolute',
  },
  fontSizeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 15,
    width: 30,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  optionBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#2C2520',
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 5,
  },
  optionSubText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  bgColorsRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  bgColorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#2C2520',
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeBoxActive: {
    borderColor: colors.primary,
  },
  modeTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modeText: {
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  }
});
