export type Lang = "vi" | "en";

export interface Strings {
  tagline1: string;
  tagline2: string;
  signIn: string;
  signOut: string;
  loading: string;
  errorTitle: string;
  gmorning: string;
  gafternoon: string;
  gevening: string;
  addTask: string;
  emptyTitle: string;
  emptySub: string;
  done: string;
  summaryOne: string;
  summaryTwo: string;
  summaryNone: string;
  light: string;
  dark: string;
}

export const STRINGS: Record<Lang, Strings> = {
  vi: {
    tagline1: "Làm việc nhẹ nhàng.",
    tagline2: "Get things done, gently.",
    signIn: "Đăng nhập",
    signOut: "Đăng xuất",
    loading: "Đang tải…",
    errorTitle: "Có lỗi",
    gmorning: "Chào buổi sáng",
    gafternoon: "Chào buổi chiều",
    gevening: "Chào buổi tối",
    addTask: "Hôm nay bạn muốn làm gì?",
    emptyTitle: "Thảnh thơi.",
    emptySub: "Chưa có việc nào ở đây.",
    done: "Đã xong",
    summaryOne: "Bạn có ",
    summaryTwo: " việc cần làm.",
    summaryNone: "Không có việc nào — tuyệt!",
    light: "Sáng",
    dark: "Tối",
  },
  en: {
    tagline1: "Get things done, gently.",
    tagline2: "Làm việc nhẹ nhàng.",
    signIn: "Sign in",
    signOut: "Sign out",
    loading: "Loading…",
    errorTitle: "Something went wrong",
    gmorning: "Good morning",
    gafternoon: "Good afternoon",
    gevening: "Good evening",
    addTask: "What would you like to do today?",
    emptyTitle: "All clear.",
    emptySub: "Nothing to do here yet.",
    done: "Done",
    summaryOne: "You have ",
    summaryTwo: " tasks.",
    summaryNone: "Nothing to do — enjoy!",
    light: "Light",
    dark: "Dark",
  },
};
