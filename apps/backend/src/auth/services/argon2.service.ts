import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2Service {
  /**
   * Hashes plain text password using Argon2id algorithm (IEEE SRS REQ-AUTH-1)
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error hashing credentials securely');
    }
  }

  /**
   * Verifies plain text password against Argon2id hash
   */
  async verifyPassword(hash: string, plainText: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainText);
    } catch (error) {
      return false;
    }
  }
}
