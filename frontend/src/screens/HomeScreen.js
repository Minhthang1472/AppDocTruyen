import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchNovels, getImageUrl } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [editorPicks, setEditorPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = React.useContext(LanguageContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [featuredData, trendingData, editorData, allData] = await Promise.all([
      fetchNovels('featured'),
      fetchNovels('trending'),
      fetchNovels('editorPick'),
      fetchNovels()
    ]);
    
    // Fallback: nếu chưa có truyện nào được set isFeatured, isTrending, thì lấy truyện chung chung
    setFeatured(featuredData.length > 0 ? featuredData : allData.slice(0, 1));
    setTrending(trendingData.length > 0 ? trendingData : allData);
    setEditorPicks(editorData.length > 0 ? editorData : allData);
    
    setLoading(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Feather name="menu" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.logoText}>NOVELPORTAL</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Discovery')}>
        <Feather name="search" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderFeatured = () => {
    const mainFeatured = featured[0];
    if (!mainFeatured) return null;
    return (
      <View style={styles.featuredContainer}>
        <Image source={{ uri: getImageUrl(mainFeatured.coverImage) }} style={styles.featuredImage} />
        <View style={styles.featuredOverlay}>
          <View style={styles.tagsContainer}>
             {mainFeatured.genres.map((genre, index) => (
               <View key={index} style={styles.tag}>
                 <Text style={styles.tagText}>{t(genre).toUpperCase()}</Text>
               </View>
            ))}
            <View style={styles.tag}>
               <Text style={styles.tagText}>{t('featured')}</Text>
            </View>
          </View>
          <Text style={styles.featuredTitle}>{mainFeatured.title}</Text>
          <Text style={styles.featuredDesc} numberOfLines={2}>{mainFeatured.description}</Text>
          <View style={styles.featuredFooter}>
             <TouchableOpacity 
               style={styles.readButton}
               onPress={() => navigation.navigate('NovelDetail', { novelId: mainFeatured._id, novelTitle: mainFeatured.title })}
            >
              <Ionicons name="play" size={16} color="#000" />
              <Text style={styles.readButtonText}>{t('startReading')}</Text>
            </TouchableOpacity>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={styles.ratingText}>{mainFeatured.rating}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTrendingItem = ({ item, index }) => (
    <TouchableOpacity style={styles.trendingCard} onPress={() => navigation.navigate('NovelDetail', { novelId: item._id, novelTitle: item.title })}>
      <Image source={{ uri: getImageUrl(item.coverImage) }} style={styles.trendingImage} />
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.trendingSub}>
        <Ionicons name="star" size={10} color={colors.primary} /> {item.rating} • {t(item.genres[0])} • {(item.views / 1000000).toFixed(1)}M {t('views')}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title, categoryKey) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Discovery', { category: categoryKey })}>
        <Text style={styles.seeAllText}>{t('seeAll')} <Feather name="chevron-right" size={12} /></Text>
      </TouchableOpacity>
    </View>
  );

  const renderEditorPickItem = (item) => (
    <TouchableOpacity key={item._id} style={styles.editorPickCard} onPress={() => navigation.navigate('NovelDetail', { novelId: item._id, novelTitle: item.title })}>
      <Image source={{ uri: getImageUrl(item.coverImage) }} style={styles.editorImage} />
      <View style={styles.editorInfo}>
        <Text style={styles.editorTitle}>{item.title}</Text>
        <Text style={styles.editorDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.tagsContainer}>
          {item.genres.map((genre, idx) => (
            <View key={idx} style={styles.tagSmall}>
              <Text style={styles.tagTextSmall}>{t(genre).toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.bookmarkButton}>
        <Feather name="bookmark" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderFeatured()}
        
        <View style={styles.section}>
          {renderSectionHeader(t('trendingNow'), 'trending')}
          <FlatList
            horizontal
            data={trending}
            keyExtractor={item => item._id}
            renderItem={renderTrendingItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
          />
        </View>

        <View style={styles.section}>
          {renderSectionHeader(t('editorsPicks'), 'editorPick')}
          <View style={styles.editorList}>
             {editorPicks.map(item => renderEditorPickItem(item))}
          </View>
        </View>

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
  featuredContainer: {
    margin: 20,
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 15,
  },
  readButtonText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors.text,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 12,
  },
  hList: {
    paddingHorizontal: 20,
  },
  trendingCard: {
    width: 140,
    marginRight: 15,
  },
  trendingImage: {
    width: 140,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendingSub: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  editorList: {
    paddingHorizontal: 20,
  },
  editorPickCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  editorImage: {
    width: 60,
    height: 80,
    borderRadius: 6,
  },
  editorInfo: {
    flex: 1,
    marginLeft: 15,
  },
  editorTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  editorDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  tagSmall: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  tagTextSmall: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  bookmarkButton: {
    padding: 10,
  }
});
