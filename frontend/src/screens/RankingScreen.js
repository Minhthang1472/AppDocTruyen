import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchNovels , getImageUrl } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';

const TABS = ['Daily', 'Weekly', 'Monthly', 'All-Time'];

export default function RankingScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily');

  useEffect(() => {
    loadRanking();
  }, [activeTab]);

  const loadRanking = async () => {
    setLoading(true);
    let sortParam = 'views';
    if (activeTab === 'Weekly') sortParam = 'newest';
    if (activeTab === 'Monthly') sortParam = 'rating';
    if (activeTab === 'All-Time') sortParam = 'views'; // We could add a different one, but views works for all-time

    const data = await fetchNovels(null, '', 'All', sortParam);
    setNovels(data);
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
            {tab === 'Daily' ? t('daily') : (tab === 'Weekly' ? t('weekly') : (tab === 'Monthly' ? t('monthly') : t('allTime')))}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTopThree = () => {
    if (novels.length === 0) return null;
    
    const top1 = novels[0];
    const top2 = novels.length > 1 ? novels[1] : null;
    const top3 = novels.length > 2 ? novels[2] : null;

    return (
      <View style={styles.topThreeContainer}>
        {/* Top 2 */}
        {top2 ? (
          <TouchableOpacity style={styles.topItem} onPress={() => navigation.navigate('NovelDetail', { novelId: top2._id, novelTitle: top2.title })}>
            <Text style={[styles.rankNumberText, { color: '#FFD700' }]}>2</Text>
            <Image source={{ uri: top2.coverImage ? getImageUrl(top2.coverImage) : 'https://via.placeholder.com/150' }} style={styles.topImageSmall} />
            <View style={styles.topOverlay}>
              <Text style={styles.topTitle} numberOfLines={1}>{top2.title}</Text>
              <Text style={styles.topViews}><Feather name="trending-up" size={10} /> {(top2.views/1000).toFixed(0)}K</Text>
            </View>
          </TouchableOpacity>
        ) : <View style={styles.topItem} />}

        {/* Top 1 */}
        <TouchableOpacity style={[styles.topItem, { marginTop: -20, zIndex: 10 }]} onPress={() => navigation.navigate('NovelDetail', { novelId: top1._id, novelTitle: top1.title })}>
          <Text style={[styles.rankNumberText, { color: '#FFA500', fontSize: 40 }]}>1</Text>
          <Image source={{ uri: top1.coverImage ? getImageUrl(top1.coverImage) : 'https://via.placeholder.com/150' }} style={styles.topImageLarge} />
          <View style={styles.hotBadge}><Feather name="trending-up" size={10} color="#000" /><Text style={{ fontSize: 10, fontWeight: 'bold' }}>{t('hot')}</Text></View>
          <View style={styles.topOverlay}>
            <Text style={[styles.topTitle, { fontSize: 16 }]} numberOfLines={2}>{top1.title}</Text>
            <Text style={styles.topViews}><Feather name="trending-up" size={10} /> {(top1.views/1000).toFixed(0)}K</Text>
          </View>
        </TouchableOpacity>

        {/* Top 3 */}
        {top3 ? (
          <TouchableOpacity style={styles.topItem} onPress={() => navigation.navigate('NovelDetail', { novelId: top3._id, novelTitle: top3.title })}>
            <Text style={[styles.rankNumberText, { color: '#CD7F32' }]}>3</Text>
            <Image source={{ uri: top3.coverImage ? getImageUrl(top3.coverImage) : 'https://via.placeholder.com/150' }} style={styles.topImageSmall} />
            <View style={styles.topOverlay}>
              <Text style={styles.topTitle} numberOfLines={1}>{top3.title}</Text>
              <Text style={styles.topViews}><Feather name="trending-up" size={10} /> {(top3.views/1000).toFixed(0)}K</Text>
            </View>
          </TouchableOpacity>
        ) : <View style={styles.topItem} />}
      </View>
    );
  };

  const renderListItem = ({ item, index }) => {
    if (index < 3) return null; // Skip top 3
    return (
      <TouchableOpacity style={styles.listCard} onPress={() => navigation.navigate('NovelDetail', { novelId: item._id, novelTitle: item.title })}>
        <Text style={styles.listRank}>{index + 1}</Text>
        <Image source={{ uri: item.coverImage ? getImageUrl(item.coverImage) : 'https://via.placeholder.com/150' }} style={styles.listImage} />
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{item.title}</Text>
          <Text style={styles.listSub}>{item.genres.map(g => t(g) || g).join(' • ')}</Text>
          <View style={styles.listStats}>
            <View style={styles.tagSmall}>
              <Text style={styles.tagTextSmall}>{t(item.genres[0]) || item.genres[0]}</Text>
            </View>
            <Text style={styles.listViews}><Feather name="trending-up" size={12} color={colors.primary} /> {(item.views/1000).toFixed(0)}K</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <View style={styles.content}>
        <Text style={styles.pageTitle}>{t('ranking')}</Text>
        {renderTabs()}

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={novels}
            keyExtractor={item => item._id}
            ListHeaderComponent={renderTopThree}
            renderItem={renderListItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListFooterComponent={
              <TouchableOpacity style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: colors.primary, fontSize: 16 }}>{t('viewFullRanking')} <Feather name="chevron-down" /></Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5', // Light background as in design for ranking
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
  },
  logoText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4B895',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#3D2A1D',
    borderRadius: 30,
    padding: 5,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#C5A5FF',
  },
  tabText: {
    color: '#D4B895',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#3D2A1D',
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  topItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  rankNumberText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: -15,
    zIndex: 10,
  },
  topImageSmall: {
    width: 90,
    height: 130,
    borderRadius: 8,
  },
  topImageLarge: {
    width: 110,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  topOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
  },
  topTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topViews: {
    color: colors.primary,
    fontSize: 10,
    marginTop: 2,
  },
  hotBadge: {
    position: 'absolute',
    top: 25,
    right: -10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D2A1D',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  listRank: {
    color: '#D4B895',
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  listImage: {
    width: 50,
    height: 70,
    borderRadius: 6,
    marginRight: 15,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listSub: {
    color: '#A09D9A',
    fontSize: 12,
    marginBottom: 8,
  },
  listStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagSmall: {
    backgroundColor: 'rgba(164, 91, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 15,
  },
  tagTextSmall: {
    color: '#C5A5FF',
    fontSize: 10,
  },
  listViews: {
    color: '#D4B895',
    fontSize: 12,
  }
});
