import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fetchChapters, api, fetchComments, postComment, fetchNovelDetails, rateNovel } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';

export default function NovelDetailScreen({ route, navigation }) {
  const { t } = useContext(LanguageContext);
  const novelId = route.params?.novelId;
  
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  // Rating state
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myReviewContent, setMyReviewContent] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (novelId) {
        loadNovelData();
      }
    }, [novelId])
  );

  const loadNovelData = async () => {
    setLoading(true);
    if (!novelId) return;
    
    const novelData = await fetchNovelDetails(novelId);
    setNovel(novelData);
    checkBookmarkStatus();
    loadComments();
    const chapsData = await fetchChapters(novelId, 1, 10);
    if (chapsData.chapters) {
      setChapters(chapsData.chapters);
      setPage(chapsData.currentPage);
      setTotalPages(chapsData.totalPages);
    }
    setLoading(false);
  };

  const loadComments = async () => {
     const data = await fetchComments(novelId);
     setComments(data);
  };

  const handlePostComment = async () => {
     if (!newComment.trim()) return;
     if (!novelId) return;
     try {
        const added = await postComment(novelId, newComment);
        setComments([added, ...comments]);
        setNewComment('');
     } catch (err) {
        alert('Vui lòng đăng nhập để bình luận!');
     }
  };

  const handleSubmitRating = async () => {
    if (!novelId) return;
    try {
      await rateNovel(novelId, { rating: myRating, content: myReviewContent });
      Alert.alert('Thành công', t('ratingSuccess'));
      setRatingModalVisible(false);
      // Reload novel details to update average rating
      const novelData = await fetchNovelDetails(novelId);
      setNovel(novelData);
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đánh giá');
    }
  };

  const checkBookmarkStatus = async () => {
     try {
        const res = await api.get('/users/library');
        const library = res.data;
        if (library.some(n => n._id === novelId)) {
           setIsBookmarked(true);
        }
     } catch (err) {
        console.log(err);
     }
  };

  const toggleBookmark = async () => {
     if (!novelId) return;
     try {
        const res = await api.post('/users/library/toggle', { novelId });
        const newStatus = res.data.isBookmarked;
        setIsBookmarked(newStatus);
        
        // Cập nhật số lượng hiển thị ngay lập tức (Real-time)
        setNovel(prev => {
          if (!prev) return prev;
          let currentCount = prev.followersCount || 0;
          if (newStatus) {
            currentCount += 1;
          } else {
            currentCount = Math.max(0, currentCount - 1);
          }
          return { ...prev, followersCount: currentCount };
        });
     } catch (err) {
        console.log(err);
     }
  };

  const loadMoreChapters = async () => {
    if (page >= totalPages || loadingMore || !novelId) return;
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
      <View style={{flex: 1}} />
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity style={[styles.headerIcon, {marginRight: 15}]} onPress={toggleBookmark}>
          <Feather name="heart" size={24} color={isBookmarked ? colors.primary : "#FFF"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setRatingModalVisible(true)}>
          <Feather name="star" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNovelInfo = () => (
    <View style={styles.novelInfoContainer}>
      <View style={styles.coverRow}>
        <Image source={{ uri: novel?.coverImage || 'https://via.placeholder.com/150' }} style={styles.detailCover} />
        <View style={styles.detailRight}>
          <Text style={styles.detailTitle}>{novel?.title}</Text>
          <Text style={styles.detailAuthor}>Tác giả: <Text style={{color: '#FFF'}}>{novel?.author || 'Đang cập nhật'}</Text></Text>
          <Text style={styles.detailStatus}>Trạng thái: <Text style={{color: colors.primary}}>{novel?.status || 'Ongoing'}</Text></Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBadge}>
               <Feather name="eye" size={12} color="#D4B895" />
               <Text style={styles.statText}>
                 {(() => {
                   const v = novel?.views || 0;
                   if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                   if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                   return v;
                 })()}
               </Text>
            </View>
            <View style={styles.statBadge}>
               <Feather name="heart" size={12} color="#D4B895" />
               <Text style={styles.statText}>{novel?.followersCount || 0}</Text>
            </View>
            <View style={styles.statBadge}>
               <Feather name="star" size={12} color="#D4B895" />
               <Text style={styles.statText}>{novel?.rating || 0} ({novel?.ratingCount || 0})</Text>
            </View>
            <View style={styles.statBadge}>
               <Feather name="list" size={12} color="#D4B895" />
               <Text style={styles.statText}>{chapters.length} Chương</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.genresRow}>
         {novel?.genres?.map((g, i) => (
           <View key={i} style={styles.genreBadgeInfo}>
             <Text style={styles.genreTextInfo}>{g}</Text>
           </View>
         ))}
      </View>

      <View style={styles.descriptionContainer}>
         <Text style={styles.sectionTitleInfo}>Giới thiệu</Text>
         <Text style={styles.descriptionText}>{novel?.description || 'Chưa có thông tin giới thiệu cho truyện này.'}</Text>
      </View>
      
      <Text style={[styles.sectionTitleInfo, { marginTop: 25, marginBottom: 15 }]}>Danh sách chương</Text>
    </View>
  );

  const renderChapterItem = ({ item }) => {
    let iconContent = <Text style={styles.chapterNumberText}>{item.chapterNumber}</Text>;
    let itemStyle = styles.chapterItem;
    let titleStyle = styles.chapterTitle;

    if (item.isCurrent) {
       iconContent = <Feather name="book-open" size={16} color="#000" />;
       itemStyle = [styles.chapterItem, styles.chapterItemCurrent];
       titleStyle = [styles.chapterTitle, { color: colors.primary }];
    } else if (item.isVip) {
       iconContent = <Feather name="lock" size={16} color="#A45BFF" />;
       itemStyle = [styles.chapterItem, { backgroundColor: '#403A3A' }];
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
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={chapters}
            keyExtractor={item => item._id}
            renderItem={renderChapterItem}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderNovelInfo}
            ListFooterComponent={
               <View>
                 {page < totalPages && novelId && (
                   <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreChapters} disabled={loadingMore}>
                     {loadingMore ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                     ) : (
                        <Text style={styles.loadMoreText}>Load More Chapters</Text>
                     )}
                   </TouchableOpacity>
                 )}
                 {renderComments()}
               </View>
            }
          />
        )}
      </View>

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('writeReview')}</Text>
            
            {/* Star Selector */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setMyRating(star)}>
                  <Ionicons 
                    name={star <= myRating ? "star" : "star-outline"} 
                    size={32} 
                    color="#FFD700" 
                    style={{ marginHorizontal: 5 }} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder={t('ratingPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={myReviewContent}
              onChangeText={setMyReviewContent}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRatingModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitRatingBtn} onPress={handleSubmitRating}>
                <Text style={styles.submitRatingBtnText}>{t('submitRating')}</Text>
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
    backgroundColor: '#3D332D',
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
    paddingHorizontal: 10,
    marginTop: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 184, 149, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  statText: {
    color: '#D4B895',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  novelInfoContainer: {
    paddingTop: 20,
  },
  coverRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailCover: {
    width: 100,
    height: 140,
    borderRadius: 8,
  },
  detailRight: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3D2A1D',
    marginBottom: 5,
  },
  detailAuthor: {
    fontSize: 14,
    color: '#A09D9A',
    marginBottom: 2,
  },
  detailStatus: {
    fontSize: 14,
    color: '#A09D9A',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  genreBadgeInfo: {
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.2)',
  },
  genreTextInfo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    backgroundColor: '#FAF7F5',
    padding: 15,
    borderRadius: 12,
  },
  sectionTitleInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D2A1D',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D2A1D',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  reviewInput: {
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    color: colors.text,
    minHeight: 100,
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  submitRatingBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  submitRatingBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
