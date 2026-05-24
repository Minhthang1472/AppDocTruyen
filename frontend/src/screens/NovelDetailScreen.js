import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchChapters, api, fetchComments, postComment } from '../utils/api';
import { TextInput, Image } from 'react-native';

export default function NovelDetailScreen({ route, navigation }) {
  // Mock novelId for now if not provided
  const novelId = route.params?.novelId || 'mock_id';
  const novelTitle = route.params?.novelTitle || 'Thiên Đạo Đồ Thư Quán';
  
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadChapters();
    if (novelId !== 'mock_id') {
       checkBookmarkStatus();
       loadComments();
    }
  }, []);

  const loadComments = async () => {
     const data = await fetchComments(novelId);
     setComments(data);
  };

  const handlePostComment = async () => {
     if (!newComment.trim()) return;
     if (novelId === 'mock_id') return alert('Không thể bình luận truyện mẫu');
     try {
        const added = await postComment(novelId, newComment);
        setComments([added, ...comments]);
        setNewComment('');
     } catch (err) {
        alert('Vui lòng đăng nhập để bình luận!');
     }
  };

  const checkBookmarkStatus = async () => {
     try {
        const res = await api.get('/users/library');
        const library = res.data;
        if (library.some(novel => novel._id === novelId)) {
           setIsBookmarked(true);
        }
     } catch (err) {
        console.log(err);
     }
  };

  const toggleBookmark = async () => {
     if (novelId === 'mock_id') return alert('Đây là dữ liệu mẫu, không thể lưu!');
     try {
        const res = await api.post('/users/library/toggle', { novelId });
        setIsBookmarked(res.data.isBookmarked);
     } catch (err) {
        console.log(err);
     }
  };

  const handleDownloadAll = async () => {
     if (novelId === 'mock_id') return alert('Không thể tải truyện mẫu');
     try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        alert('Đang tải xuống...');
        
        const downloadsStr = await AsyncStorage.getItem('downloads') || '[]';
        let downloads = JSON.parse(downloadsStr);
        if (!downloads.find(d => d.novelId === novelId)) {
           downloads.push({ novelId, title: novelTitle, timestamp: Date.now() });
           await AsyncStorage.setItem('downloads', JSON.stringify(downloads));
        }
        
        // Save chapter contents offline
        for (let chap of chapters) {
           const res = await api.get(`/chapters/${chap._id}`);
           await AsyncStorage.setItem(`offline_chapter_${chap._id}`, JSON.stringify(res.data));
        }
        alert('Tải xuống hoàn tất! Bạn có thể xem trong Hồ sơ > Tải xuống');
     } catch (err) {
        alert('Lỗi khi tải xuống');
     }
  };

  const loadChapters = async () => {
    setLoading(true);
    // If we have a real ID, fetch from API. Otherwise, we just mock some data
    if (novelId !== 'mock_id') {
       const data = await fetchChapters(novelId, 1, 10);
       if (data.chapters) {
          setChapters(data.chapters);
          setPage(data.currentPage);
          setTotalPages(data.totalPages);
       }
    } else {
       // Mock data based on the design
       setChapters([
         { _id: '1', chapterNumber: 1, title: 'Chapter 1: The Awakening', isRead: true, time: '2 days ago • 15m read' },
         { _id: '2', chapterNumber: 2, title: 'Chapter 2: First Steps', isRead: true, time: '2 days ago • 12m read' },
         { _id: '3', chapterNumber: 3, title: 'Chapter 3: The Gathering Storm', isCurrent: true, time: 'Yesterday • 18m read' },
         { _id: '4', chapterNumber: 4, title: 'Chapter 4: Shadows in the Mist', time: '12 hours ago • 20m read' },
         { _id: '5', chapterNumber: 5, title: 'Chapter 5: Hidden Truths', isVip: true, coinsPrice: 50, time: '2 hours ago • 16m read' },
         { _id: '6', chapterNumber: 6, title: 'Chapter 6: The Duel', isVip: true, coinsPrice: 50, time: 'Just now • 22m read' },
       ]);
    }
    setLoading(false);
  };

  const loadMoreChapters = async () => {
    if (page >= totalPages || loadingMore || novelId === 'mock_id') return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchChapters(novelId, nextPage, 10);
    if (data.chapters) {
       setChapters(prev => [...prev, ...data.chapters]);
       setPage(data.currentPage);
       setTotalPages(data.totalPages);
    }
    setLoadingMore(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>{novelTitle}</Text>
        <Text style={styles.chapterCount}>{chapters.length} Chapters</Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity style={[styles.headerIcon, {marginRight: 15}]} onPress={handleDownloadAll}>
          <Feather name="download" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerIcon, {marginRight: 15}]} onPress={toggleBookmark}>
          <Feather name="heart" size={24} color={isBookmarked ? colors.primary : "#FFF"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('MainTabs', { screen: 'Discovery' })}>
          <Feather name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterRow = () => (
    <View style={styles.filterRow}>
      <View style={styles.sortContainer}>
        <Text style={styles.sortByText}>Sort by</Text>
        <TouchableOpacity style={styles.sortBadge} onPress={() => alert('Tính năng sắp xếp đang phát triển')}>
          <Text style={styles.sortBadgeText}>Newest <Feather name="arrow-down" size={12} /></Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => alert('Tính năng lọc đang phát triển')}>
        <Feather name="filter" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderChapterItem = ({ item }) => {
    let iconContent = <Text style={styles.chapterNumberText}>{item.chapterNumber}</Text>;
    let itemStyle = styles.chapterItem;
    let titleStyle = styles.chapterTitle;

    if (item.isRead) {
       iconContent = <Feather name="check" size={16} color={colors.textSecondary} />;
    } else if (item.isCurrent) {
       iconContent = <Feather name="book-open" size={16} color="#000" />;
       itemStyle = [styles.chapterItem, styles.chapterItemCurrent];
       titleStyle = [styles.chapterTitle, { color: colors.primary }];
    } else if (item.isVip) {
       iconContent = <Feather name="lock" size={16} color="#A45BFF" />;
       itemStyle = [styles.chapterItem, { backgroundColor: '#403A3A' }]; // Lighter gray for locked
    }

    return (
      <TouchableOpacity 
        style={itemStyle}
        onPress={() => navigation.navigate('Reading', { chapterId: item._id, title: item.title, novelId: novelId })}
      >
        <View style={styles.iconContainer(item.isCurrent)}>
           {iconContent}
        </View>
        <View style={styles.chapterInfo}>
          <Text style={titleStyle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.chapterSub}>{item.time || '10m read'}</Text>
        </View>
        {item.isVip && (
           <View style={styles.vipBadge}>
              <View style={styles.vipIconBg}>
                <Text style={styles.vipIconText}>VIP</Text>
              </View>
              <Text style={styles.coinsText}>{item.coinsPrice}</Text>
              <Text style={styles.coinsLabel}>Coins</Text>
           </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderComments = () => (
    <View style={styles.commentsSection}>
      <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
      
      <View style={styles.commentInputRow}>
        <TextInput 
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor="#A09D9A"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.commentBtn} onPress={handlePostComment}>
          <Feather name="send" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {comments.map((item, index) => (
        <View key={item._id || index} style={styles.commentItem}>
          <Image source={{ uri: item.user?.avatar || 'https://via.placeholder.com/50' }} style={styles.commentAvatar} />
          <View style={{flex: 1}}>
             <Text style={styles.commentUsername}>{item.user?.username || 'User'}</Text>
             <Text style={styles.commentText}>{item.content}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.content}>
        {renderFilterRow()}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={chapters}
            keyExtractor={item => item._id}
            renderItem={renderChapterItem}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
               <View>
                 {page < totalPages && novelId !== 'mock_id' ? (
                   <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreChapters} disabled={loadingMore}>
                     {loadingMore ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                     ) : (
                        <Text style={styles.loadMoreText}>Load More Chapters</Text>
                     )}
                   </TouchableOpacity>
                 ) : null}
                 {renderComments()}
               </View>
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
    backgroundColor: '#3D332D', // Dark brown header background from design
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chapterCount: {
    color: '#D4B895',
    fontSize: 12,
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortByText: {
    color: '#A09D9A',
    marginRight: 10,
    fontSize: 14,
  },
  sortBadge: {
    backgroundColor: '#3D2A1D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sortBadgeText: {
    color: '#D4B895',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D2A1D', // Dark card bg
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  chapterItemCurrent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: (isCurrent) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isCurrent ? colors.primary : 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  }),
  chapterNumberText: {
    color: '#A09D9A',
    fontWeight: 'bold',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chapterSub: {
    color: '#A09D9A',
    fontSize: 12,
  },
  vipBadge: {
    alignItems: 'center',
    marginLeft: 10,
  },
  vipIconBg: {
    borderWidth: 1,
    borderColor: '#A09D9A',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  vipIconText: {
    color: '#A09D9A',
    fontSize: 8,
    fontWeight: 'bold',
  },
  coinsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  coinsLabel: {
    color: '#A09D9A',
    fontSize: 8,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#FDECE4',
    borderRadius: 25,
    marginTop: 10,
  },
  loadMoreText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  commentsSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#FDECE4',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentInputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FDECE4',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
    color: '#000',
  },
  commentBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentUsername: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  commentText: {
    color: '#333',
  }
});
