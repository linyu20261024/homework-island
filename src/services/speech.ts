import { SubjectType } from '../types/homework';

// Check if SpeechRecognition is available in the browser
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

// Check if Text-to-Speech is available
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export interface ParsedVoiceResult {
  rawText: string;
  detectedSubject: SubjectType;
  extractedTitle: string;
  extractedDue?: string;
  estimatedMinutes?: number;
}

export function parseSpokenHomework(transcript: string): ParsedVoiceResult {
  const text = transcript.trim();
  let detectedSubject: SubjectType = 'other';

  if (/语文|看拼音|写字|生字|古诗|课文|作文|读课文|日记|词语|造句/.test(text)) {
    detectedSubject = 'chinese';
  } else if (/数学|口算|竖式|应用题|算术|乘法|除法|练习册|天天练|做题/.test(text)) {
    detectedSubject = 'math';
  } else if (/英语|english|单词|字母|音标|跟读|听力|课文背诵|unit/.test(text.toLowerCase())) {
    detectedSubject = 'english';
  } else if (/科学|实验|观察|植物|动物|自然|小发明/.test(text)) {
    detectedSubject = 'science';
  } else if (/美术|画画|画作|手抄报|手工|折纸|水彩/.test(text)) {
    detectedSubject = 'art';
  } else if (/体育|跳绳|跑步|仰卧起坐|拍球|广播操|体能/.test(text)) {
    detectedSubject = 'sports';
  } else if (/阅读|读书|绘本|课外书|故事|阅读打卡/.test(text)) {
    detectedSubject = 'reading';
  }

  // Detect due date
  let extractedDue: string | undefined = undefined;
  const today = new Date();
  if (/明天|明晚/.test(text)) {
    const tomorrow = new Date(today.getTime() + 86400000);
    extractedDue = tomorrow.toISOString().split('T')[0];
  } else if (/后天/.test(text)) {
    const afterTomorrow = new Date(today.getTime() + 86400000 * 2);
    extractedDue = afterTomorrow.toISOString().split('T')[0];
  } else if (/今天|今晚/.test(text)) {
    extractedDue = today.toISOString().split('T')[0];
  }

  // Estimated minutes
  let estimatedMinutes = 20;
  const minMatch = text.match(/(\d+)\s*(分钟|分)/);
  if (minMatch) {
    estimatedMinutes = parseInt(minMatch[1], 10);
  } else if (/背诵|朗读|听写/.test(text)) {
    estimatedMinutes = 15;
  } else if (/试卷|写字|手抄报/.test(text)) {
    estimatedMinutes = 30;
  }

  // Clean title
  let cleanedTitle = text
    .replace(/^(今天|明天|后天|今晚|明晚)\s*/, '')
    .replace(/(语文|数学|英语|科学|美术|体育|阅读)\s*(作业|要|是)?/g, '')
    .replace(/明天交|今天交|后天交|周五交|请记录/g, '')
    .trim();

  if (!cleanedTitle) {
    cleanedTitle = text;
  }

  return {
    rawText: text,
    detectedSubject,
    extractedTitle: cleanedTitle,
    extractedDue,
    estimatedMinutes,
  };
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN';
      }
    }
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ): boolean {
    if (!this.recognition) return false;
    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const combined = finalTranscript || interimTranscript;
      onResult(combined, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition event:', event.error);
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      onError(e);
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}

// Text to Speech
export function speakText(text: string, onEnd?: () => void): void {
  if (!isSpeechSynthesisSupported()) return;

  try {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.95; // Slightly slower, clear for young students
    utterance.pitch = 1.05; // Gentle friendly tone

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('TTS error:', err);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

// Audio Recording (Microphone voice recording for homework submission)
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Failed to access microphone', err);
      return false;
    }
  }

  stop(): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            blob: audioBlob,
            dataUrl: reader.result as string,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
