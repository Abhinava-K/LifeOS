import React, { useState, useEffect, useRef } from 'react';
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
  const { email, fullName, isGoogle, debugOtp } = route.params;
  const { colors } = useThemeStore();
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRef = useRef<TextInput>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (codeToVerify?: string) => {
    const activeCode = (codeToVerify || otp).trim();

    if (activeCode.length !== 6) {
      Alert.alert('Verification', 'Please enter all 6 digits of your one-time passcode.');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await authService.verifyOtp({
        email,
        otp: activeCode,
        fullName,
      });

      // Commit to authenticated state -> RootNavigator switches to Main BottomTabs
      setAuth(res.user, res.tokens);
    } catch {
      Alert.alert(
        'Authentication Error',
        'The verification passcode is incorrect or has expired. Please request a new code.',
      );
      setOtp('');
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      setIsResending(true);
      await authService.sendOtp({
        email,
        fullName,
        isGoogle,
      });
      setCountdown(30);
      Alert.alert('Passcode Dispatched', `A fresh 6-digit verification code was sent to ${email}`);
    } catch {
      Alert.alert('Delivery Failed', 'Unable to dispatch a new verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Render individual digit boxes
  const renderDigitBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const digit = otp[i] || '';
      const isCurrent = i === otp.length;
      const isFilled = Boolean(digit);

      boxes.push(
        <View
          key={i}
          style={[
            styles.digitBox,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: isCurrent
                ? colors.primary
                : isFilled
                ? colors.border
                : colors.border + '80',
            },
            isCurrent && { borderWidth: 1.5 },
          ]}
        >
          <Text style={[styles.digitText, { color: colors.text }]}>{digit}</Text>
        </View>,
      );
    }
    return boxes;
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
          {/* Back Action */}
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>← Return</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={[styles.innerDot, { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Security Verification</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isGoogle ? 'Google Account Passcode' : 'One-Time Passcode'}
            </Text>
            <View style={[styles.emailBadge, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
              <Text style={[styles.emailText, { color: colors.text }]}>{email}</Text>
            </View>
          </View>

          {/* Active Passcode Helper Banner */}
          {debugOtp ? (
            <TouchableOpacity
              style={[
                styles.codeBanner,
                { backgroundColor: colors.surfaceLight, borderColor: colors.primary + '55' },
              ]}
              onPress={() => {
                setOtp(debugOtp);
                handleVerify(debugOtp);
              }}
            >
              <Text style={[styles.codeBannerLabel, { color: colors.textMuted }]}>
                LOCAL SESSION PASSCODE (TAP TO APPLY):
              </Text>
              <Text style={[styles.codeBannerCode, { color: colors.primaryLight }]}>
                {debugOtp}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Verification Box Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>ENTER 6-DIGIT AUTHORIZATION CODE</Text>

            {/* Clickable Area that focuses the hidden TextInput */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.digitContainer}
            >
              {renderDigitBoxes()}
            </TouchableOpacity>

            {/* Hidden Input for Native Keypad */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '');
                setOtp(numeric);
                if (numeric.length === 6) {
                  handleVerify(numeric);
                }
              }}
              autoFocus
            />

            {/* Submit Action */}
            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: colors.primary }]}
              onPress={() => handleVerify()}
              disabled={isVerifying || otp.length !== 6}
              activeOpacity={0.85}
            >
              {isVerifying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Authorize Session</Text>
              )}
            </TouchableOpacity>

            {/* Resend Option */}
            <View style={styles.resendRow}>
              <Text style={[styles.resendLabel, { color: colors.textMuted }]}>
                Didn't receive the passcode?{' '}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || isResending}>
                {isResending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.resendAction,
                      { color: countdown > 0 ? colors.textMuted : colors.primaryLight },
                    ]}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Compliance Info */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Passcodes expire in 5 minutes • RFC 6238 Standard
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  innerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  emailBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  emailText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 18,
  },
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  codeBanner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  codeBannerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  codeBannerCode: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 4,
  },
  digitBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  resendLabel: {
    fontSize: 12,
  },
  resendAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
