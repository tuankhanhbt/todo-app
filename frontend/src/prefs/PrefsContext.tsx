import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { STRINGS, type Lang, type Strings } from "../i18n";

type Theme = "dark" | "light";

interface Prefs {
  theme: Theme;
  lang: Lang;
  t: Strings;
  toggleTheme: () => void;
  toggleLang: () => void;
}

const PrefsCtx = createContext<Prefs | null>(null);
const KEY = "moc-prefs";

function load(): { theme: Theme; lang: Lang } {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (
      s &&
      (s.theme === "dark" || s.theme === "light") &&
      (s.lang === "vi" || s.lang === "en")
    ) {
      return { theme: s.theme, lang: s.lang };
    }
  } catch {
    // dùng mặc định nếu localStorage lỗi
  }
  return { theme: "dark", lang: "vi" };
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [{ theme, lang }, setState] = useState(load);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("lang", lang);
    try {
      localStorage.setItem(KEY, JSON.stringify({ theme, lang }));
    } catch {
      // bỏ qua nếu không lưu được
    }
  }, [theme, lang]);

  const value: Prefs = {
    theme,
    lang,
    t: STRINGS[lang],
    toggleTheme: () =>
      setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    toggleLang: () =>
      setState((s) => ({ ...s, lang: s.lang === "vi" ? "en" : "vi" })),
  };

  return <PrefsCtx.Provider value={value}>{children}</PrefsCtx.Provider>;
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsCtx);
  if (!ctx) throw new Error("usePrefs phải nằm trong PrefsProvider");
  return ctx;
}
