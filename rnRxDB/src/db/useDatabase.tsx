import PouchDB from '@craftzdog/pouchdb-core-react-native';
import HttpPouch from 'pouchdb-adapter-http';
import replication from '@craftzdog/pouchdb-replication-react-native';
import mapreduce from 'pouchdb-mapreduce';

import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';

import {useEffect, useState} from 'react';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

PouchDB.plugin(HttpPouch)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(SQLiteAdapter);

const dbName = 'heroes';
const syncUrl = 'http://admin:password@localhost:5984/';

const useDatabase = () => {
  const [db, setDb] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const openDB = () => {
    return new PouchDB(dbName, { adapter: 'react-native-sqlite' });
  };

  const openRemoteDB = () => {
    return new PouchDB(syncUrl + dbName + '/');
  };

  const resetDB = async () => {
    const db = openDB();
    return db.destroy();
  };

  useEffect(() => {
    const create_db = async () => {
      try {
        setLoading(true);
        // uncomment line below to clear local db in case of conflicts
        // await resetDB();
        const db = await openDB();
        console.log('db info:', await db.info());
        const remotedb = openRemoteDB();

        db.changes({
          since: 'now',
          live: true,
        }).on('change', change => {
          console.log('change:', change);
        });

        db.sync(syncUrl + dbName + '/', {
          live: true,
          retry: true
        }).on('change', (change) => {
          console.log('sync change:', change);
        }).on('paused', () => {
          console.log('sync paused:');
        }).on('active', (active) => {
          console.log('sync active:', active);
        }).on('denied', (denied) => {
          console.log('sync denied:', denied);
        }).on('complete', (complete) => {
          console.log('sync complete:', complete)
        }).on('error', (err) => {
          console.log('sync error', err);
        });
        
        setDb(db);
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
