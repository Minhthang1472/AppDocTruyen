import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LanguageContext } from '../context/LanguageContext';

export default function HelpSupportScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const FAQS = [
    { question: t('faqQ1'), answer: t('faqA1') },
    { question: t('faqQ2'), answer: t('faqA2') },
    { question: t('faqQ3'), answer: t('faqA3') },
    { question: t('faqQ4'), answer: t('faqA4') }
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NovelPortal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Text style={styles.title}>{t('howCanWeHelp')}</Text>
          <Text style={styles.subtitle}>{t('helpSubtitle')}</Text>
          
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchFaqs')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('faqTitle')}</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, index) => (
            <View key={index} style={styles.faqItemContainer}>
               <TouchableOpacity style={styles.faqItem} onPress={() => toggleExpand(index)}>
                 <Text style={styles.faqText}>{faq.question}</Text>
                 <Feather name={expandedIndex === index ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
               </TouchableOpacity>
               {expandedIndex === index && (
                 <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                 </View>
               )}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
             <Feather name="headphones" size={24} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>{t('contactSupport')}</Text>
          <Text style={styles.cardDesc}>{t('contactDesc')}</Text>
          <TouchableOpacity style={styles.cardButton} onPress={() => alert('Mở form liên hệ')}>
            <Text style={styles.cardButtonText}>{t('submitTicket')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
             <Feather name="users" size={24} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>{t('communityForum')}</Text>
          <Text style={styles.cardDesc}>{t('forumDesc')}</Text>
          <TouchableOpacity style={styles.cardButtonOutline} onPress={() => alert('Mở diễn đàn cộng đồng')}>
            <Text style={styles.cardButtonOutlineText}>{t('visitForum')}</Text>
          </TouchableOpacity>
        </View>
        
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  searchSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2521',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  faqList: {
    marginBottom: 30,
  },
  faqItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#2A2521',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  faqText: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
    paddingRight: 10,
    fontWeight: 'bold',
  },
  faqAnswerContainer: {
    paddingBottom: 15,
    paddingRight: 10,
  },
  faqAnswerText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#231E1B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#302620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: colors.primary,
    width: '100%',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardButtonOutline: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardButtonOutlineText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
