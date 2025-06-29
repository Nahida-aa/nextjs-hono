class Settings {
  SESSION_TOKEN_EXPIRE_MINUTES: number;
  ACCESS_TOKEN_EXPIRE_MINUTES: number;
  REFRESH_TOKEN_EXPIRE_MINUTES: number;
  SECRET_KEY: string;
  // ENCRYPT_KEY: string;

  constructor() {
    this.SESSION_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30; // 30 days
    this.ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8; // 8 days
    this.REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 100; // 100 days

    this.SECRET_KEY = process.env.SECRET_KEY!
    // this.ENCRYPT_KEY = process.env.ENCRYPT_KEY || crypto.randomBytes(32).toString('hex');
  }
}

const settings = new Settings();
export default settings;