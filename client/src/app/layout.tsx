import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MHS Wellness Center App",
  description: "My Health School — Wellness Center management app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "256x256" },
    ],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the boot script below stamps data-boot on <html> before React
    // hydrates, and that mismatch is deliberate.
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* BOOT GATE — runs synchronously before the login markup below it is parsed, so it decides
            the first paint. A stored, unexpired session stamps data-boot="sess" on <html>; CSS then
            hides #loginOverlay and shows the #appLoading splash instead. Without this, every
            refresh flashed the sign-in form while checkAuth() made its round-trips (reported
            20-Aug-2026). showApp()/showLogin() remove the attribute once JS owns visibility. */}
        <script dangerouslySetInnerHTML={{__html:
          `try{var s=JSON.parse(localStorage.getItem("wos_session")||"null");var t=s&&s.access_token;`
          +`if(t&&t!=="local"){var ok=true;`
          +`try{var b=t.split(".")[0].replace(/-/g,"+").replace(/_/g,"/");b+="=".repeat((4-b.length%4)%4);`
          +`var p=JSON.parse(atob(b));if(p.exp&&Date.now()>p.exp)ok=false;}catch(e){}`
          +`if(ok)document.documentElement.setAttribute("data-boot","sess");}}catch(e){}`
        }}/>
        {/* The gate's CSS lives INLINE here, not only in globals.css: the stylesheet arrives as an
            async chunk in dev, and whenever first paint won that race the login form flashed again
            (regression reported 24-Aug-2026). An inline <style> applies at parse time — there is
            nothing to wait for, so the gate can never lose the race again. */}
        <style dangerouslySetInnerHTML={{__html:
          `html[data-boot="sess"] #loginOverlay{display:none!important}`
          +`html[data-boot="sess"] #appLoading{display:flex!important}`
        }}/>
        {children}
      </body>
    </html>
  );
}
