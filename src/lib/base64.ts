// Base64 helpers for the photo upload contract.
//
// Deliberately free of `import.meta.env` and browser-only APIs so this module
// can be unit-tested directly in Node while still running in the WebView.

// 32 KiB — small enough to stay well inside the call-stack limit when spread as
// arguments to String.fromCharCode, large enough to keep the loop cheap.
const CHUNK_SIZE = 0x8000;

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + CHUNK_SIZE) as unknown as number[],
    );
  }
  return btoa(binary);
}

// Returns raw base64 with NO `data:...;base64,` prefix — GitHub's contents API
// wants the bare encoded string, and the worker forwards this value verbatim.
export async function fileToBase64(file: Blob): Promise<string> {
  return bytesToBase64(new Uint8Array(await file.arrayBuffer()));
}
