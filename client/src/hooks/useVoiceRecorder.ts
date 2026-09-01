import { useState } from 'react';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    setIsRecording(true);
  };

  const stopRecording = async (): Promise<string | null> => {
    setIsRecording(false);
    return 'BASE64_PCM_16KHZ_AUDIO_STREAM_DATA';
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return { isRecording, startRecording, stopRecording, toggleRecording };
};
