import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LanguageContext } from '../context/LanguageContext';
import { getMyNovels , getImageUrl } from '../utils/api';

export default function StudioScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyNovels();
  }, []);

  const fetchMyNovels = async () => {
    setLoading(true);
    try {
      const data = await getMyNovels();
      setNovels(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNovel = (novelId, title) => {
    Alert.alert(
      'Xóa Truyện',
      `Cảnh báo: Bạn có chắc chắn muốn xóa truyện "${title}" không? TẤT CẢ các chương, bình luận và đánh giá của truyện này sẽ bị xóa VĨNH VIỄN!`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa Vĩnh Viễn', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteNovel } = require('../utils/api');
              await deleteNovel(novelId);
              Alert.alert('Thành công', 'Đã xóa truyện khỏi hệ thống.');
              fetchMyNovels(); // Refresh the list
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa truyện này.');
            }
          }
        }
      ]
    );
  };

  const renderNovel = ({ item }) => (
    <View style={styles.novelCard}>
      <Image source={{ uri: item.coverImage ? getImageUrl(item.coverImage) : 'https://via.placeholder.com/150' }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.stats}>Chương: {item.chaptersCount} • Xem: {item.views} • Theo dõi: {item.followersCount || 0}</Text>
          <View style={styles.actionRowContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'rgba(233, 69, 96, 0.1)', flex: 1 }]}
              onPress={() => navigation.navigate('CreateChapter', { novelId: item._id, novelTitle: item.title })}
            >
              <Feather name="plus-circle" size={14} color={colors.primary} />
              <Text style={styles.actionText}>Thêm Chương</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'rgba(52, 152, 219, 0.1)', flex: 1, marginLeft: 5 }]}
              onPress={() => navigation.navigate('ManageChapters', { novelId: item._id, novelTitle: item.title })}
            >
              <Feather name="list" size={14} color="#3498db" />
              <Text style={[styles.actionText, { color: '#3498db' }]}>Các Chương</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionRowContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'rgba(46, 204, 113, 0.1)', flex: 1 }]}
              onPress={() => navigation.navigate('EditNovel', { novel: item })}
            >
              <Feather name="edit" size={14} color="#2ecc71" />
              <Text style={[styles.actionText, { color: '#2ecc71' }]}>Sửa Truyện</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'rgba(231, 76, 60, 0.1)', flex: 1, marginLeft: 5 }]}
              onPress={() => handleDeleteNovel(item._id, item.title)}
            >
              <Feather name="trash-2" size={14} color="#e74c3c" />
              <Text style={[styles.actionText, { color: '#e74c3c' }]}>Xóa Truyện</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('myStudio')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={novels}
          keyExtractor={(item) => item._id}
          renderItem={renderNovel}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="book-open" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Bạn chưa đăng truyện nào.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateNovel')}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  list: {
    padding: 15,
    paddingBottom: 100,
  },
  novelCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  cover: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  stats: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionRowContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionText: {
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: 15,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  }
});
