import {useEffect, useState} from 'react';
import {addRxPlugin, createRxDatabase, RxDatabase} from 'rxdb';
import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import {HeroCollection, HeroSchema} from './schema/Hero';
import {VillainCollection, VillainSchema} from './schema/Villain';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

addRxPlugin(SQLiteAdapter);
addRxPlugin(require('pouchdb-adapter-http'));

type Collections = {
  heroes: HeroCollection;
  villains: VillainCollection;
};

const dbName = 'everything';
const syncUrl = 'http://admin:password@localhost:5984/';

console.log('remote db: ', syncUrl + dbName);

const useDatabase = () => {
  const [db, setDb] = useState<RxDatabase<Collections>>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const configureSync = (collection: string) => {
      const replicationState = db[collection].sync({
        remote: syncUrl + dbName + '/',
        options: {
          live: true,
          retry: true,
        },
        waitForLeadership: false,
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
        });
        configureSync('heroes');
        configureSync('villains');
        setDb(rxdb);
      } catch (err) {
        setError(err);
        console.log('error: ', err);
      }
      setLoading(false);
    };
    if (!db && !loading) {
      create_db();
    }
  }, [db, loading]);

  return {db, loading, error};
};

export default useDatabase;
