import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'update',
    title: 'Truyện Hệ Thống Phản Diện vừa ra Chương 400: Cuộc Gặp Gỡ Bất Ngờ.',
    time: '2 phút trước',
    isNew: true,
  },
  {
    id: '2',
    type: 'system',
    title: 'Gói hội viên Premium của bạn sẽ hết hạn trong 3 ngày tới. Gia hạn ngay để không gián đoạn trải nghiệm.',
    time: '5 giờ trước',
    isNew: false,
  },
  {
    id: '3',
    type: 'alert',
    title: 'Bảo trì hệ thống định kỳ từ 02:00 - 04:00 AM ngày mai. Vui lòng lưu lại tiến trình đọc của bạn.',
    time: '1 ngày trước',
    isNew: false,
  },
  {
    id: '4',
    type: 'update',
    title: 'Truyện Đại Quản Gia Là Ma Hoàng vừa ra Chương 1055.',
    time: '2 ngày trước',
    isNew: false,
  },
  {
    id: '5',
    type: 'comment',
    title: 'Độc Giả Ẩn Danh đã phản hồi bình luận của bạn trong Thần Đạo Đan Tôn.',
    time: '3 ngày trước',
    isNew: false,
  }
];

export default function NotificationsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');

  const getIconForType = (type) => {
    switch (type) {
      case 'update': return <Feather name="book" size={18} color="#FF9800" />;
      case 'system': return <Feather name="award" size={18} color="#A45BFF" />;
      case 'alert': return <Feather name="alert-circle" size={18} color="#F44336" />;
      case 'comment': return <Feather name="message-square" size={18} color="#4ADE80" />;
      default: return <Feather name="bell" size={18} color={colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.pageTitleContainer}>
         <Text style={styles.pageTitle}>Thông báo</Text>
      </View>

      <View style={styles.tabsContainer}>
         <TouchableOpacity onPress={() => setActiveTab('all')} style={[styles.tab, activeTab === 'all' && styles.activeTab]}>
           <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => setActiveTab('updates')} style={[styles.tab, activeTab === 'updates' && styles.activeTab]}>
           <Text style={[styles.tabText, activeTab === 'updates' && styles.activeTabText]}>Cập nhật truyện</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => setActiveTab('system')} style={[styles.tab, activeTab === 'system' && styles.activeTab]}>
           <Text style={[styles.tabText, activeTab === 'system' && styles.activeTabText]}>Hệ thống</Text>
         </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.filter((item) => {
           if (activeTab === 'all') return true;
           if (activeTab === 'updates') return item.type === 'update';
           if (activeTab === 'system') return item.type === 'system' || item.type === 'alert';
           return true;
        }).map((item) => (
           <TouchableOpacity key={item.id} style={styles.notiCard}>
             <View style={styles.iconCircle}>
                {getIconForType(item.type)}
             </View>
             <View style={styles.notiInfo}>
                <Text style={styles.notiTitle}>{item.title}</Text>
                <Text style={styles.notiTime}>{item.time}</Text>
             </View>
             {item.isNew && <View style={styles.newDot} />}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconButton: {
    padding: 5,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  pageTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pageTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    paddingHorizontal: 20,
  },
  notiCard: {
    flexDirection: 'row',
    backgroundColor: '#231E1B',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#302620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notiInfo: {
    flex: 1,
  },
  notiTitle: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notiTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 10,
  }
});
