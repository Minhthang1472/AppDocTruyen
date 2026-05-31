import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchPopularNovels, fetchNovels , getImageUrl } from '../utils/api';
import { DISCOVERY_GENRES, TRENDING_SEARCHES } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../context/LanguageContext';

export default function DiscoveryScreen({ navigation, route }) {
  const { t } = useContext(LanguageContext);
  const initialCategory = route?.params?.category || null;
  const initialSearch = route?.params?.search || '';

  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('views');
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem('searchHistory');
      if (historyStr) {
        setSearchHistory(JSON.parse(historyStr));
      }
    } catch (error) {
      console.log('Error loading search history', error);
    }
  };

  const saveSearchHistory = async (query) => {
    if (!query.trim()) return;
    try {
      let currentHistory = [...searchHistory];
      currentHistory = currentHistory.filter(item => item !== query.trim());
      currentHistory.unshift(query.trim());
      if (currentHistory.length > 10) currentHistory.pop(); // Keep only last 10
      setSearchHistory(currentHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(currentHistory));
    } catch (error) {
      console.log('Error saving search history', error);
    }
  };

  const clearSearchHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem('searchHistory');
  };

  useEffect(() => {
     if (route?.params?.category) setCategory(route.params.category);
     if (route?.params?.search) {
        setSearchText(route.params.search);
        setSearchQuery(route.params.search);
     }
  }, [route?.params]);

  useEffect(() => {
    loadNovels();
  }, [searchQuery, category, status, sort]);

  const loadNovels = async () => {
    setLoading(true);
    if (searchQuery || category || status !== 'All' || sort !== 'views') {
       const data = await fetchNovels(category, searchQuery, status, sort);
       setPopular(data);
    } else {
       const data = await fetchPopularNovels();
       setPopular(data);
    }
    setLoading(false);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchText);
    saveSearchHistory(searchText);
  };

  const cycleStatus = () => {
     setStatus(s => s === 'All' ? 'Completed' : (s === 'Completed' ? 'Ongoing' : 'All'));
  };

  const cycleSort = () => {
     setSort(s => s === 'views' ? 'newest' : (s === 'newest' ? 'rating' : 'views'));
  };

  const clearFilters = () => {
     setSearchText('');
     setSearchQuery('');
     setCategory(null);
     setStatus('All');
     setSort('views');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Feather name="menu" size={24} color={colors.text} />
      <Text style={styles.logoText}>NOVELPORTAL</Text>
      <Feather name="search" size={24} color={colors.text} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={t('searchPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={() => { setSearchText(''); setSearchQuery(''); }} style={{padding: 5}}>
          <Feather name="x" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTrendingSearches = () => (
    <View style={styles.section}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
        <Text style={[styles.sectionTitle, {marginBottom: 0}]}>
          {searchHistory.length > 0 ? t('searchHistory') : t('trendingSearches')}
        </Text>
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={clearSearchHistory}>
             <Text style={{color: colors.textSecondary, fontSize: 12}}>{t('clearHistory')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.tagsContainer}>
        {(searchHistory.length > 0 ? searchHistory : TRENDING_SEARCHES).map((item, index) => (
          <TouchableOpacity key={index} style={styles.tag} onPress={() => { setSearchText(item); setSearchQuery(item); saveSearchHistory(item); }}>
             <Feather name={searchHistory.length > 0 ? "clock" : "trending-up"} size={14} color={colors.textSecondary} />
             <Text style={styles.tagText}>{t(item) || item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExploreGenres = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('exploreGenres')}</Text>
      <View style={styles.genreGrid}>
        {DISCOVERY_GENRES.map(genre => (
          <TouchableOpacity key={genre.id} style={[styles.genreCard, { backgroundColor: genre.color }]} onPress={() => setCategory(genre.name)}>
            <Feather name={genre.icon} size={24} color={colors.text} style={{ marginBottom: 10 }} />
            <Text style={styles.genreTitle} numberOfLines={2}>{t(genre.name) || genre.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity style={styles.filterButton} onPress={cycleStatus}>
        <Text style={styles.filterText}>
          {t('status')}: {status === 'All' ? t('statusAll') : (status === 'Completed' ? t('statusCompleted') : t('statusOngoing'))} <Feather name="refresh-cw" size={12} />
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton} onPress={cycleSort}>
        <Text style={styles.filterText}>
          {t('sortBy')}: {sort === 'views' ? t('sortPopular') : (sort === 'newest' ? t('sortNewest') : t('sortRating'))} <Feather name="refresh-cw" size={12} />
        </Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      {(searchQuery || category || status !== 'All' || sort !== 'views') && (
        <TouchableOpacity onPress={clearFilters} style={{flexDirection: 'row', alignItems: 'center'}}>
          <Feather name="x-circle" size={14} color="#EF4444" style={{marginRight: 4}} />
          <Text style={{color: '#EF4444', fontSize: 12}}>{t('clearFilters')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPopularItem = ({ item }) => (
    <TouchableOpacity style={styles.popularCard} onPress={() => navigation.navigate('NovelDetail', { novelId: item._id, novelTitle: item.title })}>
      <Image source={{ uri: item.coverImage ? getImageUrl(item.coverImage) : 'https://via.placeholder.com/150' || 'https://via.placeholder.com/150' }} style={styles.popularImage} />
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={10} color="#000" />
        <Text style={styles.ratingTextBadge}>{item.rating}</Text>
      </View>
      <Text style={styles.popularTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.popularSub}>{t(item.genres?.[0]) || item.genres?.[0] || 'Novel'} • {item.chaptersCount} Ch.</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {renderSearchBar()}
        {renderTrendingSearches()}
        {renderExploreGenres()}
        {renderFilters()}

        <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text style={styles.sectionTitle}>
             {(searchQuery || category || status !== 'All' || sort !== 'views') 
                ? (category ? `${t('novelGenre')}${t(category) || category}` : t('searchResults')) 
                : t('trendingNow')}
          </Text>
          <View style={{ flexDirection: 'row' }}>
             <Feather name="grid" size={20} color={colors.primary} style={{ marginRight: 15 }} />
             <Feather name="list" size={20} color={colors.textSecondary} />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={popular}
            keyExtractor={item => item._id}
            numColumns={2}
            renderItem={renderPopularItem}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={48} color={colors.border} />
                <Text style={styles.emptyText}>{t('noNovelsFound')}</Text>
                <Text style={styles.emptySubText}>{t('tryDifferentSearch')}</Text>
              </View>
            )}
          />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: colors.textSecondary,
    marginLeft: 5,
    fontSize: 14,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreCard: {
    width: '48%',
    height: 100,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'flex-end',
  },
  genreTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  popularCard: {
    width: '48%',
    marginBottom: 20,
  },
  popularImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingTextBadge: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  popularTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  popularSub: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 5,
  }
});
