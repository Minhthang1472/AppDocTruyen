import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function PreferencesScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(true);
  const [largeFont, setLargeFont] = useState(false);
  const [readingBackground, setReadingBackground] = useState('dark'); // 'dark', 'light', 'sepia'

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt Đọc truyện</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hiển thị</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="moon" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Chế độ tối (Dark Mode)</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={darkMode ? '#FFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="type" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Sử dụng Font chữ lớn</Text>
            </View>
            <Switch
              value={largeFont}
              onValueChange={setLargeFont}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={largeFont ? '#FFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Màu nền trang đọc (Reading Theme)</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity 
              style={[styles.themeBox, { backgroundColor: '#121212' }, readingBackground === 'dark' && styles.themeSelected]}
              onPress={() => setReadingBackground('dark')}
            >
              <Text style={{ color: '#FFF' }}>Tối</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeBox, { backgroundColor: '#F0F0F0' }, readingBackground === 'light' && styles.themeSelected]}
              onPress={() => setReadingBackground('light')}
            >
              <Text style={{ color: '#000' }}>Sáng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeBox, { backgroundColor: '#F4ECD8' }, readingBackground === 'sepia' && styles.themeSelected]}
              onPress={() => setReadingBackground('sepia')}
            >
              <Text style={{ color: '#5C4033' }}>Màu giấy cũ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cử chỉ & Điều hướng</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="mouse-pointer" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Chạm mép màn hình để qua trang</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#FFF'}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="chevrons-down" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Cuộn dọc liên tục</Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#FFF'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    color: colors.text,
    fontSize: 15,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeBox: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeSelected: {
    borderColor: colors.primary,
  }
});
