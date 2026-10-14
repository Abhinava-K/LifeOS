import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/useThemeStore';
import { authService } from '../services/auth.service';
import { AuthStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  // Trigger Google Sign-In flow with OTP verification
  const handleGoogleSignIn = async (customEmail?: string) => {
    const targetEmail = (customEmail || email || 'user.google@gmail.com').trim().toLowerCase();
    const targetName = fullName.trim() || 'Google User';

    try {
      setIsLoadingGoogle(true);
      const res = await authService.sendOtp({
        email: targetEmail,
        fullName: targetName,
        isGoogle: true,
      });

      navigation.navigate('OtpVerify', {
        email: targetEmail,
        fullName: targetName,
        isGoogle: true,
        debugOtp: res.debugOtp,
      });
    } catch {
      Alert.alert('Sign-In Error', 'Unable to initiate Google Sign-In. Please check your network.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Trigger Email OTP flow
  const handleEmailSignIn = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsLoadingEmail(true);
      const res = await authService.sendOtp({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim() || undefined,
        isGoogle: false,
      });

      navigation.navigate('OtpVerify', {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim() || undefined,
        isGoogle: false,
        debugOtp: res.debugOtp,
      });
    } catch {
      Alert.alert('Request Failed', 'Failed to send OTP verification code.');
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand */}
          <View style={styles.header}>
            <View style={[styles.logoBadge, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
              <Text style={styles.logoIcon}>🧠</Text>
            </View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>LifeOS</Text>
            <Text style={[styles.brandTagline, { color: colors.textMuted }]}>
              AI-Orchestrated Personal Productivity & Second Brain
            </Text>
          </View>

          {/* Primary Google Login Section */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardHeading, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.cardSubheading, { color: colors.textMuted }]}>
              Sign in with your verified Google account to sync notes, calendar, and AI tasks.
            </Text>

            {/* Google One-Tap Action */}
            <TouchableOpacity
              style={[styles.googleBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={() => handleGoogleSignIn()}
              disabled={isLoadingGoogle || isLoadingEmail}
              activeOpacity={0.8}
            >
              {isLoadingGoogle ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View style={styles.googleBtnContent}>
                  <Text style={styles.googleIconText}>G</Text>
                  <Text style={[styles.googleBtnText, { color: colors.text }]}>
                    Sign in with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Quick Demo Pre-filled Account Button */}
            <TouchableOpacity
              style={[styles.demoGoogleBtn, { backgroundColor: colors.primary + '18' }]}
              onPress={() => handleGoogleSignIn('demo.student@gmail.com')}
              disabled={isLoadingGoogle || isLoadingEmail}
            >
              <Text style={[styles.demoGoogleText, { color: colors.primary }]}>
                ⚡ Quick 1-Tap Demo: demo.student@gmail.com
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR ENTER EMAIL</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                placeholder="you@domain.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Full Name (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>FULL NAME (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                placeholder="Alex Mercer"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleEmailSignIn}
              disabled={isLoadingEmail || isLoadingGoogle}
              activeOpacity={0.85}
            >
              {isLoadingEmail ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Send 6-Digit OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Security Badge */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              🔒 Protected by Argon2id & OAuth2 Dual-Token Architecture
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardSubheading: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  googleBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4285F4',
    marginRight: 10,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  demoGoogleBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  demoGoogleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
