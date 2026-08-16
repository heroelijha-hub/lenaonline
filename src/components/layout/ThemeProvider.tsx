'use client';

export default function ThemeProvider({ themeColor }: { themeColor: string }) {
  if (!themeColor) return null;

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --theme-primary: ${themeColor};
        }
      `
    }} />
  );
}
