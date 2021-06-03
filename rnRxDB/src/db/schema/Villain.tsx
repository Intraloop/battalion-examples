import {RxCollection, RxDocument, RxJsonSchema} from 'rxdb';

export type Villain = {
  name: string;
  color: string;
};

export type VillainDocument = RxDocument<Villain>;

export type VillainCollection = RxCollection<Villain>;

export const VillainSchema: RxJsonSchema<Villain> = {
  version: 0,
  title: 'villain schema',
  description: 'describes a simple villain',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      primary: true,
    },
    color: {
      type: 'string',
    },
  },
  attachments: {
    encrypted: false,
  },
  required: ['color'],
};
