import { hash, compare } from 'bcrypt';

export class HashProvider {
  public async generateHash(payload: string) {
    return hash(payload, 10);
  }

  public async compareHash(payload: string, hashed: string) {
    return compare(payload, hashed);
  }
}
