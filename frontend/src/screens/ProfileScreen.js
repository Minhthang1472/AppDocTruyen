import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';

const MENU_ITEMS = {
  readingActivity: [
    { id: 'history', title: 'readingHistory', icon: 'clock' },
    { id: 'downloads', title: 'downloads', icon: 'download' },
    { id: 'bookmarks', title: 'bookmarks', icon: 'bookmark' },
  ],
  accountSettings: [
    { id: 'subscription', title: 'subscriptionPlan', icon: 'award' },
    { id: 'security', title: 'security', icon: 'shield' },
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
  const [editModal, setEditModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [stats, setStats] = useState({ storiesRead: 0, following: 0, points: '15k' });
  const { t } = React.useContext(LanguageContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
       loadUser();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
       setUser(JSON.parse(userInfo));
       setNewName(JSON.parse(userInfo).username);
    }
  };

  const handleLogout = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    navigation.replace('Login');
  };

  const handleSaveProfile = async () => {
     try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const res = await api.put('/users/profile', { username: newName });
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        setUser(res.data);
        setEditModal(false);
     } catch (err) {
        alert('Lỗi cập nhật');
     }
  };

  const handlePickAvatar = async () => {
     let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
     });

     if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        try {
           const AsyncStorage = require('@react-native-async-storage/async-storage').default;
           const res = await api.put('/users/profile', { avatar: base64Image });
           await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
           setUser(res.data);
        } catch (err) {
           alert('Lỗi cập nhật Avatar');
        }
     }
  };

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handlePickAvatar}>
           <Image 
             source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }} 
             style={styles.avatar} 
           />
           <View style={styles.cameraBadge}>
             <Feather name="camera" size={14} color="#000" />
           </View>
        </TouchableOpacity>
        <View style={styles.premiumBadge}>
          <Ionicons name="star" size={12} color="#000" />
        </View>
      </View>
      <Text style={styles.userName}>{user?.username || 'Guest'}</Text>
      <Text style={styles.userRole}>{t('premiumMember')}</Text>
      
      <TouchableOpacity style={styles.editButton} onPress={() => setEditModal(true)}>
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
                if (item.id === 'subscription') navigation.navigate('Subscription');
                if (item.id === 'security') navigation.navigate('Security');
                if (item.id === 'notifications') navigation.navigate('Notifications');
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
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', padding: 15}}>
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
      
      <Modal visible={editModal} transparent={true} animationType="fade">
         <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center'}}>
            <View style={{backgroundColor: colors.surface, padding: 20, borderRadius: 12, width: '80%'}}>
               <Text style={{color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>Edit Profile</Text>
               <TextInput 
                  style={{backgroundColor: colors.background, color: colors.text, padding: 10, borderRadius: 8, marginBottom: 15}}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Username"
                  placeholderTextColor={colors.textSecondary}
               />
               <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <TouchableOpacity onPress={() => setEditModal(false)} style={{padding: 10, marginRight: 10}}>
                     <Text style={{color: colors.textSecondary}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveProfile} style={{padding: 10, backgroundColor: colors.primary, borderRadius: 8}}>
                     <Text style={{color: '#000', fontWeight: 'bold'}}>Save</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
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
  cameraBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFF',
    width: 28,
    height: 28,
    borderRadius: 14,
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
