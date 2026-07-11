import { usePrefs } from "../prefs/PrefsContext";

export function Toggles() {
  const { theme, lang, t, toggleLang, toggleTheme } = usePrefs();
  const pill =
    "px-[13px] py-[6px] rounded-full border border-[var(--line)] bg-transparent text-[var(--text2)] text-[12px] font-semibold cursor-pointer transition hover:text-[var(--text)]";
  return (
    <div className="flex gap-1.5">
      <button onClick={toggleLang} className={pill}>
        {lang === "vi" ? "EN" : "VI"}
      </button>
      <button onClick={toggleTheme} className={pill}>
        {theme === "dark" ? t.light : t.dark}
      </button>
    </div>
  );
}
