import { useTranslation } from 'react-i18next';

export default function DisclaimerBanner({ textKey = 'disclaimers.results_banner', style }) {
  const { t } = useTranslation();
  return (
    <div className="disclaimer-banner animate-fade-in" style={style}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
      <span>{t(textKey)}</span>
    </div>
  );
}
