import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api , getImageUrl } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';

const TABS = ['Following', 'History', 'Download'];

export default function LibraryScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [collection, setCollection] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Following');

  useEffect(() => {
    // Focus listener to reload library when entering screen
    const unsubscribe = navigation.addListener('focus', () => {
       loadLibrary();
    });
    return unsubscribe;
  }, [navigation]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
        const [libRes, histRes] = await Promise.all([
           api.get('/users/library'),
           api.get('/users/history')
        ]);
        setCollection(libRes.data);
        setHistory(histRes.data);
    } catch (err) {
        console.log(err);
    }
    setLoading(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Feather name="menu" size={24} color={colors.text} />
      <Text style={styles.logoText}>NOVELPORTAL</Text>
      <Feather name="search" size={24} color={colors.text} />
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {TABS.map(tab => (
        <TouchableOpacity 
          key={tab} 
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab === 'Following' ? t('following') : (tab === 'History' ? t('readingHistory') : t('downloads'))}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContinueReading = () => {
    if (history.length === 0) return null;
    const item = history[0];
    const novel = item.novel;
    if (!novel) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('continueReading')}</Text>
        <TouchableOpacity style={styles.continueCard} onPress={() => navigation.navigate('NovelDetail', { novelId: novel._id })}>
          <Image source={{ uri: novel.coverImage ? getImageUrl(novel.coverImage) : 'https://via.placeholder.com/150' }} style={styles.continueImage} />
          <View style={styles.continueOverlay}>
            <View style={styles.tagSmall}>
              <Text style={styles.tagTextSmall}>NOVEL</Text>
            </View>
            <Text style={{color: '#A09D9A', fontSize: 10, marginLeft: 10}}>{t('recentlyRead')}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.continueInfo}>
          <Text style={styles.continueTitle}>{novel.title}</Text>
          <Text style={styles.continueDesc} numberOfLines={2}>{novel.description}</Text>
          
          <View style={styles.progressRow}>
             <Text style={styles.progressText}>{t('chapter')} {item.lastChapter?.chapterNumber || 1}</Text>
             <Text style={styles.progressText}>50{t('chapterComplete')}</Text>
          </View>
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: '50%' }]} />
          </View>

          <TouchableOpacity style={styles.resumeButton} onPress={() => navigation.navigate('Reading', { novelId: novel._id, chapterId: item.lastChapter?._id || '' })}>
            <Ionicons name="play" size={16} color="#000" />
            <Text style={styles.resumeButtonText}>{t('resumeChapter')}{item.lastChapter?.chapterNumber || 1}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCollectionItem = ({ item }) => {
    const novel = activeTab === 'History' ? item.novel : item;
    if (!novel) return null;
    return (
      <TouchableOpacity style={styles.collectionCard} onPress={() => navigation.navigate('NovelDetail', { novelId: novel._id, novelTitle: novel.title })}>
        <Image source={{ uri: novel.coverImage ? getImageUrl(novel.coverImage) : 'https://via.placeholder.com/150' || 'https://via.placeholder.com/150' }} style={styles.collectionImage} />
        <View style={styles.progressBarBgSmall}>
           <View style={[styles.progressBarFillSmall, { width: `${Math.random() * 80 + 10}%` }]} />
        </View>
        <Text style={styles.collectionTitle} numberOfLines={1}>{novel.title}</Text>
        <Text style={styles.collectionSub}>Ch. {activeTab === 'History' ? (item.lastChapter?.chapterNumber || 1) : Math.floor(Math.random() * 100)} / {novel.chaptersCount || '?'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        <Text style={styles.pageTitle}>{t('library')}</Text>
        {renderTabs()}

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {renderContinueReading()}
            
            <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={styles.sectionTitle}>{t('yourCollection')}</Text>
              <View style={{ flexDirection: 'row' }}>
                 <Feather name="filter" size={18} color={colors.textSecondary} style={{ marginRight: 15 }} />
                 <Feather name="grid" size={18} color={colors.textSecondary} />
              </View>
            </View>

            <FlatList
              data={activeTab === 'History' ? history : (activeTab === 'Following' ? collection : [])}
              keyExtractor={item => item._id}
              numColumns={2}
              renderItem={renderCollectionItem}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              ListEmptyComponent={
                 <View style={{padding: 20, alignItems: 'center'}}>
                    <Text style={{color: colors.textSecondary}}>{t('emptyLibrary')}</Text>
                 </View>
              }
            />
          </>
        )}
        <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  continueCard: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  continueOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagSmall: {
    backgroundColor: 'rgba(164, 91, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagTextSmall: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  continueInfo: {
    marginTop: 15,
  },
  continueTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  continueDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  resumeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  resumeButtonText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  collectionCard: {
    width: '48%',
    marginBottom: 20,
  },
  collectionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 5,
  },
  progressBarBgSmall: {
    width: '100%',
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  progressBarFillSmall: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  collectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  collectionSub: {
    color: colors.textSecondary,
    fontSize: 12,
  }
});
