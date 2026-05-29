import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsTablet } from '../theme/tablet';

interface OptionGridProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
  selected?: string | null;
  correctAnswer?: string | null;
  reveal?: boolean;
}

export function OptionGrid({
  options,
  onSelect,
  disabled,
  selected,
  correctAnswer,
  reveal,
}: OptionGridProps) {
  const isTablet = useIsTablet();

  return (
    <View style={[styles.grid, isTablet && styles.gridTablet]}>
      {options.map((option) => {
        const isSelected = selected === option;
        const isCorrect = reveal && correctAnswer === option;
        const isWrong = reveal && isSelected && correctAnswer !== option;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.option,
              isTablet && styles.optionTablet,
              isSelected && styles.selected,
              isCorrect && styles.correct,
              isWrong && styles.wrong,
              pressed && !disabled && styles.pressed,
            ]}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    backgroundColor: '#334155',
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionTablet: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  optionText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  selected: {
    borderColor: '#818CF8',
  },
  correct: {
    backgroundColor: '#14532D',
    borderColor: '#22C55E',
  },
  wrong: {
    backgroundColor: '#450A0A',
    borderColor: '#EF4444',
  },
  pressed: {
    opacity: 0.9,
  },
});
