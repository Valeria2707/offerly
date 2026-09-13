import { TransformFnParams } from 'class-transformer';
import { normalizeUrl } from '@offerly/helpers';
import { ProfileData } from '../profile/profile.types';

export function normalizeUrlValue({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? normalizeUrl(value) : value;
}

export function normalizeProfileUrls(data: ProfileData): void {
  for (const link of data.basics.links) link.url = normalizeUrl(link.url);
  for (const project of data.projects) {
    if (project.url) project.url = normalizeUrl(project.url);
  }
}
