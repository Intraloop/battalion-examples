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

import {Subscription} from 'rxjs';
import {Hero} from './db/schema/Hero';
import useDatabase from './db/useDatabase';

import {launchImageLibrary} from 'react-native-image-picker';

const {width} = Dimensions.get('window');

const App = () => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [name, setName] = useState('');
  const {db, loading} = useDatabase();

  React.useEffect(() => {
    console.log('global.btoa: ', global.btoa);
    console.log('global.base64FromArrayBuffer:', global.base64FromArrayBuffer);
    if (global.base64FromArrayBuffer) {
      // setResult('Running..');
      // runPouchDB().then(() => setResult('Done!'));
      console.log('global base64FromArrayBuffer is working!');
    } else {
      console.warn('global.base64FromArrayBuffer is not defined');
      console.warn(
        'global.base64FromArrayBuffer is not defined. Reload the app.',
      );
    }
  }, []);

  useEffect(() => {
    const subs: Subscription[] = [];
    if (db && !loading) {
      const sub = db.heroes.find().$.subscribe(_heroes => {
        if (_heroes) {
          setHeroes(_heroes);
        }
      });
      subs.push(sub);
    }

    return () => {
      subs.forEach(sub => sub.unsubscribe());
    };
  }, [db, loading]);

  if (!db && loading) {
    return null;
  }

  const addHero = async () => {
    const color = getRandomColor();
    if (name !== '') {
      console.log(`addHero: name: ${name}, color: ${color}`);
      await db.heroes.insert({name: name, color: color});
      setName('');
    }
  };

  const removeHero = async (hero_name: string) => {
    const found = await db.heroes.find().where('name').eq(hero_name);
    await found.remove();
  };

  const addHeroImage = async (hero_name: string) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
      },
      async (response: any) => {
        const base64: string = response.base64;
        const didCancel: boolean = response.didCancel;
        const fileName: string = response.fileName;
        if (!didCancel) {
          const found = await db.heroes
            .find()
            .where('name')
            .eq(hero_name)
            .exec();
          await found[0].putAttachment({
            // calling FileReader.readAsArrayBuffer here
            id: fileName,
            data: base64,
            type: 'image/jpg',
          });
        }
      },
    );
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    while (color.length < 7) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
        {heroes.length === 0 && <Text>No heroes to display ...</Text>}
        {heroes.map((hero, index) => (
          <View style={styles.card} key={index}>
            <View style={styles.row}>
              <View
                style={[
                  styles.colorBadge,
                  {
                    backgroundColor: hero.color,
                  },
                ]}
              />
              <Text style={styles.heroName}>{hero.name}</Text>
            </View>
            <Button title="Add Image" onPress={() => addHeroImage(hero.name)} />
            <TouchableOpacity onPress={() => removeHero(hero.name)}>
              <Image
                style={styles.plusImage}
                source={require('../assets/minus.png')}
              />
            </TouchableOpacity>
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
