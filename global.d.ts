// global.d.ts
export { };

declare global {
  // Tells TypeScript that the 'Blob' type exists in the global scope
  interface Blob {
    readonly size: number;
    readonly type: string;
    slice(start?: number, end?: number, contentType?: string): Blob;
  }
}