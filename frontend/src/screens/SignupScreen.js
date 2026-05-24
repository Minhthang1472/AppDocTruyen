import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
       return setError('Mật khẩu không khớp');
    }
    if (!agree) return setError('Bạn cần đồng ý điều khoản');

    try {
       const res = await api.post('/auth/register', { username: name, email, password });
       await AsyncStorage.setItem('userToken', res.data.token);
       await AsyncStorage.setItem('userInfo', JSON.stringify(res.data.user));
       navigation.replace('MainTabs');
    } catch (err) {
       setError(err.response?.data?.message || 'Lỗi kết nối');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.titleText}>Join the Portal.</Text>
            <Text style={styles.subText}>Start your immersive reading journey today.</Text>
          </View>

          <View style={styles.form}>
            {error ? <Text style={{color: '#FF4D4F', marginBottom: 15, textAlign: 'center'}}>{error}</Text> : null}
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color={colors.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={colors.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color={colors.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Feather name="settings" size={20} color={colors.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgree(!agree)}>
              <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                  {agree && <Feather name="check" size={14} color="#000" />}
              </View>
              <Text style={styles.checkboxText}>
                  I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>Sign Up <Feather name="arrow-right" size={18} /></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color={colors.text} style={{marginRight: 10}} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={20} color={colors.text} style={{marginRight: 10}} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  titleText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingRight: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: colors.primary,
    height: 55,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    paddingHorizontal: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    height: 55,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  socialButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
