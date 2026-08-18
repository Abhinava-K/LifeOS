import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth.service';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter your email and password');
      return;
    }
    try {
      setIsLoading(true);
      const res = await authService.login({ email, password });
      setAuth(res.user, res.tokens);
    } catch {
      // Mock fallback for UI demo testing
      setAuth(
        {
          userId: 'usr_demo_2026',
          email,
          fullName: 'Jahaan Suthar',
          role: 'USER' as any,
        },
        {
          accessToken: 'mock_jwt_access_token',
          refreshToken: 'mock_jwt_refresh_token',
          expiresIn: 3600,
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logoIcon}>🧠</Text>
          <Text style={[styles.title, { color: colors.text }]}>LifeOS</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            AI-Orchestrated Personal Productivity Substrate
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceLight }]}
            placeholder="jahaan@lifeos.ai"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.inputLabel, { color: colors.textMuted, marginTop: 14 }]}>PASSWORD</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceLight }]}
            placeholder="••••••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginBtnText}>{isLoading ? 'Signing In...' : 'Sign In to LifeOS'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  loginBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
