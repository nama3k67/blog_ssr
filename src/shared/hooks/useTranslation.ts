import { useI18n } from "../providers/i18n";

/**
 * @deprecated Use useI18n() instead for accessing translations
 * This hook is kept for backward compatibility
 */
export function useTranslation() {
  const { t } = useI18n();
  return t;
}
