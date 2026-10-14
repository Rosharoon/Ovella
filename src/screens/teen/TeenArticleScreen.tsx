import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { teenArticle } from '../../data/teenLearn';
import { colors, fonts } from '../../theme';
import { TeenBrandBar } from './TeenChrome';
import { TeenChangingBodyScreen } from './TeenChangingBodyScreen';
import { TeenPregnancySupportScreen } from './TeenPregnancySupportScreen';

export function TeenArticleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const article = teenArticle(route.params?.id ?? 'basics');
  if (article.id === 'body') return <TeenChangingBodyScreen />;
  if (article.id === 'pregnancy') return <TeenPregnancySupportScreen />;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }}>
        <TeenBrandBar onBack={() => navigation.goBack()} backLabel="Learn & Support" />
        <View style={styles.page}>
          <Text style={styles.kicker}>{article.eyebrow.toUpperCase()}</Text>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.meta}>{article.minutes} · Honest, not scary</Text>
          {article.sections.map((section) => (
            <View key={section.heading} style={styles.card}>
              <Text style={styles.heading}>{section.heading}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
          ))}
          <Text style={styles.care}>
            Severe pain, very heavy bleeding or feeling faint? Seek medical help. This guide is for learning, not a diagnosis.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  kicker: { fontFamily: fonts.bodyBold, color: '#C57AA5', fontSize: 10, letterSpacing: 0.6 },
  title: { fontFamily: fonts.display, color: colors.ink, fontSize: 28, lineHeight: 34 },
  meta: { fontFamily: fonts.body, color: '#786370', fontSize: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1D9E1',
    padding: 14,
    gap: 6,
  },
  heading: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  body: { fontFamily: fonts.body, color: '#705D68', fontSize: 14, lineHeight: 21 },
  care: { fontFamily: fonts.body, color: '#786370', fontSize: 12, lineHeight: 18, marginTop: 4 },
});
