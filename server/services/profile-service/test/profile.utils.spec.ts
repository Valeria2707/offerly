import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ProfileDataDto } from '../src/profile/dto/profile.dto';
import { createEmptyProfileData } from '../src/profile/profile.defaults';
import { mergeProfileDraft, updateProfileData } from '../src/utils/profile.utils';

describe('profile utilities', () => {
  it('preserves career preferences when merging a CV draft', () => {
    const current = createEmptyProfileData();
    current.preferences.desiredPosition = 'Backend Engineer';
    const draft = createEmptyProfileData();
    draft.basics.fullName = 'Jane Doe';

    const merged = mergeProfileDraft(current, draft);

    expect(merged.basics.fullName).toBe('Jane Doe');
    expect(merged.preferences.desiredPosition).toBe('Backend Engineer');
  });

  it('updates only supplied profile sections', () => {
    const current = createEmptyProfileData();
    current.basics.fullName = 'Jane Doe';

    const updated = updateProfileData(current, { preferences: { workFormat: 'Remote' } });

    expect(updated.basics.fullName).toBe('Jane Doe');
    expect(updated.preferences.workFormat).toBe('Remote');
  });

  it('rejects an incomplete full profile payload', () => {
    const payload = plainToInstance(ProfileDataDto, {});

    expect(validateSync(payload).length).toBeGreaterThan(0);
  });
});
