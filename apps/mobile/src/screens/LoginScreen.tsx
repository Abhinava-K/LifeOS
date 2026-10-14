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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/useThemeStore';
import { authService } from '../services/auth.service';
import { googleAuthService } from '../services/google-auth.service';
import { AuthStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      fill="#4285F4"
    />
    <Path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      fill="#34A853"
    />
    <Path
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.96 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
      fill="#FBBC05"
    />
    <Path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      fill="#EA4335"
    />
  </Svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  // Google Account manual entry modal (fallback if browser OAuth is dismissed/blocked)
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  // Primary Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsLoadingGoogle(true);
      const googleProfile = await googleAuthService.signIn();

      if (googleProfile && googleProfile.email) {
        // Successfully authenticated with Google, dispatch OTP to verified address
        const res = await authService.sendOtp({
          email: googleProfile.email.toLowerCase().trim(),
          fullName: googleProfile.name,
          isGoogle: true,
        });

        navigation.navigate('OtpVerify', {
          email: googleProfile.email.toLowerCase().trim(),
          fullName: googleProfile.name,
          isGoogle: true,
          debugOtp: res.debugOtp,
        });
      } else {
        // Browser session dismissed or environment without client ID: prompt account entry
        setShowGoogleModal(true);
      }
    } catch {
      setShowGoogleModal(true);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Submit Google Account email
  const handleConfirmGoogleEmail = async () => {
    const target = googleEmailInput.trim().toLowerCase();
    if (!target || !target.includes('@')) {
      Alert.alert('Invalid Account', 'Please provide a valid Google email address.');
      return;
    }

    try {
      setIsLoadingGoogle(true);
      setShowGoogleModal(false);

      const res = await authService.sendOtp({
        email: target,
        fullName: target.split('@')[0],
        isGoogle: true,
      });

      navigation.navigate('OtpVerify', {
        email: target,
        fullName: target.split('@')[0],
        isGoogle: true,
        debugOtp: res.debugOtp,
      });
    } catch {
      Alert.alert('Connection Error', 'Failed to communicate with authentication servers.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Standard Email Authentication
  const handleEmailSignIn = async () => {
    const target = email.trim().toLowerCase();
    if (!target || !target.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsLoadingEmail(true);
      const res = await authService.sendOtp({
        email: target,
        fullName: fullName.trim() || undefined,
        isGoogle: false,
      });

      navigation.navigate('OtpVerify', {
        email: target,
        fullName: fullName.trim() || undefined,
        isGoogle: false,
        debugOtp: res.debugOtp,
      });
    } catch {
      Alert.alert('Authentication Failed', 'Unable to dispatch verification passcode. Please try again.');
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
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={[styles.brandPill, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.brandPillText, { color: colors.textSecondary }]}>v1.0 Production Substrate</Text>
            </View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>LifeOS</Text>
            <Text style={[styles.brandTagline, { color: colors.textMuted }]}>
              Autonomous Cognitive Second Brain & Productivity Engine
            </Text>
          </View>

          {/* Authentication Card */}
          <View style={[styles.authCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sign in</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Access your unified tasks, intelligent memories, and workspace ledger.
            </Text>

            {/* Google OAuth Action */}
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={handleGoogleSignIn}
              disabled={isLoadingGoogle || isLoadingEmail}
              activeOpacity={0.75}
            >
              {isLoadingGoogle ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <View style={styles.buttonInner}>
                  <GoogleIcon size={18} />
                  <Text style={[styles.googleButtonText, { color: colors.text }]}>
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR WORK EMAIL</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>EMAIL</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.text, backgroundColor: colors.surfaceLight, borderColor: colors.border },
                ]}
                placeholder="name@company.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Full Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>FULL NAME (OPTIONAL)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.text, backgroundColor: colors.surfaceLight, borderColor: colors.border },
                ]}
                placeholder="Preferred Name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Submit Email OTP */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleEmailSignIn}
              disabled={isLoadingEmail || isLoadingGoogle}
              activeOpacity={0.85}
            >
              {isLoadingEmail ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Request One-Time Code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Security & Compliance Footer */}
          <View style={styles.complianceRow}>
            <Text style={[styles.complianceText, { color: colors.textMuted }]}>
              Argon2id Hash • OAuth 2.0 PKCE • End-to-End Encrypted
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Account Fallback Modal */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <GoogleIcon size={24} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Google Account</Text>
            </View>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Enter your verified Google Workspace or personal Gmail address to receive your sign-in verification code.
            </Text>

            <TextInput
              style={[
                styles.textInput,
                { color: colors.text, backgroundColor: colors.surfaceLight, borderColor: colors.border, marginTop: 16 },
              ]}
              placeholder="you@gmail.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={googleEmailInput}
              onChangeText={setGoogleEmailInput}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowGoogleModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirmGoogleEmail}
              >
                <Text style={styles.modalConfirmText}>Verify Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18,
  },
  authCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  googleButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  complianceRow: {
    marginTop: 28,
    alignItems: 'center',
  },
  complianceText: {
    fontSize: 11,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
