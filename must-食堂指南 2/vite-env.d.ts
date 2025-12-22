
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL: string; // Backend API URL
      [key: string]: string | undefined;
    }
  }
}
