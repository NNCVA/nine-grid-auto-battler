import { UNIT_TEMPLATES } from '../data/unitTemplates';
import { UnitTemplate, UnitTemplateMap } from '../types';

export const getUnitTemplate = (key: string): UnitTemplate => {
  const template = UNIT_TEMPLATES[key];

  if (!template) {
    throw new Error(`Unknown unit template key: ${key}`);
  }

  return template;
};

export const getAllUnitTemplates = (): UnitTemplateMap => UNIT_TEMPLATES;

export const getUnitTemplateKeys = (): string[] => Object.keys(UNIT_TEMPLATES);
