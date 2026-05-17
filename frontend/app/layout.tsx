// app/layout.tsx
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>   {/* ← AuthProvider must wrap everything */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}