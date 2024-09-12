import * as config from 'config';

interface IConfig {
  homeserverUrl: string;
  accessToken: string;
  autoJoin: boolean;
  dataPath: string;
  encryption: boolean;
  fusionbrainApiKey: string;
  fusionbrainSecretKey: string;
  dbUri: string;
  dbName: string;
  dbCollection: string;
}

export default <IConfig>config;
