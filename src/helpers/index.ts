import process from "process";
export const debugPrint =
  process.env.NODE_ENV === "development" ? console.log : () => {};
