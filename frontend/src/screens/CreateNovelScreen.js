import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LanguageContext } from '../context/LanguageContext';
import { createNovel } from '../utils/api';
import { FULL_GENRES as AVAILABLE_GENRES } from '../utils/constants';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateNovelScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(''); // base64 string
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Save draft whenever inputs change
  useEffect(() => {
    if (isDraftLoaded) {
      saveDraft();
    }
  }, [title, coverImage, description, selectedGenres]);

  const loadDraft = async () => {
    try {
      const draftString = await AsyncStorage.getItem('novel_draft');
      if (draftString) {
        const draft = JSON.parse(draftString);
        setTitle(draft.title || '');
        setCoverImage(draft.coverImage || '');
        setDescription(draft.description || '');
        setSelectedGenres(draft.selectedGenres || []);
      }
    } catch (error) {
      console.log('Lỗi tải bản nháp:', error);
    } finally {
      setIsDraftLoaded(true);
    }
  };

  const saveDraft = async () => {
    try {
      const draft = { title, coverImage, description, selectedGenres };
      await AsyncStorage.setItem('novel_draft', JSON.stringify(draft));
    } catch (error) {
      console.log('Lỗi lưu bản nháp:', error);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Str = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setCoverImage(base64Str);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      if (selectedGenres.length >= 5) {
        Alert.alert('Thông báo', 'Bạn chỉ được chọn tối đa 5 thể loại.');
        return;
      }
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handlePublish = async () => {
    // Form Validation
    if (!title.trim() || title.trim().length < 1) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên truyện.');
      return;
    }
    if (!coverImage) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh bìa cho truyện.');
      return;
    }
    if (selectedGenres.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 thể loại.');
      return;
    }
    if (!description.trim() || description.trim().length < 1) {
      Alert.alert('Lỗi', 'Vui lòng nhập giới thiệu nội dung truyện.');
      return;
    }

    setLoading(true);
    try {
      await createNovel({
        title: title.trim(),
        coverImage,
        description: description.trim(),
        genres: selectedGenres
      });
      
      // Xóa nháp sau khi đăng thành công
      await AsyncStorage.removeItem('novel_draft');

      Alert.alert('Thành công', t('novelCreated'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo truyện. Vui lòng thử lại.');
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
        <Text style={styles.headerTitle}>{t('createNovel')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Ảnh bìa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ảnh bìa truyện</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
            ) : (
              <View style={styles.imagePickerEmpty}>
                <Feather name="image" size={32} color={colors.textSecondary} />
                <Text style={styles.imagePickerText}>Nhấn để chọn ảnh từ thư viện</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tên truyện */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('novelTitle')}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Phàm Nhân Tu Tiên"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Thể loại */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Thể loại (Tối đa 5)</Text>
          <View style={styles.genresContainer}>
            {AVAILABLE_GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <TouchableOpacity 
                  key={genre} 
                  style={[styles.genreChip, isSelected && styles.genreChipActive]}
                  onPress={() => toggleGenre(genre)}
                >
                  <Text style={[styles.genreText, isSelected && styles.genreTextActive]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Giới thiệu */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('novelDesc')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tóm tắt nội dung truyện (Ít nhất 20 ký tự)..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
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
             <Text style={styles.submitBtnText}>{t('publishNovel')}</Text>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
  imagePicker: {
    width: 120,
    height: 160,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePickerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  imagePickerText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  genreChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  genreTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textArea: {
    minHeight: 120,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
