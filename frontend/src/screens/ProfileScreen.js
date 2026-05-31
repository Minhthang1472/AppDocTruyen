import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api, getProfile } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';

const MENU_ITEMS = {
  readingActivity: [
    { id: 'history', title: 'readingHistory', icon: 'clock' },
    { id: 'downloads', title: 'downloads', icon: 'download' },
    { id: 'bookmarks', title: 'bookmarks', icon: 'bookmark' },
    { id: 'studio', title: 'myStudio', icon: 'pen-tool', color: '#FFC107' },
  ],
  accountSettings: [
    { id: 'subscription', title: 'subscriptionPlan', icon: 'award' },
    { id: 'notifications', title: 'notifications', icon: 'bell' },
  ],
  appSettings: [
    { id: 'preferences', title: 'readingPreferences', icon: 'sliders', color: '#4ADE80' },
    { id: 'language', title: 'language', icon: 'globe', color: '#4ADE80' },
    { id: 'help', title: 'helpSupport', icon: 'help-circle', color: '#4ADE80' },
  ]
};

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ storiesRead: 0, following: 0, points: '0 Coins' });
  const { t } = React.useContext(LanguageContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setNewName(data.username);

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('userInfo', JSON.stringify(data));

      // Fetch stats
      const resStats = await api.get('/users/profile/stats');
      setStats({
        storiesRead: resStats.data.storiesRead || 0,
        following: resStats.data.following || 0,
        points: data.coins !== undefined ? `${data.coins} Coins` : '0 Coins'
      });
    } catch (e) {
      console.log('Error loading profile:', e);
      // Fallback
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    }
  };

  const handleLogout = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    navigation.replace('Login');
  };



  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.premiumBadge}>
          <Ionicons name="star" size={12} color="#000" />
        </View>
      </View>
      <Text style={styles.userName}>{user?.username || t('guest')}</Text>
      {user?.bio ? (
        <Text style={styles.userBio}>{user.bio}</Text>
      ) : null}
      <Text style={styles.userRole}>{user?.isPremium ? t('premiumMember') : t('normalUser')}</Text>

      <View style={{ backgroundColor: 'rgba(197, 165, 255, 0.1)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginBottom: 15 }}>
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{user?.coins || 0} Coins</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
        <Feather name="edit-2" size={14} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <Text style={styles.editButtonText}>{t('editProfile')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.storiesRead}</Text>
        <Text style={styles.statLabel}>{t('storiesRead')}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.following}</Text>
        <Text style={styles.statLabel}>{t('following')}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.points}</Text>
        <Text style={styles.statLabel}>{t('points')}</Text>
      </View>
    </View>
  );

  const renderMenuSection = (title, items) => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <View style={styles.menuList}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, index !== items.length - 1 && styles.menuItemBorder]}
            onPress={() => {
              if (item.id === 'history') navigation.navigate('ReadingHistory');
              if (item.id === 'downloads') navigation.navigate('DownloadedSeries');
              if (item.id === 'bookmarks') navigation.navigate('Library');
              if (item.id === 'studio') navigation.navigate('Studio');
              if (item.id === 'subscription') navigation.navigate('Subscription');
              if (item.id === 'notifications') navigation.navigate('Notifications');
              if (item.id === 'preferences') navigation.navigate('Preferences');
              if (item.id === 'language') navigation.navigate('Language');
              if (item.id === 'help') navigation.navigate('HelpSupport');
            }}
          >
            <View style={styles.menuItemLeft}>
              <Feather name={item.icon} size={20} color={item.color || colors.primary} style={{ marginRight: 15 }} />
              <Text style={styles.menuItemText}>{t(item.title)}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 15 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {renderHeader()}
        {renderStats()}

        {renderMenuSection(t('readingActivity'), MENU_ITEMS.readingActivity)}
        {renderMenuSection(t('accountSettings'), MENU_ITEMS.accountSettings)}
        {renderMenuSection(t('appSettings'), MENU_ITEMS.appSettings)}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.primary} style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Slightly lighter dark for profile bg
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  userName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userBio: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 30,
  },
  userRole: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  statValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  menuSection: {
    marginBottom: 25,
  },
  menuSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
