import { describe, expect, it } from 'vitest';
import { reptilePhotoPath } from './reptilePhotoPath';

describe('photo storage ownership', () => {
  it('places the authenticated owner in the first folder required by storage', () => {
    expect(reptilePhotoPath('owner-123', 'beauty-456', 'IMG_9827.jpeg', 123456))
      .toBe('owner-123/beauty-456/123456.jpeg');
  });
});