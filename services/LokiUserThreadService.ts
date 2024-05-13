import Loki from 'lokijs';
import { initialize } from 'next/dist/server/lib/render-server';

class LokiUserThreadService {
    private static instance: LokiUserThreadService;
    private static initialized = false;
    private static db: Loki;
    //userThreads: Loki.Collection = null;

    private constructor() {
        LokiUserThreadService.db = new Loki('userThreads.db', {
            autoload: true,
            autoloadCallback : this.databaseInitialize,
            autosave: true, 
            autosaveInterval: 4000
        });
    }

    databaseInitialize() {
        let userThreads = LokiUserThreadService.db.getCollection("userThreads");
        if (userThreads === null) {
            userThreads = LokiUserThreadService.db.addCollection('userThreads', { unique: ['threadId'] });
        }
        LokiUserThreadService.initialized = true;
    }

    addUserThread(userId: string, threadId: string, title: string) {
        const userThread = LokiUserThreadService.db.getCollection("userThreads").insert({ userId, threadId, title });
        return userThread;
    }

    getUserThreads(userId: string) {
        return LokiUserThreadService.db.getCollection("userThreads").find({ userId });
    }

    updateUserThreadTitle(userId: string, threadId: string, newTitle: string) {
        const userThread = LokiUserThreadService.db.getCollection("userThreads").findOne({ userId, threadId });
        if (userThread) {
            userThread.title = newTitle;
            LokiUserThreadService.db.getCollection("userThreads").update(userThread);
        }
        return userThread;
    }

    deleteUserThread(userId: string, threadId: string) {
        const userThread = LokiUserThreadService.db.getCollection("userThreads").findOne({ userId, threadId });
        if (userThread) {
            LokiUserThreadService.db.getCollection("userThreads").remove(userThread);
        }
    }
    

    // TODO: Make this a Singleton
    static async service(): Promise<LokiUserThreadService> {
        if (!LokiUserThreadService.instance) {
            LokiUserThreadService.instance = new LokiUserThreadService();

            while (!LokiUserThreadService.initialized) {
                // Wait half a second for initialization
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        }
        return LokiUserThreadService.instance;
    }
}


export default LokiUserThreadService;