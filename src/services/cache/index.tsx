import AsyncStorage from '@react-native-async-storage/async-storage';

const TIME_TO_LIVE = 60 * 60 * 24 * 7 * 1000; // in ms - currently 1 week

type iCachedItem = {
  value: any;
  expiryTime: number;
};

// key would be TMDB_ID for example
// if item doesn't come back, means we have to cache it (so would be making that request to TMDB, then calling setItem)
const getItem = async (key: string): Promise<any | undefined> => {
  try {
    const item = await AsyncStorage.getItem(key);
    if (!item) {
      return undefined;
    }
    const { value, expiryTime } = JSON.parse(item) as iCachedItem;
    // remove the item from the cache if expired, but still return the value for now
    const isExpired = expiryTime < Date.now();
    if (isExpired) {
      AsyncStorage.removeItem(key);
    }
    return value;
  } catch (err) {
    console.error('error setting item in cache', err);
  }
};

const getItems = async (keys: string[]) => {
  try {
    const items = await AsyncStorage.multiGet(keys);
    // for each item, check if expired. If so, remove from cache, but still return the value. Next time fetched, will return undefined, and that will indicate to store it.
    const values = items.map(([key, item]): any => {
      if (!item) {
        return undefined;
      }
      const { value, expiryTime } = JSON.parse(item) as iCachedItem;
      const isExpired = expiryTime < Date.now();
      if (isExpired) {
        AsyncStorage.removeItem(key);
      }
      return value;
    });
    return values;
  } catch (err) {
    console.error('error getting items in cache', err);
  }
};

// key would be TMDB_ID for example
// pointing to an object that holds the movie's data
const setItem = async (key: string, value: any) => {
  const cacheValue: iCachedItem = {
    expiryTime: Date.now() + TIME_TO_LIVE,
    value,
  };
  const stringifiedValue = JSON.stringify(cacheValue);
  try {
    AsyncStorage.setItem(key, stringifiedValue);
  } catch (err) {
    console.error('error setting item in cache', err);
  }
};

const setItems = async (items: { key: string; value: any }[]) => {
  const stringifiedValues: [string, string][] = items.map(({ key, value }) => {
    const cacheValue: iCachedItem = {
      expiryTime: Date.now() + TIME_TO_LIVE,
      value,
    };
    return [key, JSON.stringify(cacheValue)];
  });
  try {
    AsyncStorage.multiSet(stringifiedValues);
  } catch (err) {
    console.error('error setting items in cache', err);
  }
};

const AsyncStorageCache = {
  getItem,
  getItems,
  setItem,
  setItems,
};

export default AsyncStorageCache;
