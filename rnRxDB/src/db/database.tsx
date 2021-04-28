import {useEffect, useState} from 'react';
import {addRxPlugin, createRxDatabase, RxDatabase} from 'rxdb';
import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

addRxPlugin(SQLiteAdapter);
addRxPlugin(require('pouchdb-adapter-http'));

const useDatabase = () => {
  const [db, setDb] = useState<RxDatabase>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const create_db = async () => {
      setLoading(true);
      try {
        const rxdb = await createRxDatabase({
          name: 'mydatabase',
          adapter: 'react-native-sqlite',
          multiInstance: false,
        });
        setDb(rxdb);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    };
    if (!db && !loading) {
      console.log('create_db() called');
      create_db();
    }
  }, [db, loading]);

  return {db, loading, error};
};

export default useDatabase;
