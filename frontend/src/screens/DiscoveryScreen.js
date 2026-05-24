import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchPopularNovels, fetchNovels } from '../utils/api';

const TRENDING_SEARCHES = ['Tu Tiên', 'Hệ Thống', 'Tiên Hiệp', 'Ngôn Tình'];
const GENRES = [
  { id: '1', name: 'Tu Tiên', icon: 'cloud', color: '#0f766e' },
  { id: '2', name: 'Hành Động', icon: 'crosshair', color: '#7f1d1d' },
  { id: '3', name: 'Fantasy', icon: 'star', color: '#4c1d95' },
  { id: '4', name: 'Romance', icon: 'heart', color: '#78350f' },
];

export default function DiscoveryScreen({ navigation, route }) {
  const initialCategory = route?.params?.category || null;
  const initialSearch = route?.params?.search || '';

  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('views');
  const [viewMode, setViewMode] = useState('grid');

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
        placeholder="Search novels..."
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
      <Text style={styles.sectionTitle}>Trending Searches</Text>
      <View style={styles.tagsContainer}>
        {TRENDING_SEARCHES.map((item, index) => (
          <TouchableOpacity key={index} style={styles.tag} onPress={() => { setSearchText(item); setSearchQuery(item); }}>
             <Feather name="trending-up" size={14} color={colors.textSecondary} />
             <Text style={styles.tagText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExploreGenres = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Explore Genres</Text>
      <View style={styles.genreGrid}>
        {GENRES.map(genre => (
          <TouchableOpacity key={genre.id} style={[styles.genreCard, { backgroundColor: genre.color }]} onPress={() => setCategory(genre.name)}>
            <Feather name={genre.icon} size={24} color={colors.text} style={{ marginBottom: 10 }} />
            <Text style={styles.genreTitle}>{genre.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity style={styles.filterButton} onPress={cycleStatus}>
        <Text style={styles.filterText}>Status: {status} <Feather name="refresh-cw" size={12} /></Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton} onPress={cycleSort}>
        <Text style={styles.filterText}>Sort: {sort === 'views' ? 'Popular' : (sort === 'newest' ? 'Newest' : 'Rating')} <Feather name="refresh-cw" size={12} /></Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      {(searchQuery || category || status !== 'All' || sort !== 'views') && (
        <TouchableOpacity onPress={clearFilters} style={{flexDirection: 'row', alignItems: 'center'}}>
          <Feather name="x-circle" size={14} color="#EF4444" style={{marginRight: 4}} />
          <Text style={{color: '#EF4444', fontSize: 12}}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPopularItem = ({ item }) => (
    <TouchableOpacity style={styles.popularCard} onPress={() => navigation.navigate('NovelDetail', { novelId: item._id, novelTitle: item.title })}>
      <Image source={{ uri: item.coverImage || 'https://via.placeholder.com/150' }} style={styles.popularImage} />
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={10} color="#000" />
        <Text style={styles.ratingTextBadge}>{item.rating}</Text>
      </View>
      <Text style={styles.popularTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.popularSub}>{item.genres?.[0] || 'Novel'} • {item.chaptersCount} Ch.</Text>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.listCard} onPress={() => navigation.navigate('NovelDetail', { novelId: item._id, novelTitle: item.title })}>
      <Image source={{ uri: item.coverImage || 'https://via.placeholder.com/150' }} style={styles.listImage} />
      <View style={styles.listInfo}>
        <Text style={styles.popularTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.popularSub}>{item.genres?.[0] || 'Novel'} • {item.chaptersCount} Ch.</Text>
        <View style={styles.listRatingBadge}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={styles.listRatingText}>{item.rating}</Text>
        </View>
      </View>
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
                ? (category ? `${category} Novels` : 'Search Results') 
                : 'Popular Now'}
          </Text>
          <View style={{ flexDirection: 'row' }}>
             <TouchableOpacity onPress={() => setViewMode('grid')} style={{ padding: 5 }}>
               <Feather name="grid" size={20} color={viewMode === 'grid' ? colors.primary : colors.textSecondary} style={{ marginRight: 10 }} />
             </TouchableOpacity>
             <TouchableOpacity onPress={() => setViewMode('list')} style={{ padding: 5 }}>
               <Feather name="list" size={20} color={viewMode === 'list' ? colors.primary : colors.textSecondary} />
             </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            key={viewMode}
            data={popular}
            keyExtractor={item => item._id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            renderItem={viewMode === 'grid' ? renderPopularItem : renderListItem}
            scrollEnabled={false}
            columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
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
  listCard: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listImage: {
    width: 100,
    height: 140,
  },
  listInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  listRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  listRatingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  }
});
