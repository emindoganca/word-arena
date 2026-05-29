import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#6366F1',
  },
  secondary: {
    backgroundColor: '#334155',
  },
  danger: {
    backgroundColor: '#BE123C',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
});
