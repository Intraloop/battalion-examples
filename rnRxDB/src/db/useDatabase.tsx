import {useEffect, useState} from 'react';
import {addRxPlugin, createRxDatabase, RxDatabase} from 'rxdb';
import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import {HeroCollection, HeroSchema} from './schema/Hero';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

addRxPlugin(SQLiteAdapter);
addRxPlugin(require('pouchdb-adapter-http'));

type Collections = {
  heroes: HeroCollection;
};

const useDatabase = () => {
  const [db, setDb] = useState<RxDatabase<Collections>>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const create_db = async () => {
      setLoading(true);
      try {
        const rxdb = await createRxDatabase<Collections>({
          name: 'mydatabase',
          adapter: 'react-native-sqlite',
          multiInstance: false,
        });
        await rxdb.addCollections({
          heroes: {
            schema: HeroSchema,
          },
        });
        // rxdb.heroes.sync({
        //   remote: 'https://somewhere',
        //   options: {
        //     live: true,
        //     retry: true,
        //   },
        // });
        setDb(rxdb);
      } catch (err) {
        setError(err);
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
