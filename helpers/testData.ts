export const generateUserData = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return {
    firstName: 'Test',
    lastName:  'User',
    fullName:  'Test User',
    email:     `test.user${digits}@gmail.com`,
    password:  `Test@${digits}`,
    phone:     '03001234567',
    address:   '12 Cumbernauld Road',
    postcode:  'G33 6EP',
  };
};
