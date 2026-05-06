export const generateUserData = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const ukMobileSuffix = `${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
  return {
    firstName: 'Test',
    lastName:  'User',
    fullName:  'Test User',
    email:     `test.user${digits}@gmail.com`,
    password:  `Test@${digits}`,
    phone:     `07${ukMobileSuffix}`,
    address:   '12 Cumbernauld Road',
    postcode:  'G33 6EP',
  };
};
