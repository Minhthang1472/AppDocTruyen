import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function DownloadedSeriesScreen({ navigation }) {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
       const AsyncStorage = require('@react-native-async-storage/async-storage').default;
       const str = await AsyncStorage.getItem('downloads');
       if (str) {
          setDownloads(JSON.parse(str));
       }
    } catch (err) {
       console.log(err);
    }
    setLoading(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NovelPortal</Text>
        <Text style={styles.headerSub}>Downloads</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.storageCard}>
          <View style={styles.storageRow}>
             <View>
               <Text style={styles.storageTitle}>Storage Used</Text>
               <Text style={styles.storageSub}>Offline Novels & Manga</Text>
             </View>
             <Text style={styles.storageValue}>2.4 GB <Text style={{fontSize: 14, color: colors.textSecondary}}>/ 64 GB</Text></Text>
          </View>
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: '40%' }]} />
          </View>
          <View style={styles.storageFooter}>
             <Text style={styles.freeSpace}>Free Space: 61.6 GB</Text>
             <TouchableOpacity onPress={() => alert('Tính năng đang cập nhật')}>
               <Text style={styles.manageText}>Manage Storage</Text>
             </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Downloaded Series</Text>
        </View>

        {loading ? (
           <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 50}} />
        ) : downloads.length === 0 ? (
           <Text style={{color: colors.textSecondary, textAlign: 'center', marginTop: 50}}>Bạn chưa tải bộ truyện nào.</Text>
        ) : downloads.map((item, index) => (
          <TouchableOpacity key={index} style={styles.itemCard} onPress={() => navigation.navigate('NovelDetail', { novelId: item.novelId, novelTitle: item.title })}>
            <Image source={{ uri: item.coverImage ? getImageUrl(item.coverImage) : 'https://via.placeholder.com/150' || 'https://via.placeholder.com/60x80' }} style={styles.itemImg} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemSub}>Offline Available</Text>
              <View style={styles.statusRow}>
                 <Feather name="check-circle" size={14} color="#4ADE80" />
                 <Text style={styles.statusTextSuccess}>Downloaded</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreBtn} onPress={() => alert('Tính năng quản lý đang cập nhật')}>
              <Feather name="trash-2" size={20} color="#F87171" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2521',
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
  },
  content: {
    padding: 20,
  },
  storageCard: {
    backgroundColor: '#231E1B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  storageTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storageSub: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  storageValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#302620',
    borderRadius: 3,
    marginBottom: 15,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  storageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freeSpace: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  manageText: {
    color: '#FFF',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#231E1B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImg: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextSuccess: {
    color: '#4ADE80',
    fontSize: 12,
    marginLeft: 5,
  },
  statusTextProgress: {
    color: colors.primary,
    fontSize: 12,
    marginLeft: 5,
  },
  statusTextPaused: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 5,
  },
  downloadBarBg: {
    height: 3,
    backgroundColor: '#302620',
    borderRadius: 1.5,
    marginTop: 8,
    width: '80%',
  },
  downloadBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  moreBtn: {
    padding: 10,
  }
});
