import api from './api';
import { PromptPayload, AIMessage } from '../types/ai';

/**
 * Sends multimodal prompt (text, image URI, audio PCM stream, or intent hint) to NestJS AI Gateway.
 */
export const sendAIMessage = async (payload: PromptPayload): Promise<AIMessage> => {
  try {
    const formData = new FormData();
    if (payload.prompt) formData.append('prompt', payload.prompt);
    if (payload.intentHint) formData.append('intentHint', payload.intentHint);
    if (payload.audioBase64) formData.append('audio', payload.audioBase64);
    if (payload.imageUri) {
      formData.append('image', {
        uri: payload.imageUri,
        type: 'image/jpeg',
        name: 'multimodal_capture.jpg',
      } as any);
    }

    const response = await api.post('/ai/gateway/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    // Fallback response for offline or local dev testing
    return {
      id: Date.now().toString(),
      sender: 'assistant',
      content: `Processed **${payload.intentHint || 'GENERAL_CHAT'}**: Received input "${payload.prompt || 'Multimodal Media Attachment'}".\n\n$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: payload.intentHint,
    };
  }
};
