import { StyleSheet, Text, View } from 'react-native';
import { VsQuestion } from '../game/vs/types';

interface FillBlankSentenceProps {
  question: VsQuestion;
  large?: boolean;
}

export function FillBlankSentence({ question, large }: FillBlankSentenceProps) {
  const fontSize = large ? 28 : 22;

  return (
    <View style={styles.box}>
      <Text style={[styles.sentence, { fontSize, lineHeight: fontSize * 1.45 }]}>
        {question.sentenceParts[0]}
        <Text style={styles.blank}> ______ </Text>
        {question.sentenceParts[1]}
      </Text>
      {question.hintTr ? (
        <Text style={styles.hint}>{question.hintTr}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
  },
  sentence: {
    color: '#F8FAFC',
    fontWeight: '500',
  },
  blank: {
    color: '#A5B4FC',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  hint: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 15,
  },
});
