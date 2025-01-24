import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export const getOrCreateUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem('userId'); 

    if (!userId) {
      // Generates new user ID if none exist
      userId = uuid.v4(); // SECURE THIS 
      await AsyncStorage.setItem('userId', userId);
      console.log('Generated new User ID:', userId);
    } else {
      console.log('Retrieved existing User ID:', userId);
    }

    return userId;
  } catch (error) {
    console.error('Error retrieving or creating User ID:', error);
    return null;
  }
};
