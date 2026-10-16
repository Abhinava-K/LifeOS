import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, RefreshCw, LogOut, Trash2 } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleServiceType, ProfileVisibility, UserThemePreference } from '@lifeos/shared-types';
import { userService } from '../services/user.service';
import { googleService } from '../services/google.service';
import { memoryService } from '../services/memory.service';

export const ProfileScreen: React.FC = () => {
  const { colors, theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || 'LifeOS User');
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

  // Phase 5: Google Workspace Integration States
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);
  const [googleEmail, setGoogleEmail] = useState(user?.email || 'user.google@gmail.com');
  const [lastGoogleSync, setLastGoogleSync] = useState<string | null>('1 hour ago');
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // Phase 5: AI Long-Term Memory States
  const [memoryCount, setMemoryCount] = useState(5);
  const [avgImportance, setAvgImportance] = useState(8.2);

  useEffect(() => {
    googleService
      .getStatus()
      .then((status) => {
        setIsGoogleConnected(status.isConnected);
        if (status.email) setGoogleEmail(status.email);
        if (status.lastSyncAt) setLastGoogleSync(new Date(status.lastSyncAt).toLocaleTimeString());
      })
      .catch(() => null);

    memoryService
      .getStats()
      .then((stats) => {
        setMemoryCount(stats.totalMemories);
        setAvgImportance(stats.avgImportance);
      })
      .catch(() => null);
  }, []);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarLargeText}>
              {fullName?.substring(0, 2).toUpperCase() || 'US'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{fullName}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email || 'user@lifeos.ai'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.surfaceLight }]}>
            <Text style={[styles.roleText, { color: colors.primaryLight }]}>{user?.role || 'Verified Member'}</Text>
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
              <Download size={16} color={colors.text} strokeWidth={2} style={{ marginRight: 10 }} />
              <Text style={[styles.menuActionText, { color: colors.text }]}>
                {isExporting ? 'Exporting Archive...' : 'Export Personal Data (GDPR Art. 20)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phase 5: Google Workspace Sync Section (REQ-GGL) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>GOOGLE WORKSPACE SYNC (REQ-GGL)</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.menuRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Google Account</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>
                  {isGoogleConnected ? googleEmail : 'Not connected'}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: isGoogleConnected ? '#065F46' : '#7F1D1D',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  {isGoogleConnected ? 'SYNCED' : 'OFFLINE'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={{ padding: 14 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
                Connected Services: Calendar (Events) • Gmail (Action Items) • Drive (PDF Vault) • Contacts
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 12 }}>
                Last synchronized: {lastGoogleSync || 'Never'}
              </Text>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    setIsSyncingGoogle(true);
                    const res = await googleService.triggerSync();
                    setLastGoogleSync('Just now');
                    Alert.alert(
                      'Google Sync Complete',
                      `Synced ${res.syncedItemsCount.calendar} calendar events, ${res.syncedItemsCount.emails} tasks from email, and ${res.syncedItemsCount.drive} drive documents.`,
                    );
                  } catch (e: any) {
                    Alert.alert('Sync Error', e.message || 'Failed to sync with Google Workspace.');
                  } finally {
                    setIsSyncingGoogle(false);
                  }
                }}
                disabled={isSyncingGoogle}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RefreshCw size={15} color="#FFFFFF" strokeWidth={2.2} style={{ marginRight: 8 }} />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  {isSyncingGoogle ? 'Synchronizing...' : 'Sync Google Workspace Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Phase 5: Long-Term Memory Section (REQ-MEM) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>AI LONG-TERM MEMORY (REQ-MEM)</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.menuRow}>
              <View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Memory Storage</Text>
                <Text style={[styles.menuSubLabel, { color: colors.textMuted }]}>
                  {memoryCount} remembered facts & goals (Avg Importance: {avgImportance}/10)
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: '#3730A3',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT ACTIONS</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.menuActionRow} onPress={logout}>
              <LogOut size={16} color={colors.warning} strokeWidth={2} style={{ marginRight: 10 }} />
              <Text style={[styles.menuActionText, { color: colors.warning }]}>Sign Out</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.menuActionRow} onPress={handleDeleteAccount}>
              <Trash2 size={16} color={colors.danger} strokeWidth={2} style={{ marginRight: 10 }} />
              <Text style={[styles.menuActionText, { color: colors.danger }]}>Delete Account & Data (Right to Erasure)</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
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

