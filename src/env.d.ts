declare namespace NodeJS {
  // Interface for variables set in .env file
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    // SERVER variables
    PORT?: string | '4000';
    APOLLO_ENGINE_SCHEMA_TAG?: string | 'production';
    APOLLO_KEY: string;
    // MONGO variables
    MONGO_POOL_SIZE?: string | '2';
    MONGO_USERS_URL: string | 'mongodb://localhost';
    MONGO_USERS_PORT: string | '27017';
    MONGO_USERS_COLLECTION: string | 'timeline-users';
    MONGO_LOGS_URL: string | 'mongodb://localhost';
    MONGO_LOGS_PORT: string | '27018';
    MONGO_LOGS_COLLECTION: string | 'timeline-logs';
  }
}
