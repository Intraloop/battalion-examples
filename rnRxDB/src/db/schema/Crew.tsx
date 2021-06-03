import {RxCollection, RxDocument, RxJsonSchema} from 'rxdb';

export type Crew = {
  name: string;
  members: string[];
  crew_type: string;
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
        type: 'string',
      },
    },
    type: {
      type: 'string',
      default: 'Crew',
    },
    crew_type: {
      type: 'string',
    },
  },
  required: ['type', 'crew_type'],
};
