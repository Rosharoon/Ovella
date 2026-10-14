export const colors = {
  canvas: '#FCF7F8',
  blush: '#FBF6F8',
  blushDeep: '#E8DDE2',
  cream: '#FFFCFD',
  rose: '#A35D7A',
  roseSoft: '#C78AAE',
  roseMuted: '#C7A1B8',
  petal: '#F6E8EC',
  lilac: '#A35D7A',
  lilacSoft: '#F6E8EC',
  peach: '#F7E2DC',
  peachSoft: '#F8F1ED',
  pregnancyOrange: '#F5A24A',
  pregnancyOrangeSoft: '#F8C98A',
  dueOrange: '#E07A2F',
  mint: '#DCE8E3',
  mintDeep: '#52766E',
  gold: '#E8C36A',
  moon: '#C7A1B8',
  ink: '#24151D',
  inkSoft: '#8D7A86',
  muted: '#A58F9E',
  white: '#FFFCFD',
  card: '#FFFCFD',
  overlay: 'rgba(36, 21, 29, 0.45)',
  success: '#52766E',
  period: '#F7E2DC',
  follicular: '#F6E8EC',
  ovulation: '#A35D7A',
  luteal: '#F8F1ED',
  fertile: '#DCE8E3',
  ovulationSoft: '#D7E8F8',
  ovulationBlue: '#7EB6E0',
  ovulationPeak: '#2F6F9F',
  predicted: '#F7E2DC',
  plum: '#6E3654',
  brand: '#701F4D',
  field: '#FBF6F8',
  line: '#E8DDE2',
  fertileText: '#52766E',
  periodText: '#D96B5B',
  periodPink: '#D46B96',
  periodPinkSoft: '#F4D5E4',
  onGradient: '#F8EAF0',
};

export const gradient = {
  colors: ['#C78AAE', '#A35D7A', '#6E3654'] as const,
  locations: [0, 0.56, 1] as const,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#E2A8B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 5,
  },
  soft: {
    shadowColor: '#E2A8B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
};

export const fonts = {
  display: 'PlayfairDisplay_600SemiBold',
  displayItalic: 'PlayfairDisplay_600SemiBold_Italic',
  body: 'Nunito_500Medium',
  bodyBold: 'Nunito_700Bold',
  bodySemi: 'Nunito_600SemiBold',
};
