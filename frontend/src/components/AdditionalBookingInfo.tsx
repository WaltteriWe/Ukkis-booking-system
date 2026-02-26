import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { darkModeStyles } from "@/utils/darkModeStyles";

interface AdditionalInfoInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
}

export function AdditionalInfoInput({
  value,
  onChange,
  placeholder,
  label,
  maxLength = 500,
}: AdditionalInfoInputProps) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const defaultLabel = label || t("additionalInformation") || "Additional Information";
  const defaultPlaceholder =
    placeholder ||
    t("additionalInfoPlaceholder") ||
    "Please let us know about any allergies, dietary restrictions, mobility concerns, or other important information...";

  return (
    <div className="w-full">
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: darkModeStyles.textPrimary(darkMode) }}
      >
        {defaultLabel}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={defaultPlaceholder}
        maxLength={maxLength}
        rows={4}
        className="w-full px-4 py-3 border rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        style={{
          backgroundColor: darkModeStyles.inputBg(darkMode),
          borderColor: darkModeStyles.inputBorder(darkMode),
          color: darkModeStyles.textPrimary(darkMode),
        }}
      />
      <div
        className="mt-1 text-xs text-right"
        style={{ color: darkModeStyles.textSecondary(darkMode) }}
      >
        {value.length} / {maxLength} {t("characters") || "characters"}
      </div>
      <p
        className="mt-2 text-xs"
        style={{ color: darkModeStyles.textSecondary(darkMode) }}
      >
        ℹ️ {t("additionalInfoHint") || "This information will be shared with our team to ensure we can provide the best possible experience."}
      </p>
    </div>
  );
}