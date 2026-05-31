import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, SafeAreaView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api, unlockChapter } from '../utils/api';
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
  const [hasAccess, setHasAccess] = useState(true);
  const [coinsPrice, setCoinsPrice] = useState(0);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Serif');
  const [bgColor, setBgColor] = useState('#1A1816'); // Dark by default
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [brightness, setBrightness] = useState(0.5);
  
  // Auto scroll feature
  const [autoScroll, setAutoScroll] = useState(false);
  const scrollViewRef = useRef(null);
  const scrollY = useRef(0);
  const scrollInterval = useRef(null);

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

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  useEffect(() => {
     loadChapterContent();
     
     return () => {
       if (scrollInterval.current) clearInterval(scrollInterval.current);
     };
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
        if (res.data.hasAccess === false) {
           setHasAccess(false);
           setCoinsPrice(res.data.coinsPrice || 50);
        } else {
           setHasAccess(true);
        }
        
        if (novelId) {
           await api.post('/users/history/add', { novelId, chapterId });
        }
     } catch (err) {
        console.log(err);
     }
     setLoading(false);
  };

  const handleUnlock = async () => {
    try {
      setLoading(true);
      const res = await unlockChapter(chapterId);
      Alert.alert('Thành công', `Bạn đã mở khóa chương này. Số dư còn: ${res.coinsLeft} Coins`);
      loadChapterContent();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể mở khóa. Có thể bạn không đủ Coin.');
      setLoading(false);
    }
  };

  const toggleSettings = () => {
    setSettingsVisible(!settingsVisible);
  };

  const handleBgChange = (bg, text) => {
    setBgColor(bg);
    setTextColor(text);
    saveSettings({ bgColor: bg, textColor: text });
  };

  const handleFontFamilyChange = (font) => {
    setFontFamily(font);
    saveSettings({ fontFamily: font });
  };

  const toggleAutoScroll = () => {
    if (autoScroll) {
      clearInterval(scrollInterval.current);
      setAutoScroll(false);
    } else {
      setAutoScroll(true);
      scrollInterval.current = setInterval(() => {
        scrollY.current += 1.5;
        scrollViewRef.current?.scrollTo({ y: scrollY.current, animated: false });
      }, 50);
    }
  };

  const handleScroll = (event) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
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
         
         <TouchableOpacity 
           style={[styles.autoScrollBtn, autoScroll && {backgroundColor: colors.primary}]} 
           onPress={toggleAutoScroll}
         >
           <Feather name={autoScroll ? "pause" : "chevrons-down"} size={20} color={autoScroll ? "#fff" : textColor} />
         </TouchableOpacity>
      </View>
      
      <ScrollView 
         ref={scrollViewRef}
         contentContainerStyle={styles.scrollContent} 
         showsVerticalScrollIndicator={false}
         onScroll={handleScroll}
         scrollEventThrottle={16}
      >
        <Text style={[styles.title, { color: textColor, fontSize: fontSize + 6, fontFamily: fontFamily === 'Serif' ? 'serif' : fontFamily === 'Mono' ? 'monospace' : 'sans-serif' }]}>
          {chapterTitle}
        </Text>
        
        {hasAccess ? (
          <Text style={[styles.content, { color: textColor, fontSize: fontSize, fontFamily: fontFamily === 'Serif' ? 'serif' : fontFamily === 'Mono' ? 'monospace' : 'sans-serif' }]}>
            {chapterContent}
          </Text>
        ) : (
          <View style={styles.vipContainer}>
            <View style={styles.blurEffect}>
               <Text style={[styles.content, { color: textColor, opacity: 0.3, fontSize: fontSize }]}>
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...
               </Text>
            </View>
            <View style={styles.lockBox}>
               <Feather name="lock" size={40} color="#FFD700" style={{marginBottom: 10}} />
               <Text style={styles.lockTitle}>Chương VIP</Text>
               <Text style={styles.lockDesc}>Bạn cần dùng Coin để mở khóa chương này</Text>
               <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
                 <Text style={styles.unlockBtnText}>Mở khóa ({coinsPrice} Coins)</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity 
            style={[styles.navBtn, !chapter?.prevChapterId && styles.navBtnDisabled]} 
            onPress={() => chapter?.prevChapterId && navigation.replace('Reading', { chapterId: chapter.prevChapterId, novelId })}
            disabled={!chapter?.prevChapterId}
          >
            <Feather name="chevron-left" size={20} color={!chapter?.prevChapterId ? '#555' : '#000'} />
            <Text style={[styles.navBtnText, !chapter?.prevChapterId && {color: '#555'}]}>Chương trước</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navBtn, !chapter?.nextChapterId && styles.navBtnDisabled]} 
            onPress={() => chapter?.nextChapterId && navigation.replace('Reading', { chapterId: chapter.nextChapterId, novelId })}
            disabled={!chapter?.nextChapterId}
          >
            <Text style={[styles.navBtnText, !chapter?.nextChapterId && {color: '#555'}]}>Chương sau</Text>
            <Feather name="chevron-right" size={20} color={!chapter?.nextChapterId ? '#555' : '#000'} />
          </TouchableOpacity>
        </View>
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
            
            {/* Brightness / Font Size Sliders */}
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

            {/* Save Settings Button */}
            <TouchableOpacity style={styles.saveButton} onPress={toggleSettings}>
               <Text style={styles.saveButtonText}>Đóng cài đặt</Text>
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
    justifyContent: 'space-between',
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
  autoScrollBtn: {
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
    marginTop: 10,
  },
  content: {
    lineHeight: 32,
  },
  vipContainer: {
    position: 'relative',
    marginTop: 20,
    alignItems: 'center',
  },
  blurEffect: {
    width: '100%',
    overflow: 'hidden',
  },
  lockBox: {
    position: 'absolute',
    top: 50,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  lockTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lockDesc: {
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  unlockBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  unlockBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 140,
    justifyContent: 'center',
  },
  navBtnDisabled: {
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  navBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    marginHorizontal: 5,
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
  }
});
