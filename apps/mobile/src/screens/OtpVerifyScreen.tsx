import React, { useState, useEffect } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth.service';
import { AuthStackParamList } from '../navigation/types';

type OtpVerifyScreenProps = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

export const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({ route, navigation }) => {
  const { email, fullName, isGoogle, debugOtp: initialDebugOtp } = route.params;
  const { colors } = useThemeStore();
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState(initialDebugOtp || '123456');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const activeCode = (codeToVerify || otp).trim();

    if (activeCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit verification code.');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await authService.verifyOtp({
        email,
        otp: activeCode,
        fullName,
      });

      // Commit to authenticated state - triggers RootNavigator switch to Main BottomTabs
      setAuth(res.user, res.tokens);
    } catch {
      Alert.alert(
        'Verification Failed',
        'The verification code entered is incorrect or expired. You can use 123456 for instant testing.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      setIsResending(true);
      const res = await authService.sendOtp({
        email,
        fullName,
        isGoogle,
      });
      setDebugOtp(res.debugOtp);
      setCountdown(30);
      Alert.alert('Code Sent', `A fresh 6-digit verification code was sent to ${email}`);
    } catch {
      Alert.alert('Resend Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
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
          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surfaceLight }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backBtnText, { color: colors.text }]}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '18' }]}>
              <Text style={styles.icon}>✉️</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Verify Identity</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {isGoogle ? 'Google Account Verification' : 'One-Time Passcode'}
            </Text>
            <Text style={[styles.emailHighlight, { color: colors.primary }]}>{email}</Text>
          </View>

          {/* Debug / Instant 1-tap chip */}
          {debugOtp ? (
            <TouchableOpacity
              style={[styles.debugChip, { backgroundColor: colors.surfaceLight, borderColor: colors.primary }]}
              onPress={() => {
                setOtp(debugOtp);
                handleVerifyOtp(debugOtp);
              }}
            >
              <Text style={[styles.debugChipLabel, { color: colors.textMuted }]}>
                DEVELOPER QUICK-FILL (TAP TO APPLY):
              </Text>
              <Text style={[styles.debugChipValue, { color: colors.primary }]}>{debugOtp}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>ENTER 6-DIGIT CODE</Text>

            <TextInput
              style={[
                styles.otpInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surfaceLight,
                  borderColor: otp.length === 6 ? colors.primary : colors.border,
                },
              ]}
              placeholder="123456"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (text.length === 6) {
                  handleVerifyOtp(text);
                }
              }}
              autoFocus
            />

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleVerifyOtp()}
              disabled={isVerifying || otp.length !== 6}
              activeOpacity={0.85}
            >
              {isVerifying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify & Proceed to LifeOS</Text>
              )}
            </TouchableOpacity>

            {/* Resend Code Section */}
            <View style={styles.resendRow}>
              <Text style={[styles.resendLabel, { color: colors.textMuted }]}>
                Didn't receive the code?{' '}
              </Text>
              <TouchableOpacity onPress={handleResendOtp} disabled={countdown > 0 || isResending}>
                {isResending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.resendAction,
                      { color: countdown > 0 ? colors.textMuted : colors.primary },
                    ]}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  emailHighlight: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  debugChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  debugChipLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  debugChipValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 2,
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
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 12,
  },
  otpInput: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
  },
  verifyBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  resendLabel: {
    fontSize: 13,
  },
  resendAction: {
    fontSize: 13,
    fontWeight: '800',
  },
});
