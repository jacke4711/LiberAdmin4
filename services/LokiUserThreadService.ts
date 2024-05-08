import Loki from 'lokijs';

class LokiUserThreadService {
    db: Loki;
    userThreads: Loki.Collection;

    constructor() {
        this.db = new Loki('userThreads.db');
        this.userThreads = this.db.addCollection('userThreads', { unique: ['threadId'] });
    }

    addUserThread(userId: string, threadId: string, title: string) {
        const userThread = this.userThreads.insert({ userId, threadId, title });
        this.db.saveDatabase();
        return userThread;
    }

    getUserThreads(userId: string) {
        return this.userThreads.find({ userId });
    }

    updateUserThreadTitle(userId: string, threadId: string, newTitle: string) {
        const userThread = this.userThreads.findOne({ userId, threadId });
        if (userThread) {
            userThread.title = newTitle;
            this.userThreads.update(userThread);
            this.db.saveDatabase();
        }
        return userThread;
    }

    deleteUserThread(userId: string, threadId: string) {
        const userThread = this.userThreads.findOne({ userId, threadId });
        if (userThread) {
            this.userThreads.remove(userThread);
            this.db.saveDatabase();
        }
    }
}

export default LokiUserThreadService;