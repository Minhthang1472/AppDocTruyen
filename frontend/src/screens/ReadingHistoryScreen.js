import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api , getImageUrl } from '../utils/api';
import moment from 'moment';

export default function ReadingHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     loadHistory();
  }, []);

  const loadHistory = async () => {
     try {
        const res = await api.get('/users/history');
        setHistory(res.data);
     } catch (err) {
        console.log('Error loading history:', err);
     }
     setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reading History</Text>
        <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Discovery' })}>
           <Feather name="search" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
           <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 50}} />
        ) : history.length === 0 ? (
           <Text style={{color: colors.textSecondary, textAlign: 'center', marginTop: 50}}>Chưa có lịch sử đọc truyện.</Text>
        ) : history.map((item, index) => (
           <TouchableOpacity key={index} style={styles.historyCard} onPress={() => navigation.navigate('Reading', { chapterId: item.lastChapter?._id, title: item.lastChapter?.title, novelId: item.novel?._id })}>
             <Image source={{ uri: item.novel?.coverImage ? getImageUrl(item.novel?.coverImage) : 'https://via.placeholder.com/150' || 'https://via.placeholder.com/60x80' }} style={styles.cardImage} />
             <View style={styles.cardInfo}>
                <View style={styles.topRow}>
                   <View style={styles.genreBadge}>
                      <Text style={styles.genreText}>{item.novel?.genres?.[0] || 'Novel'}</Text>
                   </View>
                   <Text style={styles.timeText}>{moment(item.readAt).fromNow()}</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.novel?.title}</Text>
                <Text style={styles.chapterText}>{item.lastChapter?.title || 'Chưa rõ'}</Text>
             </View>
             <TouchableOpacity style={styles.moreButton} onPress={() => alert('Tùy chọn')}>
                <Feather name="more-vertical" size={20} color={colors.textSecondary} />
             </TouchableOpacity>
           </TouchableOpacity>
        ))}
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
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#231E1B',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  genreBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)', // Green tint
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  chapterText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  moreButton: {
    paddingLeft: 10,
  }
});
