var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username: {
      type: 'string',
      unique: true,
      required: true
    },
    email: {
      type: 'string',
      unique: true,
      required: true
    },
    passports: {
      collection: 'Passport',
      via: 'user'
    },
    display_name: {
      type: 'string',
      unique: false,
      required: false
    }
  }
};

module.exports = User;
