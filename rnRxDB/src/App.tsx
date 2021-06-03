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
} from 'react-native';

import {Subscription} from 'rxjs';
import {Crew} from './db/schema/Crew';
import {Hero} from './db/schema/Hero';
import {Villain} from './db/schema/Villain';
import useDatabase from './db/useDatabase';

const {width} = Dimensions.get('window');

const App = () => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [villains, setVillains] = useState<Villain[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [heroName, setHeroName] = useState('');
  const [villainName, setVillainName] = useState('');
  const [crewName, setCrewName] = useState('');
  const {db, loading} = useDatabase();

  useEffect(() => {
    const subs: Subscription[] = [];
    if (db && !loading) {
      const hereos_sub = db.heroes.find().$.subscribe(_heroes => {
        if (_heroes) {
          setHeroes(_heroes);
        }
      });
      subs.push(hereos_sub);
      const villains_sub = db.villains.find().$.subscribe(_villains => {
        if (_villains) {
          setVillains(_villains);
        }
      });
      subs.push(villains_sub);
      const crew_sub = db.crews.find().$.subscribe(_crews => {
        if (_crews) {
          setCrews(_crews);
        }
      });
      subs.push(crew_sub);
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
    if (heroName !== '') {
      console.log(`addHero: name: ${heroName}, color: ${color}`);
      await db.heroes.insert({name: heroName, color: color, type: 'Hero'});
      setHeroName('');
    }
  };

  const addVillain = async () => {
    const color = getRandomColor();
    if (villainName !== '') {
      console.log(`addVillain: name: ${villainName}, color: ${color}`);
      await db.villains.insert({
        name: villainName,
        color: color,
        type: 'Villain',
      });
      setVillainName('');
    }
  };

  const addCrew = async () => {
    if (crewName !== '') {
      console.log(`addCrew: name: ${crewName}`);
      await db.crews.insert({
        name: crewName,
        type: 'Crew',
        members: [],
      });
      setCrewName('');
    }
  };

  const removeHero = async (hero_name: string) => {
    const found = await db.heroes.find().where('name').eq(hero_name);
    await found.remove();
  };

  const removeVillain = async (villain_name: string) => {
    const found = await db.villains.find().where('name').eq(villain_name);
    await found.remove();
  };

  const removeCrew = async (crew_name: string) => {
    const crew_query = await db.crews.findOne().where('name').eq(crew_name);
    const crew: Crew = await crew_query.exec();
    crew.members.forEach(async member => {
      await removeVillain(member);
      await removeHero(member);
    });
    await crew_query.remove();
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
      <ScrollView style={styles.supersList}>
        <View style={styles.card}>
          <TouchableOpacity onPress={addCrew}>
            <Image
              style={styles.plusImage}
              source={require('../assets/add.png')}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={crewName}
            onChangeText={text => setCrewName(text)}
          />
        </View>
        {crews.length === 0 && <Text>Create a hero crew first...</Text>}
        {crews.map((crew, index) => (
          <View style={styles.crewCard} key={index}>
            <View style={styles.crewRow}>
              <View>
                <Text style={styles.crewName}>{crew.name}</Text>
              </View>
              <View>
                <TouchableOpacity onPress={() => removeCrew(crew.name)}>
                  <Image
                    style={styles.minusImage}
                    source={require('../assets/minus.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.crewSubRow}>
              <View style={styles.card}>
                <TouchableOpacity onPress={addHero}>
                  <Image
                    style={styles.plusImage}
                    source={require('../assets/add.png')}
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={heroName}
                  onChangeText={text => setHeroName(text)}
                />
              </View>
              {heroes.length === 0 && (
                <View style={styles.toDisplay}>
                  <Text>No heroes to display ...</Text>
                </View>
              )}
              {heroes.map((hero, hero_index) => (
                <View style={styles.card} key={hero_index}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.colorBadge,
                        {
                          backgroundColor: hero.color,
                        },
                      ]}
                    />
                    <Text style={styles.superName}>{hero.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeHero(hero.name)}>
                    <Image
                      style={styles.minusImage}
                      source={require('../assets/minus.png')}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.title}>Add your favorite villain!</Text>
      <ScrollView style={styles.supersList}>
        <View style={styles.card}>
          <TouchableOpacity onPress={addVillain}>
            <Image
              style={styles.plusImage}
              source={require('../assets/add.png')}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={villainName}
            onChangeText={text => setVillainName(text)}
          />
        </View>
        {villains.length === 0 && (
          <View style={styles.toDisplay}>
            <Text>No villains to display ...</Text>
          </View>
        )}
        {villains.map((villain, index) => (
          <View style={styles.card} key={index}>
            <View style={styles.row}>
              <View
                style={[
                  styles.colorBadge,
                  {
                    backgroundColor: villain.color,
                  },
                ]}
              />
              <Text style={styles.superName}>{villain.name}</Text>
            </View>
            <TouchableOpacity onPress={() => removeVillain(villain.name)}>
              <Image
                style={styles.minusImage}
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
  toDisplay: {
    marginTop: 10,
    marginLeft: 10,
  },
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
  supersList: {
    marginTop: 30,
    borderRadius: 5,
    flex: 1,
    width: width - 30,
    paddingLeft: 15,
    marginHorizontal: 15,
    backgroundColor: 'white',
  },
  plusImage: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  minusImage: {
    width: 25,
    height: 25,
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
  crewCard: {
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
  crewRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crewSubRow: {
    marginLeft: 20,
  },
  colorBadge: {
    height: 30,
    width: 30,
    borderRadius: 15,
    marginRight: 15,
  },
  superName: {
    fontSize: 18,
    fontWeight: '200',
    marginTop: 3,
  },
  crewName: {
    fontSize: 20,
    fontWeight: '300',
    marginTop: 3,
  },
});

export default App;
