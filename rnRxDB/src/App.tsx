import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Dimensions,
  Button,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import useDatabase from './db/useDatabase';

const {width} = Dimensions.get('window');

const App = () => {
  const {db, loading} = useDatabase();
  const [name, setName] = useState('');
  const [foundDocs, setFoundDocs] = useState([]);
  const fetchDocs = () => {
    if (db) {
      db.allDocs({include_docs: true, attachments: true}).then(docs => {
        setFoundDocs(docs.rows);
      });
    }
  }

  useEffect(() => {
    fetchDocs();
  }, [db, loading]);

  if (!db && loading) {
    return null;
  }

  const addHero = async () => {
    const color = getRandomColor();
    if (name !== '') {
      console.log(`addHero: name: ${name}, color: ${color}`);
      await db.post({name, color});
      setName('');
    }
    fetchDocs();
  };

  const removeHero = async hero => {
    await db.remove(hero.doc._id, hero.doc._rev);
    await fetchDocs();
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    while (color.length < 7) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const uploadImage = hero => async response => {
    await db.putAttachment(hero.doc._id, 'image', hero.doc._rev, response.base64, response.type);
    await fetchDocs();
  };

  return (
    <SafeAreaView style={styles.topContainer}>
      <StatusBar backgroundColor="#55C7F7" barStyle="light-content" />
      <Text style={styles.title}>Add your favorite hero!</Text>

      <ScrollView style={styles.heroesList}>
        <View style={styles.card}>
          <TouchableOpacity onPress={addHero}>
            <Image
              style={styles.plusImage}
              source={require('../assets/add.png')}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={text => setName(text)}
          />
        </View>
        {foundDocs.length === 0 && <Text>No heroes to display ...</Text>}
        {!!foundDocs.length && foundDocs.map((hero, index) => (
          <View key={index}>
            <View style={styles.card}>
              <View style={styles.row}>
                <View
                  style={[
                    styles.colorBadge,
                    {
                      backgroundColor: hero.doc.color,
                    },
                  ]}
                />
                <Text style={styles.heroName}>{hero.doc.name}</Text>
              </View>
              <TouchableOpacity onPress={() => removeHero(hero)}>
                <Image
                  style={styles.plusImage}
                  source={require('../assets/minus.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Button
                title="Select image"
                onPress={() =>
                  launchImageLibrary(
                    {
                      mediaType: 'photo',
                      includeBase64: true,
                      maxHeight: 800,
                      maxWidth: 800,
                    },
                    uploadImage(hero),
                  )
                }
              />
            </View>
            {!!hero.doc._attachments?.image && (
              <View style={styles.card}>
                <Image
                  source={{uri: `data:image/*;base64,${hero.doc._attachments?.image?.data}`}}
                  style={{height: 200, width: 200}}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    backgroundColor: '#55C7F7',
    flex: 1,
  },
  title: {
    marginTop: 25,
    fontSize: 25,
    color: 'white',
    fontWeight: '500',
  },
  heroesList: {
    marginTop: 30,
    borderRadius: 5,
    flex: 1,
    width: width - 30,
    paddingLeft: 15,
    marginHorizontal: 15,
    backgroundColor: 'white',
  },
  plusImage: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  input: {
    flex: 1,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',

    marginLeft: 12,
    paddingVertical: 15,
    borderBottomColor: '#D2DCE1',
    borderBottomWidth: 0.5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  colorBadge: {
    height: 30,
    width: 30,
    borderRadius: 15,
    marginRight: 15,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '200',
    marginTop: 3,
  },
});

export default App;
