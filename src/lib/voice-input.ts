// Web Speech API voice input

interface SpeechResult {
  transcript: string;
  confidence: number;
}

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined'
    && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function startListening(
  onResult: (result: SpeechResult) => void,
  onError?: (error: string) => void,
  language = 'en-US'
): () => void {
  const SpeechRecognition = (window as any).SpeechRecognition
    || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Voice input is not supported in this browser');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = language;

  recognition.onresult = (event: any) => {
    const result = event.results[0];
    onResult({
      transcript: result[0].transcript,
      confidence: result[0].confidence,
    });
  };

  recognition.onerror = (event: any) => {
    onError?.(event.error || 'Voice recognition failed');
  };

  recognition.start();

  return () => {
    try { recognition.stop(); } catch {}
  };
}
