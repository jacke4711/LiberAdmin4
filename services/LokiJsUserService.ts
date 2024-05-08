import Loki from 'lokijs';

// An interface for the User object
export interface User {
    //id?: string;
    name: string;
    email: string;
    username: string;
    password: string;
    // Add any other properties you need for a User
}

// Implements a UserService using LokiJS
class LokiJsUserService  {
    private db: Loki;

    constructor() {
        this.db = new Loki('users.db');
        /* this.db = new Loki('users.db', {
             autoload: true,
             autoloadCallback : this.databaseInitialize,
             autosave: true, 
             autosaveInterval: 4000
         });
         */
        var entries = this.db.getCollection("users");
        if (entries === null) {
            // if it doesn't exist, throw an error
            // But for starters lets just create it and add test data
            entries = this.db.addCollection("users", {
                unique: ['username']
            });
            this.addTestUsers();
        }
    }

    /*
    databaseInitialize() {
        var entries = this.db.getCollection("users");
        if (entries === null) {
          entries = this.db.addCollection("users");
        }
      
        // kick off any program logic or start listening to external events
        //runProgramLogic();
      }
    */

    createUser(user: User): Promise<User> {
        const users = this.db.getCollection('users');
        //user.id = this.getNextId();
        users.insert(user);
        this.db.saveDatabase();
        return Promise.resolve(user);
    }

    findUserById(id: string): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    findUserByEmail(email: string): Promise<User | null> {
        const users = this.db.getCollection('users');
        const user = users.findOne({ email });
        return Promise.resolve(user);
    }

    findUserByUsername(username: string): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    updateUser(user: User): Promise<User> {
        const users = this.db.getCollection('users');   
        users.update(user);
        this.db.saveDatabase();
        return Promise.resolve(user);
    }

    getUserById(id: string): User | undefined {
        const users = this.db.getCollection('users');
        return users.findOne({ id });
    }

    getUsers(): User[] {
        const users = this.db.getCollection('users');
        return users.data;
    }

    deleteUser(id: string): Promise<void> {
        const users = this.db.getCollection('users');
        users.findAndRemove({ id });
        this.db.saveDatabase();
        return Promise.resolve();
    }

    getNextId(): string {
        const users = this.db.getCollection('users');
        return (users.maxId + 1).toString();
    }

    // Add some test users
    addTestUsers(): void {
        this.createUser({
            name: 'Anders',
            email: 'anders.rennermalm@gmail.com',
            username: 'andersrennermalm',
            password: 'password'
        });
        this.createUser({
            name: 'Peder Lindencrona',
            email: 'peder.lindencrona@gmail.com',
            username: 'peder',
            password: 'password'
        })
        this.createUser({
            name: 'Oskar Rennermalm',
            email: 'oskarrennermalm03@gmail.com',
            username: 'oskar',
            password: 'password'
        })
        this.createUser({
            name: 'Jacob Lindencrona',
            email: 'jacob.lindencrona@gmail.com',
            username: 'jacob',
            password: 'password'
        })
    }
}


export default LokiJsUserService;
