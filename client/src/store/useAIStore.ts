import { create } from 'zustand';
import { AIMessage, PromptPayload } from '../types/ai';
import { sendAIMessage } from '../services/ai';

interface AIState {
  messages: AIMessage[];
  isStreaming: boolean;
  isRecording: boolean;
  selectedImage: string | null;
  sendMessage: (payload: PromptPayload) => Promise<void>;
  toggleRecording: () => void;
  setSelectedImage: (uri: string | null) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [
    {
      id: '1',
      sender: 'assistant',
      content: 'Hello Jahaan! I am your LifeOS AI Assistant. How can I help you manage your day, expenses, or notes?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isStreaming: false,
  isRecording: false,
  selectedImage: null,

  sendMessage: async (payload: PromptPayload) => {
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: payload.prompt || '[Multimodal Input]',
      imageUri: payload.imageUri,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      selectedImage: null,
    }));

    try {
      const response = await sendAIMessage(payload);
      set((state) => ({
        messages: [...state.messages, response],
        isStreaming: false,
      }));
    } catch (err) {
      set({ isStreaming: false });
    }
  },

  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  setSelectedImage: (uri: string | null) => set({ selectedImage: uri }),
  clearHistory: () => set({ messages: [] }),
}));
