import type { ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import { cognitoLogoutUrl } from "./auth/authConfig";
import { usePrefs } from "./prefs/PrefsContext";
import { Toggles } from "./components/Toggles";
import { TodoPage } from "./components/TodoPage";

export function App() {
  const auth = useAuth();
  const { t } = usePrefs();

  if (auth.isLoading) {
    return (
      <Centered>
        <p className="text-[var(--text2)]">{t.loading}</p>
      </Centered>
    );
  }

  if (auth.error) {
    return (
      <Centered>
        <h1 className="serif italic text-2xl text-[var(--text)]">
          {t.errorTitle}
        </h1>
        <p className="mt-2 text-sm text-[#c25e5e]">{auth.error.message}</p>
      </Centered>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-[460px] max-w-full text-center animate-fadeUp">
          <div className="serif italic text-[72px] font-medium tracking-[-.02em] leading-none text-[var(--text)]">
            Mộc
          </div>
          <div className="mt-3.5 text-[17px] text-[var(--text2)] leading-relaxed">
            {t.tagline1}
            <br />
            <span className="text-[var(--text3)]">{t.tagline2}</span>
          </div>
          <button
            onClick={() => void auth.signinRedirect()}
            className="mt-9 px-[34px] py-[13px] rounded-full bg-[var(--accent)] text-white text-[15px] font-semibold cursor-pointer transition hover:opacity-90"
          >
            {t.signIn}
          </button>
          <div className="mt-8 flex justify-center">
            <Toggles />
          </div>
        </div>
      </div>
    );
  }

  const email = auth.user?.profile.email ?? "";
  const logout = () => {
    void auth.removeUser();
    window.location.href = cognitoLogoutUrl();
  };
  return <TodoPage email={email} onLogout={logout} />;
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center animate-fadeUp">{children}</div>
    </div>
  );
}
