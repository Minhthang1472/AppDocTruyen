import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SecurityScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảo mật</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.alertBox}>
          <View style={styles.alertIcon}>
             <Feather name="shield" size={20} color="#FFF" />
          </View>
          <View style={styles.alertInfo}>
             <Text style={styles.alertTitle}>Tài khoản được bảo vệ tốt</Text>
             <Text style={styles.alertDesc}>Bạn đã bật xác thực 2 lớp, & cập nhật mật khẩu định kỳ để duy trì an toàn.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Đăng nhập & Xác thực</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Tính năng đang cập nhật')}>
            <View style={styles.menuLeft}>
               <Feather name="lock" size={20} color={colors.primary} style={styles.menuIcon} />
               <View>
                 <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
                 <Text style={styles.menuSub}>Cập nhật lần cuối: 3 tháng trước</Text>
               </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Tính năng đang cập nhật')}>
            <View style={styles.menuLeft}>
               <Feather name="smartphone" size={20} color={colors.primary} style={styles.menuIcon} />
               <View>
                 <Text style={styles.menuTitle}>Xác thực 2 lớp (2FA)</Text>
                 <Text style={styles.menuSubSuccess}>Đang bật</Text>
               </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Tính năng đang cập nhật')}>
            <View style={styles.menuLeft}>
               <Feather name="mail" size={20} color={colors.primary} style={styles.menuIcon} />
               <View>
                 <Text style={styles.menuTitle}>Email khôi phục</Text>
                 <Text style={styles.menuSub}>us***@novelportal.com</Text>
               </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Thiết bị & Phiên hoạt động</Text>
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
               <Feather name="smartphone" size={20} color={colors.textSecondary} style={styles.menuIcon} />
               <View>
                 <View style={styles.row}>
                    <Text style={styles.menuTitle}>iPhone 14 Pro Max</Text>
                    <View style={styles.badgeSuccess}>
                       <Text style={styles.badgeSuccessText}>Hiện tại</Text>
                    </View>
                 </View>
                 <Text style={styles.menuSub}>Hà Nội, VN • Hoạt động ngày lúc này</Text>
               </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
               <Feather name="monitor" size={20} color={colors.textSecondary} style={styles.menuIcon} />
               <View>
                 <Text style={styles.menuTitle}>MacBook Pro M2</Text>
                 <Text style={styles.menuSub}>Chrome • TP.Hồ Chí Minh, VN • 2 ngày trước</Text>
               </View>
            </View>
            <Feather name="log-out" size={20} color={colors.textSecondary} />
          </View>

          <TouchableOpacity style={styles.cardButtonOutline} onPress={() => alert('Tính năng đang cập nhật')}>
             <Text style={styles.cardButtonOutlineText}>Xem tất cả 4 thiết bị</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => alert('Không thể xóa lúc này!')}>
          <Feather name="trash-2" size={18} color="#FF4D4F" style={{ marginRight: 10 }} />
          <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
        </TouchableOpacity>
        <Text style={styles.deleteDesc}>Hành động này không thể hoàn tác.</Text>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2521',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(74, 222, 128, 0.15)', // Light green bg
    borderWidth: 1,
    borderColor: '#4ADE80',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  alertDesc: {
    color: '#E5E7EB',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#231E1B',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  menuSub: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  menuSubSuccess: {
    color: '#4ADE80',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#302620',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  badgeSuccessText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardButtonOutline: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 15,
  },
  cardButtonOutlineText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 79, 0.1)', // Light red
    borderWidth: 1,
    borderColor: '#FF4D4F',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FF4D4F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  }
});
