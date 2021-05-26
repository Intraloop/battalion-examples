import {useEffect, useState} from 'react';
import {addRxPlugin, createRxDatabase, removeRxDatabase, RxDatabase} from 'rxdb';
import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import {HeroCollection, HeroSchema} from './schema/Hero';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

addRxPlugin(SQLiteAdapter);
addRxPlugin(require('pouchdb-adapter-http'));

type Collections = {
  heroes: HeroCollection;
};

const dbName = 'heroes';
const syncUrl = 'http://admin:password@localhost:5984/';

console.log('remote db: ', syncUrl + dbName);

const useDatabase = () => {
  const [db, setDb] = useState<RxDatabase<Collections>>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
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
        });
        const replicationState = rxdb.heroes.sync({
          remote: syncUrl + dbName + '/',
          options: {
            live: true,
            retry: true,
          },
          waitForLeadership: false,
        });
        replicationState.change$.subscribe(change =>
          console.log('change: ', change),
        );
        replicationState.docs$.subscribe(docData =>
          console.log('doc: ', docData),
        );
        replicationState.denied$.subscribe(docData =>
          console.log('denied: ', docData),
        );
        replicationState.active$.subscribe(active =>
          console.log('active: ', active),
        );
        replicationState.alive$.subscribe(alive =>
          console.log('alive: ', alive),
        );
        replicationState.complete$.subscribe(completed =>
          console.log('completed: ', completed),
        );
        replicationState.error$.subscribe(err => console.dir('error: ', err));
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
