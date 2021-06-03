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
  const [heroNames, setHeroNames] = useState<string[]>([]);
  const [heroCrewName, setHeroCrewName] = useState('');
  const [villainNames, setVillainNames] = useState<string[]>([]);
  const [villainCrewName, setVillainCrewName] = useState('');
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

  const addHero = async (index: number, crew_name: string) => {
    const color = getRandomColor();
    if (heroNames[index] !== '') {
      console.log(`addHero: name: ${heroNames[index]}, color: ${color}`);
      await db.heroes.insert({
        name: heroNames[index],
        color: color,
        type: 'Hero',
      });
      console.log(
        `updateCrew: name: ${crew_name}, member: ${heroNames[index]}`,
      );
      const crew_query = await db.crews.findOne().where('name').eq(crew_name);
      const crew: Crew = await crew_query.exec();
      const members = crew.members;
      members.push(heroNames[index]);
      await crew_query.update({$set: {members}});

      const newNames = [...heroNames];
      newNames[index] = '';
      setHeroNames(newNames);
    }
  };

  const addVillain = async (index: number, crew_name: string) => {
    const color = getRandomColor();
    if (villainNames[index] !== '') {
      console.log(`addVillain: name: ${villainNames[index]}, color: ${color}`);
      await db.villains.insert({
        name: villainNames[index],
        color: color,
        type: 'Villain',
      });
      console.log(
        `updateCrew: name: ${crew_name}, member: ${heroNames[index]}`,
      );
      const crew_query = await db.crews.findOne().where('name').eq(crew_name);
      const crew: Crew = await crew_query.exec();
      const members = crew.members;
      members.push(villainNames[index]);
      await crew_query.update({$set: {members}});

      const newNames = [...villainNames];
      newNames[index] = '';
      setVillainNames(newNames);
    }
  };

  const addHeroCrew = async () => {
    if (heroCrewName !== '') {
      console.log(`addHeroCrew: name: ${heroCrewName}`);
      await db.crews.insert({
        name: heroCrewName,
        type: 'Crew',
        members: [],
        crew_type: 'heroes',
      });
      setHeroCrewName('');
    }
  };

  const addVillainCrew = async () => {
    if (villainCrewName !== '') {
      console.log(`addVillainCrew: name: ${villainCrewName}`);
      await db.crews.insert({
        name: villainCrewName,
        type: 'Crew',
        members: [],
        crew_type: 'villains',
      });
      setHeroCrewName('');
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
          <TouchableOpacity onPress={() => addHeroCrew()}>
            <Image
              style={styles.plusImage}
              source={require('../assets/add.png')}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={heroCrewName}
            onChangeText={text => setHeroCrewName(text)}
            placeholder={'Add a super hero crew'}
          />
        </View>
        {crews.length === 0 && <Text>Create a hero crew first...</Text>}
        {crews
          .filter(crew => crew.crew_type === 'heroes')
          .map((crew, index) => (
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
                  <TouchableOpacity onPress={() => addHero(index, crew.name)}>
                    <Image
                      style={styles.plusImage}
                      source={require('../assets/add.png')}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    value={heroNames[index]}
                    onChangeText={text => {
                      const newNames = [...heroNames];
                      newNames[index] = text;
                      setHeroNames(newNames);
                    }}
                    placeholder={'Add a super hero'}
                  />
                </View>
                {heroes.length === 0 && (
                  <View style={styles.toDisplay}>
                    <Text>No heroes to display ...</Text>
                  </View>
                )}
                {heroes
                  .filter(hero => crew.members.includes(hero.name))
                  .map((hero, hero_index) => (
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
          <TouchableOpacity onPress={() => addVillainCrew()}>
            <Image
              style={styles.plusImage}
              source={require('../assets/add.png')}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={villainCrewName}
            onChangeText={text => setVillainCrewName(text)}
            placeholder={'Add a super villain crew'}
          />
        </View>
        {crews.length === 0 && <Text>Create a villain crew first...</Text>}
        {crews
          .filter(crew => crew.crew_type === 'villains')
          .map((crew, index) => (
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
                  <TouchableOpacity
                    onPress={() => addVillain(index, crew.name)}>
                    <Image
                      style={styles.plusImage}
                      source={require('../assets/add.png')}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    value={villainNames[index]}
                    onChangeText={text => {
                      const newNames = [...villainNames];
                      newNames[index] = text;
                      setVillainNames(newNames);
                    }}
                    placeholder={'Add a super hero'}
                  />
                </View>
                {villains.length === 0 && (
                  <View style={styles.toDisplay}>
                    <Text>No heroes to display ...</Text>
                  </View>
                )}
                {villains
                  .filter(villain => crew.members.includes(villain.name))
                  .map((villain, villain_index) => (
                    <View style={styles.card} key={villain_index}>
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
                      <TouchableOpacity
                        onPress={() => removeHero(villain.name)}>
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
