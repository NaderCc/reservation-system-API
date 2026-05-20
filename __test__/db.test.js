const path = require('path');

const DB_PATH = path.resolve(__dirname, '../config/db');

describe('config/db', () => {
    const envBackup = {...process.env };

    afterAll(() => {
        process.env = envBackup;
        jest.resetModules();
        jest.restoreAllMocks();
    });
    /*
    test('exits when required DB env vars are missing', () => {
        jest.resetModules();

        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

        // remove DB env vars
        delete process.env.DB_USER;
        delete process.env.DB_HOST;
        delete process.env.DB_NAME;
        delete process.env.DB_PASSWORD;
        delete process.env.DB_PORT;

        // require the module — it should call process.exit(1)
        require(DB_PATH);

        // some environments may call process.exit without the numeric code,
        // so just assert that it was called at all.
        expect(exitSpy).toHaveBeenCalled();

        exitSpy.mockRestore();
    });
    */
    test('exits when required DB env vars are missing', () => {
        jest.resetModules();

        jest.doMock('dotenv', () => ({
            config: () => ({ parsed: {} }) // بيرجع كائن فاضي ومبيعملش Injection
        }));
        // لو مستخدم dotenvx في الـ require كخطوة مستقلة، اعمل ليها mock بنفس الطريقة:
        // jest.mock('@dotenvx/dotenvx', () => ({ config: () => {} }));

        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

        // 2. نمسح المتغيرات من الذاكرة الحالية بأمان
        delete process.env.DB_USER;
        delete process.env.DB_HOST;
        delete process.env.DB_NAME;
        delete process.env.DB_PASSWORD;
        delete process.env.DB_PORT;

        require(DB_PATH);
        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
        jest.unmock('dotenv');
    });

    test('exports pool and initDb when env vars are provided (pg mocked)', async() => {
        jest.resetModules();

        process.env.DB_USER = 'test_user';
        process.env.DB_HOST = 'localhost';
        process.env.DB_NAME = 'test_db';
        process.env.DB_PASSWORD = 'test_pass';
        process.env.DB_PORT = '5432';

        // create a mock Pool class that captures queries
        class MockPool {
            constructor(config) {
                this.config = config;
                this.queries = [];
            }
            on() {}
            query(sql) {
                this.queries.push(sql);
                return Promise.resolve();
            }
        }

        jest.doMock('pg', () => ({ Pool: MockPool }));

        const db = require(DB_PATH);

        expect(db).toHaveProperty('pool');
        expect(db).toHaveProperty('initDb');
        expect(db.pool.config.user).toBe('test_user');

        await db.initDb();

        const hasUsersTable = db.pool.queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS users'));
        const hasReservationsTable = db.pool.queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS reservations'));

        expect(hasUsersTable).toBe(true);
        expect(hasReservationsTable).toBe(true);

        jest.dontMock('pg');
    });
});