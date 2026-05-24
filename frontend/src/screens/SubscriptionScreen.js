import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LanguageContext } from '../context/LanguageContext';

export default function SubscriptionScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success

  const handleSubscribe = (plan) => {
    setPaymentModalVisible(true);
    setPaymentStatus('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('success');
      // Mock setting user as VIP in AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.getItem('userInfo').then(userInfoStr => {
         if (userInfoStr) {
            let userInfo = JSON.parse(userInfoStr);
            userInfo.isVip = true;
            AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
         }
      });
    }, 2000);
  };

  const handleCloseModal = () => {
    setPaymentModalVisible(false);
    setPaymentStatus('idle');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{t('unlockPremium')}</Text>
          <Text style={styles.mainTitle}>{t('premiumReading')}</Text>
          <Text style={styles.subtitle}>
            {t('premiumDesc')}
          </Text>
        </View>

        {/* Monthly Plan */}
        <View style={styles.planCard}>
          <Text style={styles.planName}>{t('monthly')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>$4.99</Text>
            <Text style={styles.pricePeriod}>{t('month')}</Text>
          </View>
          <Text style={styles.planDesc}>{t('monthlyDesc')}</Text>
          <TouchableOpacity style={styles.btnOutline} onPress={() => handleSubscribe('monthly')}>
            <Text style={styles.btnOutlineText}>{t('chooseMonthly')}</Text>
          </TouchableOpacity>
        </View>

        {/* Yearly Plan */}
        <View style={[styles.planCard, styles.planCardActive]}>
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>{t('bestValue')}</Text>
          </View>
          <Text style={styles.planName}>{t('yearly')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>$49.99</Text>
            <Text style={styles.pricePeriod}>{t('year')}</Text>
          </View>
          <Text style={styles.planDesc}>{t('yearlyDesc')}</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => handleSubscribe('yearly')}>
            <Text style={styles.btnPrimaryText}>{t('upgradeNow')}</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>{t('premiumBenefits')}</Text>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Feather name="slash" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitTextCont}>
              <Text style={styles.benefitItemTitle}>{t('adFreeTitle')}</Text>
              <Text style={styles.benefitItemDesc}>{t('adFreeDesc')}</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Feather name="lock" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitTextCont}>
              <Text style={styles.benefitItemTitle}>{t('earlyAccessTitle')}</Text>
              <Text style={styles.benefitItemDesc}>{t('earlyAccessDesc')}</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Feather name="download" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitTextCont}>
              <Text style={styles.benefitItemTitle}>{t('offlineReadingTitle')}</Text>
              <Text style={styles.benefitItemDesc}>{t('offlineReadingDesc')}</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Feather name="award" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitTextCont}>
              <Text style={styles.benefitItemTitle}>{t('premiumBadgeTitle')}</Text>
              <Text style={styles.benefitItemDesc}>{t('premiumBadgeDesc')}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Payment Processing Modal */}
      <Modal visible={paymentModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {paymentStatus === 'processing' ? (
              <>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
                <Text style={styles.modalTitle}>{t('processingPayment')}</Text>
                <Text style={styles.modalDesc}>{t('waitPayment')}</Text>
              </>
            ) : (
              <>
                <View style={styles.successIconCont}>
                  <Feather name="check" size={40} color="#000" />
                </View>
                <Text style={styles.modalTitle}>{t('paymentSuccess')}</Text>
                <Text style={styles.modalDesc}>{t('paymentSuccessDesc')}</Text>
                <TouchableOpacity style={styles.modalBtn} onPress={handleCloseModal}>
                  <Text style={styles.modalBtnText}>{t('startReading')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  mainTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: '#231E1B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  planCardActive: {
    borderColor: '#D4B895',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: '#D4B895',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  bestValueText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  priceText: {
    color: '#D4B895',
    fontSize: 32,
    fontWeight: 'bold',
  },
  pricePeriod: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 5,
  },
  planDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  btnOutline: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#302620',
  },
  btnOutlineText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    backgroundColor: '#F3B17C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  benefitsSection: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  benefitsTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#302620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  benefitTextCont: {
    flex: 1,
  },
  benefitItemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benefitItemDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#231E1B',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  successIconCont: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
