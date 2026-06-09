export const Typography = {
  uiFamily: 'System',
  serifFamily: 'Georgia',
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15.5,
    lg: 17,
    xl: 19,
    '2xl': 21,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
} as const;
