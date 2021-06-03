import {RxCollection, RxDocument, RxJsonSchema} from 'rxdb';

export type Crew = {
  name: string;
  members: string[];
  type: string;
};

export type CrewDocument = RxDocument<Crew>;

export type CrewCollection = RxCollection<Crew>;

export const CrewSchema: RxJsonSchema<Crew> = {
  version: 0,
  title: 'crew schema',
  description: 'describes a group of heroes or villains',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      primary: true,
    },
    members: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    type: {
      type: 'string',
      default: 'Crew',
    },
  },
  required: ['type'],
};
