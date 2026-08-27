import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { ProfileVisibility, UserThemePreference } from '@lifeos/shared-types';
import { userService } from '../services/user.service';

export const ProfileScreen: React.FC = () => {
  const { colors, theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || 'Parth Patel');
  const [bio, setBio] = useState('Productivity enthusiast & software engineer');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings & Preferences
  const [pushNotifs, setPushNotifs] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);

  // GDPR Consent States
  const [dataProcessingConsent, setDataProcessingConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleTheme = () => {
    const nextTheme =
      theme === UserThemePreference.DARK ? UserThemePreference.LIGHT : UserThemePreference.DARK;
    setTheme(nextTheme);
    userService.updateSettings({ theme: nextTheme }).catch(() => null);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      await userService.updateProfile({
        fullName,
        bio,
        timezone,
        currencyCode,
      });
      setIsEditingProfile(false);
      Alert.alert('Profile Saved', 'Your user profile details have been updated successfully.');
    } catch {
      Alert.alert('Save Error', 'Could not update user profile at this time.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleConsent = async (
    key: 'dataProcessing' | 'analytics' | 'marketing',
    value: boolean,
  ) => {
    if (key === 'dataProcessing') setDataProcessingConsent(value);
    if (key === 'analytics') setAnalyticsConsent(value);
    if (key === 'marketing') setMarketingConsent(value);

    try {
      await userService.updatePrivacy({
        dataProcessingConsent: key === 'dataProcessing' ? value : dataProcessingConsent,
        analyticsConsent: key === 'analytics' ? value : analyticsConsent,
        marketingConsent: key === 'marketing' ? value : marketingConsent,
        profileVisibility: ProfileVisibility.PRIVATE,
      });
    } catch {
      Alert.alert('Privacy Update Error', 'Failed to synchronize GDPR privacy preferences.');
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const exportBundle = await userService.exportUserData();
      Alert.alert(
        'GDPR Export Complete',
        `Your LifeOS data export archive (${exportBundle?.exportScope?.join(', ') || 'full profile'}) has been compiled under EU GDPR Article 20.`,
      );
    } catch {
      Alert.alert('Export Error', 'Unable to compile export archive at this time.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete LifeOS Account',
      'Are you sure you want to permanently erase all personal data, vector embeddings, and linked integrations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            await userService.deleteAccount().catch(() => null);
            logout();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarLargeText}>
              {fullName?.substring(0, 2).toUpperCase() || 'PP'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{fullName}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email || 'parth@lifeos.ai'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.surfaceLight }]}>
            <Text style={[styles.roleText, { color: colors.primaryLight }]}>Infra & Backend Lead</Text>
          </View>
        </View>

        {/* Profile Details & Editing Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>USER PROFILE DETAILS</Text>
            <TouchableOpacity onPress={() => setIsEditingProfile(!isEditingProfile)}>
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {isEditingProfile ? (
              <View style={styles.editForm}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Full Name</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Bio</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Bio"
                  placeholderTextColor={colors.textMuted}
                />

                <View style={styles.rowTwoInputs}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Timezone</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                      value={timezone}
                      onChangeText={setTimezone}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Currency</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                      value={currencyCode}
                      onChangeText={setCurrencyCode}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  <Text style={styles.saveButtonText}>
                    {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.infoDisplayList}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Bio</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{bio}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Timezone</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{timezone}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Primary Currency</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{currencyCode}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PREFERENCES & THEME</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            {/* Theme Toggle */}
            <View style={styles.menuRow}>
              <View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>
                  {theme === UserThemePreference.DARK ? 'Enabled (OLED Dark)' : 'Disabled (Light Mode)'}
                </Text>
              </View>
              <Switch
                value={theme === UserThemePreference.DARK}
                onValueChange={handleToggleTheme}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Daily Briefing Notifications */}
            <View style={styles.menuRow}>
              <View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>AI Morning Briefing</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>Receive 08:00 AM daily schedule review</Text>
              </View>
              <Switch
                value={dailyBriefing}
                onValueChange={setDailyBriefing}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Push Notifications */}
            <View style={styles.menuRow}>
              <View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>Reminders & AI triggers</Text>
              </View>
              <Switch
                value={pushNotifs}
                onValueChange={setPushNotifs}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Privacy & GDPR Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>GDPR & PRIVACY CONTROLS (REQ-USER)</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            {/* Data Processing Consent */}
            <View style={styles.menuRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Core Data Processing</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>Essential for vector embeddings & AI services</Text>
              </View>
              <Switch
                value={dataProcessingConsent}
                onValueChange={(val) => handleToggleConsent('dataProcessing', val)}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Analytics Consent */}
            <View style={styles.menuRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Usage Telemetry & Analytics</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>Anonymous performance improvements</Text>
              </View>
              <Switch
                value={analyticsConsent}
                onValueChange={(val) => handleToggleConsent('analytics', val)}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Marketing Consent */}
            <View style={styles.menuRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Product News & Communication</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>Feature updates and tips</Text>
              </View>
              <Switch
                value={marketingConsent}
                onValueChange={(val) => handleToggleConsent('marketing', val)}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* GDPR Export */}
            <TouchableOpacity style={styles.menuActionRow} onPress={handleExportData} disabled={isExporting}>
              <Text style={[styles.menuActionText, { color: colors.text }]}>
                {isExporting ? 'Exporting Archive...' : '📥 Export Personal Data (GDPR Art. 20)'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.menuActionRow} onPress={logout}>
              <Text style={[styles.menuActionText, { color: colors.warning }]}>🚪 Sign Out</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.menuActionRow} onPress={handleDeleteAccount}>
              <Text style={[styles.menuActionText, { color: colors.danger }]}>🗑️ Delete Account & Data (Right to Erasure)</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 3,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  menuActionRow: {
    paddingVertical: 14,
  },
  menuActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  editForm: {
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  rowTwoInputs: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoDisplayList: {
    paddingVertical: 6,
  },
  infoRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
});

