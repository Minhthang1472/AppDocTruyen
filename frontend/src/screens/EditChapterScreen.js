import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LanguageContext } from '../context/LanguageContext';
import { updateChapter, extractChapterText } from '../utils/api';
import * as DocumentPicker from 'expo-document-picker';

export default function EditChapterScreen({ route, navigation }) {
  const { chapter } = route.params;
  const { t } = useContext(LanguageContext);
  
  const [chapterNumber, setChapterNumber] = useState(chapter.chapterNumber?.toString() || '');
  const [title, setTitle] = useState(chapter.title || '');
  const [content, setContent] = useState(chapter.content || '');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Kiểm tra dung lượng (giới hạn 10MB)
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert('Lỗi', 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
          return;
        }

        setExtracting(true);
        const extractedText = await extractChapterText({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream'
        });

        if (extractedText) {
          setContent(extractedText);
          Alert.alert('Thành công', 'Đã trích xuất nội dung từ file.');
        } else {
          Alert.alert('Lỗi', 'Không thể đọc được nội dung từ file này.');
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn file.');
    } finally {
      setExtracting(false);
    }
  };

  const handlePublish = async () => {
    if (!chapterNumber || !title || !content) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Số chương, Tiêu đề và Nội dung.');
      return;
    }

    setLoading(true);
    try {
      await updateChapter(chapter._id, {
        chapterNumber,
        title,
        content
      });
      
      Alert.alert('Thành công', 'Đã cập nhật chương thành công', [
        { text: 'OK', onPress: () => {
           // Go back to manage chapters, maybe trigger a refresh
           navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật chương.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa Chương</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('chapterNum')}</Text>
          <TextInput
            style={styles.input}
            value={chapterNumber}
            onChangeText={setChapterNumber}
            placeholder="Ví dụ: 1"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('chapterTitle')}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Khởi Đầu Mới"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('chapterContent')}</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleFileUpload} disabled={extracting}>
              {extracting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Feather name="upload-cloud" size={16} color={colors.primary} />
                  <Text style={styles.uploadBtnText}>Tải Word/PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Viết nội dung chương tại đây..."
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handlePublish}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.submitBtnText}>Cập Nhật Chương</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  novelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  uploadBtnText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 250,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
