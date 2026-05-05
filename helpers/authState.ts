import { generateUserData } from './testData';

// This stores the generated user so same credentials
// are used across sign up and sign in in same test run
let currentUser = generateUserData();

export const getUser = () => currentUser;
export const resetUser = () => {
  currentUser = generateUserData();
};
