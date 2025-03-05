// import * as SecureStore from 'expo-secure-store';
// import uuid from 'react-native-uuid';

// export const getOrCreateUserId = async () => {
//   try {
//     let userId = await SecureStore.getItemAsync('userId');

//     if (!userId) {
//       // Generate a new user ID if none exists
//       userId = uuid.v4();
//       await SecureStore.setItemAsync('userId', userId);
//       console.log('Generated new User ID:', userId);
//     } else {
//       console.log('Retrieved existing User ID:', userId);
//     }

//     return userId;
//   } catch (error) {
//     console.error('Error retrieving or creating User ID:', error);
//     return null;
//   }
// };
