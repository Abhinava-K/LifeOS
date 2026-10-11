import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  private readonly vectorDim = 768;

  /**
   * Generates a deterministic normalized dense embedding vector (768 dimensions)
   * for a given string of text. Uses subword/character hash projection and L2 normalization.
   */
  generateEmbedding(text: string): number[] {
    const vector = new Array(this.vectorDim).fill(0);
    if (!text || text.trim().length === 0) {
      return vector;
    }

    const cleaned = text.toLowerCase().trim();
    const tokens = cleaned.split(/[\s,.;:!?_/\-\[\]()]+/);

    // Accumulate token & n-gram features
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token) continue;

      // Hash whole token
      const tokenHash = Math.abs(this.hashString(token));
      const idx1 = tokenHash % this.vectorDim;
      vector[idx1] += 1.0;

      // Bigrams
      if (i > 0) {
        const bigram = `${tokens[i - 1]}_${token}`;
        const bigramHash = Math.abs(this.hashString(bigram));
        const idx2 = bigramHash % this.vectorDim;
        vector[idx2] += 1.5;
      }

      // Trigrams of characters for fuzzy matches
      for (let j = 0; j < token.length - 2; j++) {
        const trigram = token.substring(j, j + 3);
        const triHash = Math.abs(this.hashString(trigram));
        const idx3 = triHash % this.vectorDim;
        vector[idx3] += 0.3;
      }
    }

    // L2 Normalize
    let normSq = 0;
    for (let k = 0; k < this.vectorDim; k++) {
      normSq += vector[k] * vector[k];
    }

    if (normSq > 0) {
      const norm = Math.sqrt(normSq);
      for (let k = 0; k < this.vectorDim; k++) {
        vector[k] = parseFloat((vector[k] / norm).toFixed(6));
      }
    }

    return vector;
  }

  /**
   * Computes the Cosine Similarity between two dense embedding vectors.
   * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized non-negative vectors).
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, parseFloat(similarity.toFixed(4))));
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
