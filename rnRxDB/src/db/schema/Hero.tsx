import {RxCollection, RxDocument, RxJsonSchema} from 'rxdb';

export type Hero = {
  name: string;
  color: string;
  type: string;
};

export type HeroDocument = RxDocument<Hero>;

export type HeroCollection = RxCollection<Hero>;

export const HeroSchema: RxJsonSchema<Hero> = {
  version: 0,
  title: 'hero schema',
  description: 'describes a simple hero',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      primary: true,
    },
    color: {
      type: 'string',
    },
    type: {
      type: 'string',
      default: 'Hero',
    },
  },
  required: ['color', 'type'],
};
