import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LanguageContext } from '../context/LanguageContext';
import { fetchChapters, deleteChapter } from '../utils/api';

export default function ManageChaptersScreen({ route, navigation }) {
  const { novelId, novelTitle } = route.params;
  const { t } = useContext(LanguageContext);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    setLoading(true);
    try {
      // Get a large limit to show all chapters for management
      const data = await fetchChapters(novelId, 1, 1000);
      setChapters(data.chapters || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (chapterId, title) => {
    Alert.alert(
      'Xóa Chương',
      `Bạn có chắc chắn muốn xóa chương "${title}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChapter(chapterId);
              Alert.alert('Thành công', 'Đã xóa chương.');
              loadChapters();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa chương.');
            }
          }
        }
      ]
    );
  };

  const renderChapter = ({ item }) => (
    <View style={styles.chapterRow}>
      <View style={styles.chapterInfo}>
        <Text style={styles.chapterTitle}>Chương {item.chapterNumber}: {item.title}</Text>
        <Text style={styles.chapterMeta}>Views: {item.views} {item.isVip ? `• VIP (${item.coinsPrice} Xu)` : ''}</Text>
      </View>
      <View style={styles.actionGroup}>
        <TouchableOpacity 
          style={[styles.iconBtn, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}
          onPress={() => navigation.navigate('EditChapter', { chapter: item })}
        >
          <Feather name="edit-2" size={18} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.iconBtn, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}
          onPress={() => handleDelete(item._id, item.title)}
        >
          <Feather name="trash-2" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Quản lý Chương</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.novelTitle}>{novelTitle}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item._id}
          renderItem={renderChapter}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có chương nào.</Text>
          }
        />
      )}
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
    flex: 1,
    textAlign: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: -8,
  },
  novelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    padding: 20,
    paddingBottom: 10,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  chapterInfo: {
    flex: 1,
    marginRight: 10,
  },
  chapterTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  chapterMeta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  actionGroup: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
  }
});
