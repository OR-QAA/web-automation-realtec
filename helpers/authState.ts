import { generateUserData } from './testData';

export type UserData = ReturnType<typeof generateUserData>;

let currentUser: UserData = generateUserData();

export const getUser = (): UserData => currentUser;

export const resetUser = (): void => {
  currentUser = generateUserData();
};
