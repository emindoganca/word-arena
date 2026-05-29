import { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContentMaxWidth } from '../theme/tablet';

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  onHome?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  contentStyle?: ViewStyle;
}

export function ScreenShell({
  title,
  subtitle,
  onBack,
  backLabel = '← Geri',
  onHome,
  children,
  footer,
  contentStyle,
}: ScreenShellProps) {
  const maxWidth = useContentMaxWidth();
  const showNav = onBack || onHome;

  return (
    <SafeAreaView style={styles.safe}>
      {showNav ? (
        <View style={[styles.navBar, { maxWidth, alignSelf: 'center', width: '100%' }]}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.navBtn} hitSlop={12}>
              <Text style={styles.navText}>{backLabel}</Text>
            </Pressable>
          ) : (
            <View style={styles.navSpacer} />
          )}
          {onHome ? (
            <Pressable onPress={onHome} style={styles.homeBtn} hitSlop={12}>
              <Text style={styles.homeText}>Ana menü</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, { maxWidth }]}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={[styles.body, contentStyle]}>{children}</View>
        </View>
      </ScrollView>

      {footer ? (
        <View style={[styles.footer, { maxWidth, alignSelf: 'center', width: '100%' }]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  navBtn: {
    paddingVertical: 4,
    minWidth: 80,
  },
  navSpacer: {
    minWidth: 80,
  },
  navText: {
    color: '#94A3B8',
    fontSize: 17,
    fontWeight: '500',
  },
  homeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#334155',
    borderRadius: 10,
  },
  homeText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#94A3B8',
    marginBottom: 24,
    lineHeight: 24,
  },
  body: {
    gap: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
});
