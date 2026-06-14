/**
 * Shared risk level design tokens used by AlertCard and RiskGauge.
 * Single source of truth — do not duplicate these in individual components.
 */

export const RISK_THEMES = {
  critical: {
    // AlertCard tokens
    border:     '#fecaca',
    leftBorder: '#dc2626',
    accentColor:'#dc2626',
    headerColor:'#dc2626',
    btnBg:      '#dc2626',
    iconStroke: '#dc2626',
    // RiskGauge tokens
    bg:         '#fef2f2',
    iconBg:     '#fee2e2',
    iconColor:  '#dc2626',
    titleColor: '#dc2626',
    descColor:  '#991b1b',
    etaColor:   '#dc2626',
    stepBg:     '#fee2e2',
    stepNum:    '#dc2626',
    stepText:   '#991b1b',
  },
  elevated: {
    border:     '#fde68a',
    leftBorder: '#d97706',
    accentColor:'#d97706',
    headerColor:'#d97706',
    btnBg:      '#d97706',
    iconStroke: '#d97706',
    bg:         '#fffbeb',
    iconBg:     '#fef9c3',
    iconColor:  '#b45309',
    titleColor: '#b45309',
    descColor:  '#92400e',
    etaColor:   '#b45309',
    stepBg:     '#fef9c3',
    stepNum:    '#b45309',
    stepText:   '#92400e',
  },
  normal: {
    border:     '#bbf7d0',
    leftBorder: '#16a34a',
    accentColor:'#16a34a',
    headerColor:'#16a34a',
    btnBg:      '#16a34a',
    iconStroke: '#16a34a',
    bg:         '#f0fdf4',
    iconBg:     '#dcfce7',
    iconColor:  '#15803d',
    titleColor: '#15803d',
    descColor:  '#166534',
    etaColor:   '#15803d',
    stepBg:     '#dcfce7',
    stepNum:    '#15803d',
    stepText:   '#166534',
  },
} as const;

export type RiskLevel = keyof typeof RISK_THEMES;
