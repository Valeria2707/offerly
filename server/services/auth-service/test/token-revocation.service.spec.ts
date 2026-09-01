import { Repository } from 'typeorm';
import { RevokedToken } from '../src/auth/entities/revoked-token.entity';
import { TokenRevocationService } from '../src/auth/token-revocation.service';

describe('TokenRevocationService', () => {
  it('stores a revoked token in the database', async () => {
    const repository = {
      delete: jest.fn().mockResolvedValue({ affected: 0 }),
      upsert: jest.fn().mockResolvedValue({ generatedMaps: [] })
    } as unknown as Repository<RevokedToken>;
    const service = new TokenRevocationService(repository);

    await service.revoke('95b20e21-a247-46cc-b20a-885e86767b4d', Math.floor(Date.now() / 1000) + 60, '16046d70-825d-4e38-a9f6-3c412ea70923');

    expect(repository.upsert).toHaveBeenCalledTimes(1);
  });

  it('checks whether a token was revoked', async () => {
    const repository = {
      delete: jest.fn().mockResolvedValue({ affected: 0 }),
      countBy: jest.fn().mockResolvedValue(1)
    } as unknown as Repository<RevokedToken>;
    const service = new TokenRevocationService(repository);

    await expect(service.isRevoked('95b20e21-a247-46cc-b20a-885e86767b4d')).resolves.toBe(true);
  });
});
