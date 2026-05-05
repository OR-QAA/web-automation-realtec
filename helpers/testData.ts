import { faker } from '@faker-js/faker';

export const generateUserData = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  fullName: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'Test@' + faker.number.int({ min: 1000, max: 9999 }),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
});
