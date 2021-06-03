import {useEffect, useState} from 'react';
import {
  addRxPlugin,
  createRxDatabase,
  removeRxDatabase,
  RxDatabase,
} from 'rxdb';
import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import {HeroCollection, HeroSchema} from './schema/Hero';
import {VillainCollection, VillainSchema} from './schema/Villain';
import {CrewCollection, CrewSchema} from './schema/Crew';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

addRxPlugin(SQLiteAdapter);
addRxPlugin(require('pouchdb-adapter-http'));

type Collections = {
  heroes: HeroCollection;
  villains: VillainCollection;
  crews: CrewCollection;
};

const dbName = 'everything';
const syncUrl = 'http://admin:password@localhost:5984/';

console.log('remote db: ', syncUrl + dbName);

const useDatabase = () => {
  const [db, setDb] = useState<RxDatabase<Collections>>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const configureSync = (
      collection: string,
      type: string,
      database: RxDatabase<Collections>,
    ) => {
      console.log('name: ', collection);
      const replicationState = database[collection].sync({
        remote: syncUrl + dbName + '/',
        options: {
          live: true,
          retry: true,
        },
        waitForLeadership: false,
        query: database[collection].find().where('type').eq(type),
      });
      replicationState.change$.subscribe(change =>
        console.log(`${collection} change: `, change),
      );
      replicationState.docs$.subscribe(docData =>
        console.log(`${collection} doc: `, docData),
      );
      replicationState.denied$.subscribe(docData =>
        console.log(`${collection} denied: `, docData),
      );
      replicationState.active$.subscribe(active =>
        console.log(`${collection} active: `, active),
      );
      replicationState.alive$.subscribe(alive =>
        console.log(`${collection} alive: `, alive),
      );
      replicationState.complete$.subscribe(completed =>
        console.log(`${collection} completed: `, completed),
      );
      replicationState.error$.subscribe(err =>
        console.dir(`${collection} error: `, err),
      );
    };

    const create_db = async () => {
      setLoading(true);
      try {
        await removeRxDatabase(dbName, 'react-native-sqlite');
        const rxdb = await createRxDatabase<Collections>({
          name: dbName,
          adapter: 'react-native-sqlite',
          multiInstance: false,
        });
        await rxdb.addCollections({
          heroes: {
            schema: HeroSchema,
          },
          villains: {
            schema: VillainSchema,
          },
          crews: {
            schema: CrewSchema,
          },
        });
        configureSync('heroes', 'Hero', rxdb);
        configureSync('villains', 'Villain', rxdb);
        configureSync('crews', 'Crew', rxdb);
        setDb(rxdb);
      } catch (err) {
        setError(err);
        console.log('error: ', err);
      }
      setLoading(false);
    };
    create_db();
  }, []);

  return {db, loading, error};
};

export default useDatabase;
